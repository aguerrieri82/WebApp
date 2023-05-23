import { ITemplate } from "@eusoft/webapp-core";
import { forModel } from "@eusoft/webapp-jsx";

export class Blocker {

    constructor() {

        this.template = forModel(m => <div className="blocker" visible={m.visible}>

        </div>);
    }

    visible: boolean;

    template: ITemplate<this>;
}