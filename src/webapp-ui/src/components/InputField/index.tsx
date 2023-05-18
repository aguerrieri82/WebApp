import { IComponentOptions,  Component,  TemplateMap, ITemplateProvider, Bindable, IComponent, propOf, ITemplate } from "@eusoft/webapp-core";
import { Class, Template, forModel } from "@eusoft/webapp-jsx";
import { IEditor, IEditorOptions } from "../../abstraction/IEditor";
import { ViewNode } from "../../Types";
import { Validator } from "../../abstraction/Validator";
import { IValidable } from "../../abstraction/IValidable";

type InputFieldEditor<T> = IEditor<T>;

interface IInputFieldOptions<TValue> extends IComponentOptions {

    name: string;

    content: IComponent<IEditorOptions<TValue>> | ITemplate<TValue>;

    label?: Bindable<ViewNode>;

    validators?: Bindable<Validator<TValue>[]>;

    value: Bindable<string, "two-ways">;
}


export const InputFieldTemplates: TemplateMap<InputField<any, InputFieldEditor<any>>> = {

    "Default": forModel(m => <Template name="InputField">
        <div className={m.className}>
            <Class name="invalid" condition={m.isValid === false}/>
            <label>{m.label}</label>
            {m.content}
            <div>
                {m.error}
            </div>
        </div>
    </Template>)
}
export class InputField<TValue, TEditor extends InputFieldEditor<TValue>> extends Component<IInputFieldOptions<TValue>> implements IValidable {

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

    validateAsync(force?: boolean): Promise<boolean> {

        return null;
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