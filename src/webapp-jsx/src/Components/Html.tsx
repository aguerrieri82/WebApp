import type { JsxComponentProps, JsxNode, TemplateModel } from "../abstraction";

export interface IBehavoirProps<TModel extends TemplateModel> extends JsxComponentProps<TModel, TModel, undefined> {
    name: string;
}

export function Behavoir<TModel extends TemplateModel>(props: IBehavoirProps<TModel>): null {

    props.context.builder.behavoir(props.name);
    return null;
}