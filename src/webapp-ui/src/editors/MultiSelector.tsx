import { type TemplateMap, type BindExpression, type ITemplateContext, INDEX, delayAsync } from "@eusoft/webapp-core";
import { Class, forModel } from "@eusoft/webapp-jsx";
import { EditorBuilder } from "./EditorBuilder";
import { type IItemsSource } from "../abstraction/IItemsSource";
import { type IAsyncLoad } from "../abstraction/IAsyncLoad";
import { CommitableEditor, type ICommitableEditorOptions } from "./CommitableEditor";
import "./MultiSelector.scss";
import type { ViewNode } from "../types";
import type { IItemsContainer } from "../abstraction/IItemsContainer";
import { Attribute } from "../behavoirs/Attribute";

interface IMultiSelectorOptions<TItem, TValue, TFilter> extends ICommitableEditorOptions<TValue[], string> {

    emptyItem?: string;

    itemsSource: IItemsSource<TItem, TValue, TFilter>;

    applyFilter?: (currentFilter: Partial<TFilter>) => Partial<TFilter>;

    createItemView?(item: TItem): ViewNode;

    onSelectionChanged?(value: ISelectableItem<TItem>, editor: MultiSelector<TItem, TValue, TFilter>);

    canSelect?(value: TItem): boolean;

}

interface ISelectableItem<TItem> {
    isSelected: boolean;    
    item: TItem;    
}


export const MultiSelectorTemplates: TemplateMap<MultiSelector<unknown, unknown, unknown>> = {

    "List": forModel(m => <ul
        className={m.className}
        visible={m.visible}>
        <Class name="never-empty"/> 
        <Class name="disabled" condition={m.disabled}/>
        {m.content?.forEach(i => 
            <li>
                <Class name="selected" condition={i.isSelected} />                
                <input type="checkbox"
                    disabled={m.canSelect(i.item) === false}
                    value={i.isSelected}
                    on-change={(_, ev) => {
                        m.onSelectionChanged(i, m);
                    }}>
                </input>
                {m.createItemView(i.item)}
            </li>
        )}
        </ul>
    )
}

export class MultiSelector<TItem, TValue, TFilter extends ObjectLike|unknown>
    extends CommitableEditor<TValue[], void, IMultiSelectorOptions<TItem, TValue, TFilter>>
    implements IAsyncLoad, IItemsContainer<TItem, TValue, TFilter> {

    constructor(options?: IMultiSelectorOptions<TItem, TValue, TFilter>) {

        super();

        this.init(MultiSelector, {
            template: MultiSelectorTemplates.List,
            commitMode: "auto",
            ...options
        });

        this.onChanged("itemsSource", () => this.refreshAsync());
    }

    protected override editToValue(value: void, clone?: boolean): TValue[] {

        const selected = this.content
            ?.filter(a => a.isSelected)
            ?.map(a => this.itemsSource.getValue(a.item));
        return selected;
    }

    protected override valueToEdit(value: TValue[], clone?: boolean): void {

        if (!this.content)
            return;

        for (const selectable of this.content) {

            const curValue = this.itemsSource.getValue(selectable.item);

            selectable.isSelected = value != null && value.includes(curValue);
        }
    }

    createItemView?(item: TItem): ViewNode {

        return this.itemsSource.getText(item);
    }

    async loadAsync() {

        await this.refreshAsync(); 
    }

    async refreshAsync() {

        const oldValue = this.editToValue();

        const items = this.itemsSource ? await this.itemsSource.getItemsAsync(this.applyFilter({} as TFilter)) : [];

        this.content = items.map(item => {
            const isSelected = oldValue?.includes(this.itemsSource.getValue(item)) ?? false;
            return { item, isSelected } as ISelectableItem<TItem>;
        });
    }

    applyFilter(currentFilter: TFilter): TFilter {
        return currentFilter;
    }

    onSelectionChanged(value: ISelectableItem<TItem>, editor?: MultiSelector<TItem, TValue, TFilter>) {

    }

    canSelect(value: TItem): boolean {
        return true;
    }

    itemsSource: IItemsSource<TItem, TValue, unknown>;

    content: ISelectableItem<TItem>[];
}

declare module "./EditorBuilder" {
    interface EditorBuilder<TModel, TModelContainer> {
        multiSelector<TItem, TValue, TFilter>(value: BindExpression<TModel, TValue[]>, options?: IBuilderEditorOptions<TModel, TValue[], IMultiSelectorOptions<TItem, TValue, TFilter>>);
    }
}

EditorBuilder.prototype.multiSelector = function (this: EditorBuilder<any, unknown>, value, options) {
    return this.editor(value, MultiSelector, options);
}

export default MultiSelector;