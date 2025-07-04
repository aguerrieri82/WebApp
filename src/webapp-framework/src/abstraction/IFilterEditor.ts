import { type IEditor, } from "@eusoft/webapp-ui";

export interface IFilterEditor<TFilter, TItem> extends IEditor<TFilter> {

    queryAsync?(filter: TFilter): Promise<TItem[]>;

    loadFilterAsync(filter: TFilter): Promise<unknown>;

    saveFilter?(container: Record<string, unknown>): void;

    restoreFilter?(container: Record<string, unknown>): void;
}