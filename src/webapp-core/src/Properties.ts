import { IBindable, PROPS } from "./Abstraction/IBindable";
import type { IObservableProperty } from "./Abstraction/IObservableProperty";
import type { IProperty } from "./Abstraction/IProperty";
import { getTypeName } from "./ObjectUtils";
import { ObservableProperty } from "./ObservableProperty";

interface IBound {
    unbind(): void;
}

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

export function bindTwoWay<TValue>(dst: IObservableProperty<TValue>, src: IObservableProperty<TValue>): IBound;

export function bindTwoWay<TSrc extends {}, TDst extends {}, TProp extends keyof TSrc & keyof TDst & string>(dst: TSrc, src: TDst, propName: TProp): IBound;

export function bindTwoWay(dst: any, src: any, propName?: string) {

    const srcProp = propName ? getOrCreateProp(src, propName) : src;

    const dstProp = propName ? getOrCreateProp(dst, propName) : dst;

    if (!srcProp)
        throw new Error("Source property missing");

    if (!dstProp)
        throw new Error("Dest property missing");

    dstProp.set(srcProp.get());

    const srcHandler = srcProp.subscribe(v => dstProp.set(v));

    const dstHandler = dstProp.subscribe(v => srcProp.set(v));

    return {
        unbind() {
            srcProp.unsubscribe(srcHandler);
            dstProp.unsubscribe(dstHandler);
        }
    }
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