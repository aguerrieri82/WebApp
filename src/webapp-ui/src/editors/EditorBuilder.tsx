import { Expression, type BindExpression, type ComponentStyle, toKebabCase, type ITemplate, type TemplateBuilder, Bind, template } from "@eusoft/webapp-core";
import { type ViewNode } from "../types";
import { type IEditor, type IEditorOptions } from "../abstraction/IEditor";
import { type Validator } from "../abstraction/Validator";
import { type IInputFieldOptions, InputField } from "../components";
import { type ILabel } from "../abstraction";
import { type JsxTypedElement, type TemplateModel } from "@eusoft/webapp-jsx";
import { emptyObject } from "../utils";

interface EditorBuilderOptions<TModel, TModelContainer extends Record<string, unknown>> {

    model: BindExpression<TModelContainer, TModel>;

    container: TModelContainer;

    attach?: (editor: InputField<unknown, IEditor<unknown>>) => void;

    inputField?: Partial<IInputFieldOptions<unknown, TModel>>; 
}

export interface IBuilderEditorOptions<TModel, TValue, TEditorOptions extends IEditorOptions<TValue>> {

    name?: string;

    label?: ViewNode;

    onChanged?: (model: TModel, value: TValue) => void;

    visible?: BindExpression<TModel, boolean>;

    disabled?: BindExpression<TModel, boolean>;

    validators?: Validator<TValue, TModel>[];

    style?: ComponentStyle;

    editor?: Partial<TEditorOptions>;
}

export class EditorBuilder<TModel extends TemplateModel, TModelContainer extends {}> {

    protected _options: EditorBuilderOptions<TModel, TModelContainer>;

    constructor(options: EditorBuilderOptions<TModel, TModelContainer>) {
        this._options = options;
    }

    content(template: JsxTypedElement<TModel, unknown>) {

        return {
            model: this._options.container,
            template: (t: TemplateBuilder<TModelContainer>) =>
                t.enter(Bind.exp<TModelContainer, TModel>(m => this._options.model(m)), t => (template as ITemplate<TModel>)(t))
        }   
    }

    get container() {
        return this._options.container; 
    }

    when(bind: BindExpression<TModel, boolean>, content: ViewNode) {

        return {
            model: this._options.model(this._options.container),
            template: template(t => t.if(Bind.exp(bind), t2 => t2.content(content as any))) //TODO: fix this
        };
    }

    editor<TValue,
        TEditor extends IEditor<TValue, TOptions>,
        TOptions extends IEditorOptions<TValue>>(bind: BindExpression<TModel, TValue>, type: { new(options: TOptions): TEditor }, options: IBuilderEditorOptions<TModel, TValue, TOptions>) {

        const editor = new type(options.editor as TOptions);

        const propName = Expression.build(null, bind).expression.property()?.propName;

        const label = options?.label ?? toKebabCase(options?.name ?? propName);

        const editorHasLabel = "label" in editor;

        const input = new InputField({
            content: editor,
            name: options?.name ?? propName,
            label: !editorHasLabel ? label: undefined,
            validators: options?.validators,
            value: undefined,
            ...this._options?.inputField,
            style: options?.style ?? this._options?.inputField?.style,
        }); 

        if (editorHasLabel)
            (editor as ILabel).label = label;

        input.bindTwoWays(m => m.value, this._options.container, m => bind(this._options.model(m) ?? emptyObject("editor") as TModel));
         
        if (options.onChanged)
            input.prop("value").subscribe(v => {
                const model = this._options.model(this._options.container);
                options.onChanged(model, v as TValue);
            })

        if (options.visible) 
            input.bindOneWay(m => m.visible, this._options.container, m => options.visible(this._options.model(m)));

        if (options.disabled)
            input.bindOneWay(m => m.content?.disabled, this._options.container, m => options.disabled(this._options.model(m)));

        if (this._options.attach)
            this._options.attach(input);

        return input;
    }
}

export function refreshOnChanged<TModel, TValue>(exp: BindExpression<TModel, TValue>) {

    return (input: InputField<TValue, IEditor<TValue>>, model: TModel) => {
        input.binder.model
    }
}