import type { IItemsSource } from "./IItemsSource";

export interface IItemsContainer<TItem = unknown, TValue = unknown, TFilter = unknown>  {

    itemsSource: IItemsSource<TItem, TValue, TFilter>;  

    refreshAsync() : Promise<void>;  
}
