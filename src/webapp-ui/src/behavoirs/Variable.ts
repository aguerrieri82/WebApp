import { Behavoir, propOf, type ITemplateContext } from "@eusoft/webapp-core";

export interface IVariableOptions {

    name: string;

    value: string;
}
export class Variable extends Behavoir<IVariableOptions>{

    protected _sub: Function;

    override attach(ctx: ITemplateContext<this, HTMLElement>): void {

        const update = (value: string) => {

            const propName = "--" + this.name;

            if (value === undefined || value === null)
                ctx.element.parentElement.style.removeProperty(propName);
            else
                ctx.element.parentElement.style.setProperty(propName, this.value);
        }

        this._sub = propOf(this, "value").subscribe(v => update(v));

        update(this.value);        
    }


    name: string;

    value: string;
}
