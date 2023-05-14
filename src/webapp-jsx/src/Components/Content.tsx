import type { BindValue, ITemplateProvider, CatalogTemplate } from "@eusoft/webapp-core";
import type { JsxComponentProps, JsxNode, TemplateModel } from "../abstraction";

export interface IContentProps<TModel extends TemplateModel, TInnerModel extends TemplateModel> extends JsxComponentProps<TModel, TModel, undefined> {
    src: BindValue<TModel, ITemplateProvider> | CatalogTemplate<TInnerModel>;
    inline?: boolean;
    model?: BindValue<TModel, TInnerModel>;
}

export function Content<TModel extends TemplateModel, TInnerModel extends TemplateModel = any>(props: IContentProps<TModel, TInnerModel>): JsxNode<any> {

    if (props.model)
        props.context.builder.template(props.src as CatalogTemplate<TInnerModel>, props.model);
    else
        props.context.builder.content(props.src as BindValue<TModel, ITemplateProvider>, props.inline)

    return null;
}