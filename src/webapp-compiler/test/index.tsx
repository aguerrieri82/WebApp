import { Template, forModel } from "@eusoft/webapp-jsx";
import { InputField, ObjectEditor, Page } from "@eusoft/webapp-ui";
import "./MainPage.scss";
import TextEditor from "@eusoft/webapp-ui/editors/TextEditor";
import { required } from "@eusoft/webapp-ui/editors/Validators";
import { Bind } from "@eusoft/webapp-core/Bind";

class MainPage extends Page {

    constructor() {

        super();

        this.configure({
            name: "main",
            title: "PaymentManager.App Home",
            route: "/",
            content: forModel(this, m => <Template name="MainPage">

                <InputField name="" value={Bind.twoWays(m.obj.name)}>
                    <TextEditor />
                </InputField>

                <ObjectEditor ref={m.editor} value={Bind.twoWays(m.obj)} validationMode="onInputChange" commitMode="manual" builder={bld => <>
                    {bld.text(m => m.name, {
                        label: <b>Mario</b>,
                        validators: [required],
                        editor: {
                            placeholder: "insert text"
                        }
                    })}
                    <div>Cazzo duro</div>
                    {bld.text(m => m.password, {
                        label: "Password",
                        editor: {
                            password: true
                        }
                    })}
                </>} />

                <button on-click={() => this.onClick()}>xx</button>

            </Template>)
        });
    }

    protected async onClick() {

        await this.editor.commitAsync();

        alert(JSON.stringify(this.obj));

        //this.obj = { name: "Lica", password: "239723878327878e87998" }
    }

    obj = {
        name: "xxxxx",
        password: "b"
    }

    editor: ObjectEditor<any>;

    message: string = "Hello World";
}

export const mainPage = new MainPage();