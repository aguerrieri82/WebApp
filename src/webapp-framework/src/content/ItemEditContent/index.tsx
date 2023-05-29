import { forModel } from "@eusoft/webapp-jsx";
import { Content, IContentOptions } from "../Content";
import { CommitableEditor, Editor, IEditor, IEditorOptions } from "@eusoft/webapp-ui";
import { BindValue, Bindable} from "@eusoft/webapp-core";

export interface IItemEditOptions<TItem> extends IContentOptions {

    saveAsync?: (value: TItem) => Promise<boolean>;

    editor: BindValue<TItem, IEditor<TItem>>;

    value?: Bindable<TItem, "two-ways">;
}

export class ItemEditContent<TItem> extends Content<IItemEditOptions<TItem>> {

    constructor(options?: IItemEditOptions<TItem>) {

        super();

        this.init(ItemEditContent, {
            template: forModel(m => <>
                {m.editor}
            </>),
            actions: [{
                name: "save",
                text: "save",
                executeAsync: () => this.doSaveAsync()
            }],
            ...options
        });
    }

    protected async doSaveAsync() {

        if (this.editor instanceof CommitableEditor) {

            if (!await this.editor.commitAsync())
                return;
        }

        this.saveAsync(this.editor.value);
    }

    set value(value: TItem) {
        this.editor.value = value;
    }

    get value() {
        return this.editor.value;
    }

    saveAsync?: (value: TItem) => Promise<boolean>;

    editor: Editor<TItem, IEditorOptions<TItem>>;
}