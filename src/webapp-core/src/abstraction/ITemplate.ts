import { getFunctionType } from "../utils/Object";
import type { TemplateBuilder } from "../TemplateBuilder";

export const TEMPLATE_BUILDER: unique symbol = Symbol.for("@templateBuilder")

export interface ITemplate<TModel> {

    (builder: TemplateBuilder<TModel>): void;
    [TEMPLATE_BUILDER]?: boolean;
}

export type TemplateMap<TModel> = Record<string, ITemplate<TModel>>;

export function isTemplate(obj: unknown): obj is ITemplate<unknown> {

    return obj &&
        typeof obj == "function" &&
        getFunctionType(obj) != "class" &&
        (obj as Function).length == 1 &&
        TEMPLATE_BUILDER in obj;
}
