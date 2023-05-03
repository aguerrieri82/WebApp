import { ReadStream } from "fs";
import { IWriteable } from "./Abstraction/IWriteable";
import * as parser from "@babel/parser";
import traverse from "@babel/traverse";
import { readAllTextAsync } from "./TextUtils";
import { BaseCompiler } from "./BaseCompiler";
import { JSXIdentifier, Node as BabelNode } from "@babel/types";
import { TemplateContext } from "./TemplateContext";
import { TemplateWriter } from "./Text/TemplateWriter";
import { ITemplateElement, ITemplateNode } from "./Abstraction/ITemplateNode";

export class JsxCompiler extends BaseCompiler {


    protected parse(template: BabelNode) : ITemplateElement {

        return null;
    }

    async compileStreamAsync(input: ReadStream | string, output: IWriteable) {

        const js = typeof input == "string" ? input : await readAllTextAsync(input);

        const ast = parser.parse(js, {
            sourceType: "module",
            plugins: ["jsx"]
        });

        const trav = (traverse as any).default as typeof traverse;

        const templates: BabelNode[] = [];

        trav(ast, {

            enter(path) {
                if (path.isJSXElement()) {
                    const elName = (path.node.openingElement.name as JSXIdentifier).name;
                    if (elName == "Template")
                        templates.push(path.node);
                    path.shouldSkip = true;
                }
            }
        });

        const validate = (node: BabelNode) => {

            let isValid = true;

            trav(node, {

                enter: path => {
                    if (path.isJSXSpreadChild() || path.isJSXSpreadAttribute()) {
                        this.error("Spread operator not supported in tsx/jsx (es. <div {...props}/>");
                        path.shouldStop = true;
                        isValid = false;
                    }
                }
            });

            return isValid;
        }


        const ctx = new TemplateContext();
        ctx.compiler = this;
        ctx.jsNamespace = "WebApp";
        ctx.htmlNamespace = "t";
        ctx.writer = new TemplateWriter(output, ctx);

        for (const temp of templates) {

            const tempNode = this.parse(temp);

            ctx.writer.out.write(js.substring(0, temp.start));
            if (validate(temp)) {
                ctx.writer.writeTemplate(tempNode);
            }
            else
                ctx.writer.write("null");

            ctx.writer.out.write(js.substring(temp.end));
        } 
    }
}