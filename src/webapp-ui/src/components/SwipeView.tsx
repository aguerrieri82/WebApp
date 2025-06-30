import { type Bindable, Component, type IComponentOptions, type ITemplateContext, type TemplateMap } from "@eusoft/webapp-core";
import { Class, forModel } from "@eusoft/webapp-jsx";
import { type ViewNode } from "../types";
import "./SwipeView.scss"
import { Action } from "./Action";
import { MaterialIcon } from "./Icon";

export interface ISwipeViewOptions extends IComponentOptions {

    content: ViewNode[];

    activeIndex?: Bindable<number>;

    activeContent?: Bindable<ViewNode>;
}

export const SwipeViewTemplates: TemplateMap<SwipeView> = {

    Default: forModel(m => <div className={m.className} visible={m.visible}>
        <Class name="moving" condition={m.isMoving}/>
        <div className="container">
            <Action onExecuteAsync={() => m.prev()}>〈</Action>
            <div className="content-wrapper">
                <div className="content" style-left={m.leftAlign}>
                    {m.content?.forEach(i => <section>
                        <Class name="active" condition={m.activeContent == i} />
                        {i}
                    </section>)}
                </div>
            </div>
            <Action onExecuteAsync={() => m.next()}>〉</Action>
        </div>
        <div className="bullets">
            {m.content?.forEach(i => <span>
                <Class name="active" condition={m.activeContent == i} />
                <MaterialIcon name="circle" style={m.activeContent == i ? "fill": undefined} />
            </span>)}
        </div>
    </div>)
}

export class SwipeView extends Component<ISwipeViewOptions> {

    constructor(options?: ISwipeViewOptions) {

        super();

        this.init(SwipeView, {
            template: SwipeViewTemplates.Default,
            ...options
        });
    }

    protected override initProps() {

        super.initProps();

        this.leftAlign = "0";

        const updateActiveContent = (v: number) => {
            this.activeContent = v == -1 || !this.content ? null : this.content[v];
            this.leftAlign = -(v * 100) + "%";
        }

        this.onChanged("content", v => {
            if (v?.length > 0)
                this.activeIndex = 0;
            updateActiveContent(this.activeIndex);
        });

        this.onChanged("activeIndex", v => updateActiveContent(v));

        this.onChanged("activeContent", v => this.activeIndex = this.content?.indexOf(v));

    }

    override mount(ctx: ITemplateContext) {

        super.mount(ctx);

        const wrapper = ctx.element.querySelector(".content-wrapper") as HTMLDivElement;

        let startPos: number = undefined;
        let startLeft: string;

        wrapper.addEventListener("touchstart", ev => {
            if (ev.touches.length == 1) {
                startLeft = this.leftAlign;
                startPos = ev.touches[0].clientX;
                this.isMoving = true;
            }
            else
                startPos = undefined;
        });

        wrapper.addEventListener("touchmove", async ev => {
            if (startPos !== undefined) {
                let delta = ev.touches[0].clientX - startPos;

                if (this.activeIndex == 0 && delta > 0)
                    delta = 0;

                if (this.activeIndex == this.content.length -1 && delta < 0)
                    delta = 0;

                const pos = delta / wrapper.clientWidth;

                if (pos >= 0.4 || pos <= -0.4) {
                    if (pos > 0)
                        this.prev();
                    else
                        this.next();
                    startPos = ev.touches[0].clientX;
                    startLeft = this.leftAlign;
                }
                else
                    this.leftAlign = "calc(" + startLeft + " + " + delta + "px)";
            }
        });

        wrapper.addEventListener("pointerup", ev => {
            console.log("swipe up")
        });

        wrapper.addEventListener("touchend", ev => {
                
            if (startPos !== undefined) {
  
                this.leftAlign = -(this.activeIndex * 100) + "%";
            }

            this.isMoving = false;
        });

    }

    next() {
        if (this.activeIndex < this.content.length - 1)
            this.activeIndex++;
    }

    prev() {
        if (this.activeIndex > 0)
            this.activeIndex--;
    }

    isMoving: boolean;

    activeIndex: number;

    activeContent: ViewNode;

    content: ViewNode[];

    leftAlign: string;
}