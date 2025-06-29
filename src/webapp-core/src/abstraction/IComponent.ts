import { type BIND_MODES, type IBindable } from "./IBindable";
import type { BindMode } from "./IBinder";
import type { ComponentStyle, IComponentOptions } from "./IComponentOptions";
import { type ITemplateContext } from "./ITemplateContext";
import type { CatalogTemplate } from "./ITemplateProvider";

export const COMPONENT: unique symbol = Symbol.for("@component");

export interface IComponent<TOptions extends IComponentOptions = IComponentOptions> extends IBindable  {

    readonly options: TOptions;

    context?: ITemplateContext<this, HTMLElement>;

    template: CatalogTemplate<this>;

    visible?: boolean;

    name?: string;

    style?: ComponentStyle;

    className?: string;
}

export interface IComponentConstructor<
    TOptions extends IComponentOptions = IComponentOptions,
    TComp extends IComponent<TOptions> = IComponent<TOptions>
    > {

    new(options?: TOptions): TComp;

    [BIND_MODES]?: Record<string, BindMode>;
}

export function isComponent(obj: unknown): obj is IComponent {

    return obj && typeof obj == "object" && "template" in obj;
}

