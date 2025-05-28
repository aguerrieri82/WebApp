import { type BindExpression, type Class } from "@eusoft/webapp-core";
import { type DataType, type IEditor, type IItemsSource, type ViewNode } from "@eusoft/webapp-ui";

type ItemType<TValue, Multiple> = Multiple extends true ? (TValue extends Array<infer TItem> ? TItem : never) : TValue

export interface IFilterField<
    TFilter,
    TValue,
    Multiple extends boolean> {

    name: string;
    value: BindExpression<TFilter, TValue>;
    editor?: () => IEditor<TValue> | Class<IEditor<TValue>>;
    dataType?: DataType;
    valuesSource?: IItemsSource<any, ItemType<TValue, Multiple>, any>;
    required?: boolean;
    multipleValues?: Multiple;
    label?: ViewNode;
    emptyItemText?: ViewNode;
    icon?: ViewNode;
    hidden?: boolean;
}

export interface IFilterEditor<TFilter> {

    fields: IFilterField<TFilter, unknown, any>[];
}