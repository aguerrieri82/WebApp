import { mount } from "@eusoft/webapp-core";
import { forModel } from "@eusoft/webapp-jsx";
import type { ViewNode } from "../types";
import type { ComponentStyle } from "@eusoft/webapp-core";
import { buildStyle, delayAsync } from "@eusoft/webapp-core";
import "./Toaster.scss";
import { Class } from "@eusoft/webapp-jsx";

interface IToasterOptions {
    content: ViewNode;
    style: ComponentStyle;
    timeout?: number;   
}

interface IToasterView extends IToasterOptions {
    visible?: boolean;
}

interface IToasterManager {
    showAsync(options: IToasterOptions): void;
}

class ToasterManager implements IToasterManager {

    constructor() {
        mount(document.body, forModel(this, m => <div className="toaster-manager">
            {m.toasters.forEach(a => <div className={buildStyle("toaster", a.style)}>
                <Class name="visible" condition={a.visible }/>
                {a.content}
            </div>)}
        </div>));
    }

    async showAsync(options: IToasterOptions) {

        const view = options as IToasterView;

        this.toasters.push(view);
        await delayAsync(50);
        view.visible = true;
        await delayAsync(options.timeout);
        view.visible = false;
        await delayAsync(300);

        const idx = this.toasters.indexOf(view);

        this.toasters.splice(idx, 1);        
    }

    toasters: IToasterView[] = [];
}

export const Toaster: IToasterManager = new ToasterManager();