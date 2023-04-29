import { BindValue } from "webapp-core";
import type { JsxComponentProps, JsxElement, JsxNode, TemplateModel } from "./../Abstraction";
import { isJsxElement, processElement } from "./../Runtime";

export interface IElseProps<TModel extends TemplateModel> {
    children: JsxNode<TModel>;
}

export interface IIfProps<TModel extends TemplateModel> extends JsxComponentProps<TModel> {
    condiction: BindValue<TModel, boolean>;
}

export function If<TModel extends TemplateModel>(props: IIfProps<TModel>): JsxNode<any> {

    const elseChild = Array.isArray(props.children) ? props.children.find(a => isJsxElement(a) && a.type == Else) as JsxElement<TModel, IElseProps<TModel>> : undefined;

    props.context.builder.if(props.condiction,
        t => processElement({ builder: t }, props.children), elseChild ?
        t => processElement({ builder: t }, elseChild.props.children) : undefined);

    return null;
}

export function Else<TModel extends TemplateModel>(props: IElseProps<TModel>): JsxNode<any> {
    return null;
}