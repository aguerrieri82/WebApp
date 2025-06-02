import type { IPropertyChangedHandler } from "../abstraction/IObservableProperty";
import type { IBinding } from "../Binder";
import type { TemplateBuilder } from "../TemplateBuilder";

export const WebApp = {
    bindings: [] as IBinding<any>[],
    isDebug: false,
    root: null as TemplateBuilder<unknown>,
    subs: [] as IPropertyChangedHandler<any>[]
}

declare global {
    var webApp: typeof WebApp;
}

window.webApp = WebApp;

