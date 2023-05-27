import { Bindable, Component, IComponentOptions } from "@eusoft/webapp-core";
import { IAction, LocalString, ViewNode } from "@eusoft/webapp-ui";

export interface IContentOptions extends IComponentOptions {

    icon?: Bindable<ViewNode>;

    shortTitle?: Bindable<LocalString>;

    title?: Bindable<LocalString>;

    actions?: Bindable<IAction[]>;
} 

export abstract class Content<TOptions extends IContentOptions> extends Component<TOptions> {

    constructor() {
        super();
        this.init(Content);
    }


    protected override updateOptions() {

        this.bindOptions("title", "shortTitle", "icon", "actions");
    }


    title: LocalString;

    shortTitle: LocalString;

    icon: ViewNode;

    actions: IAction[];
}