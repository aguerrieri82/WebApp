import { Component, IComponentOptions, delayAsync, mount } from "@eusoft/webapp-core";
import { IAction } from "../../abstraction/IAction";
import { ViewNode } from "../../Types";
import { createAction } from "../Action";
import "./index.scss";
import { forModel } from "@eusoft/webapp-jsx";
import { NodeView } from "../NodeView";


export interface IContextMenuOptions extends IComponentOptions {
    content?: ViewNode;
}

export class ContextMenu extends Component<IContextMenuOptions> {

    private _menuContainer: HTMLElement;
    private _clickHandler;

    constructor(options?: IContextMenuOptions) {
        super();

        this.init(ContextMenu, {

            template: forModel<this>(m => <div style-display="none" className={m.className}>
                <NodeView>{m.content}</NodeView>
            </div>),

            ...options
        });


        this._menuContainer = document.createElement("DIV");
        this._menuContainer.className = "popup-container";

        this._clickHandler = this.onClick.bind(this);
    }

    addActions(...action: IAction[]) {

        let newContent = this.content ?? [];
        if (!Array.isArray(newContent))
            newContent = [newContent];

        (newContent as ViewNode[]).push(...action.map(a => createAction(a, "text")));

        this.content = newContent;
    }

    async showAsync(element?: HTMLElement, event?: MouseEvent | TouchEvent | PointerEvent) {

        const curOfs = { x: 0, y: 0 };

        if (!element && !event)
            event = window.event as MouseEvent;

        if (!element && event) {

            if (event instanceof MouseEvent) {
                element = event.currentTarget as HTMLElement;
                curOfs.x = event.offsetX;
                curOfs.y = event.offsetY;
            }
            else {
                curOfs.x = event.touches[0].clientX;
                curOfs.y = event.touches[0].clientY;
            }
        }

        if (!this.context?.element)
            mount(this._menuContainer, this);
        else {
            this._menuContainer.appendChild(this.context?.element);
        }

        this.context.element.style.removeProperty("display");

        document.body.appendChild(this._menuContainer);

        await delayAsync(0);

        window.addEventListener("pointerdown", this._clickHandler);

        if (element) {

            let curEl = element;
            let offsetEl = element;

            while (curEl) {
                if (curEl == offsetEl) {
                    curOfs.y += curEl.offsetTop;
                    curOfs.x += curEl.offsetLeft;
                    offsetEl = curEl.offsetParent as HTMLElement;
                }
                curOfs.y -= curEl.scrollTop;
                curOfs.x -= curEl.scrollLeft;
                curEl = curEl.parentElement;
            }
        }

        let xTrans = "";
        let yTrans = "";

        if (curOfs.x + this._menuContainer.clientWidth > document.body.clientWidth) {
            curOfs.x -= this._menuContainer.clientWidth;
            xTrans = "right";
        }
        else
            xTrans = "left";

        if (curOfs.y + this._menuContainer.clientHeight > document.body.clientHeight) {
            curOfs.y -= this._menuContainer.clientHeight;
            yTrans = "bottom";
        }
        else
            yTrans = "top";

        this._menuContainer.style.top = curOfs.y + "px";
        this._menuContainer.style.left = curOfs.x + "px";
        this._menuContainer.style.transformOrigin = xTrans + " " + yTrans;

        await delayAsync(0);

        this._menuContainer.classList.add("visible");
    }

    hide() {

        this._menuContainer.classList.remove("visible");

        window.removeEventListener("pointerdown", this._clickHandler);

        setTimeout(() => document.body.removeChild(this._menuContainer), 500);
    }

    protected onClick(e: MouseEvent) {
        setTimeout(() => this.hide(), 200);
    }

    content: ViewNode;
}