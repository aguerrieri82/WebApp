import { Bindable, IComponent, IComponentOptions } from "@eusoft/webapp-core";
import { ViewNode } from "../Types";

export type ValueChangedReason = "";

export interface IEditorOptions<TValue> extends IComponentOptions {

    label?: Bindable<ViewNode>;

    visible?: Bindable<boolean>;

    disabled?: Bindable<boolean>;

    value?: Bindable<TValue, "two-ways">;
}

export interface IEditor<TValue, TOptions extends IEditorOptions<TValue> = IEditorOptions<TValue>> extends IComponent<TOptions> {

    onValueChanged: (value: TValue, oldValue: TValue, reason: ValueChangedReason) => void;

    label?: ViewNode;

    visible: boolean;

    disabled: boolean;

    value: TValue;
}