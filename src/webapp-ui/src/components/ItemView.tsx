import { cleanProxy, Component, type IComponentOptions, type TemplateMap } from "@eusoft/webapp-core";
import { forModel } from "@eusoft/webapp-jsx";
import { type ViewNode } from "../types";
import { type IAction } from "../abstraction";
import { MaterialIcon } from "./Icon";
import { createAction } from "./Action";
import { NodeView } from "./NodeView";
import "./ItemView.scss"

export interface IItemViewOptions<TItem> extends IComponentOptions {

    icon?: ViewNode;

    primary: ViewNode;

    secondary?: ViewNode;

    evidence?: ViewNode

    content: TItem;

    actions?: IAction<TItem>[];

    maxActions?: number;

    onClick?: (item: TItem) => unknown;
}

export const ItemViewTemplates: TemplateMap<ItemView<unknown>> = {

    Default: forModel(m => <li className={m.className} visible={m.visible}>
        <div className="main">
            {m.icon}
            <div className="body" on-click={() => m.onClick(m.content)}>
                <div className="primary"><NodeView>{m.primary}</NodeView></div>
                {m.secondary && <div className="secondary"><NodeView>{m.secondary}</NodeView></div>}
            </div>
            {m.evidence && <div className="evidence"><NodeView>{m.evidence}</NodeView></div>}
            <div className="secondary-actions">
                {m.secondaryActions?.forEach(a => m.createAction(a, "icon"))}
            </div>
        </div>
        {m.primaryActions?.length > 0 && <div className="primary-actions">
            {m.primaryActions?.forEach(a => m.createAction(a, "text"))}
        </div>}
    </li>)
}

export class ItemView<TItem> extends Component<IItemViewOptions<TItem>> {

    constructor(options?: IItemViewOptions<TItem>) {

        super();

        this.init(ItemView, {
            maxActions: 0,
            template: ItemViewTemplates.Default,
            ...options
        })
    }

    get primaryActions(): IAction<TItem>[]{

        return this.actions?.filter(a => a.priority == "primary");
    }

    get secondaryActions() : IAction<TItem>[] {

        const value = this.actions?.filter(a => a.priority == "secondary");
        if (value?.length > this.maxActions) {
            return [{
                name: "actions",
                icon: <MaterialIcon name="more_vert"/>,
                executeAsync: undefined,
                subActions: value, 
            }]
        }

        return value;
    }

    protected patchAction(action: IAction<TItem>) {

        action.target = this.content;

        if (action.subActions)
            action.subActions = action.subActions.map(a => this.patchAction(a));

        return action;
    }

     createAction(action: IAction<TItem>, style = "text") {
        if (action.canExecute && !action.canExecute({ target: this.content }))
            return null;
        return createAction(this.patchAction(action), style);
    }

    onClick(item: TItem) {

    }

    maxActions?: number;

    icon?: ViewNode;

    primary: ViewNode;

    secondary: ViewNode;

    evidence: ViewNode;

    content: TItem;

    actions: IAction<TItem>[];
}