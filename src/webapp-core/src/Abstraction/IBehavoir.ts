export interface IBehavoir<TElement extends HTMLElement = HTMLElement, TModel = any> {

    attach(element: TElement, model?: TModel) : void;

    detach(element: TElement, model?: TModel): void;
}

export function isBehavoir(value: any): value is IBehavoir {

    return value && typeof value === "object" &&
        "attach" in value && typeof value["attach"] === "function" &&
        "detach" in value && typeof value["detach"] === "function";
}