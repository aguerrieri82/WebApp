import { type IResultContainer } from "./IResultContainer";

export interface IContentHost extends IResultContainer {

    closeAsync(result?: unknown): Promise<void>;

    readonly canGoBack: boolean;
}