import { Component, IComponentOptions, TemplateMap } from "@eusoft/webapp-core";
import { forModel } from "@eusoft/webapp-jsx";
import { ViewNode } from "../../Types";
import "./index.scss"

export interface IListViewOptions<TItem> extends IComponentOptions {

    content: TItem[];

    createItemView: (item: TItem) => ViewNode;
}

export const ListViewTemplates: TemplateMap<ListView<unknown>> = {

    Default: forModel(m => <ol className={m.className} visible={m.visible}>
        {m.content?.forEach(i => <li>
            {m.createItemView(i)}
        </li>)}
    </ol>)
}

export class ListView<TItem> extends Component<IListViewOptions<TItem>> {

    constructor(options?: IListViewOptions<TItem>) {

        super();

        this.init(ListView, {
            template: ListViewTemplates.Default,
            ...options
        })
    }


    protected override updateOptions() {

        this.bindOptions("createItemView", "content");
    }

    createItemView: (item: TItem) => ViewNode;

    content: TItem[];
}