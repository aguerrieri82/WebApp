import { Action, Page } from "@eusoft/webapp-ui";
import { Template } from "@eusoft/webapp-jsx";
import { ITemplateProvider } from "@eusoft/webapp-core";
import { app } from "../";
import { forModel } from "@eusoft/webapp-jsx/src/Runtime";

interface IContentModel extends ITemplateProvider<IContentModel> {
    text: string;
    goBack: () => Promise<any>;
}

function Log(props: { message: string }) {

    console.log(props.message);
}
function Bold(props: { text: string }) {

    return <strong text={props.text} />;
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
                goBack() {
                    app.pageHost.pop();
                },
                template: forModel(m => <Template name="SecondPage">
                    <div>
                        <input value={m.text} type="text" />
                        <input value={this.text} type="text" />
                        <Log message={m.text} />
                        <Action executeAsync={() => m.goBack()} content={"Back " + (m.text)} />
                        <Action executeAsync={() => this.showText()} content="Show text" />
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