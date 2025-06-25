import type { ViewNode } from "@eusoft/webapp-ui/types";

export interface ISearchItemView {

    label: string;

    displayValue: ViewNode;

    icon?: ViewNode;

    color?: string;
}

export interface ISearchItemFormatter<TValue> {
    formatValue(value: TValue): ISearchItemView;
}

export interface ISearchItem<TFilter, TValue> {

    view: ISearchItemView;

    rank?: number;

    value?: TValue;

    allowMultiple?: boolean;

    apply?(filter: TFilter, value?: TValue): void;

    editAsync?(): Promise<TValue>;

    fields?: (keyof TFilter & string)[];
}

export interface ISearchQuery {

    full: string;

    parts: string[];
}

export interface ISearchItemProvider<TFilter, TValue> {

    searchAsync(query: ISearchQuery, curFilter: TFilter, curItems: ISearchItem<TFilter, unknown>[]): Promise<Iterable<ISearchItem<TFilter, TValue>>>;

    parse?(filter: TFilter): ISearchItem<TFilter, unknown>[];
}
