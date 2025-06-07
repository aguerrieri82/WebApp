import { Action, Content, IContentInfo } from "@eusoft/webapp-ui";
import { Text, JsxNode, forModel, debug } from "@eusoft/webapp-jsx";
import { Behavoir, Bind, Component, ITemplateContext, OptionsFor, TwoWays, declareComponent, template } from "@eusoft/webapp-core";
import { router } from "@eusoft/webapp-framework";
import { onChanged } from "@eusoft/webapp-core";
import {  Style } from "../../../webapp-jsx/src";
import { Bindable } from "@eusoft/webapp-core";
import { IComponentOptions } from "@eusoft/webapp-core";



const TextInput = declareComponent({

    selectAll: function () {
        (this.context.element as HTMLInputElement).select();
    }
}, m => <input type="text"/>);

function Page2() {

    const state: {
        input?: InstanceType<typeof TextInput>
    } = {}

    return <div>
        <TextInput ref={state.input} />
        <button on-click={() => state.input.selectAll()}>Select</button>
    </div>
}

const Test = declareComponent({

    construct: function (opt) {
        if (opt)
            opt.text = "Hello World!";
    },


    test: function () {
        this.text = "Hello";

    },

    text: "mona" as string
},
    m => <>
        {m.text}
    </>
);
function Log(props: { message: string }) {

    console.log("log", props.message);
}
function Bold(props: { content: JsxNode<string> }) {
    return <div>{props.content  == "Show Text " ? <Text>No input text</Text> : <strong>
        <Blink time={100} color="red" />
        {props.content}
    </strong>}</div>; 
}

class Blink extends Behavoir<OptionsFor<Blink>> {

    override attach(ctx: ITemplateContext<unknown>) {

        const doBlink = () => {
   
            const el = ctx.element.parentElement as HTMLElement;
            if (!el.style)
                return;
            if (el.style.background == "")
                el.style.background = this.color;
            else
                el.style.background = "";

            if (!this._isDetach) {
                setTimeout(doBlink, this.time)
            }
            else
                console.log("Blink detached")

        };

        doBlink();
    }

    time: number;

    color: string;
}
 
function DoBlink(props: { time: number, color: string}) {

    return template(t => {

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
    })
}
function Input(props: { text: TwoWays<string> }) {

    return <input value={props.text} value-mode="keyup" type="text" checked />
}

function Counter(props: { label: string }) {

    const state ={
        count: 1
    };

    setInterval(() => {
        state.count++
    }, 500);

    onChanged(state, "count", v => {
        if (v == 10)
            state.count = 0;
    });

    const showAlert = () => {
        alert("Hello");
    }

    return <div on-click={showAlert}>
        <Style opacity={(state.count / 10).toString()}/>
        {props.label}: {state.count}
    </div>;
}

interface IBlockOptions extends IComponentOptions {
    text?: Bindable<string>;
}
class Block extends Component<IBlockOptions> {
    constructor(options: IBlockOptions) {
        super();
        this.init(Block, {
            template: forModel<this>(m =>
                <div>
                    Block {m.text}
                </div>),
            ...options
        });
    }

    text: string;
}

export class SecondPage extends Content {

    constructor() {
        super();

        this.text = "yellow2";


        var block = new Block({
            text: Bind.external(this, "text")
        });

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
                    <Bold>{"Show Text " + (m.text[0] ?? "")}</Bold>
                </Action>

                <ul>
                    {m.items.forEach(i => <li style-margin="16px" text={i.name}>
                        <Blink time={500} color={m.text} />
                    </li>)}
                </ul>
            </div>
            <Bold>{m.text}</Bold>
            <Counter label="sto contando" />
            <Test text="inline component" />
            <Page2/>
            {block }
        </>);

        onChanged(content.model, "text", a => {
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