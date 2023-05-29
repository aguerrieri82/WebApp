import { TemplateMap, BindExpression, ITemplateContext } from "@eusoft/webapp-core";
import { forModel } from "@eusoft/webapp-jsx";
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

        this.content = this.itemsSource ? await this.itemsSource.getItemsAsync() : [];
    }

    override mount(ctx: ITemplateContext) {

        setTimeout(() => {
            this.value = (ctx.element as HTMLSelectElement).value as TValue;
        }, 0);

        super.mount(ctx);
    }

    protected override updateOptions() {

        this.bindOptions("itemsSource");
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