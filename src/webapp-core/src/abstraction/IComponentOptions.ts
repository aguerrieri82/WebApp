import type { Bindable } from "./IBindable";
import type { CatalogTemplate } from "./ITemplateProvider";

export type ComponentStyle = string | ComponentStyle[];

export interface IComponentOptions {

    style?: Bindable<ComponentStyle>;

    template?: CatalogTemplate<unknown>;

    name?: string;

    visible?: Bindable<boolean>;

    isCacheEnabled?: boolean;
}
