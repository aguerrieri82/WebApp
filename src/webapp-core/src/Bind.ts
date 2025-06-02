import { cleanProxy } from "./Expression";
import { type IComponent } from "./abstraction";
import { type IBindable, PARENT, USE, BIND_MODES, BIND_MODE } from "./abstraction/IBindable";
import type { BindExpression, BindMode, BindValue } from "./abstraction/IBinder";

interface IBindBuilder<TModel> {

    use<TValue>(value: TValue): IBindBuilder<TValue>;

    get<TValue > (exp: BindExpression<TModel, TValue>): IBindBuilder<TValue>;

    value: TModel;
}

export function bind(mode: BindMode) { 

    return (target: IComponent, propertyName: string) => {

        const constr = target.constructor;

        if (!constr[BIND_MODES])
            constr[BIND_MODES] = {};

        constr[BIND_MODES][propertyName] = mode;
    };
}


export namespace Bind {

    export function noTrack<T>(value: T) : T {
        return cleanProxy(value);
    }

    export function exp<TModel, TValue = unknown>(value: BindExpression<TModel, TValue>) {

        value[BIND_MODE] = "expression";
        return value as BindExpression<TModel, TValue> & { [BIND_MODE]: "expression" };
    }
     
    export function action<T extends BindValue<unknown, unknown>>(value: T): T {

        value[BIND_MODE] = "action";
        return value;
    }

    export function oneWay<T extends BindValue<unknown, unknown>>(value: T): T {
        value[BIND_MODE] = "one-way";
        return value;
    }

    export function twoWays<T extends BindValue<unknown, unknown>>(value: T): T {
        value[BIND_MODE] = "two-ways"; 
        return value;
    }

    export function noBind<T extends BindValue<unknown, unknown>>(value: T): T {
        value[BIND_MODE] = "no-bind";
        return value;
    }

    export function parent<T>(m: object): T {

        return (m as IBindable)[PARENT] as T;
    }


    export function build<TModel>(model: TModel) {

        function builder<TBuilder>(curModel: TBuilder): IBindBuilder<TBuilder> {
            return {

                use<TValue>(value: TValue) {
                    return builder((curModel as IBindable)[USE](value))
                },

                get<TValue>(exp: BindExpression<TBuilder, TValue>) {
                    return builder(exp(curModel));
                },

                get value() {
                    return curModel;
                }
            }
        }

        return builder(model);
    }
}

export type TwoWays<T> = T;