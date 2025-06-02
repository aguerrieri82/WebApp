export interface IResultContainer<TResult = unknown> {

    result: TResult;
}

export function isResultContainer(obj: unknown): obj is IResultContainer {
    return obj && typeof obj == "object" && "result" in obj;
}