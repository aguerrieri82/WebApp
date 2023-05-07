import type { BindValue } from "@eusoft/webapp-core";
import type { JsxComponentProps, JsxNode, TemplateModel } from "../Abstraction";

export interface IClassProps<TModel extends TemplateModel> extends Omit<JsxComponentProps<TModel>, "children"> {
    name: this["condition"] extends null | undefined ? BindValue<TModel, string> : string;
    condition?: BindValue<TModel, boolean>;
}

export function Class<TModel extends TemplateModel>(props: IClassProps<TModel>): JsxNode<any> {

    if (props.condition == undefined)
        props.context.builder.class(props.name);
    else
        props.context.builder.class(props.name, props.condition);

    return null;
}