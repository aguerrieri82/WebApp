import { type ViewNode } from "../types";

export interface IItemsSource<TItem, TValue, TFilter> {

    getValue(item: TItem): TValue;

    getText(item: TItem): string;

    getIcon?(item: TItem): ViewNode;

    matchText?(item: TItem, text: string): boolean;

    getItemsAsync(filter?: TFilter): Promise<TItem[]>;

    getItemByValueAsync?(value: TValue): Promise<TItem>;

    itemEquals?(a: TItem, b: TItem) : boolean;

    itemsSize?: "small" | "large";

    id?: string;
}
