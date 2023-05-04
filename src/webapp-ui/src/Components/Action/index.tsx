import { ITemplate, IViewComponent } from "@eusoft/webapp-core";
import "./index.scss";
import { Content, Template } from "@eusoft/webapp-jsx";
import { Bindable, IComponentOptions, ViewComponent } from "../ViewComponent";

interface IActionOptions extends IComponentOptions {

    content?: Bindable<string | IViewComponent>;

    executeAsync?: () => Promise<any>;
}

export const ActionTemplates = {

    "Button": (<Template name="Action">
        <button className={m => m.className} on-click={m => m.executeAsync()}>
            <Content src={m => m.content} />
        </button>
    </Template>) as ITemplate<Action>

}
export class Action extends ViewComponent<IActionOptions> {

    constructor(options?: IActionOptions) {

        super(options);

        this.bindOptions("content", "executeAsync");
    }

    async executeAsync() {

    }

    content: string | IViewComponent;

    template = ActionTemplates.Button;
}