import { type LocalString, type ViewNode } from "../types";

export interface ISimpleItem<TValue> {
    text: LocalString;
    value: TValue;
    icon?: ViewNode;
    color?: string;
}