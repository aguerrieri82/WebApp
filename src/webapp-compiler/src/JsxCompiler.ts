import { ReadStream } from "fs";
import { IWriteable } from "./Abstraction/IWriteable";
import * as parser from "@babel/parser";
import {  types } from "@babel/core";
import traverse, { NodePath, Visitor } from "@babel/traverse";
import { readAllTextAsync } from "./TextUtils";
import { BaseCompiler } from "./BaseCompiler";
import { JSXIdentifier, JSXElement, Expression, JSXEmptyExpression, Identifier, ImportDeclaration, JSXFragment } from "@babel/types";
import { TemplateContext } from "./TemplateContext";
import { TemplateWriter } from "./Text/TemplateWriter";
import { BindMode, ITemplateAttribute, ITemplateElement, ITemplateText, TemplateNodeType } from "./Abstraction/ITemplateNode";
import { TemplateAttributes, TemplateElements } from "./Consts";

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

function createAttribute(name: string, value: string, owner: ITemplateElement) {
    const result = {
        name,
        owner: owner,
        type: TemplateNodeType.Attribute,
        value
    } as ITemplateAttribute;
    owner.attributes[name] = result;
    return result;
}

function createElement(name: string) {
    const result = {
        type: TemplateNodeType.Element,
        name,
        attributes: {},
        childNodes: []
    } as ITemplateElement;
    return result;
}

function isBinding(path: NodePath<Expression | JSXEmptyExpression>) {

    if (path.isArrowFunctionExpression())
        return path.node.params.length == 1;

    return false;
}

function isSingleElement(path: NodePath) {

    const parent = path.parentPath as NodePath<JSXFragment>;

    if (!(parent.isJSXElement() || parent.isJSXFragment()))
        return;

    let count = 0;
    for (const child of parent.get("children")) {
        if (child.isJSXText()) {
            if (child.node.value.trim().length == 0)
                continue;
        }
        count++;
    }
    return count == 1;
}

function getHelper(exp: NodePath<Expression | JSXEmptyExpression>) {

    if (!exp.isCallExpression())
        return;

    const callee = exp.get("callee");
    if (!callee.isIdentifier())
        return;

    const resolve = exp.scope.getBinding(callee.node.name);
    if (!resolve || resolve.kind != "module")
        return;

    const parentModule = (resolve.path.parent as ImportDeclaration).source.value;
    if (parentModule == "@eusoft/webapp-jsx") {
        return {
            name: callee.node.name,
            body: exp.node.arguments[0]
        }
    }
}

export class JsxCompiler extends BaseCompiler {

    protected parse(template: NodePath<JSXElement | JSXFragment>): ITemplateElement {

        interface IStack {
            element: ITemplateElement;
            defModel: Identifier;
        };

        const stack: IStack[] = [];

        let curElement: ITemplateElement;

        let curAttribute: ITemplateAttribute;

        let rootElement: ITemplateElement;

        let defModel: Identifier;

        function enterNewElement(name: string) {

            const newElement = createElement(name);

            if (curElement)
                curElement.childNodes.push(newElement);

            stack.push({
                element: curElement,
                defModel
            });

            curElement = newElement;

            return newElement;
        }

        function exitElement() {
            const pop = stack.pop();
            curElement = pop?.element;
            defModel = pop?.defModel;
        }

        function transformExpression(exp: NodePath<Expression | JSXEmptyExpression>)  {

            let expModel: Identifier;

            let result: BindMode;

            if (exp.isArrowFunctionExpression())
                expModel = exp.node.params[0] as Identifier;

            const helper = getHelper(exp);
            if (helper?.name == "twoWays") {
                exp.replaceWith(helper.body);
                result = "two-ways";
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

        template.shouldSkip = false;

        const rootName = template.isJSXElement() && template.get("openingElement").get("name").toString();

        if (rootName != "Template") 
            rootElement = enterNewElement("t:template");
        
        if (template.parentPath.isArrowFunctionExpression())
            defModel = template.parentPath.node.params[0] as Identifier;

        else {
            const func = template.getFunctionParent();
            const params = func.get("params");
            if (params.length == 1 && params[0].isIdentifier()) {

                defModel = params[0].node as Identifier;
            }
        }


        traverseFromRoot(template, {

            exit: path => {

                if (path.isJSXAttribute())
                    curAttribute = null;

                else if (path.isJSXElement() || path.isJSXFragment()) {

                    if (curElement.name == "t:template")
                        rootElement = curElement;

                    exitElement();
                }
            },

            enter: path => {

                if (curAttribute && (path.isJSXElement() || path.isJSXFragment())) {

                    throw path.buildCodeFrameError("JSX element or fragment in attributes is not supported");
                }

                if (path.isJSXOpeningElement()) {

                    const elName = path.get("name").toString();

                    const elBinding = path.scope.getBinding(elName);

                    const isTempEl = TemplateElements.indexOf(elName) != -1;

                    const newElement = enterNewElement(isTempEl ? "t:" + elName.toLowerCase() : elName);

                    if (elBinding && !isTempEl) {
                        newElement.name = "t:component";
                        createAttribute("t:type", elName, newElement);
                    }
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

                    if (!path.node.value)
                        curAttribute.value = "true";
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

                else if (path.isStringLiteral()) {

                    if (curAttribute)
                        curAttribute.value = JSON.stringify(path.node.value);
                    else {
                        curElement.childNodes.push({
                            type: TemplateNodeType.Text,
                            value: path.node.value
                        });
                    }
                }

                else if (path.isExpression() && !path.isJSXFragment() && !path.isJSXElement()) {

                    if (!curElement && !curAttribute)
                        return;

                    if (!curAttribute) {

                        if (path.isArrowFunctionExpression() && isSingleElement(path.parentPath)) {

                            const body = path.get("body");
                            if (body.isJSXFragment() || body.isJSXElement()) {
                                defModel = path.node.params[0] as Identifier;
                                return;
                            }
                        }

                        if (path.isConditionalExpression()) {

                            enterNewElement("t:if");
                            curAttribute = createAttribute("condition", null, curElement);

                            path.get("test").visit();
                            curAttribute = null;

                            path.get("consequent").visit();

                            enterNewElement("t:else");

                            path.get("alternate").visit();

                            exitElement();

                            exitElement();

                            path.shouldSkip = true;

                            return;
                        }
                    }

                    if (path.isLogicalExpression() && path.node.operator == "&&") {
                        const right = path.get("right");

                        if (right.isJSXFragment() || right.isJSXElement()) {

                            enterNewElement("t:if");
                            curAttribute = createAttribute("condition", null, curElement);

                            const left = path.get("left");
                            left.visit();
                            curAttribute = null;

                            right.visit();

                            exitElement();

                            path.shouldSkip = true;

                            return;
                        }
                    }

                    const bindMode = transformExpression(path);

                    let value = path.toString();

                    if (!isBinding(path) &&
                        curAttribute?.name != "t:value-pool" &&
                        !curAttribute?.name.startsWith("t:on-") && 
                        curAttribute?.name != "t:behavoir")

                        value = defModel.name + " => " + value;

                    if (curAttribute) {

                        curAttribute.value = value;
                        curAttribute.bindMode = bindMode;
                    }
                    else {

                        enterNewElement("t:content")
                        createAttribute("src", value, curElement);
                        exitElement();
                    }
                    path.shouldSkip = true;
                }
                else if (path.isJSXSpreadAttribute() || path.isJSXSpreadChild()) {

                    throw path.buildCodeFrameError("Spread operator not supported in tsx/jsx (es. <div {...props}/>");
                }
            }
        });

        return rootElement;
    }

    onReplaces(replaces: ITextReplacement[]) {

    }

    async compileStreamAsync(input: ReadStream | string, output: IWriteable) {

        const js = typeof input == "string" ? input : await readAllTextAsync(input);

        const ast = parser.parse(js, {
            sourceType: "module",
            plugins: ["jsx", "typescript"]
        });

        const templates: NodePath<JSXElement | JSXFragment>[] = [];

        trav(ast, {

            JSXFragment(path) {
                templates.push(path);
                path.shouldSkip = true;
            },

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

        ctx.writer.writeImport("@eusoft/webapp-core", "USE", "PARENT");

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