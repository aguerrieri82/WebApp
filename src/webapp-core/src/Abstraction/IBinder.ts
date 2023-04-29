
export interface IGetter<TObj, TValue> {
    (model: TObj): TValue;
}

export type BindValue<TModel, TValue> = TValue | IGetter<TModel, TValue>;

