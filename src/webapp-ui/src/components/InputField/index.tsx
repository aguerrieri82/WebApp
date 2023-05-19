import { IComponentOptions,  Component,  TemplateMap, Bindable } from "@eusoft/webapp-core";
import { Class, JsxTypedComponent, Template, forModel } from "@eusoft/webapp-jsx";
import { IEditor, IEditorOptions } from "../../abstraction/IEditor";
import { ViewNode } from "../../Types";
import { IValidationContext, Validator } from "../../abstraction/Validator";
import { IValidable } from "../../abstraction/IValidable";
import { NodeView } from "../NodeView";

interface IInputFieldOptions<TValue> extends IComponentOptions {

    name: string;

    content: IEditor<TValue, IEditorOptions<TValue>> | JsxTypedComponent<IEditorOptions<TValue>>;

    label?: Bindable<ViewNode>;

    validators?: Bindable<Validator<TValue>[]>;

    value: Bindable<TValue, "two-ways">;
}


export const InputFieldTemplates: TemplateMap<InputField<any, IEditor<any>>> = {

    "Default": forModel(m => <Template name="InputField">
        <div className={m.className}>
            <Class name="invalid" condition={m.isValid === false}/>
            <label><NodeView>{m.label}</NodeView></label>
            {m.content}
            <div>
                <NodeView>{m.error}</NodeView>
            </div>
        </div>
    </Template>)
}
export class InputField<TValue, TEditor extends IEditor<TValue>> extends Component<IInputFieldOptions<TValue>> implements IValidable {

    constructor(options?: IInputFieldOptions<TValue>) {

        super();

        this.bindTwoWays(a => a.value, a => a.content?.value);

        this.configure({
            ...options,
            template: InputFieldTemplates.Default
        });
    }

    protected updateOptions() {

        this.bindOptions("name", "label", "validators", "content", "value");
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

    name: string;

    error: ViewNode;

    content: TEditor;

    label: ViewNode;

    validators: Validator<TValue>[];

    isValid: boolean;

    value: TValue;
}

export default InputField;