import { forModel } from "@eusoft/webapp-jsx";
import { Page, Wizard, WizardStep } from "@eusoft/webapp-ui";
import { Authorize } from "../services/Authorize";

class SignUpPage extends Page {

    constructor() {

        super();

        this.init(SignUpPage, {
            name: "sign-up",
            title: "sign-up",
            style: "panel",
            route: "/sign-up",
            content: forModel(this, m => <>
                <Wizard>
                    <WizardStep name="" title="xxx">
                        <p>Step 1</p>
                    </WizardStep>
                    <WizardStep name="" title="yyy">
                        <p>Step 2</p>
                    </WizardStep>
                </Wizard>
            </>)
        });
    }
}

export const signUp = new SignUpPage();