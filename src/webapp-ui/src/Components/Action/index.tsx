import { Bindable, IComponentOptions, IComponent, Component, TemplateMap } from "@eusoft/webapp-core";
import { Class, JsxNode, Template, forModel } from "@eusoft/webapp-jsx";
import { Ripple } from "../../behavoirs/Ripple";
import { ActionType, IActionContext } from "../../abstraction/IAction";
import { OperationManager } from "../../services";
import { OPERATION_MANAGER } from "../../abstraction";
import { ViewNode } from "../../Types";
import "./index.scss";
import { NodeView } from "../NodeView";

interface IActionOptions<TTarget> extends IComponentOptions {

    content?: Bindable<JsxNode<string> | IComponent>;

    type?: ActionType;

    onExecuteAsync?: (ctx?: IActionContext<TTarget>) => Promise<void> | void;
}


export const ActionTemplates: TemplateMap<Action> = {

    "Button": forModel(m => <Template name="Action">
        <button visible={m.visible} behavoir={Ripple} className={m.className} on-click={m => m.executeAsync()}>
            <Class name="executing" condition={m.isExecuting} />
            <NodeView>{m.content}</NodeView>
        </button>
    </Template>)
}

export class Action<TTarget = unknown> extends Component<IActionOptions<TTarget>> {

    constructor(options?: IActionOptions<TTarget>) {

        super();

        this.init(Action, {
            template: ActionTemplates.Button,
            style: ["contained"],
            ...options 
        });
    }

    async executeAsync(ctx?: IActionContext<TTarget>) {

        if (this.isExecuting)
            return;

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


    onExecuteAsync(ctx?: IActionContext<TTarget>) : Promise<void> | void {

    }

    type: ActionType;

    isExecuting: boolean;

    content: ViewNode;
}