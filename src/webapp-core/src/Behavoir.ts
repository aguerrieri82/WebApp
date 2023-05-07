import { IBehavoir, OptionsFor } from "./Abstraction";
import { propOf } from "./Properties";


export abstract class Behavoir<TOptions extends Record<string, any> = Record<string, any>, TElement extends HTMLElement = HTMLElement, TModel = any> implements IBehavoir<TElement, TModel> {

    protected _options: TOptions;
    protected _isDetach: boolean;

    constructor(options?: TOptions) {

        this._options = options;

        this.updateOptions();
    }

    protected updateOptions() {

        for (const key in this._options) {

            const prop = propOf(this._options, key);

            if (key in this) {

                prop.subscribe(v => {
                    (this as Record<string, any>)[key] = this._options[key];
                });

                (this as Record<string, any>)[key] = this._options[key];
            }
        }
    }

    abstract attach(element: TElement, model?: TModel): void;

    detach(element: TElement, model?: TModel): void {
        this._isDetach = true;
    }
}