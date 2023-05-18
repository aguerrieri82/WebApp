import { IBehavoir } from "./abstraction";

export abstract class Behavoir<TOptions extends Record<string, any> = Record<string, any>, TElement extends HTMLElement = HTMLElement, TModel = any> implements IBehavoir<TElement, TModel> {

    protected _isDetach: boolean;

    constructor(options?: TOptions) {

        this.options = options;

        this.updateOptions();
    }

    protected updateOptions() {

        for (const key in this.options) {

            if (key in this)
                (this as Record<string, any>)[key] = this.options[key];
        }
    }

    abstract attach(element: TElement, model?: TModel): void;

    detach(element: TElement, model?: TModel): void {
        this._isDetach = true;
    }

    options: TOptions;
}