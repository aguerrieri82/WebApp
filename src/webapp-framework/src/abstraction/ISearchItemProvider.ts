import type { ViewNode } from "@eusoft/webapp-ui/types";

export interface ISearchItemView {

    label: string;

    displayValue: ViewNode;

    icon?: ViewNode;

    color?: string;
}

export type SearchItemFormatter<TValue> = {
    (value: TValue): ISearchItemView;
}

export interface ITextValue<TValue> {
    text: string;
    value: TValue;
}

export interface ISearchItem<TFilter, TValue> {

    createView?: (value: TValue, text?: string) => ISearchItemView;

    view?: ISearchItemView;

    rank?: number;

    value?: TValue;

    canSelect?: boolean;

    allowMultiple?: boolean;

    apply?(filter: TFilter, value?: TValue): void;

    editAsync?(value?: TValue): Promise<ITextValue<TValue>>;

    fields?: (keyof TFilter & string)[];
}

export interface ISearchQuery {

    full: string;

    parts: string[];
}

export interface ISearchItemProvider<TFilter, TValue> {

    searchAsync(query: ISearchQuery, curFilter: TFilter, curItems: ISearchItem<TFilter, unknown>[]): Promise<Iterable<ISearchItem<TFilter, TValue>>>;

    parseAsync?(filter: TFilter): Promise<ISearchItem<TFilter, unknown>[]>;
}
