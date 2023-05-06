import { Action, ActionTemplates, Page } from "@eusoft/webapp-ui";
import { Template } from "@eusoft/webapp-jsx";
import { ITemplateProvider } from "@eusoft/webapp-core";
import { app } from "../";
import { forModel } from "@eusoft/webapp-jsx/src/Runtime";

interface IContentModel extends ITemplateProvider<IContentModel> {
    text: string;
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
                template: forModel(m => <Template name="SecondPage">
                    <input value={m.text} type="text" />
                    <Action executeAsync={async () => app.pageHost.pop()} content={"Back " + (m.text)}/>
                </Template>)
            } as IContentModel
        });
    }

    protected updateOptions() {

        this.bindOptions();
    }
}

export const secondPage = new SecondPage();