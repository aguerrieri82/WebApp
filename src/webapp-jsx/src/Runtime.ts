import { IComponent, ITemplate } from "@eusoft/webapp-core";
import { ITemplateContext, JsxComponentProps, JsxElement, JsxElementType, JsxNode, TemplateModel } from "./Abstraction";
import { Template } from "./Components/Template";
export function isJsxElement(obj: any): obj is JsxElement<any, JsxComponentProps<any>> {

    return obj && typeof (obj) == "object" && "props" in obj && "type" in obj;
}

export function isEventProp(name: string) {

    return name.startsWith("on-");
}
export function isComponent<TModel extends TemplateModel = TemplateModel>(type: any): type is { new(props: TModel): IComponent } {

    return type.toString().startsWith("class ");
}


export function processElement<TModel extends TemplateModel>(context: ITemplateContext<TModel>, node: JsxNode<TModel>) {

    if (node === null || node === undefined)
        return;

    if (Array.isArray(node)) {
        for (const item of node)
            processElement(context, item);
    }
    else if (typeof (node) == "string") {
        context.builder.text(node);
    }
    else if (isJsxElement(node)) {

        if (typeof (node.type) == "string") {
            const childBuilder = context.builder.beginChild(node.type);

            for (const prop in node.props) {

                if (prop == "children")
                    continue;

                const value = (node.props as any)[prop]; //TODO force any

                if (prop == "style") {
                    if (value)
                        childBuilder.styles(value);
                }

                else if (prop == "value") {
                    childBuilder.value(value);
                }

                else if (prop == "text") {
                    childBuilder.text(value);
                }
                else if (prop == "visible") {
                    childBuilder.visible(value);
                }
                else if (prop == "html") {
                    childBuilder.html(value);
                }
                else if (prop == "focus") {
                    childBuilder.focus(value);
                }
                else if (prop == "class") {
                    childBuilder.class(value);
                }
                else if (prop == "behavoir") {

                    const arrayValue = Array.isArray(value) ? value : [value];
                    for (const item of arrayValue)
                        childBuilder.behavoir(item);
                }

                else if (prop.startsWith("on-")) {
                    childBuilder.on(prop.substring(3) as any, value);
                }
                else {
                    childBuilder.set(prop, value)
                }
            }
            processElement({ builder: childBuilder }, node.props.children)
            childBuilder.endChild()
        }
        else {
            if (isComponent(node.type)) {
                const content = new node.type(node.props) as IComponent;
                context.builder.content(content)
            }
            else {

                const result = node.type({
                    ...node.props,
                    context
                });

                processElement(context, result);
            }
        }
    }
    else if (typeof (node) == "function") {
        context.builder.text(node as any); //TODO fix
    }
}

export function createElement<
    TModel extends TemplateModel,
    TProps extends JsxComponentProps<TModel>,
    TChildren extends JsxNode<TModel>>
    (type: JsxElementType<TModel, TProps>, props: TProps, ...children: TChildren[]): JsxElement<TModel, TProps> {

    if (typeof (type) == "function" && (type as Function) == Template)
        return type({
            ...props,
            children
        });

    else {
        return {
            type: type,
            props: {
                ...props,
                children
            }
        }
    }
}

export function forModel<TModel>(action: { (t: TModel): JSX.Element }): ITemplate<TModel> {
    const result = action(null);
    return result as ITemplate<TModel>;
}