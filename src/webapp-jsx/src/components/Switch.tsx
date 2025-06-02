import { type BindExpression, type BindValue, type ITemplate } from "@eusoft/webapp-core";
import type {  JsxComponentProps, TemplateModel } from "../abstraction";
import { type JsxElementInstance } from "../abstraction";


type BuildSwitch<TValue> = (value: TValue) => void;

type TChild<TValue extends TemplateModel> =
    //JsxTypedElement<TValue, IWhenProps<TValue> | IDefaultProps<TValue>> |
    //(JsxTypedElement<TValue, IWhenProps<TValue> | IDefaultProps<TValue>>)[] |
    BuildSwitch<TValue> 

export interface ISwitchProps<TModel extends TemplateModel, TValue extends TemplateModel> extends JsxComponentProps<TModel, TChild<TValue>> {
    src: BindValue<TModel, TValue>;
}

export interface IWhenProps<TValue extends TemplateModel> extends JsxComponentProps<TValue, JSX.Element> { 
    condition: BindValue<TValue, boolean>;
}

export interface IDefaultProps<TValue extends TemplateModel> extends JsxComponentProps<TValue, JSX.Element> {
}

export function Default<TValue extends TemplateModel>(props: IDefaultProps<TValue>): null {
    return null;
}

export function When<TValue extends TemplateModel>(props: IWhenProps<TValue>): null {
    return null;
}

export function Switch<TModel extends TemplateModel, TValue extends TemplateModel>(props: ISwitchProps<TModel, TValue>) : null {


    if (typeof props.content == "function") {
        //props.context.builder.switch(props.src, props.content as BuildSwitch<TValue>);
        //TODO: implement
    }
    else {

        const content = (Array.isArray(props.content) ? props.content : [props.content]) as JsxElementInstance<TValue, IWhenProps<TValue> | IDefaultProps<TValue>>[];

        props.context.builder.switch(props.src, bld => {

            content.forEach(c => {
                if ("condition" in c.props)
                    bld.when(c.props.condition as BindValue<TValue, boolean>, c.props.content as ITemplate<TValue>);
                else
                    bld.default(c.props.content as ITemplate<TValue>);
            })
        });

    }

    return null;
}