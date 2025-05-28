import { type IComponentOptions,  Component,  type TemplateMap, type Bindable } from "@eusoft/webapp-core";
import { Class, type JsxTypedComponent, Template, forModel } from "@eusoft/webapp-jsx";
import { type IEditor, type IEditorOptions } from "../../abstraction/IEditor";
import { type ViewNode } from "../../Types";
import { type IValidationContext, type Validator } from "../../abstraction/Validator";
import { type IValidable } from "../../abstraction/IValidable";
import { NodeView } from "../NodeView";
import "./index.scss";
import { isCommitable } from "../../abstraction";

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

    protected override initProps() {

        this.bindTwoWays(a => a.value, this, a => a.content?.value);

        this.onChanged("value", v => {

            this.resetValidation();
        });
    }

    beginEdit() {

        if (isCommitable(this.content))
            this.content.beginEdit();
    }

    resetValidation() {
        this.isValid = true;
        this.error = null;
    }

    async commitAsync() {

        if (this.content?.disabled || !this.visible)
            return true;

        if (isCommitable(this.content))
            return await this.content.commitAsync();

        return true;
    }

    async validateAsync<TInnerTarget>(ctx: IValidationContext<TInnerTarget & TTarget>, force?: boolean): Promise<boolean> {

        if (this.content?.disabled || !this.visible)
            return true;

        const errors: ViewNode[] = [];

        let isValid = true;

        const newCtx = { ...ctx, fieldName: this.name };

        if (!await this.commitAsync())
            isValid = false;

        if (this.validators) {
            for (const validator of this.validators) {

                const result = await validator(newCtx, this.value);
                if (!result.isValid) {
                    if (result.error)
                        errors.push(result.error);
                    isValid = false;
                }
            }
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

    isAttached: boolean;    

    value: TValue;
}

export default InputField;