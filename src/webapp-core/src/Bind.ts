import { IBindable, PARENT, USE } from "./abstraction/IBindable";
import type { BindExpression } from "./abstraction/IBinder";

export namespace Bind {

    export function action<T extends Function>(value: T): T {

        return value;
    }

    export function parent<T>(m: object): T {

        return (m as IBindable)[PARENT] as T;
    }

    export function oneWay<T>(value: T): T {
        return value;
    }

    export function twoWays<T>(value: T): T {
        return value;
    }

    export function noBind<T>(value: T): T {
        return value;
    }

    export function builder<T>(value: T): T {
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

export type TwoWays<T> = T;