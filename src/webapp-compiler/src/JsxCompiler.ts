import { ReadStream } from "fs";
import { IWriteable } from "./Abstraction/IWriteable";
import * as parser from "@babel/parser";
import traverse, { NodePath } from "@babel/traverse";
import { readAllTextAsync } from "./TextUtils";
import { BaseCompiler } from "./BaseCompiler";
import { JSXIdentifier, Node as BabelNode, JSXElement } from "@babel/types";
import { TemplateContext } from "./TemplateContext";
import { TemplateWriter } from "./Text/TemplateWriter";
import { ITemplateAttribute, ITemplateElement, ITemplateText, TemplateNodeType } from "./Abstraction/ITemplateNode";
import { FuncAttributes, TemplateElements } from "./Consts";
import { it } from "node:test";

const trav = (traverse as any).default as typeof traverse;


export class JsxCompiler extends BaseCompiler {

    protected parse(template: NodePath<JSXElement>) : ITemplateElement {

        let curElement: ITemplateElement;

        let curAttribute: ITemplateAttribute;

        const stack: ITemplateElement[] = [];

        let result: ITemplateElement;

        template.shouldSkip = false;

        template.parentPath.traverse({

            exit: path => {

                if (path.isJSXAttribute())
                    curAttribute = null;

                if (path.isJSXElement()) {

                    console.log("End: " + path.get("openingElement").get("name").toString());
 
                    if (curElement.name == "t:template")
                        result = curElement;

                    curElement = stack.pop(); 

                }
            },

            enter: path => {

                if (curAttribute && (path.isJSXElement() || path.isJSXFragment())) {
                    path.shouldStop = true;
                    const error = path.buildCodeFrameError("Jsx element or fragment in attribute not supported");
                    throw error;
                }

                if (path.isJSXElement()) {

                    console.log("Start: " + path.get("openingElement").get("name").toString());
                }

                else if (path.isJSXOpeningElement()) {

                    const elName = (path.node.name as JSXIdentifier).name;

                    const isTempEl = TemplateElements.indexOf(elName) != -1;

                    const item: ITemplateElement = {
                        type: TemplateNodeType.Element,
                        name: isTempEl ? "t:" + elName.toLowerCase() : elName,
                        attributes: {},
                        childNodes: []
                    }

                    if (curElement)
                        curElement.childNodes.push(item);

                    stack.push(curElement);

                    curElement = item;
                }
                else if (path.isJSXAttribute()) {

                    let name = (path.node.name as JSXIdentifier).name;

                    if (name.startsWith("on-") || name.startsWith("style-") || FuncAttributes.indexOf(name) != -1)
                        name = "t:" + name;

                    curAttribute = {
                        name,
                        owner: curElement,
                        type: TemplateNodeType.Attribute,
                        value: null
                    };
                    curElement.attributes[name] = curAttribute;
                }
                else if (path.isJSXText()) {

                    const item: ITemplateText = {
                        type: TemplateNodeType.Text,
                        value: path.node.value
                    }

                    if (curElement)
                        curElement.childNodes.push(item);
                }

                else if (path.isStringLiteral() && curAttribute) {

                    curAttribute.value = path.node.value;
                }
       
                else if (path.isJSXExpressionContainer()) {

                    if (curAttribute)
                        curAttribute.value = path.get("expression").toString();
                    path.shouldSkip = true;
                }
                else if (path.isJSXFragment()) {

                }
                else if (path.isJSXSpreadAttribute() || path.isJSXSpreadChild()) {

                    const error = path.buildCodeFrameError("Spread operator not supported in tsx/jsx (es. <div {...props}/>");
                    throw error;
                }
            }
        });

        return result;
    }

    async compileStreamAsync(input: ReadStream | string, output: IWriteable) {

        const js = typeof input == "string" ? input : await readAllTextAsync(input);

        const ast = parser.parse(js, {
            sourceType: "module",
            plugins: ["jsx"]
        });

        const templates: NodePath<JSXElement>[] = [];

        trav(ast, {

            enter(path) {
                if (path.isJSXElement()) {
                    const elName = (path.node.openingElement.name as JSXIdentifier).name;
                    if (elName == "Template")
                        templates.push(path);
                    path.shouldSkip = true;
                }
            }
        });

        const ctx = new TemplateContext();
        ctx.compiler = this;
        ctx.jsNamespace = "WebApp";
        ctx.htmlNamespace = "t";
        ctx.writer = new TemplateWriter(output, ctx);

        for (const temp of templates) {

            const tempNode = this.parse(temp);

            ctx.writer.out.write(js.substring(0, temp.node.start));

            this.compileElement(ctx, tempNode);

            ctx.writer.out.write(js.substring(temp.node.end));
        } 
    }
}