import { Action, Content, IContentInfo } from "@eusoft/webapp-ui";
import { Foreach, Template, Text, JsxNode, forModel } from "@eusoft/webapp-jsx";
import { Behavoir, Bind, ITemplateContext, OptionsFor, TemplateBuilder, TwoWays, USE, propOf } from "@eusoft/webapp-core";
import { router } from "@eusoft/webapp-framework";
import { BindValue } from "@eusoft/webapp-core";

function Log(props: { message: string }) {

    console.log("log", props.message);
}
function Bold(props: { content: JsxNode<string> }) {
    return <div>{props.content == "" ? <Text>No input text</Text> : <strong>
        <Blink time={100} color="red" />
        {props.content}
    </strong>}</div>;
}

class Blink extends Behavoir<OptionsFor<Blink>> {

    attach(ctx: ITemplateContext<unknown>) {

        const doBlink = () => {
            console.log(this.color);

            const el = ctx.element.parentElement as HTMLElement;
            if (!el.style)
                return;
            if (el.style.background == "")
                el.style.background = this.color;
            else
                el.style.background = "";

            if (!this._isDetach)
                setTimeout(doBlink, this.time)
        };

        doBlink();
    }

    time: number;

    color: string;
}
 
function DoBlink(props: { time: number, color: string}) {

    return (t: TemplateBuilder<any>) => {

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

export class SecondPage extends Content {

    constructor() {
        super();

        this.text = "yellow2";

        var self = this;

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

        }, m => <>
            <div>
                <Input text={Bind.twoWays(m.text)} />
                <Input text={Bind.twoWays(this.text)} /> 
                <Log message={m.text} />

                <Action onExecuteAsync={m.goBack}>
                    {m.text ? "Back: " + (m.text) : "Back"}
                </Action>
                <Action onExecuteAsync={() => this.showText()}>
                    <Bold>{"Show Text" + m.text[0]}</Bold>
                </Action>

                <ul>
                    {m.items.forEach(i => <li style-margin="16px" text={i.name}>
                        <Blink time={500} color={m.text} />
                    </li>)}
                </ul>
            </div>
            <Bold>{m.text}</Bold>
        </>);

        propOf(content.model, "text").subscribe(a => {
            console.log("sub2", a);
        }); 

        this.init(SecondPage, {
            name: "second",
            title: "Seconda Pagina 2",
            route: "/second",
            body: content
        });
    }

    showText() {
        alert(this.text);
    }



    text: string;

    static override info = {
        name: "second-page",
        route: "/second",
        factory: () => new SecondPage()
    } as IContentInfo;
}