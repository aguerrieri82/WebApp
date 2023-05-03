import { ReadStream } from "fs";
import { HandleResult, ITemplateHandler } from "./Abstraction/ITemplateHandler";
import { TemplateContext } from "./TemplateContext";
import { TemplateWriter } from "./Text/TemplateWriter";
import type { IWriteable } from "./Abstraction/IWriteable";
import { JSDOM } from 'jsdom'
import { readAllTextAsync } from "./TextUtils";
import { BaseCompiler, ICompilerOptions } from "./BaseCompiler";
import * as handlers from "./Handlers";

export class TemplateCompiler extends BaseCompiler {

    protected _handlers: ITemplateHandler[] = [];
    constructor(options?: ICompilerOptions) {

        super(options);

        const activeHandlers = handlers as Record<string, { new(): ITemplateHandler }>;

        for (const name in activeHandlers) {
            this.register(new activeHandlers[name]());
        }
    }

    async compileStreamAsync(input: ReadStream|string, output: IWriteable) {

        try {
            const html = typeof input == "string" ? input : await readAllTextAsync(input);

            const root = new JSDOM(`<t:root xmlns:t="http://www.eusoft.net/webapp">${html}</t:root>`, {
                contentType: "application/xhtml+xml",
            });

            const ctx = new TemplateContext();
            ctx.compiler = this;
            ctx.jsNamespace = "WebApp";
            ctx.htmlNamespace = "t";
            ctx.writer = new TemplateWriter(output, ctx);
            ctx.writer.writeChildElements(root.window.document.documentElement);

            if (ctx.templates.length == 1)
                ctx.writer.ensureNewLine().write("export default ").write(ctx.templates[0]).write(";");
        }
        catch (ex) {
            console.log(ex);
            this.error(ex.toString());
        }
       
    }

    register(handler: ITemplateHandler) {

        this._handlers.push(handler);
    }

    getHandler(ctx: TemplateContext, node: Node) {
        return this._handlers.find(a => a.canHandle(ctx, node));
    }

    async compileAttribute(ctx: TemplateContext, attr: Attr) {

        var handler = this.getHandler(ctx, attr);
        if (!handler)
            this.warning(`no handler for attribute ${attr.name} in ${attr.ownerElement.nodeName}.`);
        else
            handler.handle(ctx, attr);
    }

    compileElements(ctx: TemplateContext, nodes: Iterable<Node>)
    {
        for(const node of nodes)
            this.compileElement(ctx, node);
    }

    compileElement(ctx: TemplateContext, node: Node) {
        const handler = this.getHandler(ctx, node);
        if (!handler) {
            this.warning(`no handler for ${node.nodeName}, skip to next.`);
            if (node.nextSibling)
                this.compileElement(ctx, node.nextSibling);
            else
                this.compileElements(ctx, node.childNodes);
        }
        else {
            ctx.enter(handler, node);
            const result = handler.handle(ctx, node);
            if (result == HandleResult.CompileChildren)
                this.compileElements(ctx, node.childNodes);
            ctx.exit();
 
        }
    }
}