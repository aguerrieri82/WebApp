
import { Action, Content, IContentInfo } from "@eusoft/webapp-ui";
import { secondPage } from "./SecondPage";
import { router } from "@eusoft/webapp-framework";


class MainPage extends Content {

    constructor() {

        super();

        this.init(MainPage, {
            name: "main",
            title: "Pagna Principale",
            route: "/",
            body: new Action({
                content: this.prop("actionLabel"),
                onExecuteAsync: async () => {
                    this.actionLabel = "cambiato";
                    router.navigatePageAsync(secondPage);
                }
            })
        });
    }

    actionLabel: string = "Click Me";


    static override info = {
        name: "main-page",
        route: "/",
        factory: () => mainPage
    } as IContentInfo;
}


export const mainPage = new MainPage();