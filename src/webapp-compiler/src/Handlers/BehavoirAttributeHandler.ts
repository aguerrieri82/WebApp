import { HandleResult, type ITemplateHandler } from "../Abstraction/ITemplateHandler.js";
import { type ITemplateAttribute } from "../Abstraction/ITemplateNode.js";
import { type TemplateContext } from "../TemplateContext.js";
export class BehavoirAttributeHandler implements ITemplateHandler {
     
    canHandle(ctx: TemplateContext, node: ITemplateAttribute): boolean {

        return ctx.isAttr(node, "behavoir");
    }

    handle(ctx: TemplateContext, node: ITemplateAttribute): HandleResult {

        for (const item of (node.value as string).split(','))
            ctx.writer.write(".behavoir(").writeString(item.trim()).write(")");

        return HandleResult.Handled;
    }
}