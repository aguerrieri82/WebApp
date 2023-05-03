import { ReadStream } from "fs";
import { IWriteable } from "./Abstraction/IWriteable";
import * as parser from "@babel/parser";
import traverse from "@babel/traverse";
import { readAllTextAsync } from "./TextUtils";
import { BaseCompiler } from "./BaseCompiler";
import { JSXIdentifier, Node as BabelNode } from "@babel/types";

export class JsxCompiler extends BaseCompiler {

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

        let offset = 0;

        let result = js;

        const replaceNode = (node: BabelNode, newText: string) => {
            const p1 = result.substring(0, node.start + offset);
            const p2 = result.substring(node.end + offset);
            result = p1 + newText + p2;
            offset -= (node.end - node.start) - newText.length;
        }

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

        for (const temp of templates) {

            if (!validate(temp))
                continue;
            replaceNode(temp, "null");
        } 

        output.write(result);
    }
}