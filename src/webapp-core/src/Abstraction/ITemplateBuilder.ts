import type { IBehavoir } from "./IBehavoir";
import type { BindValue, BoundObject, BoundObjectModes } from "./IBinder";
import type { ITemplate } from "./ITemplate";
import type { CatalogTemplate, ITemplateProvider } from "./ITemplateProvider";


export type TemplateValueMap<TModel, TObj> = {

    [TKey in keyof TObj]?: BindValue<TModel, TObj[TKey]>
}

export type RefNodePosition = "after" | "before" | "inside";

export type ClassComponenType<TProps> = IBehavoir | ITemplateProvider<TProps> & TProps; 

export type FunctionalComponenType<TProps> = ITemplate<TProps> | null | undefined | void;

export type BehavoirType<TElement extends Element, TModel> = string | { new(): IBehavoir } | IBehavoir | BehavoirType<TElement, TModel>[];

export type StringLike = string | number | object | boolean | { toString(): string }


export type ComponentType<TProps, TComp extends ClassComponenType<TProps>, TResult extends FunctionalComponenType<TProps>> =
    { new (props?: TProps): TComp } |
    { (props?: TProps): TResult }

export type InputValueMode = "focus" | "change" | "keyup" | "pool";

export type StyleBinding<TModel> = {
    [K in keyof CSSStyleDeclaration]: BindValue<TModel, CSSStyleDeclaration[K]>
}

export interface IComponentInfo<TModel> {
    model?: TModel;
    component: ClassComponenType<TModel> | FunctionalComponenType<TModel>;
}

export interface ITemplateBuilder<TModel, TElement extends HTMLElement = HTMLElement> {

    begin(refNode?: Node, refNodePos?: RefNodePosition, marker?: string): this;

    end(): this;

    clear(remove?: boolean): this;

    appendChild(node: Node): this;

    foreach<TItem>(selector: BindValue<TModel, TItem[]>, templateOrName?: CatalogTemplate<TItem>): this;

    if(condition: BindValue<TModel, boolean>, trueTemplate: ITemplate<TModel>, falseTemplate?: ITemplate<TModel>): this;
        
    componentContent<TProps extends Record<string, unknown>, TComp extends ClassComponenType<TProps> & TProps, TResult extends FunctionalComponenType<TProps>>(constructor: ComponentType<TProps, TComp, TResult>, props: BoundObject<TProps>, modes?: BoundObjectModes<TProps>): ITemplateProvider<TProps>;

    component<TProps extends Record<string, unknown>, TComp extends ClassComponenType<TProps> & TProps, TResult extends FunctionalComponenType<TProps>>(constructor: ComponentType<TProps, TComp, TResult>, props: BoundObject<TProps>, modes?: BoundObjectModes<TProps>): this;

    content<TInnerModel extends ITemplateProvider|string>(content: BindValue<TModel, TInnerModel>, inline?: boolean): this;

    templateFor(value: TModel): ITemplate<TModel>;

    loadTemplate(templateOrName: CatalogTemplate<TModel>): ITemplate<TModel>;

    template(templateOrName: CatalogTemplate<TModel>): this;

    template<TInnerModel>(templateOrName: CatalogTemplate<TInnerModel>, model: BindValue<TModel, TInnerModel>): this;

    exec(action: (buidler: this) => void): this;

    beginChild<TKey extends keyof HTMLElementTagNameMap>(name: TKey, namespace?: string): IChildTemplateBuilder<TModel, HTMLElementTagNameMap[TKey] | TElement, this>;

    child<TKey extends keyof HTMLElementTagNameMap>(name: TKey, attributes?: TemplateValueMap<TModel, TElement>, namespace?: string): this;

    child<TKey extends keyof HTMLElementTagNameMap>(name: TKey, builder: (builder: ITemplateBuilder<TModel, HTMLElementTagNameMap[TKey]>, namespace?: string) => void): this;

    set(attribute: string, value: BindValue<TModel, StringLike | Promise<StringLike>>): this;

    on<TKey extends keyof HTMLElementEventMap>(event: TKey, handler: (model: TModel, e?: HTMLElementEventMap[TKey]) => void): this;

    class(name: BindValue<TModel, string>): this;

    class(name: string, condition: BindValue<TModel, Boolean>): this;

    visible(value: BindValue<TModel, boolean>): this;

    text(value: BindValue<TModel, StringLike>): this;

    html(value: BindValue<TModel, string>): this;

    focus(value: BindValue<TModel, boolean>): this;

    value(value: BindValue<TModel, string | boolean>, mode?: InputValueMode, poolTime?: number): this;

    style(value: StyleBinding<TModel>): this;

    style<TKey extends keyof CSSStyleDeclaration>(name: TKey, value: BindValue<TModel, CSSStyleDeclaration[TKey]>): this;

    behavoir(value: BehavoirType<TElement, TModel>): this;

    styles(value: TemplateValueMap<TModel, CSSStyleDeclaration>): this;

    attribs(value: Record<string, BindValue<TModel, StringLike>>): this;

    debugger(): this;

    logTempatesTree(): void;

    readonly model: TModel;

    readonly element: TElement;

    readonly parent: ITemplateBuilder<unknown>;
}

export interface IChildTemplateBuilder<TModel, TElement extends HTMLElement, TParent extends ITemplateBuilder<TModel>> extends ITemplateBuilder<TModel, TElement> {

    endChild(): TParent;
}