import { Component, IComponentOptions, TemplateMap } from "@eusoft/webapp-core";
import { forModel } from "@eusoft/webapp-jsx";
import { ViewNode } from "../../Types";
import { IAction } from "../../abstraction";
import { MaterialIcon } from "../Icon";
import { createAction } from "../Action";
import { NodeView } from "../NodeView";
import "./index.scss"

export interface IItemViewOptions<TItem> extends IComponentOptions {

    icon?: ViewNode;

    primary: ViewNode;

    secondary?: ViewNode;

    content: TItem;

    actions?: IAction<TItem>[];

    maxActions?: number;
}


export const ItemViewTemplates: TemplateMap<ItemView<unknown>> = {

    Default: forModel(m => <li className={m.className} visible={m.visible}>
        <div className="main">
            {m.icon && <i>{m.icon}</i>}
            <div className="body">
                <div className="primary"><NodeView>{m.primary}</NodeView></div>
                {m.secondary && <div className="secondary"><NodeView>{m.secondary}</NodeView></div>}
            </div>
            <div className="secondary-actions">
                {m.secondaryActions.forEach(a => m.createAction(a, "text"))}
            </div>
        </div>
        {m.primaryActions.length > 0 && <div className="primary-actions">
            {m.primaryActions.forEach(a => m.createAction(a, "text"))}
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

    get primaryActions(): IAction[]{

        return this.actions?.filter(a => a.priority == "primary");
    }

    get secondaryActions() : IAction[] {

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

    protected patchAction(action: IAction): IAction {
        const newAction = {
            ...action,
            executeAsync: () =>
                action.executeAsync({ target: this.content })
        }

        if (newAction.subActions)
            newAction.subActions = action.subActions.map(a => this.patchAction(a));

        return newAction;
    }

    createAction(action: IAction, style = "text") {

        return createAction(this.patchAction(action), style);
    }

    maxActions?: number;

    icon?: ViewNode;

    primary: ViewNode;

    secondary: ViewNode;

    content: TItem;

    actions: IAction<TItem>[];

}