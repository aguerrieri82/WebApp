import { TemplateMap, BindExpression, Bindable } from "@eusoft/webapp-core";
import { Class, Template, forModel } from "@eusoft/webapp-jsx";
import { IEditorOptions } from "../../abstraction/IEditor";
import { EditorBuilder } from "../EditorBuilder";
import { Editor } from "../Editor";
import { ViewNode } from "../../Types";
import "./index.scss";

interface IBooleanEditorOptions extends IEditorOptions<boolean> {

    label: Bindable<ViewNode>;
}

export const BoolEditorTemplates: TemplateMap<BooleanEditor> = {

    "Default": forModel(m => <Template name="BooleanEditor">
        <label className={m.className} >
            <input visible={m.visible} disabled={m.disabled} type="checkbox" value={m.value} >
                <Class name="default" />
            </input>
            {m.label && <span>{m.label}</span>}
        </label>
     
    </Template>)
} 

export class BooleanEditor extends Editor<boolean, IBooleanEditorOptions> {

    constructor(options?: IBooleanEditorOptions) {

        super();

        this.init(BooleanEditor, {
            template: BoolEditorTemplates.Default,
            ...options
        });
    }


    protected updateOptions() {

        this.bindOptions("label");
    }

    label: ViewNode;
}


declare module "../EditorBuilder" {
    interface EditorBuilder<TModel, TModelContainer> {
        boolean(value: BindExpression<TModel, boolean>, options?: IBuilderEditorOptions<TModel, boolean, IBooleanEditorOptions>);
    }
}

EditorBuilder.prototype.boolean = function (this: EditorBuilder<any, any>, value, options) {
    return this.editor(value, BooleanEditor, options);
}

export default BooleanEditor;