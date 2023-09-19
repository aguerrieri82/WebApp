import { Content } from "@eusoft/webapp-ui";
import { Template, forModel } from "@eusoft/webapp-jsx";
import "./MainPage.scss";

export class MainPage extends Content {

    constructor() {

        super();

        this.init(MainPage, {
            title: "VocalCoach.App Home",
            style: [],
            body: forModel(this, m => <Template name="MainPage">
                <main>{m.message}</main>
            </Template>)
        });

    }

    message = "Hello World";

    static info = {
        name: "main-page",
        route: "/",
        factory: () => new MainPage()
    };
}
