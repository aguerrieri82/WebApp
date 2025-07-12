import { type IAction } from "../abstraction/IAction";
import { type ViewNode } from "../types";
import { createAction } from "./Action";
import  { FloatingPanel, type IFloatingPanelOptions } from "./FloatingPanel";
import "./ContextMenu.scss";

export interface IContextMenuOptions extends IFloatingPanelOptions {
}

export class ContextMenu extends FloatingPanel {

    constructor(options?: IContextMenuOptions) {
        super();

        this.init(ContextMenu, {
            onClickOut: () => this.close(),
            visible: false,
            ...options
        });

    }

    override onClickIn(el: HTMLElement) {
        setTimeout(() => this.close(), 20);
    }

    addActions(...action: IAction[]) {

        let newContent = this.body ?? [];

        if (!Array.isArray(newContent))
            newContent = [newContent];

        (newContent as ViewNode[]).push(...action.map(a => createAction(a, "text")));

        this.body = newContent;
    }

    protected override applyPanelPos(anchorEl: HTMLElement) {

        let xTrans = "";
        let yTrans = "";


        const width = Math.max(window.visualViewport.width, document.body.clientWidth);
        const height = Math.max(window.visualViewport.height, document.documentElement.scrollTop + document.documentElement.clientHeight);

        if (this._curPos.x + this.context.element.clientWidth > width) {
            this._curPos.x -= this.context.element.clientWidth;
            xTrans = "right";
        }
        else
            xTrans = "left";

        if (this._curPos.y + this.context.element.clientHeight > height) {
            this._curPos.y -= this.context.element.clientHeight;
            yTrans = "bottom";
        }
        else
            yTrans = "top";

        this.context.element.style.transformOrigin = xTrans + " " + yTrans;

        super.applyPanelPos(anchorEl);
    }


    override async show(element?: HTMLElement, event?: MouseEvent | TouchEvent | PointerEvent) {

        if (!element && !event)
            event = window.event as MouseEvent;

        if (!element && event) {

            if (event instanceof MouseEvent) {
                this.anchor = event.currentTarget as HTMLElement;
                this.anchorOffset.x = event.offsetX;
                this.anchorOffset.y = event.offsetY;
            }
            else {
                this.anchorOffset.x = event.touches[0].clientX;
                this.anchorOffset.y = event.touches[0].clientY;
            }
        }

        await super.show();
    }

}