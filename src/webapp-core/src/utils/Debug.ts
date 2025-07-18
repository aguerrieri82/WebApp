import type { IPropertyChangedHandler } from "../abstraction/IObservableProperty";
import type { IBinding } from "../Binder";
import type { TemplateBuilder } from "../TemplateBuilder";

export const WebApp = {
    bindings: [] as IBinding<unknown>[],
    isDebug: false,
    debugMount: false,
    debugBlock: false,
    debugClean: false,
    debugEdit: false,
    root: null as TemplateBuilder<unknown>,
    subs: [] as IPropertyChangedHandler<unknown>[]
}

declare global {
    var webApp: typeof WebApp;
}

window.webApp = WebApp;

