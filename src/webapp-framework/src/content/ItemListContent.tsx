import { Action, Content, formatText, type IAction, type IContent, type IContentInstance, type IContentOptions, type IItemsSource, type IItemViewOptions, ItemView, ListView, type LocalString, MaterialIcon, useOperation, type ViewNode } from "@eusoft/webapp-ui";
import { type IFilterEditor  } from "../abstraction/IFilterEditor";
import { Class, forModel } from "@eusoft/webapp-jsx";
import router from "../services/Router";
import { userInteraction } from "../services/UserInteraction";
import "./ItemListContent.scss"
import { cleanProxy } from "@eusoft/webapp-core/Expression";
import { ContentBuilder } from "./Builder";
import { isClass, type ComponentStyle } from "@eusoft/webapp-core";

export interface IItemActionContext<TItem> {
    target: TItem;
    index: number;
}

export interface IListColumn<TItem, TValue> {
    name?: string;
    header: ViewNode;
    priority?: "primary" | "secondary" | "evidence";
    value: (item: TItem) => TValue;
    sortValue?: (item: TItem) => string | number;
    content?: (item: TItem) => ViewNode;
    //filter?: Omit<IFilterField<TItem, TValue, boolean, unknown>, "name" | "value">;
    canSort?: boolean;
}

export type ListFilterMode = "tags" | "text" | "controls" | "none";

export type ListSelectionMode = "none" | "single" | "multiple";

export type ListEditMode = "modal" | "page" | "auto";

export type ListPaginationMode = "manual" | "auto" | "none";

export interface IItemListOptions<TItem, TFilter> extends IContentOptions<ObjectLike> {

    canAdd?: boolean | { (): boolean };

    canEdit?: boolean | { (item?: TItem):  boolean };

    canDelete?: boolean | { (item: TItem): boolean };

    itemStyle: (item: TItem) => ComponentStyle;

    canOpen?: boolean;

    selectionMode?: ListSelectionMode;

    editMode?: ListEditMode;

    deleteItemAsync?: (item: TItem) => Promise<boolean>;

    confirmDeleteMessage?: LocalString;

    addLabel?: ViewNode;

    itemsSource: IItemsSource<TItem, unknown, unknown>;

    itemActions?: (item: TItem, result: IAction<TItem, IItemActionContext<TItem>>[]) => void,

    columns: IListColumn<TItem, unknown>[];

    openItem?: (item: TItem) => unknown;

    itemEditContent?: (item: TItem) => IContentInstance<ObjectLike, IContent>;

    itemAddContent?: (item?: TItem) => Content<ObjectLike> | Class<Content<ObjectLike>>;

    createItemView?: (item: TItem, actions?: IAction<TItem>[], openItem?: (item: TItem) => unknown) => ViewNode | Class<Content<ObjectLike>>;

    itemView?: Partial<IItemViewOptions<TItem>> | { (item: TItem): Partial<IItemViewOptions<TItem>> },

    pageSize?: number;

    prepareFilter?: (curFilter?: TFilter, offset?: number, limit?: number) => TFilter;

    filterMode?: ListFilterMode;

    filterEditor?: () => IFilterEditor<TFilter, TItem> | Class<IFilterEditor<TFilter, TItem>>;

    emptyView?: ViewNode;

    maxItemActions?: number;

    paginationMode?: ListPaginationMode;
}

export class ItemListContent<TItem, TFilter> extends Content<ObjectLike, IItemListOptions<TItem, TFilter>> {

    protected _curFilter: TFilter;

    protected _filterEditor: IFilterEditor<TFilter, TItem>;

    constructor(options?: IItemListOptions<TItem, TFilter>) {

        super();

        this.init(ItemListContent, {

            body: forModel(this, m => <div className="item-list">
                <Class name="can-open" condition={m.canOpen} />
                
                {m.filterEditor && <div className="filter">
                    {m.createFilterEditor()}
                </div>}

                {m.items?.length == 0 ?
                    <>{m.emptyView}</> :
                    <>
                    </>
                }
                <ListView createItemView={item => m.createItemView(item, m.getItemActions(item), m.openItem)}>
                    {m.items}
                </ListView>
                {(m.paginationMode == "manual" && m.canLoadMore) &&
                    <Action style="text" name="load-more" onExecuteAsync={() => m.loadNextPageAsync()}>
                        {formatText("load-more", this.pageSize.toString())}
                    </Action>
                }
            </div>),

            ...options
        });
    }

    protected getItemActions(item: TItem) {

        let result = [...this.builtInActions];

        this.itemActions(item, result);

        result = result.filter(a => !a.canExecute || a.canExecute({ target: item }));

        let i = 0;
        for (const action of result) { 

            const oldExecute = action.executeAsync;


            result[i] = {
                ...action,
                executeAsync: async () => {

                    const index = this.items.indexOf(cleanProxy(item));

                    const ctx = {
                        target: item,
                        index
                    }

                    const res = await oldExecute(ctx);

                    if (res === true)
                        this.refreshItem(index);
                    else if (res === false)
                        this.refreshAsync();

                    return res;
                }
            }
            i++;
        }

        return result;
    }

    refreshItem(index: number) {
        this.items.set(index, { ...this.items[index] }); 
    }

    override async onLoadAsync() {

        this.builtInActions = [];

        if (this.canDelete)
            this.builtInActions.push({
                name: "delete",
                text: "delete",
                icon: <MaterialIcon name="delete" />,
                priority: "secondary",
                canExecute: ctx => (typeof this.canDelete == "function") ? this.canDelete(ctx.target) : true,
                executeAsync: ctx => this.deleteItemInternalAsync(ctx.target, ctx.index)
            });

        if (this.canEdit)
            this.builtInActions.push({
                name: "edit",
                text: "edit",
                type: "local",
                icon: <MaterialIcon name="edit" />,
                priority: "secondary",
                canExecute: ctx => (typeof this.canEdit == "function") ? this.canEdit(ctx.target) : true,
                executeAsync: ctx => this.editItemAsync(ctx.target)
            });

        this.actions ??= [];

        if (this.canAdd)
            this.actions.push({
                name: "add",
                icon: <MaterialIcon name="add" />,
                priority: "primary",
                type: "local",
                text: this.addLabel ?? "add-new",
                canExecute: ctx => (typeof this.canAdd == "function") ? this.canAdd() : true,
                executeAsync: async () => this.addItemAsync()
            });

        await this.refreshAsync();

        return true;
    }

    getColumnContent(item: TItem, column: IListColumn<TItem, unknown>) : ViewNode {

        if (column.content)
            return column.content(item);
        return column.value(item) as ViewNode;
    }

    createItemView(item: TItem, actions?: IAction<TItem>[], openItem?: (item: TItem) => unknown) {

        const primary = this.columns?.find(a => a.priority == "primary");

        const secondary = this.columns?.filter(a => a.priority == "secondary");

        const evidence = this.columns?.find(a => a.priority == "evidence");

        const options = typeof this.itemView == "function" ? this.itemView(item) : this.itemView;

        return new ItemView({
            content: item,
            primary: primary ? this.getColumnContent(item, primary) : this.itemsSource.getText(item),
            secondary: secondary?.map(a => this.getColumnContent(item, a)).join(" - "),
            evidence: evidence ? this.getColumnContent(item, evidence) : undefined,
            icon: this.itemsSource.getIcon ? this.itemsSource.getIcon(item) : undefined,
            actions: actions,
            style: this.itemStyle(item),
            onClick: () => openItem?.(item),
            ...options
        });
    }

    createNewItem(): TItem {

        return undefined;
    }

    async refreshAsync() {
        await this.loadNextPageAsync(true);
    }

    async loadNextPageAsync(clear?: boolean) {

        const newItems = await this.itemsSource.getItemsAsync(
            this.prepareFilter(this._curFilter, clear ? 0 : this.items.length, this.pageSize));

        if (clear)
            this.items = [...newItems];
        else
            this.items.push(...newItems);

        this.canLoadMore = newItems.length >= this.pageSize;
    }

    async editItemAsync(item: TItem) {

        if (!this.canEdit || !this.itemEditContent)
            return;

        const instance = this.itemEditContent(item);

        const newItem = await router.navigatePageForResultAsync(instance.factory(), instance.args);    

        if (newItem)
            await this.refreshAsync();
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

    protected deleteItemInternalAsync(item: TItem, index?: number) {

        return useOperation(async () => {

            if (this.confirmDeleteMessage) {
                if (!await userInteraction.confirmAsync(formatText(this.confirmDeleteMessage), "confirm"))
                    return;
            }

            if (await this.deleteItemAsync(item)) {

                if (index !== undefined)
                    this.items.splice(index, 1);
                else
                    await this.refreshAsync();
            }
                
        });
    }

    createFilterEditor() {

        if (!this._filterEditor) {

            if (isClass(this.filterEditor))
                this._filterEditor = new this.filterEditor();
            else
                this._filterEditor = this.filterEditor() as IFilterEditor<TFilter, TItem>;

            this._filterEditor.onValueChanged = v => {

                this._curFilter = v;
                this.refreshAsync();            
            }

            this._filterEditor.queryAsync = async filter => {

                const newItems = await this.itemsSource.getItemsAsync(
                    this.prepareFilter(filter, 0, this.pageSize));
                return newItems;
            }
        }

        return this._filterEditor;
    }

    itemStyle(item: TItem) {
        return undefined;
    }

    itemActions(item: TItem, result: IAction<TItem, IItemActionContext<TItem>>[]) {

    }

    addLabel?: LocalString;

    builtInActions: IAction<TItem, IItemActionContext<TItem>>[];

    canAdd: boolean | { (): boolean };

    canDelete: boolean | { (item: TItem): boolean };

    canEdit: boolean | { (item: TItem): boolean };

    canOpen: boolean;

    confirmDeleteMessage: LocalString;

    itemsSource: IItemsSource<TItem, unknown, unknown>;

    itemAddContent?: (item?: TItem) => Content<ObjectLike> | Class<Content<ObjectLike>>;

    itemEditContent?: (item: TItem) => IContentInstance<ObjectLike, IContent>;

    openItem?: (item: TItem) => unknown;

    emptyView: ViewNode;

    items: TItem[] = [];

    columns: IListColumn<TItem, unknown>[];

    itemView?: Partial<IItemViewOptions<TItem>> | { (item: TItem): Partial<IItemViewOptions<TItem>> };

    pageSize: number;

    paginationMode?: ListPaginationMode;

    canLoadMore: boolean;

    filterEditor?: () => IFilterEditor<TFilter, TItem> | Class<IFilterEditor<TFilter, TItem>>;

    static builder<TItem, TFilter>() {
        return new ItemListContentBuilder<TItem, TFilter>();
    }
}

export class ItemListContentBuilder<
    TItem,
    TFilter> extends
    ContentBuilder<ItemListContent<TItem, TFilter>, ObjectLike, IItemListOptions<TItem, TFilter>> {

    constructor() {
        super(options => new ItemListContent(options));
    }

}

