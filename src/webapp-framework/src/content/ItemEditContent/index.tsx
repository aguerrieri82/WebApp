import { forModel, TemplateModel } from "@eusoft/webapp-jsx";
import { CommitableEditor, Content, EditorBuilder, IContentOptions, IEditor, IObjectEditorOptions, isAsyncLoad, ObjectEditor } from "@eusoft/webapp-ui";
import { ContentBuilder } from "../Builder";
import { ITemplate } from "@eusoft/webapp-core";

export interface IItemEditArgs<TItem> {

    value?: TItem;
}

export interface IItemEditOptions<TItem, TArgs extends IItemEditArgs<TItem> = IItemEditArgs<TItem>> extends IContentOptions<TArgs> {

    onSaveAsync?: (value: TItem) => Promise<boolean>;

    createEditor: (value: TItem) => IEditor<TItem>;
}

export class ItemEditContent<TItem, TArgs extends IItemEditArgs<TItem> = IItemEditArgs<TItem>> extends Content<TArgs, IItemEditOptions<TItem, TArgs>> {

    constructor(options?: IItemEditOptions<TItem, TArgs>) {

        super();

        this.init(ItemEditContent, {

            body: forModel(this, m => <>
                {m.editor}
            </>),

            actions: [{
                name: "save",
                text: "save",
                executeAsync: () => this.saveAsync()
            }],

            ...options
        });
    }


    async saveAsync() {

        if (this.editor instanceof CommitableEditor) {

            if (!await this.editor.commitAsync())
                return;
        }

        if (await this.onSaveAsync(this.editor.value)) {

            await this.host.closeAsync(this.editor.value);
        }
    }

    protected override async onLoadAsync(args?: TArgs) {

        this.editor = this.createEditor(args.value);

        this.editor.value = args.value;

        if (isAsyncLoad(this.editor))
            await this.editor.loadAsync();
    }

    createEditor(value: TItem): IEditor<TItem> {

        throw new Error("createEditor not implemented");
    }

    async onSaveAsync?(value: TItem): Promise<boolean> {

        return true;
    }

    set value(value: TItem) {
        this.editor.value = value;
    }

    get value() {
        return this.editor.value;
    }


    editor: IEditor<TItem>;


    static bulder<TItem extends object, TArgs extends IItemEditArgs<TItem> = IItemEditArgs<TItem>>() {
        return new ItemEditContentBuilder<TItem, TArgs>();
    }
}


export class ItemEditContentBuilder<
    TItem extends object,
    TArgs extends IItemEditArgs<TItem> = IItemEditArgs<TItem>> extends
    ContentBuilder<ItemEditContent<TItem, TArgs>, TArgs, IItemEditOptions<TItem, TArgs>> {

    constructor() {
        super(options => new ItemEditContent(options));
    }

    load(value: (args: TArgs) => Promise<unknown>) {
        this._options.onLoadArgsAsync = value;
        return this;
    }

    save(value: (args: TItem) => Promise<boolean>) {
        this._options.onSaveAsync = value;
        return this;
    }

    editor<TEdit = TItem>(builder: (builder: EditorBuilder<TItem, ObjectEditor<TItem>>) => ITemplate<TItem> | JSX.Element, options?: IObjectEditorOptions<TItem>) {

        const editor = new ObjectEditor({
            ...options,
            builder
        });

        this._options.createEditor = value => {
            editor.beginEdit(value);
            return editor;
        }

        return this;
    }
}