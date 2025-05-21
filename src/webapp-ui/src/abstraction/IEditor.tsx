import { Bindable, IComponent, IComponentOptions } from "@eusoft/webapp-core";
import { ViewNode } from "../Types";

export type ValueChangedReason = undefined | "edit" | "load";

export enum DataType {
    String,
    Number,
    Boolean,
    Date
}

export interface IEditorOptions<TValue> extends IComponentOptions {

    label?: Bindable<ViewNode>;

    disabled?: Bindable<boolean>;

    value?: Bindable<TValue, "two-ways">;

    onValueChanged?: (value: TValue, oldValue: TValue, reason: ValueChangedReason) => void;  
}

export interface IEditor<TValue, TOptions extends IEditorOptions<TValue> = IEditorOptions<TValue>> extends IComponent<TOptions> {

    onValueChanged: (value: TValue, oldValue: TValue, reason: ValueChangedReason) => void;

    label?: ViewNode;

    disabled: boolean;

    value: TValue;
}