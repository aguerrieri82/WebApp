import type { BindValue, ITemplateProvider, CatalogTemplate } from "@eusoft/webapp-core";
import type { JsxComponentProps, JsxNode, TemplateModel } from "../Abstraction";

export interface IContentProps<TModel extends TemplateModel, TInnerModel extends TemplateModel> extends JsxComponentProps<TModel> {
    src: BindValue<TModel, ITemplateProvider> | CatalogTemplate<TInnerModel>;
    inline?: boolean;
    model?: BindValue<TModel, TInnerModel>;
    children?: undefined;
}

export function Content<TModel extends TemplateModel, TInnerModel extends TemplateModel>(props: IContentProps<TModel, TInnerModel>): JsxNode<any> {

    if (props.model)
        props.context.builder.template(props.src as CatalogTemplate<TInnerModel>, props.model);
    else
        props.context.builder.content(props.src as BindValue<TModel, ITemplateProvider>, props.inline)

    return null;
}