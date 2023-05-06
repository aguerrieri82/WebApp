
export interface IGetter<TObj, TValue> {
    (model: TObj): TValue;
}

export type BindValue<TModel, TValue> = TValue | IGetter<TModel, TValue>;


export type BoundObject<T> = {
    [K in keyof T & string]: BindValue<T, T[K]>
}

