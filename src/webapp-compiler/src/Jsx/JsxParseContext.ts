
import { JSXElement, Expression, JSXEmptyExpression, Identifier, ImportDeclaration, JSXFragment, ThisExpression, identifier } from "@babel/types";
import { BindMode, ITemplateAttribute, ITemplateElement, TemplateNodeType } from "../Abstraction/ITemplateNode.js";
import { CORE_MODULE, TemplateAttributes } from "../Consts.js";
import type { JsxCompiler } from "../JsxCompiler.js";
import { toKebabCase } from "../TextUtils.js";
import TransfromNotModelRef from "./Transform/TransfromNotModelRef.js";
import JsxErrorHandler from "./Elements/JsxErrorHandler.js";
import JsxOpenHandler from "./Elements/JsxOpenHandler.js";
import JsxStringHandler from "./Elements/JsxStringHandler.js";
import JsxTextHandler from "./Elements/JsxTextHandler.js";
import JsxAttributeHandler from "./Elements/JsxAttributeHandler.js";
import ArrowTemplateExpressionHandler from "./Expression/ArrowTemplateExpressionHandler.js";
import ConditionalExpressionHandler from "./Expression/ConditionalExpressionHandler.js";
import AndExpressionHandler from "./Expression/AndExpressionHandler.js";
import TransformEqualsHandler from "./Transform/TransformEqualsHandler.js";
import JsxExpressionHandler from "./Elements/JsxExpressionHandler.js";
import TransformNestedTemplateHandler from "./Transform/TransformNestedTemplateHandler.js";
import ForeachExpressionHandler from "./Expression/ForeachExpressionHandler.js";
import JsxSpreadHandler from "./Elements/JsxSpreadHandler.js";

import traverse, { NodePath, Visitor } from "@babel/traverse";
import * as parser from "@babel/parser";
interface ICompileError {
    path: NodePath;
    message: string;
}


type JsxNodeHandler = {

    (ctx: JsxParseContext, stage: "trans-exp" | "enter" | "exp", path: NodePath): boolean;
}
interface IStack {
    element: ITemplateElement;
    model: Identifier;
    builder: string;
};

export class JsxParseContext {

    constructor(compiler: JsxCompiler) {

        this.handlers.push(TransfromNotModelRef);
        this.handlers.push(JsxErrorHandler);
        this.handlers.push(JsxOpenHandler);
        this.handlers.push(TransformNestedTemplateHandler);   
        this.handlers.push(JsxStringHandler);
        this.handlers.push(JsxTextHandler);
        this.handlers.push(JsxAttributeHandler);
        this.handlers.push(JsxExpressionHandler);
        this.handlers.push(JsxSpreadHandler);
        this.handlers.push(ArrowTemplateExpressionHandler);
        this.handlers.push(ConditionalExpressionHandler);
        this.handlers.push(AndExpressionHandler);
        this.handlers.push(ForeachExpressionHandler);
        this.handlers.push(TransformEqualsHandler);
        
        this.compiler = compiler;
        this.usedImports = [];
    }

    withModel<T>(model: Identifier, ignoreCurModel: boolean, action: () => T) : T{
        const oldModel = this.curModel;
        const oldIgnore = this.ignoreCurModel;
        this.curModel = model;
        this.ignoreCurModel = ignoreCurModel;
        const result = action();
        this.curModel = oldModel;
        this.ignoreCurModel = oldIgnore;
        return result;
    }

    isTemplateDefinition(path: NodePath) {

        if (path.isArrowFunctionExpression()) {
            const context = path.parentPath;
            if (context.isCallExpression()) {
                var callee = context.get("callee");
                if (callee.isIdentifier() && callee.node.name == "forModel") {
                    const params = path.get("params");
                    if (params.length > 0 && params[0].isIdentifier())
                        return params[0].node;
                }
            }
        }
    }

    parse(template: NodePath<JSXElement | JSXFragment>): ITemplateElement  {

        const rootName = template.isJSXElement() && template.get("openingElement").get("name").toString();

        const parentPath = template.parentPath;

        const tempModel = this.isTemplateDefinition(parentPath);

        if (tempModel) {

            this.curModel = tempModel;
        }
        else {

            const func = template.getFunctionParent();

            if (func && func.type != "ArrowFunctionExpression") {
          
                const params = func.get("params");

                //Skip lowercase
                let isFuncComp = true;

                if (func.isFunctionDeclaration()) {
                    const id = func.get("id");
                    if (id.isIdentifier() && id.node.name[0] == id.node.name[0].toLowerCase())
                        isFuncComp = false; 
                }
   
                if (isFuncComp && params.length == 1 && params[0].isIdentifier())
                    this.curModel = params[0].node as Identifier;
            }
        }

        this.generateBuilder();

        if (rootName != "Template")
            this.enterNewElement("t:template");

        this.traverseFromRoot(template, {

            enter: path => {

                if (path.shouldStop)
                    debugger;

                for (const handler of this.handlers) {
                    if (handler(this, "enter", path))
                        return;
                }
            },

            exit: path => {
      
                if (path.isJSXAttribute())
                    this.curAttribute = null;

                else if (path.isJSXElement() || path.isJSXFragment()) 
                    this.exitElement();

            }
        });

        return this.rootElement;

    }

    findThisBindind(path: NodePath<ThisExpression>) {
        let curPath: NodePath = path;

        let arrowFound = false;
        let jsxFound = false;

        while (true) {

            curPath = curPath.parentPath;

            if (!curPath)
                return;

            if (curPath.isArrowFunctionExpression() && !jsxFound)
                arrowFound = true;

            if (curPath.isFunctionExpression() || curPath.isFunctionDeclaration())
                return;
            /*
            if (curPath.isJSXExpressionContainer())
                jsxFound = true;
            */

            if (curPath.isClassMethod())
                break;
        }

        if (arrowFound) {
            return {
                identifier: identifier("this"),
                kind: "unknown",
                path: curPath,
                scope: curPath.scope
            };
        }
    }

    findBuilder(model: Identifier, includeCurrent = false) {

        if (includeCurrent && this.curModel == model)
            return this.curBuilder; 

        for (let i = this.stack.length - 1; i >= 0; i--) {
            if (this.stack[i].model == model)
                return this.stack[i].builder;
        }
    }

    transformExpression(exp: NodePath<Expression | JSXEmptyExpression>) {

        let result: BindMode;   

        const curModel = this.curModel;

        const tempModel = this.isTemplateDefinition(exp);

        if (tempModel)
            this.curModel = tempModel;

        const helper = this.getHelper(exp);

        if (helper?.name == "twoWays" || helper?.name == "noBind" || helper?.name == "oneWay" || helper?.name == "action") {
            exp.replaceWith(helper.body);
            result = toKebabCase(helper.name) as BindMode;
        }

        this.traverseFromRoot(exp, {
            enter: path => {
                for (const handler of this.handlers) {
                    if (handler(this, "trans-exp", path))
                        return;
                }
            }
        });

        this.curModel = curModel;

        return result;
    }

    tryEnterElement(newElement: ITemplateElement) {

        if (this.curElement == newElement)
            return;

        this.stack.push({
            element: this.curElement,
            model: this.curModel,
            builder: this.curBuilder
        });

        this.curElement = newElement;
    }

    enterNewElement(name: string) {

        const newElement = this.createElement(name);

        if (!this.rootElement)
            this.rootElement = newElement;

        if (this.curElement)
            this.curElement.childNodes.push(newElement);

        this.tryEnterElement(newElement);

        if (name == "t:template")
            this.createAttribute("as", this.curBuilder, this.curElement);

        return newElement;
    }

    exitElement() {
        const pop = this.stack.pop();
        this.curElement = pop?.element;
        this.curModel = pop?.model;
        this.curBuilder = pop?.builder;
    }

    traverseFromRoot<TNode>(path: NodePath<TNode>, visitor: Visitor & Record<string, any>, state?: object) {

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

    createAttribute(name: string, value: string, owner: ITemplateElement) {
        const result = {
            name,
            owner: owner,
            type: TemplateNodeType.Attribute,
            value
        } as ITemplateAttribute;
        owner.attributes[name] = result;
        return result;
    }

    createElement(name: string) {
        const result = {
            type: TemplateNodeType.Element,
            name,
            attributes: {},
            childNodes: []
        } as ITemplateElement;
        return result;
    }

    isBindable() {
        return this.curModel &&
            (this.curElement.name != "t:content" || this.curAttribute?.name == "src") &&
            this.curAttribute?.name != "t:value-pool" &&
            !this.curAttribute?.name.startsWith("t:on-") &&
            this.curAttribute?.name != "t:behavoir";
    }

    isBinding(path: NodePath<Expression | JSXEmptyExpression>) {

        if (path.isArrowFunctionExpression())
            return path.node.params.length == 1;

        return false;
    }

    transformIntrinsicAttribute(name: string) {

        if (name.startsWith("on-") ||
            name.startsWith("style-") ||
            TemplateAttributes.indexOf(name) != -1)

        return "t:" + name;

        if (name == "className")
            return "t:class";

        return name;
    }

    isSingleElement(path: NodePath) {

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

    getHelper(exp: NodePath<Expression | JSXEmptyExpression>) {

        if (!exp.isCallExpression())
            return;

        const callee = exp.get("callee");
        if (!callee.isMemberExpression())
            return;

        const object = callee.get("object");
        const prop = callee.get("property");
        if (!prop.isIdentifier() || !object.isIdentifier() || object.node.name != "Bind")
            return;

        const resolve = exp.scope.getBinding(object.node.name);
        if (!resolve || resolve.kind != "module")
            return;

        const parentModule = (resolve.path.parent as ImportDeclaration).source.value;
        if (parentModule.startsWith(CORE_MODULE)) {
            return {
                name: prop.node.name,
                body: exp.node.arguments[0]
            }
        }
    }

    hasModelRefs(exp: NodePath) {

        let result = false;

        let stopPoint: NodePath;

        this.traverseFromRoot(exp, {

            enter: path => {

                if (!path.isIdentifier())
                    return;

                const binding = path.scope.getBinding(path.toString());
                if (!binding)
                    return;

                const builder = this.findBuilder(binding.identifier, true);

                if (builder) {
                    result = true;
                    stopPoint = path;
                    path.stop();
                }
            }
        });

        if (stopPoint) {
            stopPoint["_traverseFlags"] = 0;
        }


        return result;
    }

    /*
    hasModelRefs(exp: NodePath) {

        let result = false;

        this.traverseFromRoot(exp, {
            enter: path => {
                if (path.isIdentifier()) {

                    const binding = path.scope.getBinding(path.toString());
                    if (!binding)
                        return;

                    const builder = this.findBuilder(binding.identifier);

                    if (builder) {
                        result = true;
                        exp.shouldStop = true;
                    }
                }
            }
        });

        return result;
    }
    */

    generateBuilder() {
        this.curBuilder = "t" + (this.stack.length > 0 ? this.stack.length : "");
    }

    replaceNode(obj: NodePath, text: string) {

        const ast = parser.parse(text, {
            sourceType: "module",
            plugins: ["jsx", "typescript"]
        });

        obj.replaceWith(ast.program.body[0]);
    }

    useImport(name: string) {
        if (this.usedImports.indexOf(name) == -1)
            this.usedImports.push(name);
        return name;
    }

    error(path: NodePath, message: string) {

        this.errors.push({
            path,
            message
        });
        return undefined;
    }

    errors: ICompileError[] = [];

    rootElement: ITemplateElement;

    curElement: ITemplateElement;

    curAttribute: ITemplateAttribute;

    curModel: Identifier;

    ignoreCurModel: boolean;

    curBuilder: string;

    readonly usedImports: string[];

    readonly compiler: JsxCompiler;

    readonly stack: IStack[] = [];

    readonly handlers: JsxNodeHandler[] = [];
}

