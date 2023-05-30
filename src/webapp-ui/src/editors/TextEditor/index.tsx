import { TemplateMap, Bindable, BindExpression } from "@eusoft/webapp-core";
import { Class, Template, forModel } from "@eusoft/webapp-jsx";
import { IEditorOptions } from "../../abstraction/IEditor";
import { LocalString } from "../../Types";
import { EditorBuilder } from "../EditorBuilder";
import { Editor } from "../Editor";
import "./index.scss"; 

type TextEditorType = "text" | "password" | "tel";

interface ITextEditorOptions extends IEditorOptions<string> {

    type?: Bindable<TextEditorType>;
     
    multiLine?: Bindable<boolean>;

    rows?: Bindable<number>; 

    placeholder?: LocalString;

    autocomplete?: Bindable<string>;
}

export const TextEditorTemplates: TemplateMap<TextEditor> = {

    "Default": forModel(m => <Template name="TextEditor">
        <input autocomplete={m.autocomplete} className={m.className}  placeholder={m.placeholder} visible={m.visible} disabled={m.disabled} type={m.type} value={m.value} >
            <Class name="default" />
        </input>
    </Template>)
} 

export class TextEditor extends Editor<string, ITextEditorOptions> {

    constructor(options?: ITextEditorOptions) {

        super();

        this.init(TextEditor, {
            template: TextEditorTemplates.Default,
            type: "text",
            ...options
        });
    }


    rows?: number;

    placeholder?: string;

    type: TextEditorType;

    autocomplete: string;
}


declare module "../EditorBuilder" {
    interface EditorBuilder<TModel, TModelContainer> {
        text(value: BindExpression<TModel, string>, options?: IBuilderEditorOptions<TModel, string, ITextEditorOptions>);
    }
}

EditorBuilder.prototype.text = function (this: EditorBuilder<any, any>, value, options) {
    return this.editor(value, TextEditor, options);
}

export default TextEditor;