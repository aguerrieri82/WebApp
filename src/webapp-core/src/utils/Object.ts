const TYPE_NAME = Symbol.for("@typeName");

export type WithTypeName = { [TYPE_NAME]?: string } & (object | Function);

const funcNameRegex = /function\s([^(]{1,})\(/;

export function getFunctionName(func: Function): string {

    let curName = func.name;
    if (!curName) {
        const results = (funcNameRegex).exec(func.toString());
        curName = (results && results.length > 1) ? results[1].trim() : "";
    }

    return curName;
}

export function getFunctionType(value: Function): "function" | "class" | "async" | "arrow" {
    return typeof value === 'function'
        ? value.prototype
            ? Object.getOwnPropertyDescriptor(value, 'prototype').writable
                ? 'function'
                : 'class'
            : value.constructor.name === 'AsyncFunction'
                ? 'async'
                : 'arrow'
        : undefined;
}

export function isClass(value: Function): value is { new(...args: any): any } {
    return getFunctionType(value) == "class";
}

export function isSimpleObject(value: any): value is object {
    return value && typeof value == "object" && value.constructor == Object;
}

export function setTypeName(obj: WithTypeName, name: string) {

    obj[TYPE_NAME] = name;
} 

export function getTypeName(obj: WithTypeName): string {

    if (!obj)
        return undefined;

    const type = typeof obj;

    let name = type == "object" || type == "function" ? obj[TYPE_NAME] : undefined;

    if (!name) {

        if (type == "function") {
            name = getFunctionName(obj as Function);
            if (getFunctionType(obj as Function) == "class" && name.startsWith("_")) {
                name = name.substring(1);
            }
        }
            

        else if (type == "object") {

            const constFunc = obj.constructor;
            if (constFunc)
                name = getTypeName(constFunc);
        }
        else
            name = type

        if (type == "object")
            obj[TYPE_NAME] = name;
    }
    return name;
}

export function getBaseType(ctr: Class<unknown>): Class<unknown>;
export function getBaseType(obj: object): Class<unknown>;
export function getBaseType(objOrFun: object | Class<unknown>): Class<unknown> {

    let proto: unknown;

    if (typeof objOrFun == "function")
        proto = objOrFun.prototype;
    else
        proto = Object.getPrototypeOf(objOrFun);

    return Object.getPrototypeOf(proto).constructor;
}

export function *objectHierarchy(obj: object) {

    let curType = Object.getPrototypeOf(obj);

    while (curType) {
        yield curType.constructor;
        curType = Object.getPrototypeOf(curType);
    }
    
} 

export function getPropertyDescriptor(obj: object, prop: PropertyKey) {

    let curObj = obj;

    while (curObj) {

        const desc = Object.getOwnPropertyDescriptor(curObj, prop);

        if (desc)
            return desc;

        curObj = Object.getPrototypeOf(curObj);

        if (curObj == Object)
            return;
    }
}

export function enumOverrides<
    TObj extends object,
    TFunc extends Function,
    TKey extends KeyOfType<TObj, TFunc>>(obj: TObj, func: TKey): TFunc[] {

    let curType = Object.getPrototypeOf(obj);

    const result: TFunc[] = [];

    while (curType) {

        if (Object.hasOwn(curType, func))
            result.push(curType[func]);

        curType = Object.getPrototypeOf(curType);
    }

    return result;
}

export function* mapObject<TObj extends object, TKey extends keyof TObj & string>(obj: TObj): Iterable<{key: TKey, value: TObj[TKey]}> {

    for (const key in obj) {
        yield {
            key: key,
            value: obj[key]
        } as any

    }
}

export function isProbablyConstructor(value: unknown) {
    return typeof value === 'function' &&
        value.prototype &&
        value.prototype.constructor === value &&
        Object.getOwnPropertyNames(value.prototype).length > 1;
}