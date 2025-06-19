import { type TemplateMap, type BindExpression, type ITemplateContext, INDEX, delayAsync } from "@eusoft/webapp-core";
import { Class, forModel } from "@eusoft/webapp-jsx";
import { EditorBuilder } from "./EditorBuilder";
import { type IItemsSource } from "../abstraction/IItemsSource";
import { type IAsyncLoad } from "../abstraction/IAsyncLoad";
import { CommitableEditor, type ICommitableEditorOptions } from "./CommitableEditor";
import "./MultiSelector.scss";
import type { ViewNode } from "../Types";

interface IMultiSelectorOptions<TItem, TValue> extends ICommitableEditorOptions<TValue[], string> {

    emptyItem?: string;

    itemsSource: IItemsSource<TItem, TValue, unknown>;

    createItemView?(item: TItem) : ViewNode;
}

interface ISelectableItem<TItem> {
    isSelected: boolean;    
    item: TItem;    
}


export const MultiSelectorTemplates: TemplateMap<MultiSelector<unknown, unknown>> = {

    "List": forModel(m => <ul
        className={m.className}
        visible={m.visible}>
        <Class name="disabled" condition={m.disabled}/>
        {m.content?.forEach(i => 
            <li>
                <Class name="selected" condition={i.isSelected} />
                <input type="checkbox" checked={i.isSelected} on-change={(_, ev) => i.isSelected = ev.target.checked} />
                {m.itemsSource.getText(i)}
            </li>
        )}
        </ul>
    )
}

export class MultiSelector<TItem, TValue> extends CommitableEditor<TValue[], string, IMultiSelectorOptions<TItem, TValue>> implements IAsyncLoad {

    constructor(options?: IMultiSelectorOptions<TItem, TValue>) {

        super();

        this.init(MultiSelector, {
            template: MultiSelectorTemplates.List,
            commitMode: "auto",
            ...options
        });
    }

    protected override editToValue(value: string, clone?: boolean): TValue[] {


    }

    protected override valueToEdit(value: TValue[], clone?: boolean): string {

    }

    async loadAsync() {

        await this.refreshAsync();
    }

    async refreshAsync() {

        const oldValue = this.value;

        const items = this.itemsSource ? await this.itemsSource.getItemsAsync() : [];

        this.content = items.map(item => {
            const isSelected = oldValue?.includes(this.itemsSource.getValue(item)) ?? false;
            return { item, isSelected } as ISelectableItem<TItem>;
        });
    }


    itemsSource: IItemsSource<TItem, TValue, unknown>;

    content: ISelectableItem<TItem>[];
}

declare module "./EditorBuilder" {
    interface EditorBuilder<TModel, TModelContainer> {
        multiSelector<TItem, TValue>(value: BindExpression<TModel, TValue[]>, options?: IBuilderEditorOptions<TModel, TValue[], IMultiSelectorOptions<TItem, TValue>>);
    }
}

EditorBuilder.prototype.multiSelector = function (this: EditorBuilder<any, unknown>, value, options) {
    return this.editor(value, MultiSelector, options);
}

export default MultiSelector;