import { HandleResult, ITemplateHandler } from "../Abstraction/ITemplateHandler";
import { TemplateContext } from "../TemplateContext";
export class BehavoirAttributeHandler implements ITemplateHandler {
     
    canHandle(ctx: TemplateContext, node: Attr): boolean {

        return ctx.isAttr(node, "behavoir");
    }

    handle(ctx: TemplateContext, node: Attr): HandleResult {

        for (const item in node.value.split(','))
            ctx.writer.write(".behavoir(").writeJson(item.trim()).write(")");

        return HandleResult.Handled;
    }

}