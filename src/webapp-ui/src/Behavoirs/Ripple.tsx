import { Behavoir, defineBehavoir } from "@eusoft/webapp-core";

export class Ripple extends Behavoir {

    attach(ctx): void {

    }
}

defineBehavoir("Ripple", () => new Ripple());