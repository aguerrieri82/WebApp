export interface IAsyncLoad {

    loadAsync(): Promise<unknown>;
}

export function isAsyncLoad(obj: unknown): obj is IAsyncLoad {
    return obj && typeof obj == "object" && "loadAsync" in obj && typeof obj["loadAsync"] == "function";
}