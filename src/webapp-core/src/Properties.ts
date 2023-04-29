import { IBindable, PROPS } from "./Abstraction/IBindable";
import type { IObservableProperty } from "./Abstraction/IObservableProperty";
import type { IProperty } from "./Abstraction/IProperty";
import { getTypeName } from "./ObjectUtils";
import { ObservableProperty } from "./ObservableProperty";


export function getOrCreateProp<TObj extends IBindable, TKey extends keyof TObj & string, TValue extends TObj[TKey]>(obj: TObj, propName: TKey, property?: IObservableProperty<TValue>, defValue?: TValue): IObservableProperty<TValue> {

    const prop = getProp(obj, propName);
    if (prop)
        return <IObservableProperty<TValue>>prop;

    const newProp = createProp(obj, propName, property);
    if (defValue !== undefined && newProp.get() === undefined)
        newProp.set(defValue);
    return newProp;
}

export function getProp<TObj extends IBindable, TKey extends keyof TObj & string, TValue extends TObj[TKey]>(obj: TObj, propName: TKey): IProperty<TValue> {

    if (PROPS in obj) { 
        const prop = obj[PROPS][propName];
        if (prop)
            return prop;
    }
    return undefined;
}

export function createProp<TObj extends IBindable, TKey extends (keyof TObj) & string, TValue extends TObj[TKey]>(obj: TObj, propName: TKey, property?: IObservableProperty<TValue>): IObservableProperty<TValue> {

    let desc = Object.getOwnPropertyDescriptor(obj, propName);

    if (!desc) {
        console.warn("'", propName, "' not defined in ", getTypeName(obj));
        desc = {};
    }

    if (!property)
        property = new ObservableProperty(desc, <string>propName);

    if (!obj[PROPS]) {
        Object.defineProperty(obj, PROPS, {
            value: {},
            enumerable: false,
            writable: false
        });
    }

    obj[PROPS][propName] = property;

    Object.defineProperty(obj, propName, {

        get: () => property.get(),

        set: (newValue) => property.set(newValue)
    });

    return property;
}