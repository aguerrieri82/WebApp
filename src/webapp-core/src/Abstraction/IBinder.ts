import { IBindable } from "./IBindable";

export interface IGetter<TObj, TValue> {
    (model: TObj): TValue;
}

export type BindValue<TModel, TValue> = TValue | IGetter<TModel & IBindable, TValue>;


export type BoundObject<T> = {
    [K in keyof T & string]: BindValue<T, T[K]>
}

