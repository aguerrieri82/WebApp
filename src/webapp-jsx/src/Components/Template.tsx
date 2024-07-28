import { ITemplate, template } from "@eusoft/webapp-core";
import type { JsxComponentProps, TemplateModel } from "./../abstraction";
import { processNode } from "./../Runtime";

export interface ITemplateProps<TModel extends TemplateModel> extends JsxComponentProps<TModel> {
    name: string;
}

export function Template<TModel extends TemplateModel>(props: ITemplateProps<TModel>) : ITemplate<TModel> {

    return template<TModel>(t => processNode({ builder: t }, props.content), props.name);
}