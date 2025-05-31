import { type BindMode } from "./IBinder";
import type { IObservableProperty } from "./IObservableProperty";
import type { CatalogTemplate } from "./ITemplateProvider";


export type Bindable<TValue, TBind extends BindMode = BindMode> =
    TValue | IObservableProperty<TValue>;

export type ComponentStyle = string | ComponentStyle[];

export interface IComponentOptions<TName extends string = string> {

    style?: Bindable<ComponentStyle>;

    template?: CatalogTemplate<any>;

    name?: TName;

    visible?: Bindable<boolean>;

    isCacheEnabled?: boolean;
}
