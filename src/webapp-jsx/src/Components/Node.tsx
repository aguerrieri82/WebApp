import type { JsxComponentProps, JsxNode, TemplateModel } from "../abstraction";

export interface INodeProps<TModel extends TemplateModel> extends JsxComponentProps<TModel, TModel, undefined> {
    src: Node;
}
export function Node<TModel extends TemplateModel>(props: INodeProps<TModel>): JsxNode<any>  {

    props.context.builder.appendChild(props.src);
    return null;
}