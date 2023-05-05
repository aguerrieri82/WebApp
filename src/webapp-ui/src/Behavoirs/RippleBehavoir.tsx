import { IBehavoir, defineBehavoir } from "@eusoft/webapp-core";

export class RippleBehavoir implements IBehavoir {

    attach(element: HTMLElement, model?: any): void {

    }

    detach(element: HTMLElement, model?: any): void {

    }
}

defineBehavoir("Ripple", () => new RippleBehavoir());