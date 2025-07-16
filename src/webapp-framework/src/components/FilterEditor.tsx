import type { BindExpression } from "@eusoft/webapp-core/abstraction/IBinder";
import { Component } from "@eusoft/webapp-core/Component";
import { forModel } from "@eusoft/webapp-jsx/Helpers";
import { formatString, formatText, HideOnClick, MaterialIcon, type FuckTS, type IEditor, type IEditorOptions, type IItemsSource, type LocalString, type ValueChangedReason, type ViewNode } from "@eusoft/webapp-ui";
import { Variable } from "@eusoft/webapp-ui/behavoirs/Variable";
import { Expression, GetExpression, toKebabCase } from "@eusoft/webapp-core";
import "./FilterEditor.scss"
import type { ISearchItem, SearchItemFormatter, ISearchItemProvider, ISearchItemView, ISearchQuery, ITextValue } from "../abstraction/ISearchItemProvider";
import { matchText, parseSearchQuery, querySearch, type IMatchField, type IQuerySearchProvider } from "../helpers/SmartSearch";
import type { IFilterEditor } from "../abstraction/IFilterEditor";

/**********************************/
/*  Types  */
/**********************************/

type ItemType<TValue, Multiple> = Multiple extends true ? (TValue extends Array<infer TItem> ? TItem : never) : TValue

type FilterFields<TFilter, TValuesFilter> = {
    [K in keyof TFilter & string]?: Omit<IFilterField<TFilter, K, boolean, TValuesFilter>, "name">;
}

type MatchFields<TItem> = {
    [K in keyof TItem as K extends string ? K : never]: SearchItemFormatter<TItem[K]>;
}

/**********************************/
/*  Interfaces  */
/**********************************/

export type DataType = "text" | "enum" | "number" | "date";

export type FilterRenderMode = "field" | "tag" | "text";

export enum FieldSearchMode {
    None = 0,
    MatchLabel = 1,
    LabelOnly = 2,
    Client = 4,
    Source = 8
}

export interface IFilterField<
    TFilter,
    TKey extends keyof TFilter & string,
    Multiple extends boolean,
    TValuesFilter,
    TValue = TFilter[TKey],
    TItemValue = ItemType<TValue, Multiple>> {

    name: TKey;

    valuesSource?: IItemsSource<unknown, TItemValue, TValuesFilter>;

    valuesFilter?: (curFilter: TFilter, query: ISearchQuery) => TValuesFilter,

    searchMode?: FieldSearchMode;

    editor?: IEditor<IEditorOptions<TValue>>;

    dataType?: DataType;

    multipleValues?: Multiple;

    label?: LocalString;

    emptyItemText?: LocalString;

    icon?: ViewNode;

    color?: string;

    priority?: number;

    minQueryLen?: number;

    pickAsync?: () => Promise<ITextValue<TItemValue>>;

    keywords?: (string | RegExp)[];

    required?: boolean | BindExpression<TFilter, boolean>;

    visible?: boolean | BindExpression<TFilter, boolean>;

    enabled?: boolean | BindExpression<TFilter, boolean>;
}

export interface IFilterEditorOptions<TFilter, TItem, TKey extends keyof TFilter & string> extends IEditorOptions<TFilter> {

    fields: IFilterField<TFilter, TKey, boolean, ObjectLike>[] | FilterFields<TFilter, unknown>;

    renderMode: FilterRenderMode;

    matchFields?: (keyof TItem & string)[] | BindExpression<TItem, unknown[]> | MatchFields<TItem>;

    prepareFilter?: (curFilter: TFilter) => TFilter;

    searchProviders?: ISearchItemProvider<TFilter, unknown>[];

    queryField: KeyOfType<TFilter, string>;
}

/**********************************/
/*  itemsSearch */
/**********************************/

export function itemsSearch<
    TFilter,
    TItem,
    TKey extends keyof TFilter & string,
    Multiple extends boolean,
    TValue = TFilter[TKey],
    TItemValue = ItemType<TValue, Multiple>>(

        field: IFilterField<TFilter, TKey, Multiple, ObjectLike>
    )
{

    let items: TItem[];

    let lastItemsFilterJson: string;

    const label = formatText(field.label ?? toKebabCase(field.name)) as string;

    const matchList = field.keywords ?? [label.toLowerCase()];

    const modeMatchLabel = field.searchMode & FieldSearchMode.MatchLabel;

    const modeClient = field.searchMode & FieldSearchMode.Client;

    const modeSource = field.searchMode & FieldSearchMode.Source;

    const modeLabelOnly = field.searchMode & FieldSearchMode.LabelOnly;

    const createView = (value: TItemValue, text?: string, isSearchMode?: boolean) => {

        const result = {
            label: label,
            icon: field.icon,
            color: field.color,
        } as ISearchItemView;

        if (value === null || value === undefined) {
            result.displayValue = isSearchMode ?
                <span className="search">{text}</span> :
                <span className="select">{formatText("field-select")}</span>
        }
        else
            result.displayValue = text;

        return result;
    };

    const apply = (filter: TFilter, value: TItemValue) => {

        if (field.multipleValues) {

            let curVal = filter[field.name] as TItemValue[];
            if (!curVal)
                curVal = [];
            if (!curVal.includes(value))
                curVal.push(value);
            filter[field.name] = curVal as FuckTS;
        }
        else {
            filter[field.name] = value as FuckTS;
        }
    }

    const createItem = (item: Partial<ISearchItem<TFilter, TItemValue>>) => {

        const result = {
            apply,
            fields: [field.name],
            editAsync: field.pickAsync ? () => field.pickAsync() : undefined,
            allowMultiple: field.multipleValues,
            rank: field.priority ?? 0,
            ...item,
        } as ISearchItem<TFilter, TItemValue>;

        if (result.createView)
            result.view = result.createView(result.value);

        return result;
    }

    const refreshItemsAsync = async (itemsFilter: object) => {

        const json = JSON.stringify(itemsFilter);

        if ((modeClient && json != lastItemsFilterJson) ||
            modeSource || !items) {

            if (field.valuesSource)
                items = await field.valuesSource?.getItemsAsync(itemsFilter) as TItem[];
            else
                items = [];
            lastItemsFilterJson = json;
        }
    }

    return {

        async parseAsync(filter: TFilter) { 

            if (!filter)
                return;

            const value = filter[field.name] as TItemValue;
            if (value) {
                const res: ISearchItem<TFilter, TItemValue>[] = [];

                let item: TItem;

                let text: string;

                if (field.valuesSource?.getItemByValueAsync) 

                    item = (await field.valuesSource?.getItemByValueAsync(value as FuckTS)) as TItem;

                else {

                    await refreshItemsAsync({});

                    if (field.valuesSource && items) 
                         item = items.find(a => field.valuesSource.getValue(a) == value);
                }
         
                if (item)
                    text = formatText(field.valuesSource.getText(item)) as string;

                res.push(createItem({
                    value,
                    createView: () => createView(value, text)
                }));

                return res;
            }                
        },

        async searchAsync(query, curFilter, curItems) {
       
            const res: ISearchItem<TFilter, TItemValue>[] = [];

            const [labelMatch, noLabelQuery] = matchText(query, matchList);

            if (modeLabelOnly) {

                const hasExtraQuery = noLabelQuery.full.length > 0;
                const isSearchMode = hasExtraQuery && field.dataType == "text";

                if (labelMatch && (isSearchMode || !hasExtraQuery) || query.full.length == 0) {

                    res.push(createItem({
                        rank: -1,
                        createView: (value, text) => createView(value, text ?? noLabelQuery.full, isSearchMode),
                    }));
                }
            }            

            if (field.minQueryLen && noLabelQuery.full.length < field.minQueryLen)
                return res;

            if ((labelMatch && modeMatchLabel) || !modeMatchLabel) { 

                const itemsFilter = field.valuesFilter ? field.valuesFilter(curFilter, noLabelQuery) : undefined;

                await refreshItemsAsync(itemsFilter);

                const addItem = (item: TItem, text: string) => {

                    const value = field.valuesSource.getValue(item) as TItemValue;

                    res.push(createItem({
                        value,
                        createView: () => createView(value, text)
                    }));
                }

                if (items) {

                    for (const item of items) {

                        const text = (formatText(field.valuesSource.getText(item)) as string);

                        if (modeClient) {

                            if (noLabelQuery.parts.length > 0) {

                                if (!noLabelQuery.parts.every(a => text.toLowerCase().includes(a)))
                                    continue;
                            }
                        }

                        addItem(item, text);
                    }
                }
            }

            return res;
        }

    } as ISearchItemProvider<TFilter, TItemValue>;
}

/**********************************/
/*  FilterEditor */
/**********************************/

export class FilterEditor<TFilter, TItem>
    extends Component<IFilterEditorOptions<TFilter, TItem, keyof TFilter & string>>
    implements IFilterEditor<TFilter, TItem> {

    protected _curSearchProviders: ISearchItemProvider<TFilter, unknown>[] = [];
    protected _firstLoad = true;
    protected _querySearch: IQuerySearchProvider<TFilter, TItem>;

    constructor(options: IFilterEditorOptions<TFilter, TItem, keyof TFilter & string>) {

        super();

        this.init(FilterEditor, {
            ...options,
            template: forModel<this>(m => <div className={m.className} visible={m.visible}>
                <HideOnClick isVisible={m.showSuggestions} inline={false} />
                <div className="search-bar">
                    <input focus={m.hasFocus} type="text" value={m.searchText} value-pool={500} />
                    <button className="clear-filters" on-click={() => m.clearFilters()}>
                        <MaterialIcon name="clear" />
                    </button>
                    <button className="show-filters" on-click={() => m.showFilters()}>
                        <MaterialIcon name="tune" />
                    </button>
                </div>
                <div className="suggestions" visible={m.showSuggestions}>
                    {m.suggestions.forEach(i => <div on-click={() => m.addFilterAsync(i)} className="suggestion">
                        <Variable name="color" value={i.view?.color} />
                        {i.view.icon}
                        {i.view.label && <label>{i.view.label}</label>}
                        <div>{i.view.displayValue}</div>
                    </div>)
                    }
                </div>
                <div className="active-filters">
                    {m.activeFilters.forEach(i => <div className="chip">
                        <Variable name="color" value={i.view.color} />
                        <div className="body" on-click={() => m.editFilterAsync(i)}>
                            {i.view.icon}
                            <div>{i.view.displayValue}</div>
                        </div>
                        <button on-click={() => m.removeFilter(i)}>
                            <MaterialIcon name="close" />
                        </button>
                    </div>)}
                </div>
            </div>)
        });

        this.onChanged("searchText", v => this.searchAsync(v));

        this.onChanged("value", (v, o) => this.onValueChanged(v, o, "edit"));

        this.onChanged("hasFocus", v => this.onFocusChanged(v));
        
        this.build();

        this.showSuggestions = false;
    }

    protected build() {

        const processField = (field: IFilterField<TFilter, keyof TFilter & string, boolean, ObjectLike>) => {

            if (field.searchMode)
                this._curSearchProviders.push(itemsSearch(field));
        }

        if (Array.isArray(this.fields)) {
            for (const field of this.fields)
                processField(field);
        }
        else {
            for (const name in this.fields) {
                processField({ name, ...this.fields[name] });
            }
        }

        if (this.searchProviders)
            this._curSearchProviders.push(...this.searchProviders);

        if (this.queryField) {

            const icon = <MaterialIcon name="abc" />

            const match: IMatchField<TItem, unknown>[] = [];

            if (Array.isArray(this.matchFields)) {
                for (const key of this.matchFields) {
                    match.push({
                        get: item => item[key],
                        format: a => ({
                            displayValue: a?.toString() ?? "",
                            label: formatString(toKebabCase(key)),
                            icon,
                            color: undefined
                        })
                    })
                }
            }
            else if (typeof this.matchFields == "function") {

                const exp = Expression.build(null, this.matchFields).expression;

                const fields: string[] = [];

                const visit = (curExp: Expression<unknown>, curParts: string[]) => {
                    if (curExp.actions.length == 0) {
                        if (curExp != exp)
                            fields.push(curParts.join("."));
                    }
                    else {
                        for (const action of curExp.actions) {
                            if (!(action instanceof GetExpression))
                                continue;
                            visit(action, [...curParts, action.propName])
                        }
                    }        
                }

                visit(exp, []);

                for (const field of fields) {

                    const parts = field.split(".");

                    match.push({
                        get: item => {
                            let curValue = item;

                            for (const part of parts) {
                                if (curValue === null || curValue === undefined)
                                    break;
                                curValue = curValue[part];
                            }

                            return curValue;
                        },
                        format: a => ({
                            displayValue: a?.toString() ?? "",
                            label: formatString(toKebabCase(field.replace(".", "-"))),
                            color: undefined,
                            icon
                        })
                    })
                }

                console.log(exp);
            }
            else {
                for (const key in this.matchFields) {
                    match.push({
                        get: item => item[key as keyof TItem],
                        format: this.matchFields[key]
                    })
                }
            }

            this._querySearch = querySearch({
                queryField: this.queryField,
                minLength: 2,
                match,
                executeAsync: query => this.queryAsync({
                    [this.queryField]: query
                } as TFilter)
            });

            this._curSearchProviders.push(this._querySearch);
        }
    }

    async searchAsync(query: string) {

        if (this._firstLoad)
            return;

        const searchQuery = parseSearchQuery(query);

        if (!this.value)
            this.value = {} as TFilter;

        const results = await Promise.all(
            this._curSearchProviders.map(a => a.searchAsync(searchQuery, this.value, this.activeFilters)));

        const newSug: ISearchItem<TFilter, unknown>[] = [];

        for (const res of results) {

            if (!res)
                return;

            for (const item of res) {
                if (!item.view)
                    item.view = item.createView(item.value);
                newSug.push(item);
            }
        }
         
        newSug.sort((a, b) => a.rank - b.rank);

        this.suggestions = newSug;

        this.showSuggestions = true;
    }

    saveFilter(container: Record<string, unknown>) {

        container["@filter"] = this.activeFilters;
    }

    restoreFilter(container: Record<string, unknown>) {

        if (container && "@filter" in container)
            this.activeFilters = container["@filter"] as typeof this.activeFilters;
    }
     
    protected onFocusChanged(value: boolean) {

        if (value) {
            this.showSuggestions = true;
            if (this._firstLoad) {
                this._firstLoad = false;
            }
            this.searchAsync("");
        }
    }

    protected updateFilter() {

        const curFilter = {} as TFilter;

        if (this.activeFilters) {
            for (const item of this.activeFilters)
                item.apply?.(curFilter, item.value);
        }

        this.value = this.prepareFilter(curFilter);
    }

    showFilters() {

    }

    clearFilters() {
        this.activeFilters = [];
        this.searchText = "";
        this.updateFilter()
    }

    async editFilterAsync(item: ISearchItem<TFilter, unknown>, apply = true) {

        if (!item.editAsync)
            return;
        const edit = await item.editAsync(item.value);
        if (!edit)
            return;
        item.value = edit.value;
        if (item.createView)
            item.view = item.createView(edit.value, edit.text);

        if (apply)
            this.updateFilter();

        return true;
    }

    async addFilterAsync(item: ISearchItem<TFilter, unknown>) {

        if (item.canSelect === false)
            return;

        this.activeFilters ??= [];

        let canAdd = true;

        if (item.value === null || item.value === undefined) {

            item = { ...item };

            if (!await this.editFilterAsync(item, false))
                canAdd = false;
        }

        if (canAdd) {

            if (!item.allowMultiple) {
                for (const field of item.fields) {
                    const current = this.activeFilters.find(a => a.fields.includes(field));
                    if (current) {
                        this.removeFilter(current);
                        break;
                    }
                }
            }
            this.activeFilters.push(item);
            this.updateFilter();
        }

        if (this.searchText.length > 0) {
            this.searchText = "";
            //this.hasFocus = true;
        }

        setTimeout(() => this.showSuggestions = false, 10);
    }

    removeFilter(item: ISearchItem<TFilter, unknown>) {

        const idx = this.activeFilters.indexOf(item);

        if (idx != -1)
            this.activeFilters.splice(idx, 1);

        this.updateFilter()
        this.showSuggestions = false;
    }

    async loadFilterAsync(value: TFilter) {

        const items: ISearchItem<TFilter, unknown>[] = [];

        for (const provider of this._curSearchProviders) {
            if (!provider.parseAsync)
                continue;
            const provItems = await provider.parseAsync(value);
            if (provItems)
                items.push(...provItems);
        }
        this.activeFilters = items;
    }

    onValueChanged(value: TFilter, oldValue: TFilter, reason: ValueChangedReason) {

    }

    prepareFilter?(curFilter: TFilter) {

        return curFilter;
    }

    queryAsync(filter: TFilter): Promise<TItem[]> {

        throw new Error("not supported");
    }

    fields: IFilterField<TFilter, keyof TFilter & string, boolean, ObjectLike>[] | FilterFields<TFilter, unknown>;

    matchFields?: (keyof TItem & string)[] | BindExpression<TItem, unknown[]> | MatchFields<TItem>;

    searchProviders?: ISearchItemProvider<TFilter, unknown>[];

    queryField: KeyOfType<TFilter, string>;

    renderMode: FilterRenderMode;

    label: ViewNode;

    disabled: boolean;

    value: TFilter;

    hasFocus: boolean;

    showSuggestions: boolean;

    activeFilters: ISearchItem<TFilter, unknown>[];

    suggestions: ISearchItem<TFilter, unknown>[];

    searchText: string = "";
}