import { TemplateMap } from "@eusoft/webapp-core";
import { Template, forModel } from "@eusoft/webapp-jsx";
import { IEditorOptions } from "../../abstraction/IEditor";
import { EditorBuilder } from "../EditorBuilder";
import { Editor } from "../Editor";

interface IObjectEditorOptions<TObj extends Record<string, any>> extends IEditorOptions<TObj> {

    content: (model: TObj, builder: EditorBuilder<TObj>) => JSX.Element;
}

export const ObjectEditorTemplates: TemplateMap<ObjectEditor<any>> = {

    "Default": forModel(m => <Template name="ObjectEditor">
        <div>
            {m.contentTemplate()}
        </div>
    </Template>)
}

export class ObjectEditor<TObj extends Record<string, any>> extends Editor<TObj, IObjectEditorOptions<TObj>>  {

    constructor(options?: IObjectEditorOptions<TObj>) {

        super();

        this.configure({
            ...options,
            template: ObjectEditorTemplates.Default
        });
    }

    protected updateOptions() {

        this.bindOptions("content");
    }

    contentTemplate() {
        return this.content(this.value, new EditorBuilder({
            attach: editor => {

            }
        }));
    }

    content: (model: TObj, builder: EditorBuilder<TObj>) => JSX.Element;
}

export default ObjectEditor;