import { ViewNode } from "../Types";


export interface IItemsSource<TItem, TValue, TFilter> {

    getValue(item: TItem): TValue;

    getText(item: TItem): string;

    getIcon?(item: TItem): ViewNode;

    matchText?(item: TItem, text: string): boolean;

    getItemsAsync(filter?: TFilter): Promise<TItem[]>;

    getItemByValueAsync(value: TValue): Promise<TItem>;

    itemsSize?: "small" | "large";

    id?: string;
}
