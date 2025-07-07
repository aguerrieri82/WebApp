import { type TemplateMap, type BindExpression, type ITemplateContext, INDEX, delayAsync } from "@eusoft/webapp-core";
import { Class, forModel } from "@eusoft/webapp-jsx";
import { EditorBuilder } from "./EditorBuilder";
import "./SingleSelector.scss";
import { type IItemsSource } from "../abstraction/IItemsSource";
import { type IAsyncLoad } from "../abstraction/IAsyncLoad";
import { CommitableEditor, type ICommitableEditorOptions } from "./CommitableEditor";
import { notEmpty } from "../utils";
import type { IItemsContainer } from "../abstraction/IItemsContainer";

interface ISingleSelectorOptions<TItem, TValue, TFilter extends ObjectLike|unknown> extends ICommitableEditorOptions<TValue, string> {

    emptyItem?: string;

    itemsSource: IItemsSource<TItem, TValue, TFilter>;

    valuesEquals?: (a: TValue, b: TValue) => boolean;

    applyFilter?: (currentFilter: Partial<TFilter>) => Partial<TFilter>;
}

function isEmpty(value: unknown) {

    return value == "@empty" || value === undefined || value === null;
}

export const SingleSelectorTemplates: TemplateMap<SingleSelector<unknown, unknown, unknown>> = {

    "Select": forModel(m => <select
        className={m.className}
        visible={m.visible}
        disabled={m.disabled}
        value={m.editValue}>
        <Class name="never-empty" condition={notEmpty(m.emptyItem)}/>
        {m.emptyItem && <option value="@empty">
            {m.emptyItem}
        </option>}
        {m.content?.forEach(i => 
            <option value={i[INDEX].toString()}>
                {m.itemsSource.getText(i)}
            </option>)}
        </select>
    ),

    "Options": forModel(m => <fieldset
        className={m.className}
        visible={m.visible}>
        <Class name="options" /> 
        <Class name="no-box" /> 
        {m.content?.forEach(i =>
            <label> 
                <input type="radio" name={m.name} value={m.value == m.itemsSource.getValue(i)}
                    on-change={(_, ev) => (ev.currentTarget as HTMLInputElement).checked ? m.value = m.itemsSource.getValue(i) : undefined} />
                <span>{m.itemsSource.getText(i)}</span>
            </label>
        )}
    </fieldset>),
    
    "Buttons": forModel(m => <div
        className={m.className}
        visible={m.visible}>
        <Class name="disabled" condition={m.disabled} />
        <Class name="buttons" />
        <Class name="no-box" />
        {m.content?.forEach(i =>
            <button on-click={() => m.selectItem(i)}>
                <Class name="selected" condition={m.itemsSource.getValue(i) == m.value} />
                {m.itemsSource.getIcon(i)}
                <span>{m.itemsSource.getText(i)}</span>
            </button>
        )}
    </div>)
}

export class SingleSelector<
        TItem,
        TValue,
    TFilter extends ObjectLike | unknown>

    extends CommitableEditor<TValue, string, ISingleSelectorOptions<TItem, TValue, TFilter>>
    implements IAsyncLoad,
               IItemsContainer<TItem, TValue, TFilter> {

    protected _lastValue: TValue;

    constructor(options?: ISingleSelectorOptions<TItem, TValue, TFilter>) {

        super();

        this.init(SingleSelector, {
            template: SingleSelectorTemplates.Select,
            commitMode: "auto",
            ...options
        });

        this.onChanged("itemsSource", () => this.refreshAsync());

        this.onChanged("editValue", () => this.commitAsync());
    }

    valuesEquals(a: TValue, b: TValue) {

        return a == b;
    }

    protected override editToValue(value: string, clone?: boolean): TValue {

        if (value == "@empty" || !this.content) {
            if (this._lastValue !== undefined)
                return this._lastValue;
            return null;
        }
        const item = this.content[parseInt(value)];
        if (item === null || item === undefined)
            return null
        return this.itemsSource.getValue(item);
    }

    protected override valueToEdit(value: TValue, clone?: boolean): string {

        this._lastValue = this.content ? undefined : value;

        const index = (value === null || value === undefined) ?
            "@empty" :
            (this.content?.findIndex(a => this.valuesEquals(this.itemsSource.getValue(a), value)) ?? "@empty");

        return index.toString();
    }

    async loadAsync() {

        await this.refreshAsync();
    }

    async refreshAsync() {

        const oldValue = this.value;

        this.content = this.itemsSource ? await this.itemsSource.getItemsAsync(this.applyFilter({} as TFilter)) : [];

        await delayAsync(0);

        if (this._lastValue !== undefined) {
            this.editValue = this.valueToEdit(this._lastValue);
        }
        else if (oldValue !== null && oldValue !== undefined)
            this.value = oldValue;
        else
            this.getSelectedValue();
    }

    override mount(ctx: ITemplateContext) {

        super.mount(ctx);

        this.getSelectedValue();
    }

    protected getSelectedValue() {

        if (this.context?.element?.tagName == "SELECT")
            this.editValue = (this.context.element as HTMLSelectElement).value;        
    }

    selectItem(item: TItem) {
        this.value = this.itemsSource.getValue(item);
    }

    isItemSelected(item: TItem) {
        return this.itemsSource.getValue(item) == this.value;
    }

    applyFilter(currentFilter: TFilter): TFilter {
        return currentFilter;
    }

    emptyItem?: string;

    itemsSource: IItemsSource<TItem, TValue, TFilter>;

    content: TItem[];
}

declare module "./EditorBuilder" {
    interface EditorBuilder<TModel, TModelContainer> {
        singleSelector<TItem, TValue, TFilter>(value: BindExpression<TModel, TValue>, options?: IBuilderEditorOptions<TModel, TValue, ISingleSelectorOptions<TItem, TValue, TFilter>>);
    }
}

EditorBuilder.prototype.singleSelector = function (this: EditorBuilder<any, unknown>, value, options) {
    return this.editor(value, SingleSelector, options);
}

export default SingleSelector;