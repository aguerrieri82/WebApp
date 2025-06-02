import { type TemplateMap, type BindExpression, type IComponent } from "@eusoft/webapp-core";
import { Class, forModel } from "@eusoft/webapp-jsx";
import { type IEditor, type IEditorOptions } from "../abstraction/IEditor";
import { EditorBuilder } from "./EditorBuilder";
import { CommitableEditor } from "./CommitableEditor";
import { type LocalString, type ViewNode } from "../Types";
import { createAction, ItemView, MaterialIcon, Popup } from "../components";
import { type IAction, isCommitable } from "../abstraction";
import { formatText } from "../utils/Format";


interface IArrayEditorOptions<TItem> extends IEditorOptions<TItem[]> {

    itemEditor: (item: TItem) => IEditor<TItem>;

    newItem?: () => Partial<TItem>;

    itemView?: (item: TItem) => ViewNode;

    newItemLabel?: LocalString;

}

export const ArrayEditorTemplates: TemplateMap<ArrayEditor<unknown>> = {

    "Default": forModel(m => <div >
        <div className="actions">
            {[m.addAction].forEach(a => createAction(a, "text"))}
        </div>
        {m.activeEditor}
    </div>)
}
