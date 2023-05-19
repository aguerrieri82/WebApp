import type { BindValue, ITemplateProvider, ITemplateBuilder, ITemplate, InputValueMode, IBehavoir, WritableKeys, EmptyConstructor, IComponent } from "@eusoft/webapp-core";
export interface ITemplateContext<TModel> {
    builder: ITemplateBuilder<TModel>;
}

export type TemplateModel = object | string | number | boolean;

export type JsxElementType<TModel extends TemplateModel, TProps extends JsxComponentProps<TModel>> = keyof HTMLElementTagNameMap | JsxComponent<TModel, TProps> ;

export type JsxComponent<TModel extends TemplateModel, TProps extends JsxComponentProps<TModel>> = (props: TProps) => (JsxElementInstance<TModel, TProps> | null | void | ITemplate<TModel>);

export type ModelBuilder<TModel extends TemplateModel> = { (t: TModel): JSX.Element };

export type JsxNode<TModel extends TemplateModel> =
    string |
    number |
    JsxTypedElement<TModel, JsxComponentProps<TModel>> | 
    JsxNode<TModel>[] |
    ModelBuilder<TModel> 

export type JsxTypedElement<TModel extends TemplateModel, TProps> =
    JsxElementInstance<TModel, TProps> |
    null |
    void |
    ITemplateProvider<TModel> |
    ITemplate<TModel>


export type JsxTypedComponent<TOptions> = JsxTypedElement<IComponent<TOptions>, TOptions>;

export type JsxComponentProps<
        TModel extends TemplateModel,
        TContent = any> = {
    content?: TContent;
    context?: ITemplateContext<TModel>;
}

export interface JsxElementInstance<TModel extends TemplateModel, TProps extends JsxComponentProps<TModel>> {
    type: JsxElementType<TModel, TProps>;
    props: TProps;
}

type ElementEvents<TModel> = {
    [K in keyof HTMLElementEventMap as K extends string ? `on-${K}` : never]?: { (model: TModel, e?: HTMLElementEventMap[K]): object | number | boolean | void }
}

type ElementStyles<TModel> = {
    [K in keyof CSSStyleDeclaration as K extends string ? `style-${K}` : never]?: BindValue<TModel, CSSStyleDeclaration[K]>;
}

type ElementAttributes<TModel, TElement> = {
    [K in WritableKeys<TElement, string | number | boolean>]?: BindValue<TModel, TElement[K]>
}

type ElementProps<TModel extends TemplateModel, TElement> =
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

type InputProps<TModel extends TemplateModel, TElement> =
    ElementProps<TModel, TElement> &
    {
        "value"?: BindValue<TModel, string>;
        "value-mode"?: InputValueMode;
        "value-pool"?: number;
    }

declare global {
    namespace JSX {

        interface ElementChildrenAttribute { content: {} }

        interface ElementAttributesProperty { readonly options: {} }

        type ElementClass = IComponent<any> | ITemplateProvider | IBehavoir;
         
        type Element = JsxTypedElement<any, any>;

        type IntrinsicAttributes = {
        }

        type IntrinsicClassAttributes<T> = {
            builder?: (model: T, builder: any) => Element;
            ref?: BindValue<T, any>;
        }

        type IntrinsicElements = {

            [P in keyof HTMLElementTagNameMap]: ElementProps<any, HTMLElementTagNameMap[P]>
        } & {

            ["input"]: InputProps<any, HTMLElementTagNameMap["input"]>
            ["select"]: InputProps<any, HTMLElementTagNameMap["select"]>
            ["textarea"]: InputProps<any, HTMLElementTagNameMap["textarea"]>
        }
    }
}