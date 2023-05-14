import { Bindable, IComponentOptions, IComponent, Component, ITemplateProvider, TemplateMap } from "@eusoft/webapp-core";
import { JsxNode, Template, forModel } from "@eusoft/webapp-jsx";
import "./index.scss";
import { Ripple } from "../../behavoirs/Ripple";

interface IActionOptions extends IComponentOptions {

    content?: Bindable<JsxNode<string> | IComponent>;

    executeAsync?: () => Promise<void> | void;
}

export const ActionTemplates: TemplateMap<Action> = {

    "Button": forModel(m => <Template name="Action">
        <button behavoir={Ripple} className={m.className} on-click={a => a.executeAsync()}>
            {m.content}
        </button>
    </Template>)
}
export class Action extends Component<IActionOptions> {

    constructor(options?: IActionOptions) {

        super();

        this.configure({
            ...options,
            template: ActionTemplates.Button
        });
    }

    protected updateOptions() {

        this.bindOptions("content", "executeAsync");
    }

    async executeAsync() {

    }

    content: string | ITemplateProvider;
}