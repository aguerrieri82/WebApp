import type { BindValue, ITemplateProvider, ITemplate, InputValueMode, IBehavoir, IComponent, TemplateBuilder } from "@eusoft/webapp-core";

export interface ITemplateContext<TModel> {
    builder: TemplateBuilder<TModel>;
}

export type TemplateModel = object | string | number | boolean | { (): string };

export type JsxElementType<TModel, TProps extends JsxComponentProps<TModel>> = keyof HTMLElementTagNameMap | JsxComponent<TModel, TProps> ;

export type JsxComponent<TModel, TProps extends JsxComponentProps<TModel>> = (props: TProps) => (JsxElementInstance<TModel, TProps> | null | void | ITemplate<TModel>);

export type ModelBuilder<TModel> = { (t: TModel): JSX.Element };

export type JsxNode<TModel> =
    string |
    number |
    HTMLElement |
    JsxTypedElement<TModel, JsxComponentProps<TModel>> | 
    JsxNode<TModel>[] |
    ModelBuilder<TModel> 

export type JsxTypedElement<TModel, TProps> =
    JsxElementInstance<TModel, TProps> |
    null |
    void |
    IComponent<TProps> |
    ITemplateProvider<TModel> |
    ITemplate<TModel>

export type JsxTypedComponent<TOptions> = JsxTypedElement<IComponent<TOptions>, TOptions>;

export type JsxComponentProps<
        TModel,
        TContent = any> = {
    content?: TContent;
    context?: ITemplateContext<TModel>;
}

export interface JsxElementInstance<TModel, TProps extends JsxComponentProps<TModel>> {
    type: JsxElementType<TModel, TProps>;
    props: TProps;
}

type ElementEvents<TModel> = {
    [K in keyof HTMLElementEventMap as K extends string ? `on-${K}` : never]?: { (model: TModel, e?: HTMLElementEventMap[K]): any }
}
 
type ElementStyles<TModel> = {
    [K in keyof CSSStyleDeclaration as K extends string ? `style-${K}` : never]?: BindValue<TModel, CSSStyleDeclaration[K]>;
}

type ElementAttributes<TModel, TElement> = {
    [K in WritableKeys<TElement, string | number | boolean>]?: BindValue<TModel, TElement[K]>
}

type ElementProps<TModel, TElement> =
    ElementEvents<TModel> &
    ElementStyles<TModel> &
    ElementAttributes<TModel, TElement> &
    {
        style?: {
            [P in keyof CSSStyleDeclaration]?: BindValue<TModel, CSSStyleDeclaration[P]>
        };
        content?: JsxNode<TModel>;
        text?: BindValue<TModel, string | boolean>;
        visible?: BindValue<TModel, boolean>;
        html?: BindValue<TModel, string>;
        focus?: BindValue<TModel, boolean>;
        behavoir?: string | string[] | EmptyConstructor<IBehavoir> | EmptyConstructor<IBehavoir>[] | IBehavoir | IBehavoir[];
    }

type InputProps<TModel, TElement> =
    Omit< ElementProps<TModel, TElement>, "value"> &
    {
        "value"?: BindValue<TModel, string|boolean>;
        "value-mode"?: InputValueMode;
        "value-pool"?: number;
    }

declare global {
    namespace JSX {

        interface IntrinsicCustomElements {

        }

        interface ElementChildrenAttribute { content: {} }

        interface ElementAttributesProperty { readonly options: {} }

        type ElementClass = IComponent<any> | ITemplateProvider | IBehavoir;
         
        type Element = JsxTypedElement<any, any>;

        type IntrinsicAttributes = {
        }

        type IntrinsicClassAttributes<T> = {
            ref?: BindValue<T, any>;
        }

        type IntrinsicElements = Omit<{

            [P in keyof HTMLElementTagNameMap]: ElementProps<any, HTMLElementTagNameMap[P]>
        }, "input" | "select" | "textarea"> & {

            ["input"]: InputProps<any, HTMLElementTagNameMap["input"]>
            ["select"]: InputProps<any, HTMLElementTagNameMap["select"]>
            ["textarea"]: InputProps<any, HTMLElementTagNameMap["textarea"]>
        } & IntrinsicCustomElements

    }
}