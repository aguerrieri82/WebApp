import { toKebabCase } from "@eusoft/webapp-core";
import { type LocalString, type ViewNode } from "../Types";
import { type IItemsSource } from "../abstraction/IItemsSource";
import { type ISimpleItem } from "../abstraction/ISimpleItem";
import { formatText } from "../utils/Format";

const LARGE_ITEMS_SIZE_VALUE = 50;

type StandardEnum<T> = {
    [id: string]: T | string;
    [nu: number]: string;
}

export function staticItemsSourceWithIcon<TValue>(...items: [LocalString, TValue, ViewNode][]) {

    const simpleItems = items.map(a => ({
        text: formatText(a[0]),
        value: a[1],
        icon: a[2]
    }) as ISimpleItem<TValue>);

    return {
        getItemByValueAsync: async value => simpleItems.find(a => a.value == value),
        getItemsAsync: async () => simpleItems,
        getText: a => a.text,
        getValue: a => a.value,
        getIcon: a => a.icon,
        itemsSize: items.length > LARGE_ITEMS_SIZE_VALUE ? "small" : "large",
        id: null
    } as IItemsSource<ISimpleItem<TValue>, TValue, void> & { id: string }
}


export function staticItemsSource<TValue>(...items: [LocalString, TValue][]) {

    const simpleItems = items.map(a => ({
        text: formatText(a[0]),
        value: a[1]
    }) as ISimpleItem<TValue>);

    return {
        getItemByValueAsync: async value => simpleItems.find(a => a.value == value),
        getItemsAsync: async () => simpleItems,
        getText: a => a.text,
        getValue: a => a.value,
        itemsSize: items.length > LARGE_ITEMS_SIZE_VALUE ? "small" : "large",
        id: null
    } as IItemsSource<ISimpleItem<TValue>, TValue, void> & { id: string }
}

export function stringItemsSource(...values: string[]) {
    return {
        getText: a => formatText(a),
        getValue: a => a,
        getItemByValueAsync: async a => a,
        getItemsAsync: async () => values,
        itemsSize: values.length > LARGE_ITEMS_SIZE_VALUE ? "small" : "large"
    } as IItemsSource<string, string, void>
}

export function enumItemsSource<TEnum>(value: TEnum) {
    return {
        getText: a => a.text,
        getValue: a => a.value,
        getItemsAsync: async () => Object.keys(value).filter(a=> isNaN(parseInt(a))).map(a => (
        {
            text: formatText(toKebabCase(a)),
            value: value[a]
        } as ISimpleItem<TEnum>)),

    } as IItemsSource<ISimpleItem<TEnum>, TEnum, void>
}

export function arrayItemsSource<TItem, TValue = TItem>(items: TItem[] | { (): TItem[] }, getText: (a: TItem) => string, getValue?: (a: TItem) => TValue) {
    return itemsSource({
        getText,
        getValue: getValue ?? (a => a as unknown as TValue),
        getItemsAsync: async () => Array.isArray(items) ? items : items(),
    } as IItemsSource<TItem, TValue, undefined>)
}

export function itemsSource<TItem, TValue, TFilter = unknown>(props: Partial<IItemsSource<TItem, TValue, TFilter>>) {

    const getText = props.getText ?? (a => (a === undefined || a === null) ? "" : a.toString())

    return {
        getText,
        getValue: a => a,
        matchText: (a, t) => getText(a).toLowerCase().indexOf(t.toLowerCase()) != -1,
        ...props
    } as unknown as IItemsSource<TItem, TValue, TFilter>;
}
