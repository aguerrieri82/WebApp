import { type BindValue } from "@eusoft/webapp-core";
import type { JsxComponentProps, TemplateModel } from "../abstraction";

export interface ITextProps<TModel extends TemplateModel> extends JsxComponentProps<TModel, string | string[]> {
    src?: BindValue<TModel, string>;
}

export function Html<TModel extends TemplateModel>(props: ITextProps<TModel>): null {

    props.context.builder.html(props.src);

    return null;
}