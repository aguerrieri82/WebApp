import { TemplateMap, Bindable, BindValue, BindExpression } from "@eusoft/webapp-core";
import { Template, debug, forModel } from "@eusoft/webapp-jsx";
import { IEditorOptions } from "../../abstraction/IEditor";
import { LocalString } from "../../Types";
import { EditorBuilder } from "../EditorBuilder";
import { Editor } from "../Editor";

interface ITextEditorOptions extends IEditorOptions<string> {

    password?: Bindable<boolean>;

    multiLine?: Bindable<boolean>;

    rows?: Bindable<number>;

    placeholder?: LocalString;
}

export const TextEditorTemplates: TemplateMap<TextEditor> = {

    "Default": forModel(m => <Template name="TextEditor">
        <input visible={m.visible} disabled={m.disabled} type={m.password ? "password" : "text"} value={m.value} />
    </Template>)
}

export class TextEditor extends Editor<string, ITextEditorOptions> {

    constructor(options?: ITextEditorOptions) {

        super();

        this.configure({
            ...options,
            template: TextEditorTemplates.Default
        });
    }

    protected updateOptions() {

        this.bindOptions("password", "rows");
    }

    rows?: number;

    placeholder?: string;

    password: boolean;
}


declare module "../EditorBuilder" {
    interface EditorBuilder<TModel> {
        text(value: BindExpression<TModel, string>, options?: IBuilderEditorOptions<string, ITextEditorOptions>);
    }
}

EditorBuilder.prototype.text = function (this: EditorBuilder<any>, value, options) {
    return this.editor(value, TextEditor, options);
}

export default TextEditor;