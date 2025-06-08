import { getFunctionType, isSimpleObject } from "../utils";
import { type BIND_MODE, type IBindable } from "./IBindable";
import { isTemplate } from "./ITemplate";

export type BindMode = "one-way" | "two-ways" | "no-bind" | "action" | "expression";

export type BindDirection = "srcToDst" | "dstToSrc";

export interface ExternalBind<TValue, TModel extends ObjectLike> {
    model: TModel;
    value: BindExpression<TModel, TValue>;
    mode?: BindMode
}

export interface IGetter<TObj, TValue> {
    (model: TObj): TValue;
}

export type BindExpression<TModel, TValue> = IGetter<TModel & IBindable, TValue> & {
    [BIND_MODE]?: BindMode;
}

export type BindValueUnchecked<TModel, TValue> = TValue | BindExpression<TModel, TValue>;

export type BindValue<TModel, TValue> = TValue | (BindExpression<TModel, TValue> & {
    [BIND_MODE]: BindMode
});

export type BoundObject<T extends ObjectLike> = {
    [K in keyof T]: BindValue<T, T[K]>
}

export type BoundObjectModes<T> = {

    [K in keyof T & string]?: BindMode;
}

export function isBindExpression(value: unknown): value is BindExpression<unknown, unknown> {

    return value &&
        typeof value == "function" &&
        (value as Function).length == 1 &&
        getFunctionType(value) !== "class" &&
        !isTemplate(value);
}

export function isExternalBind<TModel extends ObjectLike = object, TValue = unknown>(value: unknown): value is ExternalBind<TValue, TModel> {
    return isSimpleObject(value) && 
        "model" in value &&
        "value" in value;
}

