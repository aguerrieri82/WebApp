import type { LoadResult } from "../types";
import type { IContent } from "./IContent";

export interface IFeature<TContent extends IContent<TArgs>, TArgs extends ObjectLike = ObjectLike> {

    (component: TContent, args?: TArgs): Promise<LoadResult>;
}