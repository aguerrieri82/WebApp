import { Content, type IAction, type IContent, type IContentInstance, type IContentOptions, type IEditor, type IItemsSource, type IItemViewOptions, ItemView, ListView, type LocalString, MaterialIcon, useOperation, type ViewNode } from "@eusoft/webapp-ui";
import { type IFilterField } from "../abstraction/IFilterEditor";
import { Class, forModel } from "@eusoft/webapp-jsx";
import router from "../services/Router";
import { userInteraction } from "../services/UserInteraction";
import "./ItemListContent.scss"
import { cleanProxy } from "@eusoft/webapp-core/Expression";

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
    filter?: Omit<IFilterField<TItem, TValue, boolean>, "name" | "value">;
    canSort?: boolean;
}

export type ListFilterMode = "tags" | "text" | "controls" | "none";

export type ListSelectionMode = "none" | "single" | "multiple";

export type ListEditMode = "modal" | "page" | "auto";

export interface IItemListOptions<TItem, TFilter> extends IContentOptions<unknown> {
    canAdd?: boolean;
    canEdit?: boolean;
    canDelete?: boolean | { (item: TItem) : Promise<boolean>|boolean };
    canOpen?: boolean;
    selectionMode?: ListSelectionMode;
    editMode?: ListEditMode;
    deleteItemAsync?: (item: TItem) => Promise<boolean>;
    confirmDeleteMessage?: ViewNode;
    addLabel?: ViewNode;
    itemsSource: IItemsSource<TItem, unknown, unknown>;
    itemActions?: (item: TItem, result: IAction<TItem, IItemActionContext<TItem>>[]) => IAction<TItem, IItemActionContext<TItem>>[],
    columns: IListColumn<TItem, unknown>[];
    openItem?: (item: TItem) => unknown;
    itemEditContent?: (item: TItem) => IContentInstance<ObjectLike, IContent>;
    itemAddContent?: (item?: TItem) => Content<unknown> | Class<Content<unknown>>;
    createItemView?: (item: TItem, actions?: IAction<TItem>[]) => ViewNode | Class<Content<unknown>>;
    itemView?: Partial<IItemViewOptions<TItem>> | { (item: TItem) : Partial<IItemViewOptions<TItem>> },
    pageSize?: number;
    prepareFilter?: (curFilter?: TFilter, offset?: number, limit?: number) => TFilter;
    filterMode?: ListFilterMode;
    filterEditor?: () => IEditor<TFilter> | Class<IEditor<TFilter>>;
    emptyView?: ViewNode;
    maxItemActions?: number;
}

export class ItemListContent<TItem, TFilter> extends Content<unknown, IItemListOptions<TItem, TFilter>> {

    constructor(options?: IItemListOptions<TItem, TFilter>) {

        super();

        this.init(ItemListContent, {

            body: forModel(this, m => <div className="item-list">
                <Class name="can-open" condition={m.canOpen}/>
                {m.items?.length == 0 ?
                    <>{m.emptyView}</> :
                    <>
                    </>
                }
                <ListView createItemView={item => m.createItemView(item, m.getItemActions(item))}>
                    {m.items}
                </ListView>
            </div>),

            ...options
        });
    }

    protected getItemActions(item: TItem) {

        const result = [...this.builtInActions];

        if (Array.isArray(this.itemActions))
            result.push(... this.itemActions);

        else if (this.itemActions)
            result.push(...this.itemActions(item, []));

        result.forEach((action, i) => {
            result[i] = {
                ...action,
                executeAsync: async () => {

                    const index = this.items.indexOf(cleanProxy(item));

                    const ctx = {
                        target: item,
                        index
                    }

                    const res = await action.executeAsync(ctx);

                    if (res === true)
                        this.refreshItem(index);
                    else if (res === false)
                        this.refreshAsync();

                    return res;
                }
            }
        });

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
                executeAsync: ctx => this.deleteItemInternalAsync(ctx.target, ctx.index)
            });

        if (this.canEdit)
            this.builtInActions.push({
                name: "edit",
                text: "edit",
                type: "local",
                icon: <MaterialIcon name="edit" />,
                priority: "secondary",
                executeAsync: ctx => this.editItemAsync(ctx.target)
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

        return true;
    }

    getColumnContent(item: TItem, column: IListColumn<TItem, unknown>) : ViewNode {

        if (column.content)
            return column.content(item);
        return column.value(item) as ViewNode;
    }

    createItemView(item: TItem, actions?: IAction<TItem>[]) {

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
            onClick: () => {
                if (this.canOpen)
                    this.openItem(item);
            },
            ...options
        });
    }

    createNewItem(): TItem {

        return undefined;
    }

    async refreshAsync() {

        const items = await this.itemsSource.getItemsAsync(this.prepareFilter());

        this.items = items;
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
                if (!await userInteraction.confirmAsync(this.confirmDeleteMessage, "confirm"))
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

    addLabel?: LocalString;

    builtInActions: IAction<TItem, IItemActionContext<TItem>>[];

    canAdd: boolean;

    canDelete: boolean | { (item: TItem): Promise<boolean> | boolean };

    canEdit: boolean;

    canOpen: boolean;

    confirmDeleteMessage: ViewNode;

    itemsSource: IItemsSource<TItem, unknown, unknown>;

    itemAddContent?: (item?: TItem) => Content<unknown> | Class<Content<unknown>>;

    itemEditContent?: (item: TItem) => IContentInstance<ObjectLike, IContent>;

    openItem?: (item: TItem) => unknown;

    emptyView: ViewNode;

    items: TItem[] = [];

    columns: IListColumn<TItem, unknown>[];

    itemView?: Partial<IItemViewOptions<TItem>> | { (item: TItem): Partial<IItemViewOptions<TItem>> };

    itemActions: (item: TItem, result: IAction<TItem, IItemActionContext<TItem>>[]) => IAction<TItem, IItemActionContext<TItem>>[];
}

