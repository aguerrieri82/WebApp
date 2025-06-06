import type { BindValue, ITemplateProvider, CatalogTemplate, ContentUpdateMode } from "@eusoft/webapp-core";
import type { JsxComponentProps, TemplateModel } from "../abstraction";

export interface IContentProps<TModel extends TemplateModel, TInnerModel extends TemplateModel> extends JsxComponentProps<TModel, undefined> {
    src: BindValue<TModel, TInnerModel>;
    inline?: boolean;
    update?: ContentUpdateMode;
    template?: BindValue<TModel, ITemplateProvider> | CatalogTemplate<TInnerModel>;
}
 
export function Content<TModel extends TemplateModel, TInnerModel extends TemplateModel = any>(props: IContentProps<TModel, TInnerModel>): null {

    if (props.template)
        props.context.builder.template(props.template as CatalogTemplate<TInnerModel>, props.src);
    else
        props.context.builder.content(props.src as BindValue<TModel, ITemplateProvider>, props.inline, props.update)

    return null;
}