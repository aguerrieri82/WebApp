import { Behavoir, defineBehavoir } from "@eusoft/webapp-core";

export class Ripple extends Behavoir {

    override attach(ctx): void {

    }
}

defineBehavoir("Ripple", () => new Ripple());