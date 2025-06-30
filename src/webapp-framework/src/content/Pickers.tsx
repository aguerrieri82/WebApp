import { Bind, cleanProxy, type ComponentStyle } from "@eusoft/webapp-core";
import { type LocalString, type IItemsSource, CheckBox } from "@eusoft/webapp-ui";
import type { IFilterEditor } from "../abstraction/IFilterEditor";
import { TextFilterEditor } from "../components/TextFilterEditor";
import { ItemListContent } from "./ItemListContent";
import type { ISelectableItem } from "@eusoft/webapp-ui/abstraction/ISelectableItem";
import "./Pickers.scss"
import { forModel } from "@eusoft/webapp-jsx/Helpers";

interface IPickerOptions<TItem, TValue, TFilter> {

    title: LocalString;

    style?: ComponentStyle;

    itemsSource: IItemsSource<TItem, TValue, TFilter>;

    pageSize?: number;

    prepareFilter?: (filter: TFilter, offset: number, limit: number) => TFilter;

    queryField?: KeyOfType<TFilter, string>;
}

interface IPickSingleItemOptions<TItem, TValue, TFilter> extends IPickerOptions<TItem, TValue, TFilter> {

}
interface IPickMultipleItemsOptions<TItem, TValue, TFilter> extends IPickerOptions<TItem, TValue, TFilter> {

    validate?: (items: TItem[]) => boolean;

    showSelectAll?: boolean;
}
export function pickSingleItemContent<TItem, TValue, TFilter>(options: IPickSingleItemOptions<TItem, TValue, TFilter>) {

    let filterEditor: () => IFilterEditor<TFilter, TItem>;

    if (options.queryField) {
        filterEditor = () => new TextFilterEditor<TFilter>({
            queryField: options.queryField,
        });
    }

    const content = ItemListContent.builder<TItem, TFilter>()

        .info({
            name: "single-item-picker",
        })

        .options(() => ({

            title: options.title,

            style: [options.style, "picker"],

            canOpen: true,

            canAdd: false,

            canEdit: false,

            canDelete: false,

            filterEditor,

            createItemView: (item, actions, open) => <div className="simple-item" on-click={() => open(item)}>
                {options.itemsSource.getText(item)}
            </div>,

            openItem: item => {
                content.host?.closeAsync(cleanProxy(item));
            },

            itemsSource: options.itemsSource,

            prepareFilter: options.prepareFilter,

            pageSize: options.pageSize,

            columns: [{
                value: a => options.itemsSource.getText(a),
                priority: "primary",
                header: "name",
            }],
        }))
        .createInstance();

    return content as typeof content & { result: TItem };
}

export function pickMultipleItemsContent<TItem, TValue, TFilter>(options: IPickMultipleItemsOptions<TItem, TValue, TFilter>) {

    let filterEditor: () => IFilterEditor<TFilter, ISelectableItem<TItem>>;

    if (options.queryField) {
        filterEditor = () => new TextFilterEditor<TFilter>({
            queryField: options.queryField,
        });
    }

    const content = ItemListContent.builder<ISelectableItem<TItem>, TFilter>()

        .info({
            name: "multiple-items-picker",
        })

        .options(() => ({

            title: options.title,

            style: [options.style, "picker"],

            canOpen: true,

            canAdd: false,

            canEdit: false,

            canDelete: false,

            filterEditor,

            actions: [{
                name: "select",
                text: "select", 
                executeAsync: async () => {
                    const selected = content.items.filter(a => a.isSelected).map(a=> a.item);

                    if (options.validate && !options.validate(selected))
                        return false;

                    content.host?.closeAsync(selected);
                    return true;
                }
            }],

            createItemView: (sel, actions, open) => forModel(sel, m => <div className="simple-item">
                <CheckBox value={Bind.twoWays(m.isSelected)}>
                    {options.itemsSource.getText(m.item)}
                </CheckBox>
            </div>),

            itemsSource: {
                getText: v => options.itemsSource.getText(v.item),
                getValue: v => options.itemsSource.getValue(v.item),
                getItemsAsync: async (filter: TFilter) => {
                    const res = await options.itemsSource.getItemsAsync(filter);
                    const items = [] as ISelectableItem<TItem>[];

                    items.push(...res.map(a => ({
                        item: a,
                        isSelected: false
                    })));

                    return items;
                }
            },

            prepareFilter: options.prepareFilter,

            pageSize: options.pageSize,

            columns: [{
                value: a => options.itemsSource.getText(a.item),
                priority: "primary",
                header: "name",
            }],
        }))
        .createInstance();

    return content as typeof content & { result: TItem[] };
}