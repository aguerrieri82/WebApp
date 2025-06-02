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

    "Default": forModel(m => <div className={m.className} visible={m.visible}>
        <Class name="no-box" />
        <Class name="disabled" condition={m.disabled} />
        <div className="items">
            {m.editValue.forEach(a => <ItemView
                actions={[{
                    name: "delete",
                    icon: <MaterialIcon name="delete" />,
                    priority: "secondary",
                    executeAsync: async c => m.deleteItem(c.target)
                }]}
                maxActions={1}
                primary={m.itemView(a)}
                content={a} />)}
        </div>
        <div className="actions">
            {[m.addAction].forEach(a => createAction(a, "text"))}
        </div>
        {m.activeEditor}
    </div>)
}

export class ArrayEditor<TItem> extends CommitableEditor<TItem[], TItem[], IArrayEditorOptions<TItem>> {

    constructor(options?: IArrayEditorOptions<TItem>) {

        super();

        this.init(ArrayEditor, {
            template: ArrayEditorTemplates.Default,
            ...options,
        });
    }

    override initProps() {
        super.initProps();
        this.addAction = {
            name: "add",
            text: this.newItemLabel ?? "add-item",
            type: "local",
            executeAsync: () => this.addItemAsync(),
            priority: "primary"
        }
    }

    async addItemAsync() {

        const item = await this.editItemAsync(this.newItem(), this.newItemLabel);
        if (!item)
            return;

        if (!this.editValue)
            this.editValue = [];

        this.editValue.push(item);  
    }

    protected editItemAsync(item: TItem, title: LocalString) {

        const editor = this.itemEditor(item);

        return new Promise<TItem>(async res => {

            this.activeEditor = new Popup({
                body: editor,
                title: formatText(title),
                actions: [{
                    name: "save",
                    text: "save",
                    executeAsync: async () => {

                        if (isCommitable(editor) && !await editor.commitAsync())
                            return false;

                        res(editor.value);

                        return true;
                    }
                }, {
                    name: "cancel",
                    text: "cancel",
                    executeAsync: async () => {
                        res(undefined);
                        return true;
                    }
                }]
            });

            await (this.activeEditor as Popup).showAsync();
        });
    }

    deleteItem(item: TItem) {

        this.editValue.splice(this.editValue.indexOf(item), 1);
    }

    itemView(item: TItem) {

        return item?.toString();
    }

    newItem() {
        return undefined;
    }

    itemEditor(item: TItem): IEditor<TItem> {

        throw new Error("Not implemented");
    }

    addAction: IAction;

    activeEditor: IComponent;

    newItemLabel: LocalString;
}


declare module "./EditorBuilder" {
    interface EditorBuilder<TModel, TModelContainer> {
        array<TItem>(value: BindExpression<TModel, TItem[]>, options?: IBuilderEditorOptions<TModel, TItem[], IArrayEditorOptions<TItem>>);
    }
}

EditorBuilder.prototype.array = function (this: EditorBuilder<any, any>, value, options) {
    return this.editor(value, ArrayEditor, options);
}

export default ArrayEditor;