import { type TemplateMap, type BindExpression, type IComponent } from "@eusoft/webapp-core";
import { Class, forModel } from "@eusoft/webapp-jsx";
import { type IEditor, type IEditorOptions } from "../abstraction/IEditor";
import { EditorBuilder } from "./EditorBuilder";
import { CommitableEditor } from "./CommitableEditor";
import { type LocalString, type ViewNode } from "../Types";
import { createAction, ItemView, MaterialIcon, Popup } from "../components";
import { type IAction, isCommitable, isValidable } from "../abstraction";
import { formatText } from "../utils/Format";


interface IArrayEditorOptions<TItem> extends IEditorOptions<TItem[]> {

    itemEditor: (item: TItem) => IEditor<TItem>;

    newItem?: () => Partial<TItem>;

    itemView?: (item: TItem) => ViewNode;

    newItemLabel?: LocalString;

    editMode: "inplace" | "popup";
}

export const ArrayEditorTemplates: TemplateMap<ArrayEditor<unknown>> = {

    "Default": forModel(m => <div className={m.className} visible={m.visible}>
        <Class name="no-box" />
        <Class name="disabled" condition={m.disabled} />
        <div className="items">
            {m.editValue.forEach(a => <ItemView
                actions={[{
                    name: "edit",
                    icon: <MaterialIcon name="edit" />,
                    priority: "secondary",
                    type: "local",
                    executeAsync: c => m.updateItemAsync(c.target)
                },{
                    name: "delete",
                    icon: <MaterialIcon name="delete" />,
                    priority: "secondary",
                    executeAsync: async c => m.deleteItem(c.target)
                }]}
                maxActions={2}
                primary={m.itemView(a)}
                content={a} />)}
        </div>
        <div className="actions">
            {createAction(m.addAction, "text")}
        </div>
        {m.editMode == "inplace" && <div className="editor-contaner">
            {m.activeEditor}
            {m.activeEditor && createAction(m.saveAction, "text")}
        </div>}
    </div>)
}

export class ArrayEditor<TItem> extends CommitableEditor<TItem[], TItem[], IArrayEditorOptions<TItem>> {

    private _editPopup: Popup;
    private _editPromise: (a: TItem) => void;

    constructor(options?: IArrayEditorOptions<TItem>) {

        super();

        this.init(ArrayEditor, {
            template: ArrayEditorTemplates.Default,
            editMode: "popup",
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

        this.saveAction = {
            name: "save",
            text: "save-item",
            type: "local",
            executeAsync: () => this.saveItemAsync(),
            priority: "primary"
        }
    }

    async updateItemAsync(item: TItem) {

        const result = await this.editItemAsync(item, "save");
        if (item !== result && typeof item == "object")
            Object.assign(item, result);
        return result;
    }

    async addItemAsync() {

        const item = await this.editItemAsync(this.newItem(), this.newItemLabel);

        if (!item)
            return;

        if (!this.editValue)
            this.editValue = [];

        this.editValue.push(item);  
    }

    async saveItemAsync() {

        if (isValidable(this.activeEditor) && !await this.activeEditor.validateAsync()) 
            return;

        if (isCommitable(this.activeEditor) && !await this.activeEditor.commitAsync())
            return;

        if (this._editPromise) {
            this._editPromise((this.activeEditor as IEditor<TItem>).value);
            this._editPromise = null;
        }
    }

    protected async editItemAsync(item: TItem, title: LocalString) {

        const editor = this.itemEditor(item);

        editor.value = item;

        if (this.editMode == "popup") {

            return new Promise<TItem>(res => {

                this._editPopup = new Popup({
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

                this._editPopup.showAsync();
            });

           
        }
        else {

            this.activeEditor = editor;

            let result = await new Promise<TItem>(res => this._editPromise = res);

            this.activeEditor = null;

            return result;
        }
    }

    override unmount() {
        //this._editPopup?.unmount();
        //this._editPopup = undefined;
        super.unmount();
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

    editMode: IArrayEditorOptions<TItem>["editMode"];

    addAction: IAction;

    saveAction: IAction;

    activeEditor: IComponent;

    newItemLabel: LocalString;
}


declare module "./EditorBuilder" {
    interface EditorBuilder<TModel, TModelContainer> {
        array<TItem>(value: BindExpression<TModel, TItem[]>, options?: IBuilderEditorOptions<TModel, TItem[], IArrayEditorOptions<TItem>>);
    }
}

EditorBuilder.prototype.array = function (this: EditorBuilder<unknown[], unknown>, value, options) {
    return this.editor(value, ArrayEditor, options);
}

export default ArrayEditor;