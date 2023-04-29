import type { IProperty } from "./IProperty";

export interface IPropertyChangedHandler<TValue> {

    (value: TValue, oldValue: TValue): void;
}
export interface IObservableProperty<TValue> extends IProperty<TValue> {

    subscribe(handler: IPropertyChangedHandler<TValue>): IPropertyChangedHandler<TValue>;

    unsubscribe(handler: IPropertyChangedHandler<TValue>) : void;

    notifyChanged(): void;
}