import { app } from "@eusoft/webapp-ui/App";
import { Page, Action } from "@eusoft/webapp-ui/components";
import { secondPage } from "./SecondPage";


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