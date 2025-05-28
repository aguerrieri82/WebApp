import { type ITemplateContext } from "./ITemplateContext";

export interface IBehavoir<TElement extends HTMLElement = HTMLElement, TModel = unknown> {

    attach(ctx: ITemplateContext<TModel, TElement>) : void;

    detach(ctx: ITemplateContext<TModel, TElement>): void;
}

export function isBehavoir(value: any): value is IBehavoir {

    return value && typeof value === "object" &&
        "attach" in value && typeof value["attach"] === "function" &&
        "detach" in value && typeof value["detach"] === "function";
}