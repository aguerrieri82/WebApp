import type { JsxComponentProps, JsxNode, TemplateModel } from "../Abstraction";

export interface INodeProps<TModel extends TemplateModel> extends JsxComponentProps<TModel> {
    src: Node;
    children: undefined;
}
export function Node<TModel extends TemplateModel>(props: INodeProps<TModel>): JsxNode<any>  {

    props.context.builder.appendChild(props.src);
    return null;
}