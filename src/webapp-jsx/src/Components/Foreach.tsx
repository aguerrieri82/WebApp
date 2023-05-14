import type { BindValue, ITemplate } from "@eusoft/webapp-core";
import type { JsxComponentProps, JsxElement, JsxNode, ModelBuilder, TemplateModel } from "./../abstraction";
import { processNode } from "./../Runtime";



export interface IForeachProps<TModel extends TemplateModel, TItem extends TemplateModel>
    extends JsxComponentProps<TModel, TItem, Exclude<JsxNode<TItem>, ITemplate<TModel>>> {
    src: BindValue<TModel, TItem[]>;
}

export function Foreach<TModel extends TemplateModel, TItem extends TemplateModel>(props: IForeachProps<TModel, TItem>): JsxNode<any> {

    let children = props.content as JsxNode<TItem>;

    if (typeof children == "function")
        children = children(null);

    props.context.builder.foreach(props.src, t => processNode({ builder: t }, children))
    return null;
}
