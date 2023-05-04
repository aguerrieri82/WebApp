import type { IProperty } from "./IProperty";

export interface IPropertyChangedHandler<TValue> {

    (value: TValue, oldValue: TValue): void;
}
export interface IObservableProperty<TValue> extends IProperty<TValue> {

    subscribe(handler: IPropertyChangedHandler<TValue>): IPropertyChangedHandler<TValue>;

    unsubscribe(handler: IPropertyChangedHandler<TValue>) : void;

    notifyChanged(): void;
}


export function isObservableProperty(value: any): value is IObservableProperty<any> {

    return value && typeof value == "object" &&
        typeof (value["get"]) == "function" &&
        typeof (value["subscribe"]) == "function";
}