import { IPropertyChangedHandler } from "./abstraction/IObservableProperty";
import { ITemplateBuilder } from "./abstraction/ITemplateBuilder";
import { IBinding } from "./Binder";

export const WebApp = {
    bindings: [] as IBinding<any>[],
    isDebug: true,
    root: null as ITemplateBuilder<unknown>,
    subs: [] as IPropertyChangedHandler<any>[]
}

declare global {
    var webApp: typeof WebApp;
}

window.webApp = WebApp;

