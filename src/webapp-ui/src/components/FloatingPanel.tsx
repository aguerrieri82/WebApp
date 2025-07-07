import { Component, type IComponentOptions, isComponent, mount } from "@eusoft/webapp-core";
import { type ViewNode } from "../types";
import { Class, forModel } from "@eusoft/webapp-jsx";
import { findParent, getScreenPos, isParentOrSelf } from "../utils/Dom";
import "./FloatingPanel.scss";

export interface IFloatingPanelOptions extends IComponentOptions {

    body: ViewNode;

    anchor?: ViewNode;

    onClickOut?: (element: HTMLElement) => void;
}

export class FloatingPanel extends Component<IFloatingPanelOptions> {

    protected _closePromise: (value: string) => void;
    protected _isMounted;
    protected _onClick: (ev: PointerEvent) => void;

    constructor(options?: IFloatingPanelOptions) {
        super();

        this.init(FloatingPanel, {

            template: forModel<this>(m => <div className={m.className} visible={m.visible}>
                <Class name="fixed" condition={m.isFixed} />
                {m.body}
            </div>),
            visible: false,
            ...options
        });

        this._onClick = ev => {

            if (!isParentOrSelf(ev.target as HTMLElement, this.context.element))
                this.onClickOut(ev.target as HTMLElement);
        }
    }

    protected updateSuggestionsPos() {

        if (!this.anchor)
            return;

        let anchorEl: HTMLElement;

        if (isComponent(this.anchor))
            anchorEl = this.anchor.context?.element;

        else if (this.anchor instanceof HTMLElement)
            anchorEl = this.anchor;

        if (!anchorEl)
            return;

        const panel = this.context.element;

        this.isFixed = !!findParent(anchorEl, a => window.getComputedStyle(a).position == "fixed");
       
        const ofs = getScreenPos(anchorEl, false);
        panel.style.top = (ofs.y + anchorEl.clientHeight) + "px";
        panel.style.left = (ofs.x) + "px";
        panel.style.width = (anchorEl.clientWidth) + "px";
    }

    close() {

        if (!this.visible)
            return;

        window.removeEventListener("pointerup", this._onClick);

        this.visible = false;

        setTimeout(() => {

            if (this.context?.element && this._isMounted) {
                this.context.element.remove();
                this.context.element = undefined;
            }

        }, 500)
    }

    show() {

        console.log("show");

        if (this.visible)
            return;

        this._isMounted = false;

        if (!this.context?.element) {
            mount(document.body, this);
            this._isMounted = true;
        }

        setTimeout(() => this.updateSuggestionsPos(), 20);

        this.visible = true;

        window.addEventListener("pointerup", this._onClick);
    }

    onClickOut(el: HTMLElement) {

    }

    isFixed: boolean;

    body: ViewNode;

    anchor: ViewNode | Node;
}
