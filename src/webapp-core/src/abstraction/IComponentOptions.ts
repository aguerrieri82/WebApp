import type { Bindable } from "./IBindable";
import type { CatalogTemplate } from "./ITemplateProvider";



export type ComponentStyle = string | ComponentStyle[];

export interface IComponentOptions<TName extends string = string> {

    style?: Bindable<ComponentStyle>;

    template?: CatalogTemplate<unknown>;

    name?: TName;

    visible?: Bindable<boolean>;

    isCacheEnabled?: boolean;
}
