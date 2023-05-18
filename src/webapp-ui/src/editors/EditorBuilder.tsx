import { BindExpression, BindValue } from "@eusoft/webapp-core/abstraction/IBinder";
import { Constructor, ViewNode } from "../Types";
import { IEditor, IEditorOptions } from "../abstraction/IEditor";
import { Validator } from "../abstraction/Validator";
import { InputField } from "../components";
import { USE } from "@eusoft/webapp-core";
import { Bind } from "@eusoft/webapp-jsx";

interface EditorBuilderOptions<TModel, TModelContainer extends Record<string, any>> {

    model: BindExpression<TModelContainer, TModel>;

    container: TModelContainer;

    attach?: (editor: InputField<any, any>) => void;
}

export interface IBuilderEditorOptions<TValue, TEditorOptions extends IEditorOptions<TValue>> {

    name?: string;

    label?: ViewNode;

    validators?: Validator<TValue>[];

    editor: TEditorOptions;
}

export class EditorBuilder<TModel, TModelContainer extends Record<string, any>> {

    protected _options: EditorBuilderOptions<TModel, TModelContainer>;

    constructor(options: EditorBuilderOptions<TModel, TModelContainer>) {
        this._options = options;
    }

    editor<TValue,
        TEditor extends IEditor<TValue, TOptions>,
        TOptions extends IEditorOptions<TValue>>(bind: BindExpression<TModel, TValue>, type: { new (options: TOptions): TEditor }, options: IBuilderEditorOptions<TValue, TOptions>) {

        const editor = new type(options.editor);

        const input = new InputField({
            content: editor,
            name: options?.name,
            label: options?.label,
            validators: options?.validators,
            value: undefined
        });

        input.bindTwoWays(m => Bind.build(m)
            .use(this._options.container)
            .get(this._options.model)
            .get(bind).value, m => m.value);

        if (this._options.attach)
            this._options.attach(input);

        return input;
    }
}