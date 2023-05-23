import { Behavoir, defineBehavoir } from "@eusoft/webapp-core";
import { ITemplateContext } from "@eusoft/webapp-core";

export class Ripple extends Behavoir {

    attach(ctx: ITemplateContext<any, HTMLElement>): void {
        throw new Error("Method not implemented.");
    }
}

defineBehavoir("Ripple", () => new Ripple());