interface ICompareArrayHandler<T> {

    onAdded(value: T, index?: number) : void ;

    onRemoved(value: T, index?: number): void;

    equals(a: T, b: T): boolean;
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
