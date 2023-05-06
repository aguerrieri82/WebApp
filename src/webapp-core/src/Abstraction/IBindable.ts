import { IObservableProperty } from "./IObservableProperty";

export const PROPS: unique symbol = Symbol.for("@props");
export const TARGET: unique symbol = Symbol.for("@target")
export const USE: unique symbol = Symbol.for("@use")
export const PARENT: unique symbol = Symbol.for("@parent")

export interface IBindable {

    [PROPS]?: Record<string, IObservableProperty<any>>;
    [TARGET]?: this
    [USE]?: <TValue>(value: TValue) => TValue
    [PARENT]?: IBindable
}