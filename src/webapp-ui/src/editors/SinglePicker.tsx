import { type TemplateMap, type BindExpression, type ComponentStyle } from "@eusoft/webapp-core";
import { Class, forModel } from "@eusoft/webapp-jsx";
import { EditorBuilder } from "./EditorBuilder";
import { type IItemsSource } from "../abstraction/IItemsSource";
import { type IAsyncLoad } from "../abstraction/IAsyncLoad";
import { CommitableEditor, type ICommitableEditorOptions } from "./CommitableEditor";
import { Action, type Content, type IPopUpAction, MaterialIcon, Popup } from "../components";
import { type LocalString, type ViewNode } from "../types";
import { formatText } from "../utils/Format";
import "./SinglePicker.scss";

interface ISinglePickerOptions<TItem, TValue> extends ICommitableEditorOptions<TValue, TValue> {

    itemsSource: IItemsSource<TItem, TValue, unknown>;

    pickItemAsync: () => Promise<TItem>;

}

interface IPickItemOptions<T> {
    itemsSource: IItemsSource<unknown, T, unknown>;
    value?: T;
    title?: LocalString;
    cancelLabel?: LocalString;
    canCancel?: boolean;
    style?: ComponentStyle;
    header?: ViewNode;
}

export async function pickItemAsync<T>(options: IPickItemOptions<T>) : Promise<T> {

    const items = await options.itemsSource.getItemsAsync();

    let value = options.value;

    const actions: IPopUpAction[] = [];
    if (options.canCancel !== false)
        actions.push({
            name: "cancel",
            text: "cancel",
            executeAsync: async () => true
        })

    const popup = new Popup({
        title: formatText(options.title ?? "select"),
        style: options.style,
        name: "picker",
        actions: actions,
        body: <>
            {options.header}
            {items.forEach(a => <div on-click={() => {
                value = options.itemsSource.getValue(a);
                popup.close();
            }}>
                <Class name="selected" condition={options.itemsSource.getValue(a) == value} />
                <MaterialIcon name="check" />
                {options.itemsSource.getIcon?.(a)}
                <span>{options.itemsSource.getText(a)}</span>
            </div>)}
        </>
    });

    const res = await popup.showAsync();
    if (res == "cancel")
        return;

    return value;
}

export const SinglePickerTemplates: TemplateMap<SinglePicker<unknown, unknown>> = {

    "Default": forModel(m => <div
        className={m.className}
        visible={m.visible}>
        <Class name="disabled" condition={m.disabled}/>
        <div className="content-box">
            <div className="content">{m.displayValue}</div>
            <Action name="clear" onExecuteAsync={() => m.clearValue()}><MaterialIcon name="delete" /> </Action>
        </div>
        <Action name="pick" onExecuteAsync={() => m.pickItemAsync()}><MaterialIcon name="menu" /> </Action>
    </div>
    )
}

export class SinglePicker<TItem, TValue> extends CommitableEditor<TValue, TValue, ISinglePickerOptions<TItem, TValue>> implements IAsyncLoad {

    protected _lastValue: TValue;

    constructor(options?: ISinglePickerOptions<TItem, TValue>) {

        super();

        this.init(SinglePicker, {
            template: SinglePickerTemplates.Default,
            commitMode: "auto",
            ...options
        });

        this.onChanged("itemsSource", () => this.loadValueAsync());

        this.onChanged("editValue", () => this.commitAsync());
    }

    protected async loadValueAsync() {
        if (this.editValue === null || this.editValue === undefined)
            this.displayValue = "";
        else {
            const item = await this.itemsSource.getItemByValueAsync(this.editValue);
            this.displayValue = this.itemsSource.getText(item);
        }
    }

    async loadAsync() {

    }

    clearValue() {

    }

    pickItemAsync() {

    }

    itemSelectContent: Content;

    displayValue?: ViewNode;

    itemsSource: IItemsSource<TItem, TValue, unknown>;
}

declare module "./EditorBuilder" {
    interface EditorBuilder<TModel, TModelContainer> {
        singlePicker<TItem, TValue>(value: BindExpression<TModel, TValue>, options?: IBuilderEditorOptions<TModel, TValue, ISinglePickerOptions<TItem, TValue>>);
    }
}

EditorBuilder.prototype.singlePicker = function (this: EditorBuilder<any, any>, value, options) {
    return this.editor(value, SinglePicker, options);
}