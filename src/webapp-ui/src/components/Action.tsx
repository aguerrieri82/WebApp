import { type Bindable, type IComponentOptions, Component, type TemplateMap, type ComponentStyle, configureBindings, registerComponent, cleanProxy } from "@eusoft/webapp-core";
import { Class, type JsxNode, forModel } from "@eusoft/webapp-jsx";
import { type ActionType, type IAction, type IActionContext } from "../abstraction/IAction";
import { type OperationManager } from "../services";
import { OPERATION_MANAGER } from "../abstraction";
import { type LocalString, type ViewNode } from "../types";
import { NodeView } from "./NodeView";
import { ContextMenu } from "./ContextMenu";
import { formatText } from "../utils";
import { Variable } from "../behavoirs/Variable";
import "./Action.scss";

interface IActionOptions<TTarget> extends IComponentOptions {

    content?: Bindable<JsxNode<string> | ViewNode>;

    info?: Bindable<LocalString>;

    type?: ActionType;

    color?: Bindable<string>;   

    target?: TTarget;

    canExecute?(ctx?: IActionContext<TTarget>): boolean;

    onExecuteAsync?(ctx?: IActionContext<TTarget>) : Promise<unknown> | void;

    enabled?: Bindable<boolean>;
}

export const ActionTemplates: TemplateMap<Action> = {

    "Button": forModel(m => <button
        type="button"
        visible={m.visible}
        className={m.className}
        title={formatText(m.info) as string}
        disabled={m.enabled === false}
        on-click={(_, ev) => m.executeAsync({ target: cleanProxy(m.target) }, ev)}>
        <Class name="executing" condition={m.isExecuting} />
        <Variable name="color" value={m.color} />
        <NodeView>{m.content}</NodeView>
    </button>)
}

export class Action<TTarget = unknown> extends Component<IActionOptions<TTarget>> {

    constructor(options?: IActionOptions<TTarget>) {

        super();

        this.init(Action, {
            template: ActionTemplates.Button,
            style: ["contained", "action"],
            ...options
        });
    }

    async executeAsync(ctx: IActionContext<TTarget>, ev: MouseEvent) {

        if (this.isExecuting)
            return;

        if (!this.canExecute(ctx))
            return;

        ev.stopPropagation();
        ev.stopImmediatePropagation();

        const operation = this.context.require<OperationManager>(OPERATION_MANAGER);

        const newOp = operation?.begin({
            name: "Executing " + this.name,
            isLocal: this.type == "local" 
        });

        try {
            this.isExecuting = true;

            await this.onExecuteAsync(ctx);

        }
        catch (ex) {
            console.error(ex);
        }
        finally {

            newOp?.end();

            this.isExecuting = false;
        }
    }

    canExecute(ctx?: IActionContext<TTarget>): boolean {
        return true;
    }

    onExecuteAsync(ctx?: IActionContext<TTarget>): Promise<unknown> | void {

    }

    color: string;  

    info: LocalString;

    target: TTarget;

    type: ActionType;

    content: ViewNode;

    enabled: boolean;

    isExecuting: boolean;

}

registerComponent(Action, "Action");

configureBindings(Action, {
    "onExecuteAsync": "action",
});

export function createAction(action: IAction, style?: ComponentStyle) {

    const mainAction: IActionOptions<unknown> = {
        content: style == "icon" ? action.icon : [action.icon, action.text], 
        info: action.text,
        name: action.name,
        onExecuteAsync: action.executeAsync,
        canExecute: action.canExecute,
        type: action.type,
        target: action.target,
        style
    }; 

    if (action.subActions?.length > 0) {

        mainAction.onExecuteAsync = async ctx => {
            const menu = new ContextMenu();
            menu.addActions(...action.subActions);
            menu.show();
        }
    }

    return new Action(mainAction);
}

export function filterActions<T>(actions: IAction<T>[], target?: T) {

    return actions?.filter(a => !a.canExecute || a.canExecute({ target }));
}