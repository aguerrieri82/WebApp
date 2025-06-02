import { type IBindable } from "./IBindable";
import type { IComponentOptions } from "./IComponentOptions";
import { type ITemplateContext } from "./ITemplateContext";
import type { CatalogTemplate } from "./ITemplateProvider";

export const COMPONENT: unique symbol = Symbol.for("@component");

export interface IComponent<TOptions extends IComponentOptions = IComponentOptions> extends IBindable  {

    readonly options: TOptions;

    context?: ITemplateContext<this, HTMLElement>;

    template: CatalogTemplate<this>;

    visible?: boolean;

    name?: string;
}

export function isComponent(obj: unknown): obj is IComponent {

    return obj && typeof obj == "object" && "template" in obj;
}
