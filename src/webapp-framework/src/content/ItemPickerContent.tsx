import { Action, Content, type IAction, type IContentOptions, type IItemsSource, ItemView, ListView, type LocalString, type ViewNode } from "@eusoft/webapp-ui";
import { type Class } from "@eusoft/webapp-core";
import { forModel } from "@eusoft/webapp-jsx";
import router from "../services/Router";
import "./ItemPickerContent.scss"

export interface IItemPickerOptions<TItem, TFilter> extends IContentOptions<unknown> {
    canAdd?: boolean;
    addLabel?: ViewNode;
    itemsSource: IItemsSource<TItem, unknown, unknown>;
    itemAddContent?: (item?: TItem) => Content<unknown> | Class<Content<unknown>>;
    createItemView?: (item: TItem, actions?: IAction<TItem>[]) => ViewNode | Class<Content<unknown>>;
    pageSize?: number;
    prepareFilter?: (text: string, offset?: number, limit?: number) => TFilter;
    emptyView?: ViewNode;
}

export class ItemPickerContent<TItem, TFilter> extends Content<unknown, IItemPickerOptions<TItem, TFilter>> {

    constructor(options?: IItemPickerOptions<TItem, TFilter>) {

        super();

        this.init(ItemPickerContent, {

            body: forModel(this, m => <div className="item-list">
                <input type="text" value-pool={500} value={m.searchText} />

                {m.canAdd && <>
                    <Action>{m.addLabel}</Action>
                </>}

                {m.items?.length == 0 ?
                    <>{m.emptyView}</> :
                    <>
                    </>
                }

                <ListView createItemView={item => m.createItemView(item)}>
                    {this.items}
                </ListView>
            </div>),

            ...options
        });
    }

    override async onLoadAsync() {

        await this.refreshAsync();
    }

    createNewItem(): TItem {
        return null;
    }

    createItemView(item: TItem) {

        return new ItemView({
            content: item,
            primary: this.itemsSource.getText(item),
            icon: this.itemsSource.getIcon ? this.itemsSource.getIcon(item) : undefined,
        });
    }


    async refreshAsync() {

        const items = await this.itemsSource.getItemsAsync(this.prepareFilter(this.searchText));

        this.items = items;
    }


    async addItemAsync() {

        if (!this.canAdd || !this.itemAddContent)
            return;

        const builder = this.itemAddContent(this.createNewItem());

        const content = typeof builder == "function" ? new builder() : builder;

        const newItem = await router.navigatePageForResultAsync(content);    

        if (newItem)
            await this.refreshAsync();
    }

    prepareFilter(text: string, offset?: number, limit?: number): TFilter{
        return null;
    }

    searchText: string; 

    addLabel?: LocalString;

    canAdd: boolean;

    itemsSource: IItemsSource<TItem, unknown, unknown>;

    itemAddContent?: (item?: TItem) => Content<unknown> | Class<Content<unknown>>;

    emptyView: ViewNode;

    items: TItem[] = [];
}

