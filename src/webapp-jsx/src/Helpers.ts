import { BindMode, BindValue, ITemplate } from "@eusoft/webapp-core";
import { ModelBuilder, TemplateModel } from "./Abstraction";

export function forModel<TModel extends TemplateModel>(action: ModelBuilder<TModel>): ITemplate<TModel> {
    const result = action(null);
    return result as ITemplate<TModel>;
}


/**
 * Enable two-ways binding in Jsx component
 * @param value
 * @returns
 */
export function twoWays<T>(value: T): T {
    return value;
}

export type TwoWays<T> = T;