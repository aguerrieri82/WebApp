import { type TemplateMap, type BindExpression, type ITemplateContext, Behavoir } from "@eusoft/webapp-core";
import { Class, forModel } from "@eusoft/webapp-jsx";
import type { IEditorOptions, IItemsSource, ValueChangedReason } from "../abstraction";
import { Editor } from "./Editor";
import { EditorBuilder } from "./EditorBuilder";
import type { ViewNode } from "../types";
import { MaterialIcon } from "../components/Icon";
import "./AutoComplete.scss";
import { FloatingPanel } from "../components";

interface IAutoCompleteOptions<TItem, TValue, TFilter> extends IEditorOptions<TValue> {

    listItemView?: (item: TItem) => ViewNode;

    selectedItemView?: (item: TItem) => ViewNode;

    itemsSource: IItemsSource<TItem, TValue, TFilter>;

    prepareFilter?: (filter: TFilter, query: string) => TFilter;

    canSelect: (item: TItem) => boolean;

    sourceMode?: boolean;

    freeText: boolean;

    createItem?: (text: string) => TItem;
}

export const AutoCompleteTemplates: TemplateMap<AutoComplete<unknown, unknown, unknown>> = {

    "Default": forModel(m => <div className={m.className} visible={m.visible}>
        <Class name="has-selection" condition={m.selectedItem != null} />
        <div className="search-bar">
            <div className="edit-view">
                <input on-keydown={(_, ev) => m.onKeyDown(ev)} focus={m.hasFocus} type="text" value={m.searchText} value-pool={300} />
                {m.selectedItem && <div className="selected">{m.selectedItemView(m.selectedItem)}</div>}
            </div>
            <button className="clear-filters" on-click={() => m.clearSelection()}>
                <MaterialIcon name="clear" />
            </button>
        </div>

    </div>)
}

export interface IAnchorOptions {
    anchor: HTMLElement;
}

export class AutoComplete<TItem, TValue, TFilter> extends Editor<TValue, IAutoCompleteOptions<TItem, TValue, TFilter>> {


    protected _firstLoad = true;
    private _input: HTMLInputElement;
    protected _suggestions: FloatingPanel;

    constructor(options?: IAutoCompleteOptions<TItem, TValue, TFilter>) {

        super();

        this.init(AutoComplete, {
            template: AutoCompleteTemplates.Default,
            ...options
        });

        this.showSuggestions = false;

        this.onChanged("searchText", v => this.searchAsync(v));

        this.onChanged("hasFocus", v => this.onFocusChanged(v));

        this.onChanged("showSuggestions", v => this.onShowSuggestions(v));

        this._suggestions = new FloatingPanel({

            name: "suggestions",

            onClickOut: () => this.showSuggestions = false,

            body: forModel(this, m => <>
                {m.suggestions.forEach(i => <div on-click={() => m.selectItem(i, true)}>
                    {m.listItemView(i)}
                </div>)
                }
            </>)
        });
    }

    async searchAsync(query: string) {

        if (this._firstLoad)
            return;

        let items = await this.itemsSource.getItemsAsync(this.prepareFilter({} as TFilter, this.searchText));

        if (!this.sourceMode) {
            const parts = (this.searchText ?? "").toLowerCase().split(' ').map(a => a.trim()).filter(a => a.length > 0);
            items = items.filter(a => {
                const text = this.itemsSource.getText(a).toLowerCase();
                return parts.every(a => text.includes(a));
            })
        }

        this.suggestions = items;

        this.showSuggestions = true;
    }



    onKeyDown(ev: KeyboardEvent) {

        if (ev.key == "Tab" || ev.key == "Enter") {
            this.showSuggestions = false;
            document.body.focus();
        }   
    }

   
    override async onValueChanged(value: TValue, oldValue: TValue, reason: ValueChangedReason) {

        if (value === null || value === undefined)
            this.selectItem(null);
        else {
            const item = await this.itemsSource.getItemByValueAsync?.(value);
            if (this.freeText && typeof value == "string" && (item === null || item === undefined)) {
                const item = this.createItem(value);
                if (item)
                    this.selectItem(item);
            }
        }
    
    }

    protected onShowSuggestions(value: boolean) {

        console.log(value);

        if (value) 
            this._suggestions?.show();
        else
            this._suggestions?.close();

        if (!value) {
            if (this.freeText) {
                if (this.searchText?.length > 0) {
                    const item = this.createItem(this.searchText);
                    if (item)
                        this.selectItem(item);
                }
            }
            else
                this.searchText = "";
       
        }
            
    }

    protected onFocusChanged(value: boolean) {

        if (value) {
            this.showSuggestions = true;
            if (this._firstLoad) {
                this._firstLoad = false;
                this.searchAsync("");
            }
            this._input.select();
        }
    }

    override mount(ctx: ITemplateContext) {

        super.mount(ctx);

        this._input = ctx.element.querySelector("input");
        this._suggestions.anchor = this._input;
    }

    clearSelection() {
        this.searchText = "";
        this.value = null;
        this.selectedItem = null;

    }

    selectItem(item: TItem, hide: boolean = false) {

        this.value = item ? this.itemsSource.getValue(item) : (this.freeText ? this.searchText as TValue : undefined);

        if (item)
            this.searchText = this.itemsSource.getText(item);

        this.selectedItem = item;
        if (hide)
            setTimeout(() => this.showSuggestions = false, 50);
    }

    listItemView(item: TItem): ViewNode {
        if (!item)
            return;
        return <>
            {this.itemsSource.getIcon?.(item)}
            <span>{this.itemsSource.getText(item)}</span>
        </>;
    }

    selectedItemView(item: TItem): ViewNode {
        return this.listItemView(item);
    }

    prepareFilter(filter: TFilter, query: string) {
        return filter;
    }

    canSelect(item: TItem) {
        return true;
    }

    createItem(text: string) {
        return text as unknown as TItem;
    }    

    freeText: boolean;

    selectedItem: TItem;

    sourceMode: boolean;

    itemsSource: IItemsSource<TItem, TValue, TFilter>;

    hasFocus: boolean;

    searchText: string;

    suggestions: TItem[];

    showSuggestions: boolean;
}

declare module "./EditorBuilder" {
    interface EditorBuilder<TModel, TModelContainer> {
        autoComplete<TItem, TValue, TFilter>(value: BindExpression<TModel, TValue>, options?: IBuilderEditorOptions<TModel, TValue, IAutoCompleteOptions<TItem, TValue, TFilter>>);
    }
}

EditorBuilder.prototype.autoComplete = function (this: EditorBuilder<any, any>, value, options) {
    return this.editor(value, AutoComplete, options);
}

export default AutoComplete;