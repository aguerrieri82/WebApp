import { Action, Page } from "@eusoft/webapp-ui";
import { secondPage } from "./SecondPage";
import { app } from "..";

class MainPage extends Page {

    constructor() {

        super();

        this.configure({
            name: "main",
            title: "Pagna Principale",
            route: "/",
            content: new Action({
                content: this.prop("actionLabel"),
                executeAsync: async () => {
                    this.actionLabel = "cambiato";
                    app.pageHost.push(secondPage);
                }
            })
        });
    }

    actionLabel: string = "Click Me";
}


export const mainPage = new MainPage();