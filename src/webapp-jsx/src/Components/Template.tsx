import { defineTemplate } from "webapp-core";
import type { JsxComponentProps, JsxNode, TemplateModel } from "./../Abstraction";
import { processElement } from "./../Runtime";

export interface ITemplateProps<TModel extends TemplateModel> extends JsxComponentProps<TModel> {
    name: string;
    children: JsxNode<TModel>
}

export function Template<TModel extends TemplateModel>(props: ITemplateProps<TModel>): JsxNode<any>  {

    defineTemplate(props.name, t => processElement({builder: t} , props.children));

    return null;
}