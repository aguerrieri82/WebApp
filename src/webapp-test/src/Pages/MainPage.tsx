import { Page, Action } from "@eusoft/webapp-ui/components";
import { secondPage } from "./SecondPage";
import { router } from "@eusoft/webapp-framework";

class MainPage extends Page {

    constructor() {

        super();

        this.init(MainPage, {
            name: "main",
            title: "Pagna Principale",
            route: "/",
            content: new Action({
                content: this.prop("actionLabel"),
                executeAsync: async () => {
                    this.actionLabel = "cambiato";
                    router.navigateAsync(secondPage);
                }
            })
        });
    }

    actionLabel: string = "Click Me";
}


export const mainPage = new MainPage();