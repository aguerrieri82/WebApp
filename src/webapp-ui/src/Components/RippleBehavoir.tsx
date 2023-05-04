import { BehavoirCatalog, IBehavoir } from "@eusoft/webapp-core";


export class RippleBehavoir implements IBehavoir {

    attach(element: HTMLElement, model?: any): void {
        alert(element);
    }

    detach(element: HTMLElement, model?: any): void {

    }
}

BehavoirCatalog["Ripple"] = () => new RippleBehavoir();
