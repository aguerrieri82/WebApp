import { IBehavoir, defineBehavoir } from "@eusoft/webapp-core";

export class Ripple implements IBehavoir {

    attach(element: HTMLElement, model?: any): void {

        console.log("attach", element);
    }

    detach(element: HTMLElement, model?: any): void {

        console.log("detach", element);
    }

}

defineBehavoir("Ripple", () => new Ripple());