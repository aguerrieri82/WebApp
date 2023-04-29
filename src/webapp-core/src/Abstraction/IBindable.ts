import { IProperty } from "./IProperty";

export const PROPS: unique symbol = Symbol("Props");

export interface IBindable {

    [PROPS]?: Record<string, IProperty<any>>;
}