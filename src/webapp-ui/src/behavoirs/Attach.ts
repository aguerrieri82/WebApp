import { Behavoir, type ITemplateContext } from "@eusoft/webapp-core";

export interface IAttachOptions {

    load: (element: HTMLElement) => void;
}

export class Attach extends Behavoir<IAttachOptions>{

    attach(ctx: ITemplateContext<this, HTMLDivElement>): void {
        this.load(ctx.element);
    }

    load: (element: HTMLElement) => void;

}
