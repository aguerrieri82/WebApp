import { type TemplateMap, type Bindable, type BindExpression } from "@eusoft/webapp-core";
import { Class, forModel } from "@eusoft/webapp-jsx";
import { type IEditorOptions } from "../abstraction/IEditor";
import { type LocalString } from "../Types";
import { EditorBuilder } from "./EditorBuilder";
import { Editor } from "./Editor";
import "./TextEditor.scss"; 

type TextEditorType = "text" | "password" | "tel" |"email";

interface ITextEditorOptions extends IEditorOptions<string> {

    type?: Bindable<TextEditorType>;
     
    multiLine?: Bindable<boolean>;

    rows?: Bindable<number>; 

    placeholder?: LocalString;

    autocomplete?: Bindable<AutoFill>;
}

export const TextEditorTemplates: TemplateMap<TextEditor> = {

    "Default": forModel(m => <>{m.rows && m.rows > 1 ?
        <textarea rows={m.rows} className={m.className} placeholder={m.placeholder} visible={m.visible} value={m.value}>
            <Class name="default" />
        </textarea>
        :
        <input autocomplete={m.autocomplete} className={m.className} placeholder={m.placeholder} visible={m.visible} disabled={m.disabled} type={m.type} value={m.value} >
            <Class name="default" />
        </input>
    }</>)
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

    autocomplete: AutoFill;
}


declare module "./EditorBuilder" {
    interface EditorBuilder<TModel, TModelContainer> {
        text(value: BindExpression<TModel, string>, options?: IBuilderEditorOptions<TModel, string, ITextEditorOptions>);
    }
}

EditorBuilder.prototype.text = function (this: EditorBuilder<string, unknown>, value, options) {
    return this.editor(value, TextEditor, options);
}

export default TextEditor;