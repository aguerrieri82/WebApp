
import { Action, Page } from "@eusoft/webapp-ui";
import { SecondPage } from "./SecondPage";
import { app } from "../";
export class MainPage extends Page {
    constructor() {
        super({
            name: "main",
            title: "Pagna Principale",
            route: "/",
            content: new Action({
                content: "Click Me",
                executeAsync: async () => {
                    app.pageHost.push(new SecondPage());
                }
            })
        });
    }
}