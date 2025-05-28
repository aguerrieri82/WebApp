import { type BindValue } from "@eusoft/webapp-core";
import type { JsxComponentProps, TemplateModel } from "../abstraction";


type StyleProps<TModel extends TemplateModel>  = JsxComponentProps<TModel, undefined> & {

    [K in keyof CSSStyleDeclaration as K extends string ? K : never]?: BindValue<TModel, CSSStyleDeclaration[K]>;
}

export function Style<TModel extends TemplateModel>(props: StyleProps<TModel>): null  {

    const element = props.context.builder.element

    for (const prop in props)
        element.style[prop as any] = (props as any)[prop]; //TODO any

    return null;
}