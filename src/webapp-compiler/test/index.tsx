import { Foreach, debug, forModel } from "@eusoft/webapp-jsx";
import { Action, InputField, MaterialIcon, NumberEditor, ObjectEditor, Page, ValidationResult, ViewNode, Wizard, WizardStep, formatText, required, validEmail } from "@eusoft/webapp-ui";
import "./SignUpPage.scss";
import { Bind } from "@eusoft/webapp-core";
import { IMerchantCreate, UserAccountType } from "../../entities/Commands";
import { IValidationContext } from "@eusoft/webapp-ui/abstraction/Validator";
import { apiClient } from "../../services/PmApiClient";
import { router } from "@eusoft/webapp-framework";
import { loginPage } from "./LoginPage";
import { MerchantEditor } from "../merchant/EditMerchant";


class SignUpPage extends Page {

    constructor() {

        super();

        this.init(SignUpPage, {
            name: "sign-up",
            title: "sign-up",
            style: "panel",
            route: "/sign-up",
            content: forModel(this, m => <>
                <Wizard ref={m.wizard}>


                    <WizardStep name="merchant-details" title="merchant-details" visible={m.data.accountType == UserAccountType.Business} validateAsync={Bind.action((step) => m.createAccountAsync(step))}>
                        <MerchantEditor value={Bind.twoWays(m.data.merchant)} />
                    </WizardStep>

                </Wizard>
            </>)
        });


    }

};