import { forModel } from "@eusoft/webapp-jsx";
import { Action, Content, InputField, MaterialIcon, NumberEditor, ObjectEditor, ValidationResult, ViewNode, Wizard, WizardStep, formatText, required, validEmail } from "@eusoft/webapp-ui";
import { Bind } from "@eusoft/webapp-core";
import { ICreateMerchant, UserAccountType } from "../../entities/Commands";
import { IValidationContext } from "@eusoft/webapp-ui/abstraction/Validator";
import { apiClient } from "../../services/PmApiClient";
import { MerchantEditor } from "../merchant/EditMerchant";
import { navigatePage } from "../../entities/Pages";
import "./SignUpPage.scss";
import { useNetwork } from "@eusoft/webapp-framework";

interface IAccountType {
    name: string;
    description: ViewNode;
    type: UserAccountType;
}

async function equalsPassword(ctx: IValidationContext<SignUpPage["data"]>, value: string) {

    if (ctx.target.password != ctx.target.repeatPassword)
        return ValidationResult.error("msg-password-not-equals");

    return ValidationResult.valid;
}

const style = "filled";

export class SignUpPage extends Content {

    constructor() {

        super();

        this.data.accountTypes = [
            { name: "personal", description: "bla bla", type: UserAccountType.Personal },
            { name: "busness", description: "bla bla", type: UserAccountType.Business }
        ]

        this.init(SignUpPage, {
            name: SignUpPage.info.name,
            title: "sign-up",
            style: "panel",
            body: forModel(this, m => <>
                <Wizard ref={m.wizard}>

                    <WizardStep name="account-type" title="account-type">
                        <ul>
                            {m.data.accountTypes.forEach(i => <li on-click={() => m.selectAccount(i.type)}>
                                <header>{formatText(i.name)}</header>
                                <section>{i.description}</section>
                            </li>)}
                        </ul>
                    </WizardStep>

                    <WizardStep name="" title="credentials" >
                        <ObjectEditor
                            style={["vertical"]}
                            inputField={{ style: style }}
                            commitMode="auto"
                            value={Bind.twoWays(m.data)}
                            builder={bld => <>
                                {bld.text(m => m.username, {
                                    label: "email",
                                    validators: [required, validEmail],
                                    editor: {
                                        autocomplete: "username"
                                    }
                                })}
                                {bld.text(m => m.password, {
                                    validators: [required],
                                    editor: {
                                        autocomplete: "new-password",
                                        type: "password",
                                    }
                                })}
                                {bld.text(m => m.repeatPassword, {
                                    validators: [required, equalsPassword],
                                    editor: {
                                        autocomplete: "new-password",
                                        type: "password",
                                    }
                                })}
                            </>
                            } />
                    </WizardStep>

                    <WizardStep name="account-details" title="account-details" validateAsync={Bind.action((step) => m.createAccountAsync(step))}>
                        <ObjectEditor
                            style={["vertical"]}
                            inputField={{ style: style }}
                            commitMode="auto"
                            value={Bind.twoWays(m.data)}
                            builder={bld => <>
                                {bld.text(m => m.firstName, {
                                    validators: [required],
                                    editor: {
                                        autocomplete: "given-name"
                                    }
                                })}
                                {bld.text(m => m.lastName, {
                                    validators: [required],
                                    editor: {
                                        autocomplete: "family-name"
                                    }
                                })}
                                {bld.text(m => m.phoneNumber, {
                                    validators: [required],
                                    editor: {
                                        type: "tel",
                                        autocomplete: "tel-national"
                                    }
                                })}
                                {bld.date(m => m.birthDate, {
                                    validators: [required],
                                    editor: {
                                        placeholder: "dd/mm/yyyy"
                                    }
                                })}
                            </>
                        } />
                    </WizardStep>

                    <WizardStep name="merchant-details" title="merchant-details" visible={m.data.accountType == UserAccountType.Business} validateAsync={Bind.action((step) => m.createAccountAsync(step))}>
                        <MerchantEditor value={Bind.twoWays(m.data.merchant)}/>
                    </WizardStep>

                    <WizardStep name="validation" title="validation" validateAsync={() => m.validateEmailAsync()} >
                        <p>{formatText("msg-mail-sent", m.data.username)}</p>
                        <InputField style={style} name="code" label="code" value={Bind.twoWays(m.data.validationCode)}>
                            <NumberEditor />
                        </InputField>
                        <Action style="text">resend-email</Action>
                    </WizardStep>

                    <WizardStep name="finish" title="finish" canGoPrev={() => false}>
                        <div>{formatText("msg-account-created")}</div>
                        <MaterialIcon name="check_circle" />
                        <Action onExecuteAsync={()=> navigatePage("login")} style="text">login</Action>
                    </WizardStep>
                </Wizard>
            </>)
        });
    }

    protected async selectAccount(type: UserAccountType) {

        this.data.accountType = type;
        await this.wizard.nextAsync();
    }

    protected async createAccountAsync(step: WizardStep) {

        if (!await (step.content as ObjectEditor<unknown>).commitAsync())
            return;

        if (this.data.accountType == UserAccountType.Business && step.name != "merchant-details")
            return true;

        await useNetwork(() => apiClient.executeAsync("CreateUser", {
            email: this.data.username,
            password: this.data.password,
            accountType: this.data.accountType,
            mobileNumber: this.data.phoneNumber,
            firstName: this.data.firstName,
            lastName: this.data.lastName,
            birthDate: this.data.birthDate,
            merchant: this.data.merchant
        }));

        return true;
    }

    protected async validateEmailAsync() {
        alert(this.data.validationCode);
        return true;
    }

    wizard: Wizard;

    data: {
        username?: string;
        password?: string;
        repeatPassword?: string;
        validationCode?: number;
        accountTypes?: IAccountType[];
        accountType?: UserAccountType;
        phoneNumber?: string;
        firstName?: string;
        lastName?: string;
        birthDate?: Date;
        merchant?: ICreateMerchant;
    } = {}


    static override info = {
        route: "/sign-up",
        name: "sign-up",
        factory: () => new SignUpPage()
    }
}

export default SignUpPage;