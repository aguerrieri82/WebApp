import { IBindable } from "./IBindable";

export type BindMode = "one-way" | "two-ways";

export interface IGetter<TObj, TValue> {
    (model: TObj): TValue;
}

export type BindValue<TModel, TValue> = TValue | IGetter<TModel & IBindable, TValue>;


export type BoundObject<T extends {}> = {
    [K in keyof T & string]: BindValue<T, T[K]>
}

export type BoundObjectModes<T> = {

    [K in keyof T & string]?: BindMode;
}

