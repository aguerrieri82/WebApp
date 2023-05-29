export interface IResultContainer<TResult = unknown> {

    result: TResult;
}

export function isResultContainer(obj: any): obj is IResultContainer {
    return obj && typeof obj == "object" && "result" in obj;
}