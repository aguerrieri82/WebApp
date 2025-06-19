import { Behavoir, propOf, type ITemplateContext } from "@eusoft/webapp-core";

export interface IAttachOptions {

    name: string;

    condition: boolean;
}
export class Attribute extends Behavoir<IAttachOptions>{

    protected _sub: Function;

    override attach(ctx: ITemplateContext<this, HTMLElement>): void {

        const update = (value: boolean) => {

            if (value)
                ctx.element.setAttribute(this.name, this.name);
            else
                ctx.element.removeAttribute(this.name);
        }

        this._sub = propOf(this, "condition").subscribe(v => update(v));

        update(this.condition);        
    }


    name: string;

    condition: boolean;
}
