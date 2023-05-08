import { BindMode, BindValue, ITemplate, PARENT } from "@eusoft/webapp-core";
import { ModelBuilder, TemplateModel } from "./Abstraction";

export function forModel<TModel extends TemplateModel>(action: ModelBuilder<TModel>): ITemplate<TModel> {
    const result = action(null);
    return result as ITemplate<TModel>;
}

export namespace Bind {

    /**
     * Enable two-ways binding in Jsx component
     * @param value
     * @returns
     */
    export function twoWays<T>(value: T): T {
        return value;
    }
}



export function debug<T>(value: T, ...args: any[]) {
    debugger;
    return value;
}

export function getParent<T>(m: object): T {

    return m[PARENT] as T;
}

export type TwoWays<T> = T;