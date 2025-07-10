import {  type IComponentOptions, Component, type TemplateMap, registerComponent } from "@eusoft/webapp-core";
import { forModel } from "@eusoft/webapp-jsx";
import { createAction, type IAction, type IContent } from "@eusoft/webapp-ui";
import "./BottomNav.scss";
import { router, type NavigationMode } from "../services/Router";

interface IBottomNavOptions extends IComponentOptions {

    actions?: IAction[];
}

export const BottomNavTemplates: TemplateMap<BottomNav> = {

    "Button": forModel(m => <div visible={m.visible} className={m.className} >
        {m.actions.forEach(a => createAction(a, "icon"))}
    </div>)
}

export class BottomNav extends Component<IBottomNavOptions> {

    constructor(options?: IBottomNavOptions) {

        super();

        this.init(BottomNav, {
            template: BottomNavTemplates.Button,
            ...options
        });

    }

    addNav<TArgs extends ObjectLike>(content: IContent<TArgs>|string, mode: NavigationMode) {

        if (typeof content == "string")
            content = router.findPage(content);

        this.actions ??= [];
             
        this.actions.push({
            name: content.name,
            icon: content.icon,
            type: "global",            
            executeAsync: () => router.navigatePageAsync(content, undefined, mode)
        })
    }

    actions: IAction[]; 

}

registerComponent(BottomNav, "BottomNav");

