import { Component, delayAsync, type IComponentOptions, isComponent, mount } from "@eusoft/webapp-core";
import { type ViewNode } from "../types";
import { Class, forModel } from "@eusoft/webapp-jsx";
import { findParent, getScreenPos, isParentOrSelf, type IPoint } from "../utils/Dom";
import "./FloatingPanel.scss";

export interface IFloatingPanelOptions extends IComponentOptions {

    content: ViewNode;

    anchor?: ViewNode;

    sizeToAnchor?: boolean;

    anchorX?: "left" | "right";

    anchorY?: "top" | "bottom";

    onClickOut?: (element: HTMLElement) => void;
}


export class FloatingPanel extends Component<IFloatingPanelOptions> {

    protected _closePromise: (value: string) => void;
    protected _isMounted;
    protected _onClick: (ev: PointerEvent) => void;
    protected _onLayout: (ev: Event) => void;
    protected _curPos: IPoint;

    constructor(options?: IFloatingPanelOptions) {
        super();

        this.init(FloatingPanel, {

            template: forModel<this>(m => <div className={m.className} visible={m.visible}>
                <Class name="fixed" condition={m.isFixed} />
                {m.content}
            </div>),
            visible: false,
            ...options
        });

        this._onClick = ev => {

            if (!isParentOrSelf(ev.target as HTMLElement, this.context.element))
                this.onClickOut(ev.target as HTMLElement);
            else
                this.onClickIn(ev.target as HTMLElement);
        }
        this._onLayout = ev => {

            if (this.visible)
                this.updatePanelPos();
        }
    }

    protected attachEvents() {

        window.addEventListener("pointerup", this._onClick);
        window.addEventListener("scroll", this._onLayout, true);
        window.addEventListener("resize", this._onLayout); 
    }

    protected detachEvents() {
        window.removeEventListener("pointerup", this._onClick);
        window.removeEventListener("scroll", this._onLayout, true);
        window.removeEventListener("resize", this._onLayout); 
    }

    protected updatePanelPos() {

        if (!this.anchor)
            return;

        let anchorEl: HTMLElement;

        if (isComponent(this.anchor))
            anchorEl = this.anchor.context?.element;

        else if (this.anchor instanceof HTMLElement)
            anchorEl = this.anchor;

        if (!anchorEl)
            return;

        if (!this.context?.element.isConnected) {
            this.detachEvents();
            return;
        }
            
        this.isFixed = !!findParent(anchorEl, a => window.getComputedStyle(a).position == "fixed");
       
        this._curPos = getScreenPos(anchorEl, true, true);
        this._curPos.x += this.anchorOffset.x;
        this._curPos.y += this.anchorOffset.y;

        this.applyPanelPos(anchorEl);
    }

    protected applyPanelPos(anchorEl: HTMLElement) {

        const panel = this.context.element;

        if (this.anchorX == "right")
            this._curPos.x += anchorEl.clientWidth;

        if (this.anchorY == "bottom")
            this._curPos.y += anchorEl.clientHeight;

        panel.style.top = (this._curPos.y) + "px";
        panel.style.left = (this._curPos.x) + "px";

        if (this.sizeToAnchor)
            panel.style.width = (anchorEl.clientWidth) + "px";

    }

    close() {

        if (!this.visible)
            return;

        this.visible = false;

        this.detachEvents();

        setTimeout(() => {

            if (this.context?.element && this._isMounted) {
                this.context.element.remove();
                this.context.element = undefined;
            }

        }, 500)
    }

    async show() {

        if (this.visible)
            return;

        this._isMounted = false;

        if (!this.context?.element) {
            mount(document.body, this);
            this._isMounted = true;

            await delayAsync(0);
        }


        this.updatePanelPos();

        this.visible = true;

        this.attachEvents();
    }

    onClickOut(el: HTMLElement) {

    }

    onClickIn(el: HTMLElement) {

    }

    isFixed: boolean;

    content: ViewNode;

    anchor: ViewNode | Node;

    anchorOffset: IPoint = { x: 0, y: 0 };

    sizeToAnchor: boolean;

    anchorX: "left" | "right" = "left";

    anchorY: "top" | "bottom" = "top";
}
