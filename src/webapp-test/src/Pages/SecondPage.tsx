import { Page } from "@eusoft/webapp-ui";
import { Template } from "@eusoft/webapp-jsx";
import { app } from "../";
import { CatalogTemplate } from "../../../../dist/webapp-core";

class SecondPage extends Page {
    constructor() {
        super({
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
}

export const secondPage = new SecondPage();