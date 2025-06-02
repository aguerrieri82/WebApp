import { Bind, Component, type IComponentOptions, delayAsync, mount } from "@eusoft/webapp-core";
import { type ViewNode } from "../Types";
import { forModel } from "@eusoft/webapp-jsx";
import { Action } from "./Action";
import "./Popup.scss";
import { formatText } from "../utils/Format";


interface IMessageBoxAction {
    name: string;
    text: string;
    executeAsync?: () => Promise<boolean>;
}

export interface IPopupOptions extends IComponentOptions {


    title: ViewNode;

    body: ViewNode;

    actions: IMessageBoxAction[];

    hideOnClick?: boolean;
 
}

export class Popup extends Component<IPopupOptions> {

    protected _closePromise: (value: string) => void;

    constructor(options?: IPopupOptions) {
        super();

        this.init(Popup, {

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
                            <Action name={a.name} type="local" style="text" onExecuteAsync={Bind.action(() => m.onActionClick(a))}>
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

        this.close(action.name);
    }

    close(result?: string) {

        if (this._closePromise)
            this._closePromise(result);
        this.visible = false;
    }

    async showAsync() {

        let isMounted = false;

        if (!this.context?.element) {
            mount(document.body, this);
            await delayAsync(100);
            isMounted = true;
        }

        this.visible = true;

        const result = await new Promise<string>(res => this._closePromise = res);

        await delayAsync(500); 

        if (this.context?.element && isMounted) {
            this.context.element.remove();
            this.context.element = undefined;
        }

        return result;
    }
    

    title: ViewNode;

    body: ViewNode;

    actions: IMessageBoxAction[]

    hideOnClick: boolean;
}
