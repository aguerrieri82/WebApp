import { Bind, Template, forModel } from "@eusoft/webapp-jsx";
import { InputField, ObjectEditor, Page } from "@eusoft/webapp-ui";
import "./MainPage.scss";
import TextEditor from "@eusoft/webapp-ui/editors/TextEditor";

class MainPage extends Page {

    constructor() {

        super();

        this.configure({
            name: "main",
            title: "PaymentManager.App Home",
            route: "/",
            content: forModel(this, m => <Template name="MainPage">
                <ObjectEditor value={m.obj} builder={bld => <>
                    {bld.text(m => m.password, {
                        label: "Pippo",
                        editor: {
                            password: true
                        }
                    })}
                </>} />
            </Template>)
        });
    }

    obj = {
        name: "xxxxx",
        password: "b"
    }

    message: string = "Hello World";
}

export const mainPage = new MainPage();