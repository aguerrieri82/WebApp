import { Template, forModel } from "@eusoft/webapp-jsx";
import { Page } from "@eusoft/webapp-ui";
import "./MainPage.scss";
class MainPage extends Page {

    constructor() {

        super();

        this.configure({
            name: "main",
            title: "$(project-name) Home",
            route: "/",
            content: forModel(this, m => <Template name="MainPage">
                <main>{m.message}</main>
            </Template>)
        });
    }

    message: string = "Hello World";
}

export const mainPage = new MainPage();