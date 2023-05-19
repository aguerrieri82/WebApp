import type { JsxComponentProps, TemplateModel } from "../abstraction";

export interface INodeProps<TModel extends TemplateModel> extends JsxComponentProps<TModel, undefined> {
    src: Node;
}
export function Node<TModel extends TemplateModel>(props: INodeProps<TModel>): null  {

    props.context.builder.appendChild(props.src);
    return null;
}