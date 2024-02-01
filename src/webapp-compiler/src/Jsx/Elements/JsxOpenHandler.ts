import type { NodePath } from "@babel/traverse";
import type { JsxParseContext } from "../JsxParseContext.js";
import { TemplateElements } from "../../Consts.js";

export function JsxOpenHandler(ctx: JsxParseContext, stage: "enter", path: NodePath): boolean {

    if (stage != "enter")
        return;

    if (!(path.isJSXOpeningElement() || (path.isJSXOpeningFragment() && ctx.curAttribute && !ctx.curAttribute.value)))
        return;

    const elName = path.isJSXOpeningElement() ? path.get("name").toString() : "Template";

    const isTempEl = TemplateElements.indexOf(elName) != -1;

    if (ctx.curAttribute && !ctx.curAttribute.value) {

        if (ctx.curElement.name != "t:component") 
            throw path.buildCodeFrameError("Jsx inside attributes is supported only in components.");

        const newElement = ctx.createElement(isTempEl ? "t:" + elName.toLowerCase() : elName);
        const attr = ctx.curAttribute;
        attr.value = newElement;
        ctx.tryEnterElement(newElement);
        ctx.curAttribute = null;
    }
    else {

        const elBinding = path.scope.getBinding(elName);

        const newElement = ctx.enterNewElement(isTempEl ? "t:" + elName.toLowerCase() : elName);

        //TODO check  elBinding.kind
        if (elBinding && elBinding.kind != "param" && !isTempEl) {
            newElement.name = "t:component";
            ctx.createAttribute("t:type", elName, newElement);
        }
    }
    return true;
}


export default JsxOpenHandler;