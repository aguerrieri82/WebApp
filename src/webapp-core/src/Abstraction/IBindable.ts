import { IObservableProperty } from "./IObservableProperty";

export const PROPS: unique symbol = Symbol("Props");

export interface IBindable {

    [PROPS]?: Record<string, IObservableProperty<any>>;
}