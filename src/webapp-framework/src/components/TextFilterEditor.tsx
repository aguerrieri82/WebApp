import { Component } from "@eusoft/webapp-core/Component";
import { forModel } from "@eusoft/webapp-jsx/Helpers";
import {  MaterialIcon,  type IEditorOptions,  type ValueChangedReason } from "@eusoft/webapp-ui";
import type { IFilterEditor } from "../abstraction/IFilterEditor";
import "./TextFilterEditor.scss"


export interface ITextFilterEditorOptions<TFilter> extends IEditorOptions<TFilter> {

    queryField: KeyOfType<TFilter, string>;
}

export class TextFilterEditor<TFilter>
    extends Component<ITextFilterEditorOptions<TFilter>>
    implements IFilterEditor<TFilter, unknown> {


    constructor(options: ITextFilterEditorOptions<TFilter>) {

        super();

        this.init(TextFilterEditor, {
            ...options,
            template: forModel<this>(m => <div className={m.className} visible={m.visible}>
                <div className="search-bar">
                    <input focus={m.hasFocus} type="text" value={m.searchText} value-pool={500} />
                    <button className="clear-filters" on-click={() => m.searchText = ""}>
                        <MaterialIcon name="clear" />
                    </button>
                </div>
            </div>)
        });

        this.onChanged("searchText", v => this.searchAsync(v));

        this.onChanged("value", (v, o) => this.onValueChanged(v, o, "edit"));

        this.onChanged("hasFocus", v => this.onFocusChanged(v));

    }

    async searchAsync(query: string) {

        const curFilter = {} as TFilter;
        curFilter[this.queryField as any] = this.searchText;
        this.value = this.prepareFilter(curFilter);
    }
     
    protected onFocusChanged(value: boolean) {

    }


    onValueChanged(value: TFilter, oldValue: TFilter, reason: ValueChangedReason) {

    }

    prepareFilter?(curFilter: TFilter) {

        return curFilter;
    }

    disabled: boolean;

    value: TFilter;

    hasFocus: boolean;

    searchText: string = "";

    queryField: KeyOfType<TFilter, string>;
}