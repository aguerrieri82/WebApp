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
    value.reverse = function (this: IObservableArray<T>) {

        const retValue = Array.prototype.reverse.call(this);
        this.raise(a => a.onReorder && a.onReorder());
        return retValue;
    }
    value.sort = function (this: IObservableArray<T>, ...args) {

        const retValue = Array.prototype.sort.call(this, ...args);
        this.raise(a => a.onReorder && a.onReorder());
        return retValue;
    }

    value.push = function (this: IObservableArray<T>, ...items) {

        const curIndex = this.length;
         
        const retValue = Array.prototype.push.call(this, ...items);

        for (let i = curIndex; i < this.length; i++)
            this.raise(a => a.onItemAdded && a.onItemAdded(this[i], i, "add"));

        this.raise(a => a.onChanged && a.onChanged());

        return retValue;
    }

    value.shift = function (this: IObservableArray<T>) {

        const result = Array.prototype.shift.call(this);

        if (result !== undefined) {
            this.raise(a => a.onItemRemoved && a.onItemRemoved(result, 0, "remove"));
            this.raise(a => a.onChanged && a.onChanged());
        }
        return result;
    }

    value.pop = function (this: IObservableArray<T>) {

        const result = Array.prototype.pop.call(this);

        if (result !== undefined) {
            this.raise(a => a.onItemRemoved && a.onItemRemoved(result, this.length, "remove"));
            this.raise(a => a.onChanged && a.onChanged());
        }
        return result;
    }

    value.splice = function (this: IObservableArray<T>, start, deleteCount, ...items: T[]) {

        const result = Array.prototype.splice.call(this, start, deleteCount, ...items);

        if (start == 0 && deleteCount >= this.length && (!items || items.length == 0))
            this.raise(a => a.onClear && a.onClear());

        if (deleteCount > 0) {
            for (let i = 0; i < deleteCount; i++)
                this.raise(a => a.onItemRemoved && a.onItemRemoved(result[i], i + start, "remove"));
        }

        if (items.length > 0) {
            for (let i = 0; i < items.length; i++)
                this.raise(a => a.onItemAdded && a.onItemAdded(items[i], i + start, "insert"));
        }

        this.raise(a => a.onChanged && a.onChanged());

        return result;
    }

    return newValue;
}