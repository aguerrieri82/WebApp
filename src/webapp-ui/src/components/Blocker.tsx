import { type ITemplate, type ITemplateProvider } from "@eusoft/webapp-core";
import { forModel } from "@eusoft/webapp-jsx";
import "./Blocker.scss";
import { type ViewNode } from "../Types";

export class Blocker<TContent extends ViewNode = ViewNode> implements ITemplateProvider {

    constructor() {

        this.visible = false;

        this.template = forModel(m => <div className="blocker" visible={m.visible}>
            {m.content}
        </div>);
    }

    visible: boolean;

    content: TContent;

    template: ITemplate<this>;
}