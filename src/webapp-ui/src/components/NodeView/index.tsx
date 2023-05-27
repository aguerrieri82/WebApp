import { Default, Foreach, Switch, Text, When } from "@eusoft/webapp-jsx";
import { LocalString, ViewNode } from "../../Types";
import { ITemplate, ITemplateProvider, TemplateBuilder, isTemplateProvider } from "@eusoft/webapp-core";
import { formatText } from "../../utils";

export interface INodeViewOptions {
    content: ViewNode;
}

type NodeType = LocalString | ITemplateProvider;
export function NodeView(options: INodeViewOptions) {

    const singleNode = (t: TemplateBuilder<NodeType>) => {

        if (typeof t.model == "string") {
            const format = formatText(t.model);
            if (typeof format == "string")
                t.text(format);
            else if (format)
                format(t);
        }
        else if (isTemplateProvider(t.model))
            t.content(t.model);

        else if (typeof t.model == "function" && t.model.length == 0)
            t.text(t.model());
    }
   

    return (t: TemplateBuilder<INodeViewOptions>) =>
        t.enter(m => m.content, t2 => {
            if (t2.model === undefined || t2.model === null)
                return;
            if (Array.isArray(t2.model))
                t2.model.forEach(item => t2.template(singleNode, item as NodeType));
            else
                singleNode(t2 as TemplateBuilder<NodeType>)
        });
}