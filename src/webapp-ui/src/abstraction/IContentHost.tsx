import { IResultContainer } from "./IResultContainer";

export interface IContentHost extends IResultContainer {

    closeAsync(result?: unknown): Promise<void>;
}