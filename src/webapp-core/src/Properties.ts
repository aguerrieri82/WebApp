import { IBindable, PROPS } from "./Abstraction/IBindable";
import type { IObservableProperty } from "./Abstraction/IObservableProperty";
import type { IProperty } from "./Abstraction/IProperty";
import { getTypeName } from "./ObjectUtils";
import { ObservableProperty } from "./ObservableProperty";

export function getOrCreateProp<TObj extends object, TKey extends keyof TObj & string, TValue extends TObj[TKey]>(obj: TObj, propName: TKey, property?: IObservableProperty<TValue>, defValue?: TValue): IObservableProperty<TValue> {

    const prop = getProp(obj, propName);
    if (prop)
        return prop as IObservableProperty<TValue>;

    const newProp = createProp(obj, propName, property);
    if (defValue !== undefined && newProp.get() === undefined)
        newProp.set(defValue);
    return newProp;
}

export function getProp<TObj extends object, TKey extends keyof TObj & string, TValue extends TObj[TKey]>(obj: TObj, propName: TKey): IProperty<TValue> {

    if (PROPS in obj) 
        return (obj as IBindable)[PROPS][propName];
    return undefined;
}

export function bindTwoWay<TValue>(dst: IObservableProperty<TValue>, src: IObservableProperty<TValue>) {

    dst.set(src.get());

    src.subscribe(v => dst.set(v));

    dst.subscribe(v => src.set(v));
}

export function createProp<TObj extends object, TKey extends (keyof TObj) & string, TValue extends TObj[TKey]>(obj: TObj, propName: TKey, property?: IObservableProperty<TValue>): IObservableProperty<TValue> {

    let desc = Object.getOwnPropertyDescriptor(obj, propName);

    if (!desc) {
        console.warn("'", propName, "' not defined in ", getTypeName(obj));
        desc = {};
    }

    if (!property)
        property = new ObservableProperty(desc, propName);

    if (!(PROPS in obj)) {
        Object.defineProperty(obj, PROPS, {
            value: {},
            enumerable: false,
            writable: false
        });
    }

    (obj as IBindable)[PROPS][propName] = property;

    Object.defineProperty(obj, propName, {

        get: () => property.get(),

        set: (newValue) => property.set(newValue)
    });

    return property;
}