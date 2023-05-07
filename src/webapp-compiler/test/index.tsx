import { Action, Page } from "@eusoft/webapp-ui";
import { Foreach, Template, forModel, twoWay } from "@eusoft/webapp-jsx";
import { ITemplateProvider } from "@eusoft/webapp-core";
import { app } from "../";
interface IContentModel extends ITemplateProvider<IContentModel> {
    text: string;
    items: { name: string }[];
    goBack: () => Promise<any>;
}

function Bold2(props: { text: string }) {

    return <>
        {((props.text == "22" || props.text == "23") && props.text == "2") && <span></span>}
    </>
}


function Log(props: { message: string }) {

    console.log(props.message);
}
function Bold(props: { text: string }) {

    return <>{props.text == "mamma" ? "ccc" : <strong text={props.text} />}</>;
}



function Text(props: { text: string }) {

    return <input value={props.text} value-pool={500} type="text" />
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
                        <Text text={twoWay(m.text)} />
                        <Text text={twoWay(this.text)} />
                        <Log message={m.text} />
                        <Action executeAsync={() => m.goBack()} content={"Back " + (m.text)} />
                        <Foreach src={m.items}>
                            {x => <span>{x.name}</span>}
                        </Foreach>
                        <Action executeAsync={() => this.showText()}>
                            Show Text
                            {"caso"}
                        </Action>
   
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