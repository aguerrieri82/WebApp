import { BehavoirCatalog, IBehavoir } from "@eusoft/webapp-core";


export class RippleBehavoir implements IBehavoir {

    attach(element: HTMLElement, model?: any): void {

    }

    detach(element: HTMLElement, model?: any): void {

    }
}

BehavoirCatalog["Ripple"] = () => new RippleBehavoir();
