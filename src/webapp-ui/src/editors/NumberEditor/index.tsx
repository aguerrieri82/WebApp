import { TemplateMap, BindExpression } from "@eusoft/webapp-core";
import { Class, Template, forModel } from "@eusoft/webapp-jsx";
import { IEditorOptions } from "../../abstraction/IEditor";
import { LocalString } from "../../Types";
import { EditorBuilder } from "../EditorBuilder";
import { Editor } from "../Editor";

interface INumberEditorOptions extends IEditorOptions<number> {

    placeholder?: LocalString;
}

export const NumberEditorTemplates: TemplateMap<NumberEditor> = {

    "Default": forModel(m => <Template name="TextEditor">
        <input placeholder={m.placeholder} visible={m.visible} disabled={m.disabled} type="number" value={m.editValue} >
            <Class name="default"/>
        </input>
    </Template>)
} 

export class NumberEditor extends Editor<number, INumberEditorOptions> {

    constructor(options?: INumberEditorOptions) {

        super();

        this.init(NumberEditor, {
            template: NumberEditorTemplates.Default,
            ...options
        });
    }

    protected initWork() {

        this.onChanged("editValue", v => this.value = v ? parseFloat(v) : undefined);

        this.onChanged("value", v => this.editValue = (v === null || v === undefined) ? undefined : v.toString());
    }

    protected updateOptions() {

        this.bindOptions("placeholder");
    }

    placeholder?: string;

    editValue: string;
}


declare module "../EditorBuilder" {
    interface EditorBuilder<TModel, TModelContainer> {
        number(value: BindExpression<TModel, number>, options?: IBuilderEditorOptions<TModel, number, INumberEditorOptions>);
    }
}

EditorBuilder.prototype.number = function (this: EditorBuilder<any, any>, value, options) {
    return this.editor(value, NumberEditor, options);
}

export default NumberEditor;