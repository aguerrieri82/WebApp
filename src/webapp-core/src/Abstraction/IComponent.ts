import { IBindable } from "./IBindable";
import type { Bindable, ComponentStyle, IComponentOptions } from "./IComponentOptions";
import type { CatalogTemplate } from "./ITemplateProvider";

export interface IComponent<TOptions extends IComponentOptions = IComponentOptions> extends IBindable  {

    unmount?(): void;

    style?: Bindable<ComponentStyle>;

    template: CatalogTemplate<this>;
}

export function isComponent(obj: any): obj is IComponent {

    return obj && typeof obj == "object" && "template" in obj;
}