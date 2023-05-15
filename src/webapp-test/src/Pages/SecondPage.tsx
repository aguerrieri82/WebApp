import { Action, Page } from "@eusoft/webapp-ui";
import { Foreach, Template, TwoWays, Text, JsxNode, Bind, forModel } from "@eusoft/webapp-jsx";
import { ITemplateBuilder, OptionsFor, propOf } from "@eusoft/webapp-core";
import { Behavoir } from "@eusoft/webapp-core/Behavoir";
import { router } from "@eusoft/webapp-framework";
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

        this.text = "yellow2";

        const content = forModel({

            text: "main text",
            items: [
                { name: "Max2" },
                { name: "Lucy" },
            ],
            async goBack() {
                await router.backAsync();
                alert("I'm back");
            }

        }, m => <Template name="SecondPage">
            <div>
                <Input text={Bind.twoWays(m.text)} />
                <Input text={Bind.twoWays(this.text)} /> 
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
                            <Blink time={500} color={m.text} />
                        </li>}
                    </Foreach>
                </ul>
            </div>
            <Bold>{m.text}</Bold>
        </Template>);

        propOf(content.model, "text").subscribe(a => {
            console.log(a);
        });

        this.configure({
            name: "second",
            title: "Seconda Pagina 2",
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