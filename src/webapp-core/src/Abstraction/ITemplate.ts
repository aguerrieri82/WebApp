import { getFunctionType } from "../utils/Object";
import type { TemplateBuilder } from "../TemplateBuilder";

export const TEMPLATE: unique symbol = Symbol.for("@template")

export interface ITemplate<TModel> {

    (builder: TemplateBuilder<TModel>): void;
    [TEMPLATE]?: boolean;
}

export type TemplateMap<TModel> = Record<string, ITemplate<TModel>>;

export function isTemplate(obj: any): obj is ITemplate<unknown> {

    return obj &&
        typeof obj == "function" &&
        getFunctionType(obj) != "class" &&
        (obj as Function).length == 1 &&
        TEMPLATE in obj;
}