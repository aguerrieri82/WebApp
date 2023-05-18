import { IBindable } from "./IBindable";
import type { IComponentOptions } from "./IComponentOptions";
import type { CatalogTemplate } from "./ITemplateProvider";

export interface IComponent<TOptions extends IComponentOptions = IComponentOptions> extends IBindable  {

    readonly options: TOptions;

    unmount?(): void;

    parent?: IComponent;

    template: CatalogTemplate<this>;
}

export function isComponent(obj: any): obj is IComponent {

    return obj && typeof obj == "object" && "template" in obj;
}