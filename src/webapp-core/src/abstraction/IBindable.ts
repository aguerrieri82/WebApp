import type { ExternalBind } from "./IBinder";
import { type IObservableProperty } from "./IObservableProperty";

export const PROPS: unique symbol = Symbol.for("@props");
export const TARGET: unique symbol = Symbol.for("@target")
export const USE: unique symbol = Symbol.for("@use")
export const PARENT: unique symbol = Symbol.for("@parent")
export const INDEX: unique symbol = Symbol.for("@index")
export const BIND_MODES: unique symbol = Symbol.for("@bindModes")
export const ATTRIBUTES: unique symbol = Symbol.for("@attrs");
export const BIND_MODE: unique symbol = Symbol.for("@bindMode");


export type Bindable<TValue, TModel = {}> =
    TValue | IObservableProperty<TValue> | ExternalBind<TValue, TModel>;


export interface IBindable {

    [PROPS]?: Record<string, IObservableProperty<unknown>>;
    [TARGET]?: this
    [USE]?: <TValue>(value: TValue) => TValue
    [PARENT]?: IBindable
    [INDEX]?: number
    [ATTRIBUTES]?: string[]
}
