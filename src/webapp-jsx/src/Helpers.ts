import {  ITemplate, ITemplateProvider } from "@eusoft/webapp-core";
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