import { type BindExpression, type TemplateMap } from "@eusoft/webapp-core";
import { Class, forModel } from "@eusoft/webapp-jsx";
import { type IEditorOptions } from "../abstraction/IEditor";
import { type LocalString } from "../types";
import { Editor } from "./Editor";
import { EditorBuilder } from "./EditorBuilder";
import "./NumberEditor.scss";

interface INumberEditorOptions extends IEditorOptions<number> {

    placeholder?: LocalString;

}

export const NumberEditorTemplates: TemplateMap<NumberEditor> = {

    "Default": forModel(m => <>
        <input placeholder={m.placeholder} visible={m.visible} disabled={m.disabled} type="number" value={m.editValue} >
            <Class name="default"/>
        </input>

    </>)
} 

export class NumberEditor extends Editor<number, INumberEditorOptions> {

    constructor(options?: INumberEditorOptions) {

        super();

        this.init(NumberEditor, {
            template: NumberEditorTemplates.Default,
            ...options
        });
    }

    protected override initProps() {

        this.onChanged("editValue", v => {
            this.value = v ? parseFloat(v) : undefined;
        });

        this.onChanged("value", v => {
            this.editValue = (v === null || v === undefined) ? null : v.toString();
        });
    }

    placeholder?: string;

    editValue: string;

}

declare module "./EditorBuilder" {
    interface EditorBuilder<TModel, TModelContainer> {
        number(value: BindExpression<TModel, number>, options?: IBuilderEditorOptions<TModel, number, INumberEditorOptions>);
    }
}

EditorBuilder.prototype.number = function (this: EditorBuilder<number, unknown>, value, options) {
    return this.editor(value, NumberEditor, options);
}

export default NumberEditor;