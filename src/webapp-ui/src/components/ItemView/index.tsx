import { Bind, Component, IComponentOptions, TemplateMap } from "@eusoft/webapp-core";
import { forModel } from "@eusoft/webapp-jsx";
import { ViewNode } from "../../Types";
import { IAction } from "../../abstraction";
import { MaterialIcon } from "../Icon";
import { Action, createAction } from "../Action";
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

    Default: forModel(m => <div className={m.className} visible={m.visible}>
        <div className="main">
            <i>{m.icon}</i>
            <div className="body">
                <div className="primary"><NodeView>{m.primary}</NodeView></div>
                {m.secondary && <div className="secondary"><NodeView>{m.secondary}</NodeView></div>}
            </div>
            <div className="secondary-actions">
                {m.secondaryActions.forEach(a => createAction(a, "text"))}
            </div>
        </div>
        <div className="primary-actions">
            {m.primaryActions.forEach(a => createAction(a, "text"))}
        </div>
    </div>)
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

    maxActions?: number;

    icon?: ViewNode;

    primary: ViewNode;

    secondary: ViewNode;

    content: TItem;

    actions: IAction<TItem>[];

}