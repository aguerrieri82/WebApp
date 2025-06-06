import type { BIND_MODES } from "./IBindable";
import type { BindMode } from "./IBinder";
import { type ITemplateContext } from "./ITemplateContext";

export interface IBehavoir<TElement extends HTMLElement = HTMLElement, TModel = unknown> {

    attach(ctx: ITemplateContext<TModel, TElement>) : void;

    detach(ctx: ITemplateContext<TModel, TElement>): void;
}


export interface IBehavoirConstructor<
    TModel,
    TComp extends IBehavoir<HTMLElement, TModel> = IBehavoir<HTMLElement, TModel>> {

    new(options?: TModel): TComp;

    [BIND_MODES]?: Record<string, BindMode>;
}


export function isBehavoir(value: unknown): value is IBehavoir {

    return value && typeof value === "object" &&
        "attach" in value && typeof value["attach"] === "function" &&
        "detach" in value && typeof value["detach"] === "function";
}