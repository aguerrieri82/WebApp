import { Page } from "@eusoft/webapp-ui";
import { Template } from "@eusoft/webapp-jsx";
import { app } from "../";
import { CatalogTemplate, IViewComponent } from "../../../../dist/webapp-core";
export class SecondPage extends Page {
    constructor() {
        super({
            name: "second",
            title: "Seconda Pagina",
            route: "/second",
            content: {

                template: (<Template name="SecondPage">
                    <input type="text" />
                    <button on-click={m => app.pageHost.pop()}>Back</button>
                </Template>) as CatalogTemplate<this>
            }
        });
    }
}