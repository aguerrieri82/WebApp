import { type TemplateMap, type BindExpression } from "@eusoft/webapp-core";
import { Class, Template, forModel } from "@eusoft/webapp-jsx";
import { type IEditorOptions } from "../../abstraction/IEditor";
import { type LocalString } from "../../Types";
import { EditorBuilder } from "../EditorBuilder";
import { Editor } from "../Editor";
import { formatDate } from "../../utils/Date";

interface IDateEditorOptions extends IEditorOptions<Date> {

    placeholder?: LocalString;
}

export const DateEditorTemplates: TemplateMap<DateEditor> = {

    "Default": forModel(m => <Template name="TextEditor">
        <input lang="it-IT" value-mode="focus" placeholder={m.placeholder} visible={m.visible} disabled={m.disabled} type="date" value={m.editValue} >
            <Class name="default"/>
        </input>
    </Template>)
} 

export class DateEditor extends Editor<Date, IDateEditorOptions> {

    constructor(options?: IDateEditorOptions) {

        super();

        this.init(DateEditor, {
            template: DateEditorTemplates.Default,
            ...options
        });
    }

    protected override initProps() {

        this.onChanged("editValue", v => {
            this.value = v ? new Date(v) : undefined
        });

        this.onChanged("value", v => {
            this.editValue = v ? formatDate(v, "{YYYY}-{MM}-{DD}") : undefined;
        });
    }

    placeholder?: string;

    editValue: string;
}


declare module "../EditorBuilder" {
    interface EditorBuilder<TModel, TModelContainer> {
        date(value: BindExpression<TModel, Date>, options?: IBuilderEditorOptions<TModel, Date, IDateEditorOptions>);
    }
}

EditorBuilder.prototype.date = function (this: EditorBuilder<any, any>, value, options) {
    return this.editor(value, DateEditor, options);
}

export default DateEditor;