import { type IBehavoir } from "./abstraction";
import { type ITemplateContext } from "./abstraction/ITemplateContext";

export abstract class Behavoir<
    TOptions extends ObjectLike = object,
    TElement extends HTMLElement = HTMLElement,
    TModel = unknown>
    implements IBehavoir<TElement, TModel> {

    protected _isDetach: boolean;

    constructor(options?: TOptions) {

        this.options = options;

        this.updateOptions();
    }

    protected updateOptions() {

        for (const key in this.options) {

            if (key in this)
                (this as Record<string, unknown>)[key] = this.options[key];
        }
    }

    abstract attach(ctx: ITemplateContext<TModel, TElement>): void;

    detach(ctx: ITemplateContext<TModel, TElement>): void {
        this._isDetach = true;
    }

    options: TOptions;
}