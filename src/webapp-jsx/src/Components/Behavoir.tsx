import { BindValue } from "webapp-core";
import type { JsxComponentProps, JsxNode, TemplateModel } from "../Abstraction";

export interface IBehavoirProps<TModel extends TemplateModel> extends JsxComponentProps<TModel> {
    src: BindValue<TModel, string>;
    children: undefined;
}

export function Behavoir<TModel extends TemplateModel>(props: IBehavoirProps<TModel>): JsxNode<any> {

    props.context.builder.html(props.src);
    return null;
}