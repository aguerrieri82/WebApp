import { BindValue } from "webapp-core";
import type { JsxComponentProps, JsxNode, TemplateModel } from "../Abstraction";

export interface IClassProps<TModel extends TemplateModel> extends Omit<JsxComponentProps<TModel>, "children"> {
    name: this["condiction"] extends null | undefined ? BindValue<TModel, string> : string;
    condiction?: BindValue<TModel, boolean>;
}

export function Class<TModel extends TemplateModel>(props: IClassProps<TModel>): JsxNode<any> {

    if (props.condiction == undefined)
        props.context.builder.class(props.name);
    else
        props.context.builder.class(props.name, props.condiction);

    return null;
}