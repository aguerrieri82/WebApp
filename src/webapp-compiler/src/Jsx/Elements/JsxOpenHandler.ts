import type { NodePath } from "@babel/traverse";
import type { JsxParseContext } from "../JsxParseContext";
import { TemplateElements } from "../../Consts";

export function JsxOpenHandler(ctx: JsxParseContext, stage: "enter", path: NodePath): boolean {

    if (stage != "enter")
        return;

    if (!path.isJSXOpeningElement())
        return;

    const elName = path.get("name").toString();

    const elBinding = path.scope.getBinding(elName);

    const isTempEl = TemplateElements.indexOf(elName) != -1;

    const newElement = ctx.enterNewElement(isTempEl ? "t:" + elName.toLowerCase() : elName);

    if (elBinding && !isTempEl) {
        newElement.name = "t:component";
        ctx.createAttribute("t:type", elName, newElement);
    }

    return true;
}


export default JsxOpenHandler;