import { Content, IContentInfo } from "@eusoft/webapp-ui";
import { Template, forModel } from "@eusoft/webapp-jsx";
import "./MainPage.scss";

export class MainPage extends Content {

    constructor() {

        super();

        this.init(MainPage, {
            title: "$(project-name) Home",
            style: [],
            body: forModel(this, m => <Template name="MainPage">
                <main>{m.message}</main>
            </Template>)
        });

    }

    message: string = "Hello World";

    static override info = {
        name: "main-page",
        route: "/",
        factory: () => new MainPage()
    } as IContentInfo;
}
