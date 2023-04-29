import { IObservableArray, IObservableArrayHandler, isObservableArray } from "./Abstraction/IObservableArray";

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

export function createObservableArray<T>(value: T[]): IObservableArray<T> {

    if (isObservableArray(value))
        return;

    let handlers: IObservableArrayHandler<T>[];

    const newValue = value as IObservableArray<T>;

    newValue.raise = action => {

        if (!handlers)
            return;
        handlers.forEach(handler =>
            action(handler));
    }

    newValue.subscribe = function (this: T[], handler) {

        if (!handlers)
            handlers = [];
        const index = handlers.indexOf(handler);
        if (index == -1)
            handlers.push(handler);
        return handler;
    }

    newValue.unsubscribe = function (this: IObservableArray<T>, handler) {

        if (!handlers)
            return;
        const index = handlers.indexOf(handler);
        if (index != -1)
            handlers.splice(index, 1);
    }

    value.push = function (this: IObservableArray<T>, items) {

        const curIndex = this.length;
         
        const retValue = Array.prototype.push.call(value, items);

        for (let i = curIndex; i < this.length; i++)
            this.raise(a => a.onItemAdded && a.onItemAdded(this[i], i, "add"));

        this.raise(a => a.onChanged && a.onChanged());

        return retValue;
    }

    return newValue;
}