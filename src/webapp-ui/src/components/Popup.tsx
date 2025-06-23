import { Component, type IComponentOptions, cleanProxy, delayAsync, mount } from "@eusoft/webapp-core";
import { type LocalString, type ViewNode } from "../Types";
import { forModel } from "@eusoft/webapp-jsx";
import { Action, createAction } from "./Action";
import { formatText } from "../utils/Format";
import "./Popup.scss";
import { withUnblock } from "../utils";
import type { ActionPriority } from "../abstraction/IAction";

export interface IPopUpAction {

    name: string;

    text: LocalString;

    priority?: ActionPriority;

    executeAsync?: () => Promise<boolean>;
}

export interface IPopupOptions extends IComponentOptions {

    title: ViewNode;

    body: ViewNode;

    actions: IPopUpAction[];

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
                            <Action name={a.name} type="local" style={a.priority == "primary" ? "contained" : "text"} onExecuteAsync={() => m.onActionClick(a)}>
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

    async onActionClick(action: IPopUpAction) {

        action = cleanProxy(cleanProxy(action));

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

        const onPopState = () => {
            this.close();
        }

        window.addEventListener("popstate", onPopState);
        
        const result = await withUnblock(() => new Promise<string>(res => this._closePromise = res));

        window.removeEventListener("popstate", onPopState);

        setTimeout(() => {

            if (this.context?.element && isMounted) {
                this.context.element.remove();
                this.context.element = undefined;
            }

        }, 500)

        return result;
    }

    title: ViewNode;

    body: ViewNode;

    actions: IPopUpAction[]

    hideOnClick: boolean;
}
