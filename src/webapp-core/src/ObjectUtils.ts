
const TYPE_NAME = Symbol("@typeName");

export function getFunctionName(func: Function): string {

    let curName = func.name;
    if (!curName) {
        const funcNameRegex = /function\s([^(]{1,})\(/;
        const results = (funcNameRegex).exec(func.toString());
        curName = (results && results.length > 1) ? results[1].trim() : "";
    }
    return curName;
}

export function getTypeName(obj: any) : string {

    if (!obj)
        return undefined;

    const type = typeof obj;

    let name = type == "object" ? obj[TYPE_NAME] : undefined;

    if (!name) {

        if (name == "function")
            name = getFunctionName(obj);

        else if (name == "object") {

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
