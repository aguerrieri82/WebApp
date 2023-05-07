import { BindValue } from "@eusoft/webapp-core";
import type { JsxComponentProps, TemplateModel } from "../Abstraction";


export interface ITextProps<TModel extends TemplateModel> extends JsxComponentProps<TModel, TModel, string|string[]> {
    src?: BindValue<TModel, string>;
}

export function Text<TModel extends TemplateModel>(props: ITextProps<TModel>) {

    if (props.src)
        props.context.builder.text(props.src);
    else
        props.context.builder.text(Array.isArray(props.content) ? props.content.join("") : props.content);

    return null;
}