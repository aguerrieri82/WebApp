import { Action, Page } from "@eusoft/webapp-ui";
import { secondPage } from "./SecondPage";
import { app } from "../";
class MainPage extends Page {
    constructor() {
        super({
            name: "main",
            title: "Pagna Principale",
            route: "/",
            content: new Action({
                content: "Click Me",
                executeAsync: async () => {
                    app.pageHost.push(secondPage);
                }
            })
        });
    }
}


export const mainPage = new MainPage();