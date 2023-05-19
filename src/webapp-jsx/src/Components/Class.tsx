import type { BindValue } from "@eusoft/webapp-core";
import type { JsxComponentProps, TemplateModel } from "../abstraction";

export interface IClassProps<TModel extends TemplateModel> extends JsxComponentProps<TModel, undefined> {
    name: this["condition"] extends null | undefined ? BindValue<TModel, string> : string;
    condition?: BindValue<TModel, boolean>;
}

export function Class<TModel extends TemplateModel>(props: IClassProps<TModel>) : null {

    if (props.condition == undefined)
        props.context.builder.class(props.name);
    else
        props.context.builder.class(props.name, props.condition);

    return null;
}