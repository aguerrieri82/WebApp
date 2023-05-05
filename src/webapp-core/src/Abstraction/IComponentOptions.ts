import type { IObservableProperty } from "./IObservableProperty";
import type { CatalogTemplate } from "./ITemplateProvider";

export type Bindable<TValue> = TValue | IObservableProperty<TValue>;

export type ComponentStyle = string | ComponentStyle[];

export interface IComponentOptions {

    style?: Bindable<ComponentStyle>;

    template?: CatalogTemplate<any>;
}
