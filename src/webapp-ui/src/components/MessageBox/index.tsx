import { Bind, Component, IComponentOptions, delayAsync, mount } from "@eusoft/webapp-core";
import { ViewNode } from "../../Types";
import { forModel } from "@eusoft/webapp-jsx";
import { Action } from "../Action";
import "./index.scss";
import { formatText } from "../../utils/Format";


interface IMessageBoxAction {
    name: string;
    text: string;
    executeAsync?: () => Promise<boolean>;
}

export interface IMessageBoxOptions extends IComponentOptions {


    title: ViewNode;

    body: ViewNode;

    actions: IMessageBoxAction[];
  
}

export class MessageBox extends Component<IMessageBoxOptions> {

    protected _closePromise: (value: string) => void;

    constructor(options?: IMessageBoxOptions) {
        super();

        this.init(MessageBox, {

            template: forModel((m: this) => <div className={m.className} visible={m.visible}>
                <div className="message">
                    <header>
                        {m.title}
                    </header>
                    <main>
                        {m.body}
                    </main>
                    <footer>
                        {m.actions?.forEach(a =>
                            <Action name={a.name} type="local" onExecuteAsync={Bind.action(()=> m.onActionClick(a))}>
                                {formatText(a.text)}
                            </Action>
                        )}
                    </footer>
                </div>
            </div>),
            visible: false,
            ...options
        });
    }

    async onActionClick(action: IMessageBoxAction) {

        if (action.executeAsync) {

            if (!await action.executeAsync())
                return;
        }

        this._closePromise(action.name);

        this.visible = false;
    }

    async showAsync() {

        if (!this.context?.element) {
            mount(document.body, this);
            await delayAsync(100);
        }

        this.visible = true;

        const result = await new Promise<string>(res => this._closePromise = res);

        await delayAsync(500); 

        if (this.context?.element) {
            this.context.element.remove();
            this.context.element = undefined;
        }

        return result;
    }
    

    title: ViewNode;

    body: ViewNode;

    actions: IMessageBoxAction[];
}
