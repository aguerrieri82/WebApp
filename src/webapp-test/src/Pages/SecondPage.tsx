import { Action, Page } from "@eusoft/webapp-ui";
import { Foreach, Template, TwoWays, forModel, twoWays, Text, debug } from "@eusoft/webapp-jsx";
import { ITemplateBuilder, ITemplateProvider, propOf } from "@eusoft/webapp-core";
import { app } from "../";
interface IContentModel extends ITemplateProvider<IContentModel> {
    text: string;
    items: { name: string }[];
    goBack: () => Promise<any>;
}

function Log(props: { message: string }) {

    console.log(props.message);
}
function Bold(props: { text: string }) {

    return <>{props.text == "" ? <Text>No input text</Text> : <strong text={props.text} />}</>;
}

function Blink(props: { time: number, color: string }) {

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

    return <input value={props.text} value-pool={500} type="text" checked />
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

                    <Action executeAsync={() => m.goBack()} content={"Back: " + (m.text)} />
                    <Action executeAsync={() => this.showText()} content="Show color" />
                    <ul>
                        <Foreach src={m.items}>
                            {i => <li style-margin="16px" text={i.name}>
                                <Blink time={500} color={this.text} />
                            </li>}
                        </Foreach>
                    </ul>
                </div>
                <Bold text={m.text} />
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

    key = "Page 2";
}

export const secondPage = new SecondPage();