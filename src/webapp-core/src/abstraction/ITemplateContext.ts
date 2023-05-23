import type { IComponent } from "./IComponent";
import type { ServiceType } from "./IService";
import type { Class } from "./Types";

type Visitor = (child: ITemplateContext, level: number) => void | "skip-children" | "stop";

export interface ITemplateContext<TModel = unknown, TElement extends Element = HTMLElement> {

    logTree(): void;

    visitChildComponents(visitor: Visitor): void;

    visitChildren(visitor: Visitor, selector?: (model: unknown) => boolean): void;

    parentOfType<TParentModel>(type: Class<TParentModel>): ITemplateContext<TParentModel>;

    parentComponent(): ITemplateContext<IComponent>;

    parent(selector?: (model: unknown) => boolean): ITemplateContext;

    require<TService>(service: ServiceType): TService;

    element: TElement;

    model: TModel;
}