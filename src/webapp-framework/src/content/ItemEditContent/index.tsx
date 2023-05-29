import { forModel } from "@eusoft/webapp-jsx";
import { Content, IContentOptions } from "../Content";
import { CommitableEditor, IEditor, isAsyncLoad } from "@eusoft/webapp-ui";

export interface IItemEditArgs<TItem> {

    value?: TItem;
}

export interface IItemEditOptions<TItem, TArgs extends IItemEditArgs<TItem>> extends IContentOptions<TArgs> {

    onSaveAsync?: (value: TItem) => Promise<boolean>;

    createEditor: (value: TItem) => IEditor<TItem>;
}

export class ItemEditContent<TItem, TArgs extends IItemEditArgs<TItem> = IItemEditArgs<TItem>> extends Content<IItemEditOptions<TItem, TArgs>, IItemEditArgs<TItem>> {

    constructor(options?: IItemEditOptions<TItem, TArgs>) {

        super();

        this.init(ItemEditContent, {
            template: forModel(m => <>
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

    protected override async onOpenAsync(args?: TArgs) {

        this.editor = this.createEditor(args.value);

        this.editor.value = args.value;

        if (isAsyncLoad(this.editor))
            await this.editor.loadAsync();

        return true;
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
}