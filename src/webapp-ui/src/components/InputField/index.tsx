import { IComponentOptions,  Component,  TemplateMap, Bindable } from "@eusoft/webapp-core";
import { Class, JsxTypedComponent, Template, forModel } from "@eusoft/webapp-jsx";
import { IEditor, IEditorOptions } from "../../abstraction/IEditor";
import { ViewNode } from "../../Types";
import { IValidationContext, Validator } from "../../abstraction/Validator";
import { IValidable } from "../../abstraction/IValidable";
import { NodeView } from "../NodeView";
import "./index.scss";

interface IInputFieldOptions<TValue> extends IComponentOptions {

    name: string;

    visible?: boolean;

    content: IEditor<TValue, IEditorOptions<TValue>> | JsxTypedComponent<IEditorOptions<TValue>>;

    label?: Bindable<ViewNode>;

    validators?: Bindable<Validator<TValue>[]>;

    value: Bindable<TValue, "two-ways">;
}
 

export const InputFieldTemplates: TemplateMap<InputField<any, IEditor<any>>> = {

    "Default": forModel(m => <Template name="InputField">
        <div className={m.className} visible={m.visible}>
            <Class name="default" />
            <Class name="invalid" condition={m.isValid === false} />

            <label><NodeView>{m.label}</NodeView></label>
            {m.content}
            <div className = "error">
                <NodeView>{m.error}</NodeView>
            </div>
        </div>
    </Template>)
}
export class InputField<TValue, TEditor extends IEditor<TValue>> extends Component<IInputFieldOptions<TValue>> implements IValidable {

    constructor(options?: IInputFieldOptions<TValue>) {

        super();

        this.bindTwoWays(a => a.value, this, a => a.content?.value);

        this.configure({
            template: InputFieldTemplates.Default,
            visible: true,
            ...options,

        });
    }

    protected updateOptions() {

        this.bindOptions("label", "validators", "content", "value", "visible");
    }


    async validateAsync<TTarget>(ctx: IValidationContext<TTarget>, force?: boolean): Promise<boolean> {

        if (!this.validators || this.validators?.length == 0)
            return true;

        const errors: ViewNode[] = [];

        let isValid = false;

        for (const validator of this.validators) {

            const result = await validator(ctx, this.value);
            if (!result.isValid) {
                if (result.error)
                    errors.push(result.error);
            }
        }

        this.isValid = isValid;

        this.error = isValid ? null : errors;

        return isValid;
    }

    error: ViewNode;

    content: TEditor;

    label: ViewNode;

    validators: Validator<TValue>[];

    isValid: boolean;

    value: TValue;

    visible: boolean;
}

export default InputField;