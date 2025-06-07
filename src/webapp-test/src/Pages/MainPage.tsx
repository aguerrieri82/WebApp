import { Action, Content, IContentInfo } from "@eusoft/webapp-ui";
import { router } from "@eusoft/webapp-framework";
import { SecondPage } from "./SecondPage";
import { declareComponent } from "@eusoft/webapp-core";



export class MainPage extends Content {

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
                    router.navigatePageAsync("second-page");
                }
            })
        });
    }

    actionLabel: string = "Click Me";


    static override info = {
        name: "main-page",
        route: "/",
        factory: () => new MainPage()
    } as IContentInfo;
}
