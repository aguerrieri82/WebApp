import { BindExpression, IBindable, ITemplate, ITemplateProvider, PARENT, USE } from "@eusoft/webapp-core";
import { ModelBuilder, TemplateModel } from "./abstraction";

export function forModel<TModel extends TemplateModel>(action: ModelBuilder<TModel>): ITemplate<TModel>;
export function forModel<TModel extends TemplateModel>(model: TModel, action: ModelBuilder<TModel>): ITemplateProvider<TModel>;
export function forModel<TModel extends TemplateModel>(actionOrModel: ModelBuilder<TModel> | TModel, action?: ModelBuilder<TModel>) {

    if (typeof actionOrModel != "function") {
        return {
            template: action(actionOrModel) as ITemplate<TModel>,
            model: actionOrModel
        } as ITemplateProvider<TModel>
    }

    const result = actionOrModel(null);
    return result as ITemplate<TModel>;
}

export function debug<T>(value: T, ...args: any[]) {
    debugger;
    return value;
}

export function getParent<T>(m: object): T {

    return (m as IBindable)[PARENT] as T;
}

export type TwoWays<T> = T;