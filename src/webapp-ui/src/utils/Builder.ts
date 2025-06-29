import type { BindValue } from "@eusoft/webapp-core/abstraction/IBinder"
import { TemplateBuilder } from "@eusoft/webapp-core/TemplateBuilder"
import type { LocalString, ViewNode } from "../types"
import { isTemplateProvider, isTemplate, type ITemplateProvider } from "@eusoft/webapp-core"
import { formatText } from "./Format"

type NodeType = LocalString | ITemplateProvider;

declare module "@eusoft/webapp-core/TemplateBuilder" {
    interface TemplateBuilder<TModel, TElement> {
        nodeView<TInnerModel extends ViewNode>(content: BindValue<TModel, TInnerModel>): this
    }
}

TemplateBuilder.prototype.nodeView = function (content) {

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

    return this.enter(content, t2 => {
        if (t2.model === undefined || t2.model === null)
            return;
        if (Array.isArray(t2.model))
            t2.model.forEach(item => {

                if (isTemplate(item))
                    t2.template(item);
                else
                    t2.enter(item as object, t3 => singleNode(t3 as TemplateBuilder<NodeType>));
            });
        else
            singleNode(t2 as TemplateBuilder<NodeType>)
    });
}
