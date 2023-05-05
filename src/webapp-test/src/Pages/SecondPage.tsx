import { Page } from "@eusoft/webapp-ui";
import { Template } from "@eusoft/webapp-jsx";
import { CatalogTemplate } from "@eusoft/webapp-core";
import { app } from "../";

class SecondPage extends Page {

    constructor() {
        super();

        this.configure({
            name: "second",
            title: "Seconda Pagina",
            route: "/second",
            content: {
                text: "cazzo",
                template: (<Template name="SecondPage">
                    <input value={m => m.text} type="text" />
                    <button on-click={m => app.pageHost.pop()}>Back</button>
                </Template>) as CatalogTemplate<this>
            } as any
        });
    }

    protected updateOptions() {

        this.bindOptions();
    }
}

export const secondPage = new SecondPage();