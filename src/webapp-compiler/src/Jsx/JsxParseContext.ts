import traverse, { NodePath, Visitor } from "@babel/traverse";
import { JSXElement, Expression, JSXEmptyExpression, Identifier, ImportDeclaration, JSXFragment, JSXIdentifier } from "@babel/types";
import { BindMode, ITemplateAttribute, ITemplateElement, ITemplateText, TemplateNodeType } from "../Abstraction/ITemplateNode";
import { CORE_MODULE, TemplateAttributes, TemplateElements } from "../Consts";
import type { JsxCompiler } from "../JsxCompiler";
import { toKebabCase } from "../TextUtils";
import * as parser from "@babel/parser";
import * as types from "@babel/types";


type JsxNodeHandler = {

    (ctx: JsxParseContext, stage: "trans-exp" | "enter" | "exp", path: NodePath): boolean;
}
interface IStack {
    element: ITemplateElement;
    model: Identifier;
    builder: string;
};

function TransfromNotModelRef(ctx: JsxParseContext, stage: "trans-exp", path: NodePath<Expression>) {

    if (stage != "trans-exp" /*|| ctx.curAttribute?.name.startsWith("t:on-")*/)
        return;

    if (!path.isMemberExpression())
        return;

    const obj = path.get("object");
    if (!obj.isIdentifier() && !obj.isThisExpression())
        return;

    const binding = path.scope.getBinding(obj.toString());

    if (binding && binding?.identifier == ctx.curModel)
        return;

    const builder = ctx.findBuilder(binding?.identifier);

    const exp = builder ? `${builder}.model` : obj.toString();

    if (ctx.curModel) 
        ctx.replaceNode(obj, `${ctx.curModel.name}[${ctx.useImport("USE")}](${exp})`);
    else
        ctx.replaceNode(obj, exp);


    path.shouldSkip = true;

    return true;
}

function JsxErrorHandler(ctx: JsxParseContext, stage: "enter", path: NodePath) : boolean {

    if (stage != "enter")
        return;

    if (ctx.curAttribute && (path.isJSXElement() || path.isJSXFragment())) 
        throw path.buildCodeFrameError("JSX element or fragment in attributes is not supported");

    if (path.isJSXSpreadAttribute() || path.isJSXSpreadChild()) 
        throw path.buildCodeFrameError("Spread operator not supported in tsx/jsx (es. <div {...props}/>");
}

function JsxOpenHandler(ctx: JsxParseContext, stage: "enter", path: NodePath): boolean {

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

function StringHandler(ctx: JsxParseContext, stage: "enter", path: NodePath): boolean {

    if (stage != "enter" || !path.isStringLiteral())
        return;

    if (ctx.curAttribute)
        ctx.curAttribute.value = JSON.stringify(path.node.value);
    else {
        ctx.curElement.childNodes.push({
            type: TemplateNodeType.Text,
            value: path.node.value
        });
    }

    return true;
}

function JsxTextHandler(ctx: JsxParseContext, stage: "enter", path: NodePath): boolean {

    if (stage != "enter" || !path.isJSXText())
        return;

    if (ctx.compiler.options.includeWhitespace || path.node.value.trim().length > 0) {

        const item: ITemplateText = {
            type: TemplateNodeType.Text,
            value: path.node.value
        }

        if (ctx.curElement)
            ctx.curElement.childNodes.push(item);
    }

    return true;
}

function JSXAttributeHandler(ctx: JsxParseContext, stage: "enter", path: NodePath): boolean {

    if (stage != "enter" || !path.isJSXAttribute())
        return;

    let name = (path.node.name as JSXIdentifier).name;

    if (ctx.curElement.name != "t:component")
        name = ctx.transformIntrinsicAttribute(name);

    ctx.curAttribute = ctx.createAttribute(name, null, ctx.curElement);

    if (!path.node.value)
        ctx.curAttribute.value = "true";

    return true;
}

function NestedTemplateHandler(ctx: JsxParseContext, stage: "trans-exp", path: NodePath): boolean {

    if (!(stage == "trans-exp" && ctx.curAttribute && (path.isJSXFragment() || path.isJSXElement())))
        return;

    const newCtx = new JsxParseContext(ctx.compiler);

    const root = newCtx.parse(path);

    const text = ctx.compiler.generateTemplate(root);

    ctx.replaceNode(path, text);

    ctx.curModel = null;
    
    return true;
}

function ExpressionHandler(ctx: JsxParseContext, stage: "enter", path: NodePath): boolean {

    if (stage != "enter" || path.isJSXFragment() || path.isJSXElement() || !path.isExpression())
        return;

    if (!ctx.curElement && !ctx.curAttribute)
        return;

    for (const handler of ctx.handlers) {
        if (handler(ctx, "exp", path))
            return;
    }

    let createBind = !ctx.isBinding(path) && ctx.isBindable();

    const bindMode = ctx.withModel(createBind ? ctx.curModel : null, () => ctx.transformExpression(path));

    if (bindMode == "no-bind" || bindMode == "action") {
        ctx.curModel = null;
        createBind = false;
    }

    let value = path.toString();

    if (createBind) {

        if (path.isObjectExpression())
            value = "(" + value + ")";

        value = ctx.curModel.name + " => " + value;
    }

    if (ctx.curAttribute) {
        ctx.curAttribute.value = value;
        ctx.curAttribute.bindMode = bindMode;
    }
    else {

        ctx.enterNewElement("t:content")
        ctx.createAttribute("src", value, ctx.curElement);
        ctx.exitElement();
    }

    path.shouldSkip = true;

    return true;
}

function ArrowTemplateExpressionHandler(ctx: JsxParseContext, stage: "exp", path: NodePath<Expression>): boolean {

    if (stage != "exp" || ctx.curAttribute)
        return;

    if (path.isArrowFunctionExpression() && ctx.isSingleElement(path.parentPath)) {
        const body = path.get("body");
        if (body.isJSXFragment() || body.isJSXElement()) {
    
            ctx.curModel = path.node.params[0] as Identifier;
            ctx.generateBuilder();
            if (ctx.curElement.name == "t:foreach" || ctx.curElement.name == "t:switch")
                ctx.createAttribute("as", ctx.curBuilder, ctx.curElement);
            return true;
        }
    }
}

function TransformEqualsExpressionHandler(ctx: JsxParseContext, stage: "trans-exp", path: NodePath<Expression>): boolean {

    if (stage != "trans-exp" || !path.isBinaryExpression())
        return;

    const op = path.node.operator;

    if (!(op == "==" || op == "===" || op == "!==" || op == "!="))
        return;

    const left = path.get("left");
    const right = path.get("right");

    if (ctx.hasModelRefs(left)) {
        left.replaceWith(types.callExpression(types.identifier(ctx.useImport("cleanProxy")), [left.node as Expression]));
    }

    if (ctx.hasModelRefs(right)) {
        right.replaceWith(types.callExpression(types.identifier(ctx.useImport("cleanProxy")), [right.node]));
    }

    return true;
    
}

function CondictionalExpressionHandler(ctx: JsxParseContext, stage: "exp", path: NodePath<Expression>): boolean {

    if (stage != "exp" || ctx.curAttribute || !path.isConditionalExpression())
        return;

    const curElement = ctx.curElement;

    ctx.enterNewElement("t:if");
    ctx.curAttribute = ctx.createAttribute("condition", null, ctx.curElement);

    path.get("test").visit();
    ctx.curAttribute = null;

    path.get("consequent").visit();

    ctx.enterNewElement("t:else");

    path.get("alternate").visit();

    while(ctx.curElement != curElement)
        ctx.exitElement();

    path.shouldSkip = true;

    return true;
}

function AndExpressionHandler(ctx: JsxParseContext, stage: "exp", path: NodePath<Expression>): boolean {

    if (stage != "exp" || ctx.curAttribute || !path.isLogicalExpression() || path.node.operator != "&&")
        return;

    const right = path.get("right");

    if (!right.isJSXFragment() && !right.isJSXElement())
        return;

    ctx.enterNewElement("t:if");
    ctx.curAttribute = ctx.createAttribute("condition", null, ctx.curElement);

    const left = path.get("left");
    left.visit();
    ctx.curAttribute = null;

    right.visit();

    ctx.exitElement();

    path.shouldSkip = true;

    return true;
}


export class JsxParseContext {

    constructor(compiler: JsxCompiler) {

        this.handlers.push(TransfromNotModelRef);
        this.handlers.push(JsxErrorHandler);
        this.handlers.push(JsxOpenHandler);
        this.handlers.push(NestedTemplateHandler);
        
        this.handlers.push(StringHandler);
        this.handlers.push(JsxTextHandler);
        this.handlers.push(JSXAttributeHandler);
        this.handlers.push(ExpressionHandler);
        this.handlers.push(ArrowTemplateExpressionHandler);
        this.handlers.push(CondictionalExpressionHandler);
        this.handlers.push(AndExpressionHandler);
        this.handlers.push(TransformEqualsExpressionHandler);
        
        this.compiler = compiler;
        this.usedImports = [];
    }

    withModel<T>(model: Identifier,  action: () => T) : T{
        const oldModel = this.curModel;
        this.curModel = model;
        const result = action();
        this.curModel = oldModel;
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

                if (params.length == 1 && params[0].isIdentifier())
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

    findBuilder(model: Identifier) {
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

    enterNewElement(name: string) {

        const newElement = this.createElement(name);

        if (!this.rootElement)
            this.rootElement = newElement;

        if (this.curElement)
            this.curElement.childNodes.push(newElement);

        this.stack.push({
            element: this.curElement,
            model: this.curModel,
            builder: this.curBuilder
        });

        this.curElement = newElement;

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
            this.curElement.name != "t:content" &&
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

    rootElement: ITemplateElement;

    curElement: ITemplateElement;

    curAttribute: ITemplateAttribute;

    curModel: Identifier;

    curBuilder: string;

    readonly usedImports: string[];

    readonly compiler: JsxCompiler;

    readonly stack: IStack[] = [];

    readonly handlers: JsxNodeHandler[] = [];
}