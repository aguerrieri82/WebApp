import { type LocalString, type ViewNode } from "../Types";

export interface ISimpleItem<TValue> {
    text: LocalString;
    value: TValue;
    icon?: ViewNode;
    color?: string;
}