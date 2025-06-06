import { cleanProxy } from "./Expression";
import { isBindExpression, type IBehavoir, type IBehavoirConstructor, type IComponent, type IComponentConstructor } from "./abstraction";
import { type IBindable, PARENT, USE, BIND_MODES, BIND_MODE, INDEX } from "./abstraction/IBindable";
import type { BindExpression, BindMode, BindValue, ExternalBind } from "./abstraction/IBinder";

interface IBindBuilder<TModel> {

    use<TValue>(value: TValue): IBindBuilder<TValue>;

    get<TValue > (exp: BindExpression<TModel, TValue>): IBindBuilder<TValue>;

    value: TModel;
}

export function bind(mode: BindMode) { 

    return (target: IComponent, propertyName: string) => {

        const constr = target.constructor as IComponentConstructor;

        if (!constr[BIND_MODES])
            constr[BIND_MODES] = {};

        constr[BIND_MODES][propertyName] = mode;
    };
}

export function use<T>(model: IBindable, item: T) {
    const target = cleanProxy(model);
    if (target === model)
        return item;
    if (typeof target != "object")
        return item;
    return model[USE](item);
}

export namespace Bind {

    export function noTrack<T>(value: T) : T {
        return cleanProxy(value);
    }

    export function track<T>(value: T): T {
        return value;
    }

    export function external<TModel extends object, T>(
        model: TModel,
        value: BindExpression<TModel, T>,
        mode?: BindMode): ExternalBind<T, TModel>;
    export function external<TModel extends object, TKey extends keyof TModel & string>(
        model: TModel,
        key: TKey,
        mode?: BindMode): ExternalBind<TModel[TKey], TModel>;

    export function external<TModel extends object, TKey extends keyof TModel & string, TValue>(
        model: TModel,
        valueOrKey: BindExpression<TModel, TValue>|TKey,
        mode?: BindMode): ExternalBind<TValue | TModel[TKey], TModel> {

        let value;
        if (typeof valueOrKey == "string")
            value = Bind.exp((m: TModel) => m[valueOrKey])
        else
            value = valueOrKey;

        return {
            model,
            value,
            mode
        };
    }

    export function exp<TModel, TValue = unknown>(value: BindExpression<TModel, TValue>) {

        value[BIND_MODE] = "expression";
        return value as BindExpression<TModel, TValue> & { [BIND_MODE]: "expression" };
    }
     
    export function action<T extends BindValue<unknown, unknown>>(value: T): T {

        if (isBindExpression(value))
            value[BIND_MODE] = "action";
        return value;
    }

    export function oneWay<T extends BindValue<unknown, unknown>>(value: T): T {
        if (isBindExpression(value))
            value[BIND_MODE] = "one-way";
        return value;
    }

    export function twoWays<T extends BindValue<unknown, unknown>>(value: T): T {

        if (isBindExpression(value))
            value[BIND_MODE] = "two-ways"; 
        return value;
    }

    export function noBind<T extends BindValue<unknown, unknown>>(value: T): T {
        if (isBindExpression(value))
            value[BIND_MODE] = "no-bind";
        return value;
    }

    export function parent<T>(m: object): T {

        return (m as IBindable)[PARENT] as T;
    }

    export function index(m: object) {

        return (m as IBindable)[INDEX];
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

type ComponentOrBehavoir<T> = T extends IComponent ?
    IComponentConstructor<unknown, T> :
    IBehavoirConstructor<T>;

export function configureBindings<
    T extends IComponent | IBehavoir<HTMLElement, unknown>>(
        component: ComponentOrBehavoir<T>,
        values: Partial<Record<keyof T & string, BindMode>>
) {

    let modes = component[BIND_MODES];

    if (!modes) {
        modes = {};
        component[BIND_MODES] = modes;
    }

    Object.assign(modes, values);

}