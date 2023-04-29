
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

    let name = obj["@typeName"];

    if (!name) {
        name = typeof obj;

        if (name == "function")
            return getFunctionName(obj);

        if (name == "object") {

            const constFunc = obj.constructor;
            if (constFunc)
                return getTypeName(constFunc);
        }
    }
    return name;
}
