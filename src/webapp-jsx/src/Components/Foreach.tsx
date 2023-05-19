import type { BindValue } from "@eusoft/webapp-core";
import type { JsxComponentProps, JsxNode, TemplateModel } from "./../abstraction";
import { processNode } from "./../Runtime";



export interface IForeachProps<TModel extends TemplateModel, TItem extends TemplateModel>
    extends JsxComponentProps<TModel, {(t: TItem) : JSX.Element } > {
    src: BindValue<TModel, TItem[]>;
}

export function Foreach<TModel extends TemplateModel, TItem extends TemplateModel>(props: IForeachProps<TModel, TItem>): null {

    let children = props.content as JsxNode<TItem>;

    if (typeof children == "function")
        children = children(null) as JsxNode<TItem>; 

    props.context.builder.foreach(props.src, t => processNode({ builder: t }, children))
    return null;
}
