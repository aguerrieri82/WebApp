import type { JsxComponentProps, JsxNode, TemplateModel } from "../Abstraction";

export interface IBehavoirProps<TModel extends TemplateModel> extends JsxComponentProps<TModel> {
    name: string;
    children: undefined;
}

export function Behavoir<TModel extends TemplateModel>(props: IBehavoirProps<TModel>): JsxNode<any> {

    props.context.builder.behavoir(props.name);
    return null;
}