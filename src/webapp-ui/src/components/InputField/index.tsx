import { IComponentOptions,  Component,  TemplateMap, Bindable } from "@eusoft/webapp-core";
import { Class, JsxTypedComponent, Template, forModel } from "@eusoft/webapp-jsx";
import { IEditor, IEditorOptions } from "../../abstraction/IEditor";
import { ViewNode } from "../../Types";
import { IValidationContext, Validator } from "../../abstraction/Validator";
import { IValidable, isValidable } from "../../abstraction/IValidable";
import { NodeView } from "../NodeView";
import "./index.scss";

export interface IInputFieldOptions<TValue, TTarget> extends IComponentOptions {

    name: string;

    content: IEditor<TValue, IEditorOptions<TValue>> | JsxTypedComponent<IEditorOptions<TValue>>;

    label?: Bindable<ViewNode>;

    validators?: Bindable<Validator<TValue, TTarget>[]>;

    value: Bindable<TValue, "two-ways">; 
} 
 

export const InputFieldTemplates: TemplateMap<InputField<unknown, IEditor<any>>> = {

    "Default": forModel(m => <Template name="InputField">
        <div className={m.className} visible={m.visible}>
            <Class name="default" />
            <Class name="invalid" condition={m.isValid === false} />
            <Class name="empty" condition={m.value === null || m.value === undefined || m.value === ""} />

            <label><NodeView>{m.label}</NodeView></label>
            <div className="editor-container">
                {m.content}
            </div>
            <div className = "error">
                <NodeView>{m.error}</NodeView>
            </div>
        </div>
    </Template>)
}
export class InputField<TValue, TEditor extends IEditor<TValue>, TTarget = unknown> extends Component<IInputFieldOptions<TValue, TTarget>> implements IValidable {

    constructor(options?: IInputFieldOptions<TValue, TTarget>) {

        super();

        this.init(InputField, {
            template: InputFieldTemplates.Default,
            visible: true,
            style: "filled",
            ...options,
        });
    }

    protected override initWork() {

        this.bindTwoWays(a => a.value, this, a => a.content?.value);

        this.onChanged("value", () => {

            this.resetValidation();
        });
    }

    protected override updateOptions() {

        this.bindOptions("label", "validators", "content", "value");
    }

    resetValidation() {
        this.isValid = true;
        this.error = null;
    }

    async validateAsync<TInnerTarget>(ctx: IValidationContext<TInnerTarget & TTarget>, force?: boolean): Promise<boolean> {

        if (!this.validators || this.validators?.length == 0)
            return true;

        const errors: ViewNode[] = [];

        let isValid = true;

        const newCtx = { ...ctx, fieldName: this.name };

        for (const validator of this.validators) {

            const result = await validator(newCtx, this.value);
            if (!result.isValid) {
                if (result.error)
                    errors.push(result.error);
                isValid = false;
            }
        }

        if (isValidable(this.content)) {
            if (!await this.content.validateAsync(ctx, force))
                isValid = false;
        }

        this.isValid = isValid;

        this.error = isValid ? null : errors;

        return isValid;
    }

    error: ViewNode;

    content: TEditor;

    label: ViewNode;

    validators: Validator<TValue, TTarget>[];

    isValid: boolean;

    value: TValue;
}

export default InputField;