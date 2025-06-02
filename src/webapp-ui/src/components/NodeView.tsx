import { type LocalString, type ViewNode } from "../Types";
import { template, type ITemplateProvider, type TemplateBuilder, isTemplate, isTemplateProvider } from "@eusoft/webapp-core";
import { formatText } from "../utils";

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

        else if (isTemplate(t.model))
            t.template(t.model);
    }
   

    return template<INodeViewOptions>(t =>
        t.enter(m => m.content, t2 => {
            if (t2.model === undefined || t2.model === null)
                return;
            if (Array.isArray(t2.model))
                t2.model.forEach(item => {

                    if (isTemplate(item))
                        t2.template(item);
                    else
                        t2.enter(item, t3 => singleNode(t3 as TemplateBuilder<NodeType>));
                });
            else
                singleNode(t2 as TemplateBuilder<NodeType>)
        }));
}