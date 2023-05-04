import { HandleResult, ITemplateHandler } from "../Abstraction/ITemplateHandler";
import { ITemplateAttribute } from "../Abstraction/ITemplateNode";
import { TemplateContext } from "../TemplateContext";
export class BehavoirAttributeHandler implements ITemplateHandler {
     
    canHandle(ctx: TemplateContext, node: ITemplateAttribute): boolean {

        return ctx.isAttr(node, "behavoir");
    }

    handle(ctx: TemplateContext, node: ITemplateAttribute): HandleResult {

        for (const item of node.value.split(','))
            ctx.writer.write(".behavoir(").writeStringAttr(item.trim()).write(")");

        return HandleResult.Handled;
    }
}