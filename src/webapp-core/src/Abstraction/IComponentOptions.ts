import { BindMode } from "./IBinder";
import type { IObservableProperty } from "./IObservableProperty";
import type { CatalogTemplate } from "./ITemplateProvider";


export type Bindable<TValue, TBind extends BindMode = BindMode> =
    TValue | IObservableProperty<TValue>;

export type ComponentStyle = string | ComponentStyle[];

export interface IComponentOptions {

    style?: Bindable<ComponentStyle>;

    template?: CatalogTemplate<any>;

    name?: string;

    visible?: Bindable<boolean>;
}
