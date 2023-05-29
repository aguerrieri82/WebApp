import { Content, IContentOptions } from "../Content";


export interface IItemListOptions<TItem, TFilter> extends IContentOptions {

}

export class ItemListContent<TItem, TFilter> extends Content<IItemListOptions<TItem, TFilter>, unknown> {

    constructor(options?: IItemListOptions<TItem, TFilter>) {

        super();

        this.init(ItemListContent, {
            ...options
        });
    }
}