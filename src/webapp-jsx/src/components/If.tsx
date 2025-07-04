import type { BindValue } from "@eusoft/webapp-core";
import type { JsxComponentProps, JsxElementInstance, TemplateModel } from "./../abstraction";
import { isJsxElement, processNode } from "./../Runtime";

export interface IElseProps<TModel extends TemplateModel> extends JsxComponentProps<TModel> {

}

export interface IIfProps<TModel extends TemplateModel> extends JsxComponentProps<TModel> {
    condition: BindValue<TModel, boolean>;
}

export function If<TModel extends TemplateModel>(props: IIfProps<TModel>): null {

    const elseChild = Array.isArray(props.content) ? props.content.find(a => isJsxElement(a) && a.type == Else) as JsxElementInstance<TModel, IElseProps<TModel>> : undefined;

    props.context.builder.if(props.condition,
        t => processNode({ builder: t }, props.content), elseChild ?
        t => processNode({ builder: t }, elseChild.props.content) : undefined);

    return null;
}

export function Else<TModel extends TemplateModel>(props: IElseProps<TModel>): null {
    return null;
}