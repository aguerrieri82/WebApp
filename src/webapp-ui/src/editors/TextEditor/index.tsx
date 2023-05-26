import { TemplateMap, Bindable, BindExpression } from "@eusoft/webapp-core";
import { Class, Template, forModel } from "@eusoft/webapp-jsx";
import { IEditorOptions } from "../../abstraction/IEditor";
import { LocalString } from "../../Types";
import { EditorBuilder } from "../EditorBuilder";
import { Editor } from "../Editor";
import "./index.scss"; 
  
interface ITextEditorOptions extends IEditorOptions<string> {

    password?: Bindable<boolean>;
     
    multiLine?: Bindable<boolean>;

    rows?: Bindable<number>; 

    placeholder?: LocalString;

    autocomplete?: Bindable<string>;
}

export const TextEditorTemplates: TemplateMap<TextEditor> = {

    "Default": forModel(m => <Template name="TextEditor">
        <input autocomplete={m.autocomplete} className={m.className}  placeholder={m.placeholder} visible={m.visible} disabled={m.disabled} type={m.password ? "password" : "text"} value={m.value} >
            <Class name="default"/>
        </input>
    </Template>)
} 

export class TextEditor extends Editor<string, ITextEditorOptions> {

    constructor(options?: ITextEditorOptions) {

        super();

        this.init(TextEditor, {
            template: TextEditorTemplates.Default,
            ...options
        });
    }

    protected updateOptions() {

        this.bindOptions("password", "rows", "placeholder", "autocomplete");
    }

    rows?: number;

    placeholder?: string;

    password: boolean;

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