import { Behavoir, configureBindings, type Bindable, type ITemplateContext } from "@eusoft/webapp-core";
import { isParentOrSelf } from "../utils";

export interface IHideOnClickOptions {

    isVisible: Bindable<boolean>;
}
export class HideOnClick extends Behavoir<IHideOnClickOptions>{

    protected _sub: (ev: PointerEvent) => void;

    override attach(ctx: ITemplateContext<this, HTMLElement>): void {

        this._sub = ev => {

            if (!this.isVisible)
                return;

            if ((ev.target as HTMLElement).classList.contains("blocker"))
                return;
                 
            if (!isParentOrSelf(ev.target as HTMLElement, ctx.element.parentElement))
                this.isVisible = false;
        }

        window.addEventListener("pointerup", this._sub);
    }

    override detach(ctx: ITemplateContext<this, HTMLElement>): void {

        window.removeEventListener("pointerup", this._sub);
    }

    isVisible: boolean;
}

configureBindings(HideOnClick, {
    "isVisible": "two-ways",
});