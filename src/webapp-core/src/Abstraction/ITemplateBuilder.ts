import type { IBehavoir } from "./IBehavoir";
import type { BindValue, BoundObject } from "./IBinder";
import { IComponent } from "./IComponent";
import type { ITemplate } from "./ITemplate";
import type { CatalogTemplate, ITemplateProvider } from "./ITemplateProvider";

export type TemplateValueMap<TModel, TObj extends { [key: string]: any }> = { [TKey in keyof TObj]?: BindValue<TModel, TObj[TKey]> }

export type RefNodePosition = "after" | "before" | "inside";


export interface ITemplateBuilder<TModel, TElement extends HTMLElement = HTMLElement> {

    begin(refNode?: Node, refNodePos?: RefNodePosition, marker?: string): this;

    end(): this;

    clear(remove?: boolean): this;

    appendChild(node: Node): this;

    foreach<TItem>(selector: BindValue<TModel, TItem[]>, templateOrName?: CatalogTemplate<TItem>): this;

    if(condition: BindValue<TModel, boolean>, trueTemplate: ITemplate<TModel>, falseTemplate?: ITemplate<TModel>): this;

    component<TComp extends IComponent, TProps extends TComp>(constructor: { new(props?: TProps): TComp }, props: BoundObject<TProps>): this;

    content<TInnerModel extends ITemplateProvider>(content: Iterable<BindValue<TModel, TInnerModel>>, inline?: boolean): this;

    content<TInnerModel extends ITemplateProvider>(content: BindValue<TModel, TInnerModel>, inline?: boolean): this;

    templateFor(value: TModel): ITemplate<TModel>;

    loadTemplate(templateOrName: CatalogTemplate<TModel>): ITemplate<TModel>;

    template(templateOrName: CatalogTemplate<TModel>): this;

    template<TInnerModel>(templateOrName: CatalogTemplate<TInnerModel>, model: BindValue<TModel, TInnerModel>): this;

    exec(action: (buidler: this) => void): this;

    beginChild<TKey extends keyof HTMLElementTagNameMap>(name: TKey, namespace?: string): IChildTemplateBuilder<TModel, HTMLElementTagNameMap[TKey] | TElement, this>;

    child<TKey extends keyof HTMLElementTagNameMap>(name: TKey, attributes?: TemplateValueMap<TModel, TElement>, namespace?: string): this;

    child<TKey extends keyof HTMLElementTagNameMap>(name: TKey, builder: (builder: ITemplateBuilder<TModel, HTMLElementTagNameMap[TKey]>, namespace?: string) => void): this;

    set(attribute: string, value: BindValue<TModel, string | number | boolean | Promise<string | number | boolean>>): this;

    on<TKey extends keyof HTMLElementEventMap>(event: TKey, handler: (model: TModel, e?: HTMLElementEventMap[TKey]) => void): this;

    class(name: BindValue<TModel, string>): this;

    class(name: string, condition: BindValue<TModel, Boolean>): this;

    visible(value: BindValue<TModel, boolean>): this;

    text(value: BindValue<TModel, string | number>): this;

    html(value: BindValue<TModel, string>): this;

    focus(value: BindValue<TModel, boolean>): this;

    value(value: BindValue<TModel, string | boolean>): this;

    style<TKey extends keyof CSSStyleDeclaration>(name: TKey, value: BindValue<TModel, CSSStyleDeclaration[TKey]>): this;

    behavoir(value: IBehavoir<TElement, TModel>): this;

    behavoir(name: string): this;

    styles(value: TemplateValueMap<TModel, CSSStyleDeclaration>): this;

    attribs(value: { [key: string]: BindValue<TModel, string | number | boolean> }): this;

    debugger(): this;
}

export interface IChildTemplateBuilder<TModel, TElement extends HTMLElement, TParent extends ITemplateBuilder<TModel>> extends ITemplateBuilder<TModel, TElement> {

    endChild(): TParent;
}