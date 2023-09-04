import { HandleResult, ITemplateHandler } from "../Abstraction/ITemplateHandler";
import { ITemplateAttribute } from "../Abstraction/ITemplateNode";
import { TemplateContext } from "../TemplateContext";

export class ValueAttributeHandler implements ITemplateHandler {
     
    canHandle(ctx: TemplateContext, node: ITemplateAttribute): boolean {

        return ctx.isAttr(node, "value") ||
            ctx.isAttr(node, "value-pool") ||
            ctx.isAttr(node, "value-mode");
    }

    handle(ctx: TemplateContext, node: ITemplateAttribute): HandleResult {

        if (!ctx.isAttr(node, "value"))
            return HandleResult.Handled;

        ctx.writer.write(".value(").writeBinding(node.value as string);

        const pool = ctx.attrValue(node.owner, "value-pool"); 
        const mode = pool ? '"pool"' : ctx.attrValue(node.owner, "value-mode") as string;
        if (mode)
            ctx.writer.write(", ").writeString(mode);
        if (pool)
            ctx.writer.write(", ").write(pool);

        ctx.writer.write(")");

        return HandleResult.Handled;
    }

}