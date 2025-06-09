import type { ITemplate } from "./ITemplate";

export const TEMPLATE: unique symbol = Symbol.for("@template")

export interface IModelTemplate {

    [TEMPLATE]?: ITemplate<this>;
}

export function setTemplate<T extends ObjectLike>(model: T, template: ITemplate<T>) {
    model[TEMPLATE] = template;
}

export function isModelTemplate(value: any): value is IModelTemplate {
    return value && typeof value == "object" && TEMPLATE in value;
}
