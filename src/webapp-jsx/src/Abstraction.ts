import type { BindValue, ITemplateProvider, ITemplateBuilder, ITemplate } from "@eusoft/webapp-core";

export interface ITemplateContext<TModel> {
    builder: ITemplateBuilder<TModel>;
}

export type TemplateModel = object | string | number | boolean;

export type JsxElementType<TModel extends TemplateModel, TProps extends JsxComponentProps<TModel>> = keyof HTMLElementTagNameMap | JsxComponent<TModel, TProps> ;

export type JsxComponent<TModel extends TemplateModel, TProps extends JsxComponentProps<TModel>> = (props: TProps) => (JsxElement<TModel, TProps> | null);

export type JsxNode<TModel extends TemplateModel> =
    string |
    ITemplate<TModel> |
    JsxElement<TModel, JsxComponentProps<TModel>> |
    JsxNode<TModel>[] |
    { (model: TModel) : string|number }

export type JsxComponentProps<TModel extends TemplateModel, TChildrenModel extends TemplateModel = TModel, TChildren extends JsxNode<TChildrenModel> = JsxNode<TChildrenModel>> = {
    children?: TChildren;
    context?: ITemplateContext<TModel>;
}

export interface JsxElement<TModel extends TemplateModel, TProps extends JsxComponentProps<TModel>> {
    type: JsxElementType<TModel, TProps>;
    props: TProps;
}

type IfEquals<X, Y, A = X, B = never> =
    (<T>() => T extends X ? 1 : 2) extends
    (<T>() => T extends Y ? 1 : 2) ? A : B;


type WritableKeys<T, TProp> = {
    [P in keyof T]-?: T[P] extends TProp ? IfEquals<{ [Q in P]: T[P] }, { -readonly [Q in P]: T[P] }, P> : never
}[keyof T];

type ElementEvents<TModel> = {
    [K in keyof HTMLElementEventMap as K extends string ? `on-${K}` : never]?: { (model: TModel, e?: HTMLElementEventMap[K]) : void }
}

type ElementAttributes<TModel, TElement> = {
    [K in WritableKeys<TElement, string | number>]?: BindValue<TModel, TElement[K]>
}

type ElementProps<TModel extends TemplateModel, TElement> =
    ElementEvents<TModel> &
    ElementAttributes<TModel, TElement> &
    {
        style?: {
            [P in keyof CSSStyleDeclaration]?: BindValue<TModel, CSSStyleDeclaration[P]>
        };
        children?: JsxNode<TModel>;
        text?: BindValue<TModel, string | boolean>;
        visible?: BindValue<TModel, boolean>;
        html?: BindValue<TModel, string>;
        focus?: BindValue<TModel, boolean>;
        behavoir?: string | string[];
    }


declare global {
    namespace JSX {

        interface ElementChildrenAttribute { children: {} }

        interface ElementAttributesProperty { options: {} } 

        interface ElementClass extends ITemplateProvider {

        }

        type Element = JsxNode<any>;


        type IntrinsicElements = {

            [P in keyof HTMLElementTagNameMap]: ElementProps<any, HTMLElementTagNameMap[P]>
        }
    }
}