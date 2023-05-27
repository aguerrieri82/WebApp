export interface IAsyncLoad {

    loadAsync(): Promise<any>;
}

export function isAsyncLoad(obj: any): obj is IAsyncLoad {
    return obj && typeof obj == "object" && "loadAsync" in obj && typeof obj["loadAsync"] == "function";
}