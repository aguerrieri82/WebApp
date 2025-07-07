interface ICompareArrayHandler<T> {

    onAdded(value: T, index?: number) : void ;

    onRemoved(value: T, index?: number): void;

    equals(a: T, b: T): boolean;
}

export interface IGroup<TKey, TValue> {
    key: TKey;
    values: TValue[];
}

export function forEachRev<T>(items: T[], action: (item: T) => void) {

    if (!items || items.length == 0)
        return;

    for (let i = items.length - 1; i >= 0; i--)
        action(items[i]);
}

export async function forEachRevAsync<T>(items: T[], action: (item: T) => Promise<void>) {

    if (!items || items.length == 0)
        return;

    for (let i = items.length - 1; i >= 0; i--)
        await action(items[i]);
}

export function compareArray<T>(oldValue: T[], newValue: T[], handler: ICompareArrayHandler<T>) {

    if (!oldValue || oldValue.length == 0) {
        if (newValue) 
            newValue.forEach(handler.onAdded);
        return;
    }

    if (!newValue || newValue.length == 0) {
        if (oldValue)
            oldValue.forEach(handler.onRemoved);
        return;
    }

    oldValue.forEach((ov, i) => {
        if (!newValue.some(nv => handler.equals(ov, nv)))
            handler.onRemoved(ov, i);
    });

    newValue.forEach((nv, i) => {
        if (!oldValue.some(ov => handler.equals(ov, nv)))
            handler.onAdded(nv, i);
    });
}

export function remap<TKey, TValue, TResult>(map: Map<TKey, TValue>, selector: (key: TKey, value: TValue) => Promise<TResult>, keySort?: (key: TKey) => string | number): Promise<TResult[]>;

export function remap<TKey, TValue, TResult>(map: Map<TKey, TValue>, selector: (key: TKey, value: TValue) => TResult, keySort?: (key: TKey) => string | number): TResult[];

export function remap<TKey, TValue, TResult>(map: Map<TKey, TValue>, selector: (key: TKey, value: TValue) => TResult | Promise<TResult>, keySort?: (key: TKey) => string | number) {

    const result: (TResult | Promise<TResult>)[] = [];

    const keys = Array.from(map.keys());
    if (keySort)
        keys.sort((a, b) => {
            const newA = keySort(a);
            const newB = keySort(b);
            if (typeof newA === "string")
                return newA.localeCompare(newB as string);
            return newA - (newB as number);
        })

    for (const key of keys) {
        const item = selector(key, map.get(key)!);
        result.push(item);
    }

    if (result[0] instanceof Promise)
        return Promise.all(result) as Promise<TResult[]>;

    return result as TResult[];
}

export function groupBy<T, TKey>(items: T[] | undefined, selector: (item: T) => TKey, sortByKey = true) {
    const map = new Map<TKey, T[]>();
    const keyMap = new Map<string, TKey>();

    if (items) {
        for (const item of items) {

            let key = selector(item);

            const json = JSON.stringify(key);

            if (!keyMap.has(json))
                keyMap.set(json, key);
            else
                key = keyMap.get(json);

            if (!map.has(key))
                map.set(key, [item]);
            else
                map.get(key)?.push(item);
        }
    }

    const result = remap(map, (key, values) => ({ key, values } as IGroup<TKey, T>));

    if (sortByKey) {
        result.sort((a, b) => {
            if (typeof a.key == "string")
                return a.key.localeCompare(b.key as string);
            if (typeof a.key == "number")
                return a.key - (b.key as number);
        });
    }

    return result;
}

declare global {
    interface Array<T> {
        set(index: number, value: T): void;
    }
}

Array.prototype.set = function <T>(this: T[], index: number, value: T) {
    this[index] = value;
}