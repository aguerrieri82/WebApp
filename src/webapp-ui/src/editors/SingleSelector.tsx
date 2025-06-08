import { type TemplateMap, type BindExpression, type ITemplateContext, INDEX, delayAsync } from "@eusoft/webapp-core";
import { Class, forModel } from "@eusoft/webapp-jsx";
import { EditorBuilder } from "./EditorBuilder";
import "./SingleSelector.scss";
import { type IItemsSource } from "../abstraction/IItemsSource";
import { type IAsyncLoad } from "../abstraction/IAsyncLoad";
import { CommitableEditor, type ICommitableEditorOptions } from "./CommitableEditor";

interface ISingleSelectorOptions<TItem, TValue> extends ICommitableEditorOptions<TValue, string> {

    emptyItem?: string;

    itemsSource: IItemsSource<TItem, TValue, unknown>;

}

function isEmpty(value: unknown) {

    return value == "@empty" || value === undefined || value === null;
}

export const SingleSelectorTemplates: TemplateMap<SingleSelector<unknown, unknown>> = {

    "Select": forModel(m => <select
        className={m.className}
        visible={m.visible}
        disabled={m.disabled}
        value={m.editValue}>
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
    </fieldset>
    )
}

export class SingleSelector<TItem, TValue> extends CommitableEditor<TValue, string, ISingleSelectorOptions<TItem, TValue>> implements IAsyncLoad {

    protected _lastValue: TValue;

    constructor(options?: ISingleSelectorOptions<TItem, TValue>) {

        super();

        this.init(SingleSelector, {
            template: SingleSelectorTemplates.Select,
            commitMode: "auto",
            ...options
        });

        this.onChanged("itemsSource", () => this.refreshAsync());

        this.onChanged("editValue", () => this.commitAsync());
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
            (this.content?.findIndex(a => this.itemsSource.getValue(a) == value) ?? "@empty");

        return index.toString();
    }

    async loadAsync() {

        await this.refreshAsync();
    }

    async refreshAsync() {

        const oldValue = this.value;

        this.content = this.itemsSource ? await this.itemsSource.getItemsAsync() : [];

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

    emptyItem?: string;

    itemsSource: IItemsSource<TItem, TValue, unknown>;

    content: TItem[];
}

declare module "./EditorBuilder" {
    interface EditorBuilder<TModel, TModelContainer> {
        singleSelector<TItem, TValue>(value: BindExpression<TModel, TValue>, options?: IBuilderEditorOptions<TModel, TValue, ISingleSelectorOptions<TItem, TValue>>);
    }
}

EditorBuilder.prototype.singleSelector = function (this: EditorBuilder<any, unknown>, value, options) {
    return this.editor(value, SingleSelector, options);
}

export default SingleSelector;