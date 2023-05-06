import { ITemplate } from "@eusoft/webapp-core";

export function forModel<TModel>(action: { (t: TModel): JSX.Element }): ITemplate<TModel> {
    const result = action(null);
    return result as ITemplate<TModel>;
}

export function twoWay<T>(value: T): T {
    return value;
}