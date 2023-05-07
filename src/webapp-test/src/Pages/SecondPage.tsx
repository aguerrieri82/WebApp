import { Action, Page } from "@eusoft/webapp-ui";
import { Foreach, Template, TwoWays, forModel, twoWays, Text } from "@eusoft/webapp-jsx";
import { ITemplateBuilder, ITemplateProvider } from "@eusoft/webapp-core";
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

    return <>{props.text == "mamma" ? <Text>ccc</Text> : <strong text={props.text} />}</>;
}

function Blink(props: {time: number, color: string}) {

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

    return <input value={props.text} value-pool={500} type="text" checked  />
}

class SecondPage extends Page {

    constructor() {
        super();

        this.text = "class text";

        this.configure({
            name: "second",
            title: "Seconda Pagina",
            route: "/second",
            content: {
                text: "cazzo",
                items: [
                    { name: "Luca" },
                    { name: "Mario" },
                ],
                goBack() {
                    app.pageHost.pop();
                },
                template: forModel(m => <Template name="SecondPage">
                    <div>
                        <Input text={twoWays(m.text)} />
                        <Input text={twoWays(this.text)} />
                        <Log message={m.text} />
                        <Blink time={500} color="yellow" />
                        <Action executeAsync={() => m.goBack()} content={"Back " + (m.text)} />
                        <Action executeAsync={() => this.showText()} content="Show text" />
                        <Foreach src={m.items}>
                            {i => <span>{i.name}</span>}
                        </Foreach>
                    </div>
                    <Bold text={m.text} />
                </Template>)
            } as IContentModel
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