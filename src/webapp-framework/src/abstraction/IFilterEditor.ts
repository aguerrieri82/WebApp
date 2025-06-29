import { type IEditor, } from "@eusoft/webapp-ui";

export interface IFilterEditor<TFilter, TItem> extends IEditor<TFilter> {

    queryAsync?(filter: TFilter): Promise<TItem[]>;
}