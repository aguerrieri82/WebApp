
import type { BindExpression } from "@eusoft/webapp-core/abstraction/IBinder";
import { Component } from "@eusoft/webapp-core/Component";
import { forModel } from "@eusoft/webapp-jsx/Helpers";
import { formatText, MaterialIcon, type IEditor, type IEditorOptions, type IItemsSource, type LocalString, type ValueChangedReason, type ViewNode } from "@eusoft/webapp-ui";
import { Variable } from "@eusoft/webapp-ui/behavoirs/Variable";
import { toKebabCase } from "@eusoft/webapp-core";
import "./FilterEditor.scss"

/**********************************/
/*  Const  */
/**********************************/

const QUERY_SPLIT = /([^\s"']+)|"([^"]*)"|'([^']*)'/g


/**********************************/
/*  Types  */
/**********************************/

type ItemType<TValue, Multiple> = Multiple extends true ? (TValue extends Array<infer TItem> ? TItem : never) : TValue

type FilterFields<TFilter, TValuesFilter> = {
    [K in keyof TFilter & string]?: Omit<IFilterField<TFilter, K, boolean, TValuesFilter>, "name">;
};


type KeyOfValue<TFilter, TValue> = {
    [K in keyof TFilter]: TFilter[K] extends TValue ? K : never
}[keyof TFilter];


type MatchFields<TItem> = {
    [K in keyof TItem as K extends string ? K : never]: ISearchItemFormatter<TItem[K]>;
};

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
    TValue = TFilter[TKey]> {

    name: TKey;

    valuesSource?: IItemsSource<unknown, ItemType<TValue, Multiple>, TValuesFilter>;

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

    keywords?: (string | RegExp)[];

    required?: boolean | BindExpression<TFilter, boolean>;

    visible?: boolean | BindExpression<TFilter, boolean>;

    enabled?: boolean | BindExpression<TFilter, boolean>;
}

interface ISearchItemView {

    label: string;

    displayValue: ViewNode;

    icon?: ViewNode;

    color?: string;
}

interface ISearchItemFormatter<TValue> {
    formatValue(value: TValue): ISearchItemView;
}

export interface ISearchItem<TFilter, TValue> {

    view: ISearchItemView;

    priority?: number;

    value?: TValue;

    apply?(filter: TFilter): void;

    editAsync?(): Promise<TValue>;
}

export interface ISearchQuery {
    full: string;
    parts: string[];
}


export interface ISearchItemProvider<TFilter, TValue> {

    searchAsync(query: ISearchQuery, curFilter: TFilter, curItems: ISearchItem<TFilter, unknown>[]): Promise<Iterable<ISearchItem<TFilter, TValue>>>;

    parse?(filter: TFilter): ISearchItem<TFilter, unknown>[];
}

export interface IFilterEditorOptions<TFilter, TItem, TKey extends keyof TFilter & string> extends IEditorOptions<TFilter> {

    fields: IFilterField<TFilter, TKey, boolean, ObjectLike>[] | FilterFields<TFilter, unknown>;

    renderMode: FilterRenderMode;

    matchFields?: (keyof TItem & string)[] | BindExpression<TItem, unknown[]> | MatchFields<TItem>;

    prepareFilter?: (curFilter: TFilter) => TFilter;

    searchProviders?: ISearchItemProvider<TFilter, unknown>[];

    queryField: KeyOfValue<TFilter, string>;
}

export interface IDateRange {
    from?: Date;
    to?: Date;
}

/**********************************/
/*  dateRangeSearch */
/**********************************/

export function dateRangeSearch<TFilter>(from: KeyOfValue<TFilter, Date | string>, to: KeyOfValue<TFilter, Date | string>) {

    const keywords = ["from", "to", "today", "yesterday", "month", "week", "year"];

    const icon = <MaterialIcon name="date"/>

    return {

        searchAsync(query, curFilter, curItems) {

            for (const keyword in keywords) {
                if (query.parts.a)
            }
        }

    } as ISearchItemProvider<TFilter, IDateRange>;
}

/**********************************/
/*  numberSearch */
/**********************************/

export function numberSearch<TFilter>(field: KeyOfValue<TFilter, number>) {
    return {

        searchAsync(query, curFilter, curItems) {

        }

    } as ISearchItemProvider<TFilter, number>;
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

        field: IFilterField<TFilter, TKey, Multiple, ObjectLike>,

        editAsync?: (value: TItemValue) => Promise<TItemValue>
    )
{

    let items: TItem[];

    const label = formatText(field.label ?? toKebabCase(field.name)) as string;

    const matchList = field.keywords ?? [label.toLowerCase()];

    let lastItemsFilterJson: string;

    const matchLabel = (query: ISearchQuery) => {

        for (const match of matchList) {

            if (typeof match == "string") {
                if (query.parts.every(a => match.includes(a)))
                    return true;
            }
            else {

                if (query.full.match(match))
                    return true;
            }
        }
        return false;
    }

    const modeMatchLabel = field.searchMode & FieldSearchMode.MatchLabel;
    const modeClient = field.searchMode & FieldSearchMode.Client;
    const modeSource = field.searchMode & FieldSearchMode.Source;

    return {

        async searchAsync(query, curFilter, curItems) {

            if (field.minQueryLen && query.full.length < field.minQueryLen)
                return;

            const res: ISearchItem<TFilter, TItemValue>[] = [];

            const labelMatch = query.parts.length > 0 && matchLabel(query);

            if (field.searchMode & FieldSearchMode.LabelOnly) {

                if (labelMatch) {

                    res.push({
                        apply: undefined,
                        priority: field.priority,
                        editAsync: editAsync ? () => editAsync(null) : undefined,
                        view: {
                            label: label,
                            icon: field.icon,
                            displayValue: <span className="select">{formatText("field-select")}</span>
                        }
                    });
                };
            }

            if ((labelMatch && modeMatchLabel) || !modeMatchLabel) { 

                const itemsFilter = field.valuesFilter ? field.valuesFilter(curFilter, query) : undefined;
                const json = JSON.stringify(itemsFilter);

                if ((modeClient && json != lastItemsFilterJson) ||
                    modeSource || !items) {

                    items = await field.valuesSource.getItemsAsync(itemsFilter) as TItem[];
                }

                const addItem = (item: TItem, text: string) => {

                    const value = field.valuesSource.getValue(item) as TItemValue;

                    res.push({
                        value,
                        editAsync: editAsync ? () => editAsync(value) : undefined,
                        view: {
                            displayValue: text,
                            label: label,
                            color: field.color,
                            icon: field.valuesSource.getIcon?.(item) ?? field.icon
                        },
                        apply: filter => {

                            if (field.multipleValues) {

                                let curVal = filter[field.name] as TItemValue[];
                                if (!curVal)
                                    curVal = [];
                                if (!curVal.includes(value))
                                    curVal.push(value);
                                filter[field.name] = curVal as any;
                            }
                            else {
                                filter[field.name] = value as any;
                            }
                        }
                    })
                }

                if (items) {

                    for (const item of items) {

                        const text = (formatText(field.valuesSource.getText(item)) as string);

                        if (modeClient) {

                            if (query.parts.length > 0 && !labelMatch) {

                                const matchText = text.toLowerCase() + "|" + label.toLowerCase();

                                if (!query.parts.every(a => matchText.includes(a)))
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
    implements IEditor<TFilter> {
    protected _curSearchProviders: ISearchItemProvider<TFilter, unknown>[] = [];

    constructor(options: IFilterEditorOptions<TFilter, TItem, keyof TFilter & string>) {

        super();

        this.init(FilterEditor, {
            ...options,
            template: forModel<this>(m => <div className={m.className} visible={m.visible}>
                <div className="search-bar">
                    <input type="text" value={m.searchText} value-pool={500} />
                    <button className="clear-filters" on-click={() => m.clearFilters()}>
                        <MaterialIcon name="clear" />
                    </button>
                    <button className="show-filters" on-click={() => m.showFilters()}>
                        <MaterialIcon name="filter" />
                    </button>
                </div>
                <div className="suggestions" visible={m.showSuggestions}>
                    {m.suggestions.forEach(i => <div on-click={() => m.addFilter(i)} className="suggestion">
                        {i.view.icon}
                        {i.view.label && <label>{i.view.label}</label>}
                        <div>{i.view.displayValue}</div>
                    </div>)
                    }
                </div>
                <div className="active-filters">
                    {m.activeFilters.forEach(i => <div className="chip">
                        <Variable name="color" value={i.view.color} />
                        <div className="body" on-click={() => m.editFilter(i)}>
                            {i.view.icon}
                            {i.view.label && <label>{i.view.label}</label>}
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

        this.build();
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

        }
    }

    async searchAsync(query: string) {

        const searchQuery = {
            parts: [...(query?.trim().toLowerCase() ?? "").matchAll(QUERY_SPLIT)]
                .map(m => m[1] || m[2] || m[3])
                .filter(a=> a.trim().length > 0),
            full: query
        } as ISearchQuery;

        if (!this.value)
            this.value = {} as TFilter;

        const results = await Promise.all(
            this._curSearchProviders.map(a => a.searchAsync(searchQuery, this.value, this.activeFilters)));

        const newSug: ISearchItem<TFilter, unknown>[] = [];

        for (const res of results) {
            if (res)
                newSug.push(...Array.from(res));
        }

        this.suggestions = newSug;
    }

    showFilters() {

    }

    clearFilters() {

    }

    editFilter(item: ISearchItem<TFilter, unknown>) {

    }


    addFilter(item: ISearchItem<TFilter, unknown>) {

    }

    removeFilter(item: ISearchItem<TFilter, unknown>) {

    }

    onValueChanged(value: TFilter, oldValue: TFilter, reason: ValueChangedReason) {

    }

    prepareFilter?(curFilter: TFilter) {

        return curFilter;
    }

    fields: IFilterField<TFilter, keyof TFilter & string, boolean, ObjectLike>[] | FilterFields<TFilter, unknown>;

    matchFields?: (keyof TItem & string)[] | BindExpression<TItem, unknown[]> | MatchFields<TItem>;

    searchProviders?: ISearchItemProvider<TFilter, unknown>[];

    queryField: KeyOfValue<TFilter, string>;

    renderMode: FilterRenderMode;

    label: ViewNode;

    disabled: boolean;

    value: TFilter;

    showSuggestions: boolean;

    activeFilters: ISearchItem<TFilter, unknown>[];

    suggestions: ISearchItem<TFilter, unknown>[];

    searchText: string;
}