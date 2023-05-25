import { Bindable, IComponentOptions, IComponent, Component, ITemplateProvider, TemplateMap } from "@eusoft/webapp-core";
import { Class, JsxNode, Template, forModel } from "@eusoft/webapp-jsx";
import { Ripple } from "../../behavoirs/Ripple";
import { IActionContext } from "../../abstraction/IAction";
import { OperationManager } from "../../services";
import { OPERATION_MANAGER } from "../../abstraction";
import { ViewNode } from "../../Types";
import "./index.scss";

interface IActionOptions<TTarget> extends IComponentOptions {

    content?: Bindable<JsxNode<string> | IComponent>;

    executeAsync?: (ctx?: IActionContext<TTarget>) => Promise<void> | void;
}


export const ActionTemplates: TemplateMap<Action> = {

    "Button": forModel(m => <Template name="Action">
        <button visible={m.visible} behavoir={Ripple} className={m.className} on-click={m => m.doExecuteAsync()}>
            <Class name="executing" condition={m.isExecuting} />
            {m.content}
        </button>
    </Template>)
}

export class Action<TTarget = unknown> extends Component<IActionOptions<TTarget>> {

    constructor(options?: IActionOptions<TTarget>) {

        super();

        this.init(Action, {
            template: ActionTemplates.Button,
            ...options 
        });
    }

    protected updateOptions() {

        this.bindOptions("content", "executeAsync");
    }

    async doExecuteAsync(ctx?: IActionContext<TTarget>) {

        if (this.isExecuting)
            return;

        const operation = this.context.require<OperationManager>(OPERATION_MANAGER);

        const newOp = operation?.begin({
            name: "Executing " + this.name,
        });

        try {
            this.isExecuting = true;

            await this.executeAsync(ctx);

        }
        finally {

            newOp?.end();

            this.isExecuting = false;
        }
    }


    executeAsync: (ctx?: IActionContext<TTarget>) => Promise<void> | void;

    isExecuting: boolean;

    content: ViewNode;
}