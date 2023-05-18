import { ITemplate, defineTemplate } from "@eusoft/webapp-core";
import type { JsxComponentProps, JsxNode, TemplateModel } from "./../abstraction";
import { processNode } from "./../Runtime";

export interface ITemplateProps<TModel extends TemplateModel> extends JsxComponentProps<TModel> {
    name: string;
}

export function Template<TModel extends TemplateModel>(props: ITemplateProps<TModel>) : ITemplate<TModel> {

    return defineTemplate(props.name, t => processNode({ builder: t }, props.content)) as any;
}