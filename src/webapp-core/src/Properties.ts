import { ATTRIBUTES, type IBindable, PROPS } from "./abstraction/IBindable";
import type { IBound } from "./abstraction/IBound";
import type { IObservableProperty, IPropertyChangedHandler } from "./abstraction/IObservableProperty";
import type { IProperty } from "./abstraction/IProperty";
import { getPropertyDescriptor } from "./utils/Object";
import { ObservableProperty } from "./ObservableProperty";
import type { IComponent } from "./abstraction";

export function propOf<TObj extends object, TKey extends keyof TObj & string>(obj: TObj, propName: TKey) {

    return getOrCreateProp(obj, propName);
}

export function onChanged<TObj extends object, TKey extends keyof TObj & string>(obj: TObj, propName: TKey, handler: IPropertyChangedHandler<TObj[TKey]>) {

    return getOrCreateProp(obj, propName).subscribe(handler);
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
        return (obj as IBindable)[PROPS][propName] as IProperty<TValue>;
    return undefined;
}

export function bindTwoWays<TValue>(dst: IObservableProperty<TValue>, src: IObservableProperty<TValue>): IBound;

export function bindTwoWays<
    TSrc extends ObjectLike,
    TDst extends ObjectLike,
    TProp extends keyof TSrc & keyof TDst & string>(dst: TSrc, src: TDst, propName: TProp): IBound;

export function bindTwoWays(dst: any, src: any, propName?: string) {

    const srcProp = propName ? getOrCreateProp(src, propName) : src;

    const dstProp = propName ? getOrCreateProp(dst, propName) : dst;

    if (!srcProp)
        throw new Error("Source property missing");

    if (!dstProp)
        throw new Error("Dest property missing");

    if (srcProp.get() !== undefined)
        dstProp.set(srcProp.get());

    else if (dstProp.get() !== undefined)
        srcProp.set(dstProp.get());

    const srcHandler = srcProp.subscribe((v: unknown) => dstProp.set(v));

    const dstHandler = dstProp.subscribe((v: unknown) => srcProp.set(v));

    return {
        dst,
        src,
        unbind() {
            srcProp.unsubscribe(srcHandler);
            dstProp.unsubscribe(dstHandler);
        }
    }
}

export function createProp<TObj extends object, TKey extends (keyof TObj) & string, TValue extends TObj[TKey]>(obj: TObj, propName: TKey, property?: IObservableProperty<TValue>): IObservableProperty<TValue> {

    let desc = getPropertyDescriptor(obj, propName);

    if (!desc) {
        //console.warn("'", propName, "' not defined in ", getTypeName(obj), obj);
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

        enumerable: true,

        configurable: true,

        get: () => property.get(),

        set: (newValue) => property.set(newValue)
    });

    return property;
}

export function attribute<T extends IComponent>() {

    return function (target: T, propertyKey: keyof T & string) {

        const attrs = target[ATTRIBUTES] ?? [];
        target[ATTRIBUTES] = attrs;
        attrs.push(propertyKey);
    };
} 
