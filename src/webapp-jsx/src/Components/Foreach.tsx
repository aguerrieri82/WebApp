import type { BindValue } from "@eusoft/webapp-core";
import type { JsxComponentProps, JsxNode, TemplateModel } from "./../Abstraction";
import { processElement } from "./../Runtime";

export interface IForeachProps<TModel extends TemplateModel, TItem extends TemplateModel> extends JsxComponentProps<TModel, TItem> {
    src: BindValue<TModel, TItem[]>;
}

export function Foreach<TModel extends TemplateModel, TItem extends TemplateModel>(props: IForeachProps<TModel, TItem>): JsxNode<any> {

    props.context.builder.foreach(props.src, t => processElement({ builder: t }, props.children))
    return null;
}
