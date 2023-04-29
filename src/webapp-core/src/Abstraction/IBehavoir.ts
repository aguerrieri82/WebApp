export interface IBehavoir<TElement extends HTMLElement = HTMLElement, TModel = any> {

    attach(element: TElement, model?: TModel) : void;

    detach(element: TElement, model?: TModel): void;
}


