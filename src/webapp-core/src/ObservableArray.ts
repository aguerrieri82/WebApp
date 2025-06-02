import { TARGET } from "./abstraction";
import { type IObservableArray, type IObservableArrayHandler, isObservableArray } from "./abstraction/IObservableArray";

export function createObservableArray<T>(value: T[]): IObservableArray<T> {

    if (isObservableArray(value))
        return value;

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
    newValue.reverse = function (this: IObservableArray<T>) {

        const retValue = Array.prototype.reverse.call(newValue);
        newValue.raise(a => a.onReorder && a.onReorder());
        return retValue;
    }
    newValue.sort = function (this: IObservableArray<T>, ...args) {

        const retValue = Array.prototype.sort.call(newValue, ...args);
        newValue.raise(a => a.onReorder && a.onReorder());
        return retValue;
    }

    newValue.push = function (this: IObservableArray<T>, ...items) {

        const curIndex = newValue.length;

        const retValue = Array.prototype.push.call(newValue, ...items);

        for (let i = curIndex; i < newValue.length; i++)
            newValue.raise(a => a.onItemAdded && a.onItemAdded(newValue[i], i, "add"));

            newValue.raise(a => a.onChanged && a.onChanged());

        return retValue;
    }

    newValue.shift = function (this: IObservableArray<T>) {

        const result = Array.prototype.shift.call(newValue);

        if (result !== undefined) {
            newValue.raise(a => a.onItemRemoved && a.onItemRemoved(result, 0, "remove"));
            newValue.raise(a => a.onChanged && a.onChanged());
        }
        return result;
    }

    newValue.pop = function (this: IObservableArray<T>) {

        const result = Array.prototype.pop.call(newValue);

        if (result !== undefined) {
            newValue.raise(a => a.onItemRemoved && a.onItemRemoved(result, newValue.length, "remove"));
            newValue.raise(a => a.onChanged && a.onChanged());
        }
        return result;
    }

    newValue.splice = function (this: IObservableArray<T>, start, deleteCount, ...items: T[]) {

        const isClear = start == 0 && deleteCount >= newValue.length && (!items || items.length == 0);

        const result = Array.prototype.splice.call(newValue, start, deleteCount, ...items);

        if (deleteCount > 0) {

            if (isClear)
                newValue.raise(a => a.onClear && a.onClear());
            else {
                for (let i = 0; i < deleteCount; i++)
                    newValue.raise(a => a.onItemRemoved && a.onItemRemoved(result[i], start, "remove"));
            }

        }

        if (items.length > 0) {
            for (let i = 0; i < items.length; i++)
                newValue.raise(a => a.onItemAdded && a.onItemAdded(items[i], i + start, "insert"));
        }

        newValue.raise(a => a.onChanged && a.onChanged());

        return result;
    }

    return new Proxy(newValue, {
        get: (t, p, r) => {
            if (p == TARGET)
                return t;
            return Reflect.get(t, p, r);
        },

        set: (t, p, v, r) => {

            const old = Reflect.get(t, p, r);
            const retVal = Reflect.set(t, p, v, r);

            if (typeof p == "string") {
                const idx = parseInt(p);
                if (!isNaN(idx)) {
                    newValue.raise(a => a.onItemReplaced && a.onItemReplaced(v, old, idx));
                    newValue.raise(a => a.onChanged && a.onChanged());
                }
            }
            
            return retVal;
        }
    });
}