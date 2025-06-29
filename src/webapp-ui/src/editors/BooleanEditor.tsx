import { type TemplateMap, type BindExpression, type Bindable, Bind } from "@eusoft/webapp-core";
import { Class, forModel } from "@eusoft/webapp-jsx";
import { type IEditorOptions } from "../abstraction/IEditor";
import { EditorBuilder } from "./EditorBuilder";
import { Editor } from "./Editor";
import { type ViewNode } from "../types";
import "./BooleanEditor.scss";
import { CheckBox, NodeView } from "../components";
import { type ILabel } from "../abstraction/ILabel";

interface IBooleanEditorOptions extends IEditorOptions<boolean> {

    label: Bindable<ViewNode>;
}

export const BoolEditorTemplates: TemplateMap<BooleanEditor> = {

    "Default": forModel(m =>
        <CheckBox disabled={m.disabled} visible={m.visible} style={[m.style, m.name, "no-box"]} value={Bind.twoWays(m.value)} >
            {m.label}
        </CheckBox>),
    "Classic": forModel(m => <label className={m.className} visible={m.visible} >
        <Class name="no-box" />
            <input  disabled={m.disabled} type="checkbox" value={m.value} >
                <Class name="default" />
            </input>
            {m.label && <span><NodeView>{m.label}</NodeView></span>}
        </label>)
} 

export class BooleanEditor extends Editor<boolean, IBooleanEditorOptions> implements ILabel {

    constructor(options?: IBooleanEditorOptions) {

        super();

        this.init(BooleanEditor, {
            template: BoolEditorTemplates.Default,
            ...options
        });
    }

    label: ViewNode;
}

declare module "./EditorBuilder" {
    interface EditorBuilder<TModel, TModelContainer> {
        boolean(value: BindExpression<TModel, boolean>, options?: IBuilderEditorOptions<TModel, boolean, IBooleanEditorOptions>);
    }
}

EditorBuilder.prototype.boolean = function (this: EditorBuilder<boolean, unknown>, value, options) {
    return this.editor(value, BooleanEditor, {
        style: "no-error",
       ...options
    });
}

export default BooleanEditor;