import { ITemplate } from "@eusoft/webapp-core";
import { ModelBuilder, TemplateModel } from "./Abstraction";

export function forModel<TModel extends TemplateModel>(action: ModelBuilder<TModel>): ITemplate<TModel> {
    const result = action(null);
    return result as ITemplate<TModel>;
}

export function twoWay<T>(value: T): T {
    return value;
}