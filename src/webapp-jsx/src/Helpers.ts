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

export namespace Bind {

    /**
     * Enable two-ways binding in Jsx component
     * @param value
     * @returns
     */
    export function twoWays<T>(value: T): T {
        return value;
    }

    export function noBind<T>(value: T): T {
        return value;
    }

    export function build(model: any) {

        function builder<TModel>(curModel: TModel) {
            return ({

                use<TValue>(value: TValue) {
                    return builder((curModel as IBindable)[USE](value))
                },

                get<TValue>(exp: BindExpression<TModel, TValue>) {
                    return builder(exp(curModel));
                },

                get value() {
                    return curModel;
                }
            });
        }

        return builder(model);
    }
}

export function debug<T>(value: T, ...args: any[]) {
    debugger;
    return value;
}

export function getParent<T>(m: object): T {

    return (m as IBindable)[PARENT] as T;
}

export type TwoWays<T> = T;