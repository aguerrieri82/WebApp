import { Binder, ITemplate, TemplateMap } from "@eusoft/webapp-core";
import { Bind, Content, Template, forModel } from "@eusoft/webapp-jsx";
import { IEditorOptions } from "../../abstraction/IEditor";
import { EditorBuilder } from "../EditorBuilder";
import { Editor } from "../Editor";
import { InputField } from "../../components";
import { IValidable } from "../../abstraction/IValidable";
import { ViewNode } from "../../Types";

interface IObjectEditorOptions<TObj extends Record<string, any>> extends IEditorOptions<TObj> {

    builder: (builder: EditorBuilder<TObj>) => ITemplate<TObj> | JSX.Element;
}

export const ObjectEditorTemplates: TemplateMap<ObjectEditor<any>> = {

    "Default": forModel(m => <Template name="ObjectEditor">
        <div> 
            <Content src={m.value} template={Bind.noBind(m.contentTemplate(m.value))}/>
        </div>
    </Template>)
}

export class ObjectEditor<TObj extends Record<string, any>> extends Editor<TObj, IObjectEditorOptions<TObj>> implements IValidable  {

    protected _editors: InputField<any, any>[];
    protected _isDirty: boolean;

    constructor(options?: IObjectEditorOptions<TObj>) {

        super();

        this.configure({
            ...options,
            template: ObjectEditorTemplates.Default
        });
    }

    protected updateOptions() {

        this.bindOptions("builder");
    }

    contentTemplate(model: TObj) { 

        this._editors = [];

        var result = this.builder(new EditorBuilder({
            model,
            attach: editor => {
                this._editors.push(editor);
                editor.onChanged("value", v => {
                    this._isDirty = true;
                });
            }
        }));

        return result;
    }

    async validateAsync(force?: boolean): Promise<boolean> {

        let isValid = true;

        for (const editor of this._editors) {
            if (!await editor.validateAsync())
                isValid = false;
        }

        this.isValid = isValid;

        this._isDirty = false;

        return isValid;
    }

    error: ViewNode;

    isValid: boolean;

    builder: (builder: EditorBuilder<TObj>) => JSX.Element;
}

export default ObjectEditor;