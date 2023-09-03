import { Bindable, Component, IComponentOptions, TemplateMap } from "@eusoft/webapp-core";
import { Class, forModel } from "@eusoft/webapp-jsx";
import { ViewNode } from "../../Types";
import "./index.scss"

export interface ISwipeViewOptions extends IComponentOptions {

    content: ViewNode[];

    activeIndex?: Bindable<number>;

    activeContent?: Bindable<ViewNode>;
}

export const SwipeViewTemplates: TemplateMap<SwipeView> = {

    Default: forModel(m => <div className={m.className} visible={m.visible}>
        {m.content?.forEach(i => <section>
            <Class name="active" condition={m.activeContent == i }/>
            {i}
        </section>)}
    </div>)
}

export class SwipeView extends Component<ISwipeViewOptions> {

    constructor(options?: ISwipeViewOptions) {

        super();

        this.init(SwipeView, {
            template: SwipeViewTemplates.Default,
            ...options
        });

        this.onChanged("activeIndex", v => this.activeContent = v == -1 ? null : this.content[this.activeIndex]);
        this.onChanged("activeContent", v => this.activeIndex = this.content.indexOf(v));
    }

    next() {
        if (this.activeIndex < this.content.length - 1)
            this.activeIndex++;
    }

    prev() {
        if (this.activeIndex > 0)
            this.activeIndex--;
    }

    activeIndex: number;

    activeContent: ViewNode;

    content: ViewNode[];
}