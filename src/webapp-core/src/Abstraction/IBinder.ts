import { type IBindable } from "./IBindable";

export type BindMode = "one-way" | "two-ways" | "no-bind" | "action";

export type BindDirection = "srcToDst" | "dstToSrc";

export interface IGetter<TObj, TValue> {
    (model: TObj): TValue;
}

export type BindExpression<TModel, TValue> = IGetter<TModel & IBindable, TValue>;

export type BindValue<TModel, TValue> = TValue | BindExpression<TModel, TValue>;


export type BoundObject<T extends {}> = {
    [K in keyof T]: BindValue<T, T[K]>
}

export type BoundObjectModes<T> = {

    [K in keyof T & string]?: BindMode;
}

