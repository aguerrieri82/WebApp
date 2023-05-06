import { defineTemplate } from "@eusoft/webapp-core";
import type { JsxComponentProps, JsxNode, TemplateModel } from "./../Abstraction";
import { processNode } from "./../Runtime";

export interface ITemplateProps<TModel extends TemplateModel> extends JsxComponentProps<TModel> {
    name: string;
    children: JsxNode<TModel>
}

export function Template<TModel extends TemplateModel>(props: ITemplateProps<TModel>) {

    return defineTemplate(props.name, t => processNode({builder: t} , props.children));
}