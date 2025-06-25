import { Bind, Component, INDEX, type IComponentOptions, type TemplateMap } from "@eusoft/webapp-core";
import { forModel } from "@eusoft/webapp-jsx";
import { type ViewNode } from "../types";
import "./ListView.scss"

export interface IListViewOptions<TItem> extends IComponentOptions {

    content: TItem[];

    createItemView: (item: TItem, index?: number) => ViewNode;
}

export const ListViewTemplates: TemplateMap<ListView<unknown>> = {

    Default: forModel(m => <ol className={m.className} visible={m.visible}>
        {m.content?.forEach(i => m.createItemView(i, Bind.index(i)))}
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

    scrollToLast() {

        const list = this.context?.element;
        if (list)
            list.scrollTop = list.scrollHeight - list.clientHeight;
    }

    createItemView: (item: TItem, index?: number) => ViewNode;

    content: TItem[];
}