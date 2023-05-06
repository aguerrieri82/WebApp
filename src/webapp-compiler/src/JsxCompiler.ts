import { ReadStream } from "fs";
import { IWriteable } from "./Abstraction/IWriteable";
import * as parser from "@babel/parser";
import traverse, { NodePath, Visitor } from "@babel/traverse";
import { readAllTextAsync } from "./TextUtils";
import { BaseCompiler } from "./BaseCompiler";
import { JSXIdentifier, JSXElement, Expression, JSXEmptyExpression, Identifier, ImportDeclaration } from "@babel/types";
import { TemplateContext } from "./TemplateContext";
import { TemplateWriter } from "./Text/TemplateWriter";
import { BindMode, ITemplateAttribute, ITemplateElement, ITemplateText, TemplateNodeType } from "./Abstraction/ITemplateNode";
import {  TemplateAttributes, TemplateElements } from "./Consts";

const trav = (traverse as any).default as typeof traverse;

interface ITextBlock {
    start: number;
    end: number;
}

interface ITextReplacement {
    src: ITextBlock;
    dst: ITextBlock;
}

function traverseFromRoot<TNode>(path: NodePath<TNode>, visitor: Visitor & Record<string, any>, state?: object) {

    const expVisitor = traverse.visitors.explode(visitor) as any;

    if (expVisitor.enter?.length > 0)
        expVisitor.enter[0].call(state, path, state);

    if (path.shouldSkip) 
        path.shouldSkip = false;
    else 
        path.traverse(visitor, state);
    
    if (expVisitor.exit?.length > 0)
        expVisitor.exit[0].call(state, path, state);
}


export class JsxCompiler extends BaseCompiler {

    protected parse(template: NodePath<JSXElement>) : ITemplateElement {

        let curElement: ITemplateElement;

        let curAttribute: ITemplateAttribute;

        const stack: ITemplateElement[] = [];

        let result: ITemplateElement;

        template.shouldSkip = false;

        let defModel: Identifier;

        const rootName = template.get("openingElement").get("name").toString();

        if (rootName != "Template") {
            curElement = {
                attributes: {},
                name: "t:template",
                childNodes: [],
                type: TemplateNodeType.Element
            }

            result = curElement;
        }

        if (template.parentPath.isArrowFunctionExpression())
            defModel = template.parentPath.node.params[0] as Identifier;
        else {
            const func = template.getFunctionParent();
            const params = func.get("params");
            if (params.length == 1 && params[0].isIdentifier()) {

                defModel = params[0].node as Identifier;
            }
           
        }
           

        const createAttribute = (name: string, value: string, owner: ITemplateElement) => {
            const result = {
                name,
                owner: owner,
                type: TemplateNodeType.Attribute,
                value
            };
            owner.attributes[name] = result;
            return result;
        }

        const isBinding = (path: NodePath<Expression | JSXEmptyExpression>) => {

            if (path.isArrowFunctionExpression())
                return path.node.params.length == 1;

            return false;
        }

        const transformExpression = (exp: NodePath<Expression | JSXEmptyExpression>) => {

            let expModel: Identifier;

            let result: BindMode;

            if (exp.isArrowFunctionExpression())
                expModel = exp.node.params[0] as Identifier;

            if (exp.isCallExpression()) {
                const callee = exp.get("callee");
                if (callee.isIdentifier()) {
                    const resolve = exp.scope.getBinding(callee.node.name);
                    if (resolve && resolve.kind == "module") {
                        const parentModule = (resolve.path.parent as ImportDeclaration).source.value;
                        if (parentModule == "@eusoft/webapp-jsx") {
                            if (callee.node.name == "twoWay") {
                                exp.replaceWith(exp.node.arguments[0]);
                                result = "two-ways";
                            }
                        }
                    }
                }
        
            }

            traverseFromRoot(exp, {
                enter: path => {
                    if (path.isMemberExpression()) {
                        const obj = path.get("object");

                        if (obj.isIdentifier() || obj.isThisExpression()) {

                            const bindig = path.scope.getBinding(obj.toString());

                            if (bindig && bindig?.identifier == expModel || bindig?.identifier == defModel)
                                return;
                            const curModel = expModel ?? defModel;
                            obj.replaceWithSourceString(`${curModel.name}[USE](${obj})`);

                            path.shouldSkip = true;
                        }
 
                    }
                }
            });

            return result;
        }
         
        traverseFromRoot(template.parentPath, {

            exit: path => {

                if (path.isJSXAttribute())
                    curAttribute = null;

                if (path.isJSXElement()) {

                    if (curElement.name == "t:template")
                        result = curElement;

                    curElement = stack.pop(); 
                }
            },

            enter: path => {

                if (curAttribute && (path.isJSXElement() || path.isJSXFragment())) {

                    throw path.buildCodeFrameError("JSX element or fragment in attributes is not supported");
                }

                if (path.isJSXOpeningElement()) {

                    const elName = path.get("name").toString();

                    const binding = path.scope.getBinding(elName);

                    const isTempEl = TemplateElements.indexOf(elName) != -1;

                    const item: ITemplateElement = {
                        type: TemplateNodeType.Element,
                        name: isTempEl ? "t:" + elName.toLowerCase() : elName,
                        attributes: {},
                        childNodes: []
                    }

                    if (binding && !isTempEl) {
                        item.name = "t:component";
                        createAttribute("t:type", elName, item);
                    }

                    if (curElement)
                        curElement.childNodes.push(item);

                    stack.push(curElement);

                    curElement = item;
                }
                else if (path.isJSXAttribute()) {

                    let name = (path.node.name as JSXIdentifier).name;

                    if (curElement.name != "t:component") {

                        if (name.startsWith("on-") ||
                            name.startsWith("style-") ||
                            TemplateAttributes.indexOf(name) != -1)
                            name = "t:" + name;

                        else if (name == "className")
                            name = "t:class";
                    }
    

                    curAttribute = createAttribute(name, null, curElement);
                }
                else if (path.isJSXText()) {

                    if (this.options.includeWhitespace || path.node.value.trim().length > 0) {

                        const item: ITemplateText = {
                            type: TemplateNodeType.Text,
                            value: path.node.value
                        }

                        if (curElement)
                            curElement.childNodes.push(item);
                    }

                }

                else if (path.isStringLiteral() && curAttribute) {

                    curAttribute.value = JSON.stringify(path.node.value);
                }
       
                else if (path.isJSXExpressionContainer()) {

                    const exp = path.get("expression");

                    const bindMode = transformExpression(exp);

                    let value = exp.toString();

                    if (!isBinding(exp) && curAttribute?.name != "t:value-pool") 
                        value = defModel.name + " => " + value;
                    
                    if (curAttribute) {

                        curAttribute.value = value;
                        curAttribute.bindMode = bindMode;
                    }
                    else {

                        const contentElement = {
                            type: TemplateNodeType.Element,
                            name: "t:content",
                            attributes: {},
                            childNodes: []
                        } as ITemplateElement;

                        createAttribute("src", value, contentElement);

                        curElement.childNodes.push(contentElement);
                    }
                    path.shouldSkip = true;
                }
                else if (path.isJSXFragment()) {

                }
                else if (path.isJSXSpreadAttribute() || path.isJSXSpreadChild()) {

                    throw path.buildCodeFrameError("Spread operator not supported in tsx/jsx (es. <div {...props}/>");
                }
            }
        });

        return result;
    }

    onReplaces(replaces: ITextReplacement[]) {

    }

    async compileStreamAsync(input: ReadStream | string, output: IWriteable) {

        const js = typeof input == "string" ? input : await readAllTextAsync(input);
        
        const ast = parser.parse(js, {
            sourceType: "module",
            plugins: ["jsx", "typescript"]
        });

        const templates: NodePath<JSXElement>[] = [];

        trav(ast, {

            JSXElement(path) {
                templates.push(path);
                path.shouldSkip = true;
            }
        });

        const ctx = new TemplateContext();
        ctx.compiler = this;
        ctx.jsNamespace = "WebApp";
        ctx.htmlNamespace = "t";
        ctx.writer = new TemplateWriter(output, ctx);

        let curPos = 0;

        const replaces: ITextReplacement[] = [];

        ctx.writer.writeImport("@eusoft/webapp-core", "USE");

        replaces.push({
            src: {
                start: 0,
                end: 0
            },
            dst: {
                start: 0,
                end: ctx.writer.length
            }
        });

        for (const temp of templates) {

            if (temp.node.start != curPos)
                ctx.writer.writeRaw(js.substring(curPos, temp.node.start));

            const tempNode = this.parse(temp);

            const curLen = ctx.writer.length;
          
            this.compileElement(ctx, tempNode);

            replaces.push({
                src: {
                    start: temp.node.start,
                    end: temp.node.end
                },
                dst: {
                    start: curLen,
                    end: ctx.writer.length
                }
            });

            curPos = temp.node.end;
        } 

        ctx.writer.writeRaw(js.substring(curPos));

        this.onReplaces(replaces);
    }
}