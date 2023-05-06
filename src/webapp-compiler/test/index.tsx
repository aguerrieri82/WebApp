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

    return forModel<typeof props>(m => <strong text={m.text} />);
}

class SecondPage extends Page {

    constructor() {
        super();

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
                        <input value={this.text[2][m.call.my[2]].test(this.yyy)} type="text" />
                        <Log message={m.text} />
                        <Action executeAsync={m.goBack} content={"Back " + (m.text)} />
                    </div>
                    <Bold text={m.text} />
                </Template>)
            } as IContentModel
        });
    }


    protected updateOptions() {

        this.bindOptions();
    }

    text: string = "class text";
}

export const secondPage = new SecondPage();