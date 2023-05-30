import { TemplateMap, BindExpression, ITemplateContext, Bind } from "@eusoft/webapp-core";
import { Class, forModel } from "@eusoft/webapp-jsx";
import { IEditorOptions } from "../../abstraction/IEditor";
import { EditorBuilder } from "../EditorBuilder";
import { Editor } from "../Editor";
import "./index.scss";
import { IItemsSource } from "../../abstraction/IItemsSource";
import { IAsyncLoad } from "../../abstraction/IAsyncLoad";


interface ISingleSelectorOptions<TItem, TValue> extends IEditorOptions<TValue> {

    itemsSource: IItemsSource<TItem, TValue, unknown>;

}

export const SingleSelectorTemplates: TemplateMap<SingleSelector<unknown, unknown>> = {

    "Select": forModel(m => <select
        className={m.className}
        visible={m.visible}
        disabled={m.disabled}
        value={m.value as string}>
        {m.content?.forEach(i =>
            <option value={m.itemsSource.getValue(i) as string}>
                {m.itemsSource.getText(i)}
            </option>)}
        </select>
    ),

    "Options": forModel(m => <fieldset
        className={m.className}
        visible={m.visible}>
        <Class name="options"/> 
        {m.content?.forEach(i =>
            <label> 
                <input type="radio" name="selector" checked={m.value == m.itemsSource.getValue(i)}
                    on-change={Bind.action((_, ev) => (ev.currentTarget as HTMLInputElement).checked ? m.value = m.itemsSource.getValue(i) : undefined)} />
                <span>{m.itemsSource.getText(i)}</span>
            </label>
        )}
    </fieldset>
    )
}

export class SingleSelector<TItem, TValue> extends Editor<TValue, ISingleSelectorOptions<TItem, TValue>> implements IAsyncLoad {

    constructor(options?: ISingleSelectorOptions<TItem, TValue>) {

        super();

        this.init(SingleSelector, {
            template: SingleSelectorTemplates.Select,
            ...options
        });

        this.onChanged("itemsSource", () => this.refreshAsync());
    }

    async loadAsync() {

        await this.refreshAsync();
    }

    async refreshAsync() {

        const oldValue = this.value;

        this.content = this.itemsSource ? await this.itemsSource.getItemsAsync() : [];

        if (oldValue)
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
            this.value = (this.context.element as HTMLSelectElement).value as TValue;
    }


    itemsSource: IItemsSource<TItem, TValue, unknown>;

    content: TItem[];
}


declare module "../EditorBuilder" {
    interface EditorBuilder<TModel, TModelContainer> {
        singleSelector<TItem, TValue>(value: BindExpression<TModel, TValue>, options?: IBuilderEditorOptions<TModel, TValue, ISingleSelectorOptions<TItem, TValue>>);
    }
}

EditorBuilder.prototype.singleSelector = function (this: EditorBuilder<any, any>, value, options) {
    return this.editor(value, SingleSelector, options);
}

export default SingleSelector;