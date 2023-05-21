
type ArrayAddReason = "add" | "insert" | "replace";

type ArrayRemoveReason = "remove" | "clear" | "replace";

export interface IObservableArrayHandler<T> {

    onItemAdded?(item: T, index: number, reason: ArrayAddReason) : void;

    onItemRemoved?(item: T, index: number, reason: ArrayRemoveReason): void;

    onItemReplaced?(newItem: T, oldItem: T, index: number): void;

    onItemSwap?(index: number, newIndex: number): void;

    onReorder?(): void;

    onChanged?(): void;

    onClear?(): void;
}

export interface IObservableArray<T> extends Array<T> {

    subscribe(handler: IObservableArrayHandler<T>): IObservableArrayHandler<T>;

    unsubscribe(handler: IObservableArrayHandler<T>): void;

    raise(action: (hander: IObservableArrayHandler<T>) => void): void;
}

export function isObservableArray(value: any): value is IObservableArray<any>  {

    return Array.isArray(value) && "subscribe" in value && typeof (value["subscribe"]) == "function";
}