import { Content, IAction, IContentOptions, IEditor, IItemsSource, ItemView, ListView, LocalString, MaterialIcon, ViewNode } from "@eusoft/webapp-ui";
import { IFilterField } from "../../abstraction/IFilterEditor";
import { Bind, Class } from "@eusoft/webapp-core";
import { forModel } from "@eusoft/webapp-jsx";
import router from "../../services/Router";

export interface IListColumn<TItem, TValue> {
    name?: string;
    header: ViewNode;
    priority?: "primary" | "secondary";
    value: (item: TItem) => TValue;
    sortValue?: (item: TItem) => string | number;
    content?: (item: TItem) => ViewNode;
    filter?: Omit<IFilterField<TItem, TValue, any>, "name" | "value">;
    canSort?: boolean;
}

export type ListFilterMode = "tags" | "text" | "controls" | "none";

export type ListSelectionMode = "none" | "single" | "multiple";

export type ListEditMode = "modal" | "page" | "auto";

export interface IItemListOptions<TItem, TFilter> extends IContentOptions<unknown> {
    canAdd?: boolean;
    canEdit?: boolean;
    canDelete?: boolean;
    canOpen?: boolean;
    selectionMode?: ListSelectionMode;
    editMode?: ListEditMode;
    deleteItemAsync?: (item: TItem) => Promise<boolean>;
    confirmDeleteMessage?: ViewNode;
    addLabel?: ViewNode;
    itemsSource: IItemsSource<TItem, unknown, unknown>;
    itemActions?: (item?: TItem) => IAction<TItem>[] | IAction<TItem>[];
    columns: IListColumn<TItem, unknown>[];
    openItem?: (item: TItem) => any;
    itemEditContent?: (item: TItem) => Content<unknown> | Class<Content<unknown>>;
    itemAddContent?: (item?: TItem) => Content<unknown> | Class<Content<unknown>>;
    createItemView?: (item: TItem, actions?: IAction<TItem>[]) => ViewNode | Class<Content<unknown>>;
    pageSize?: number;
    prepareFilter?: (curFilter?: TFilter, offset?: number, limit?: number) => TFilter;
    filterMode?: ListFilterMode;
    filterEditor?: () => IEditor<TFilter> | Class<IEditor<TFilter>>;
    emptyView?: ViewNode;
}

export class ItemListContent<TItem, TFilter> extends Content<unknown, IItemListOptions<TItem, TFilter>> {

    constructor(options?: IItemListOptions<TItem, TFilter>) {

        super();

        this.init(ItemListContent, {

            body: forModel(this, m => <div className="item-list">
                {m.items?.length == 0 ?
                    <>{m.emptyView}</> :
                    <>
                    </>
                }
                <ListView createItemView={Bind.action(item => m.createItemView(item, m.getItemActions(item)))}>
                    {this.items}
                </ListView>
            </div>),

            ...options
        });
    }

    getItemActions(item: TItem) {

        const result = [...this.buildInActions];

        if (Array.isArray(this.itemActions))
            result.push(... this.itemActions);

        else if (this.itemActions)
            result.push(... this.itemActions(item));

        return result;
    }

    override async onLoadAsync() {

        this.buildInActions = [];

        if (this.canDelete)
            this.buildInActions.push({
                name: "delete",
                icon: <MaterialIcon name="delete" />,
                priority: "secondary",
                executeAsync: ctx => this.deleteItemAsync(ctx.target)
            });

        this.actions = [];

        if (this.canAdd)
            this.actions.push({
                name: "add",
                icon: <MaterialIcon name="add" />,
                priority: "primary",
                type: "local",
                text: this.addLabel ?? "add-new",
                executeAsync: async () => this.addItemAsync()
            });

        await this.refreshAsync();
    }

    getColumnContent(item: TItem, column: IListColumn<TItem, unknown>) : ViewNode {

        if (column.content)
            return column.content(item);
        return column.value(item) as ViewNode;
    }

    createItemView(item: TItem, actions?: IAction<TItem>[]) {

        const primary = this.columns?.find(a => a.priority == "primary");

        const secondary = this.columns?.filter(a => a.priority == "secondary");

        return new ItemView({
            content: item,
            primary: primary ? this.getColumnContent(item, primary) : this.itemsSource.getText(item),
            secondary: secondary?.map(a => this.getColumnContent(item, a)),
            icon: this.itemsSource.getIcon ? this.itemsSource.getIcon(item) : undefined,
            actions: actions
        });
    }

    createNewItem(): TItem {

        return undefined;
    }

    async refreshAsync() {

        const items = await this.itemsSource.getItemsAsync(this.prepareFilter());

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

    prepareFilter(curFilter?: TFilter, offset?: number, limit?: number) : TFilter{
        return curFilter;
    }

    async deleteItemAsync(item: TItem) : Promise<boolean>{

        return false;
    }

    addLabel?: LocalString;

    buildInActions: IAction<TItem>[];

    canAdd: boolean;

    canDelete: boolean;

    itemsSource: IItemsSource<TItem, unknown, unknown>;

    itemAddContent?: (item?: TItem) => Content<unknown> | Class<Content<unknown>>;

    emptyView: ViewNode;

    items: TItem[] = [];

    columns: IListColumn<TItem, unknown>[];

    itemActions: (item?: TItem) => IAction<TItem>[] | IAction<TItem>[];
}