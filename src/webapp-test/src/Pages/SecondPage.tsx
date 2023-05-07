import { Action, Page } from "@eusoft/webapp-ui";
import { Foreach, Template, TwoWays, forModel, twoWays, Text, debug, JsxNode } from "@eusoft/webapp-jsx";
import { ITemplateBuilder, ITemplateProvider, OptionsFor, PARENT, propOf } from "@eusoft/webapp-core";
import { app } from "../";
import { Behavoir } from "@eusoft/webapp-core/src/Behavoir";
interface IContentModel extends ITemplateProvider<IContentModel> {
    text: string;
    items: { name: string }[];
    goBack: () => Promise<any>;
}

function Log(props: { message: string }) {

    console.log(props.message);
}
function Bold(props: { content: JsxNode<string> }) {
    return <>{props.content == "" ? <Text>No input text</Text> : <strong>
        <Blink time={100} color="red" />
        {props.content}
    </strong>}</>;
}

class Blink extends Behavoir<OptionsFor<Blink>> {

    protected _timer: NodeJS.Timeout;

    attach(element: HTMLElement) {

        const doBlink = () => {

            if (element.style.background == "")
                element.style.background = this.color;
            else
                element.style.background = "";

            if (!this._isDetach)
                setTimeout(doBlink, this.time)
        };

        doBlink();
    }

    time: number;

    color: string;
}

function DoBlink(props: { time: number, color: string }) {

    return (t: ITemplateBuilder<any>) => {

        const timer = setInterval(() => {

            if (!t.parent.element.isConnected) {
                clearInterval(timer);
                return;
            }

            if (t.parent.element.style.background == "")
                t.parent.element.style.background = props.color;
            else
                t.parent.element.style.background = "";

        }, props.time);
    }
}
function Input(props: { text: TwoWays<string> }) {

    return <input value={props.text} value-mode="keyup" type="text" checked /> 
}

class SecondPage extends Page {

    constructor() {
        super();

        this.text = "yellow";

        const content = {
            text: "main text",
            items: [
                { name: "Max" },
                { name: "Lucy" },
            ],
            goBack() {
                app.pageHost.pop();
            },
            template: forModel(m => <Template name="SecondPage">
                <div>
                    <Input text={twoWays(m.text)} />
                    <Input text={twoWays(this.text)} />
                    <Log message={m.text} /> 

                    <Action executeAsync={() => m.goBack()}>
                        {m.text ? "Back: " + (m.text) : "Back"}
                    </Action>
                    <Action executeAsync={() => this.showText()}>
                        <Bold>{"Show Text" + m.text[0]}</Bold>
                    </Action>
                    <ul>
                        <Foreach src={m.items}>
                            {i => <li style-margin="16px" text={i.name}>
                                <Blink time={500} color={this.text} />
                            </li>}
                        </Foreach>
                    </ul>
                </div>
                <Bold>{m.text}</Bold>
            </Template>)
        } as IContentModel;

        propOf(content, "text").subscribe(a => {
            console.log(a);
        });

        this.configure({
            name: "second",
            title: "Seconda Pagina",
            route: "/second",
            content
        });
    }

    showText() {
        alert(this.text);
    }

    protected updateOptions() {

        this.bindOptions();
    }

    text: string;
}

export const secondPage = new SecondPage();