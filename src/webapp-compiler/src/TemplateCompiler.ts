import { ReadStream } from "fs";
import { HandleResult, ITemplateHandler } from "./Abstraction/ITemplateHandler";
import { TemplateContext } from "./TemplateContext";
import { TemplateWriter } from "./Text/TemplateWriter";
import * as path from "path";
import * as fs from "fs";
import { stderr, stdout } from "process";
import type { IWriteable } from "./Abstraction/IWriteable";
import { JSDOM } from 'jsdom'
import TemplateElementHandler from "./Handlers/TemplateElementHandler";
import ElementHandler from "./Handlers/ElementHandler";
import AttributeHandler from "./Handlers/AttributeHandler";
import IfElementHandler from "./Handlers/IfElementHandler";
import TextNodeHandler from "./Handlers/TextNodeHandler";
import ClassElementHandler from "./Handlers/ClassElementHandler";
import OnAttributeHandler from "./Handlers/OnAttributeHandler";
import FuncAttributeHandler from "./Handlers/FuncAttributeHandler";
import ContentElementHandler from "./Handlers/ContentElementHandler";
import BehavoirElementHandler from "./Handlers/BehavoirElementHandler";
import ForeachElementHandler from "./Handlers/ForeachElementHandler";
import BehavoirAttributeHandler from "./Handlers/BehavoirAttributeHandler";
import BindingAttributeHandler from "./Handlers/BindingAttributeHandler";
import HtmlElementHandler from "./Handlers/HtmlElementHandler";
import NodeElementHandler from "./Handlers/NodeElementHandler";
import StyleAttributeHandler from "./Handlers/StyleAttributeHandler";
import { StringBuilder } from "./StringBuilder";

export enum TemplateOutputMode {
    Always,
    IfNew
}

export enum TemplateLanguage {
    Typescript,
    Javascript
}

interface ITemplateCompilerOptions {

    includeWhitespace?: boolean;
    generateOutput?: TemplateOutputMode;
    emitWarning?: boolean;
    language?: TemplateLanguage;
}

export class TemplateCompiler {

    protected _handlers: ITemplateHandler[] = [];


    constructor(options?: ITemplateCompilerOptions) {

        this.options = options ?? {
            language: TemplateLanguage.Javascript,
            emitWarning: true,
            generateOutput: TemplateOutputMode.Always,
            includeWhitespace: false
        };

        this.register(new TemplateElementHandler());
        this.register(new ElementHandler());
        this.register(new BehavoirAttributeHandler());
        this.register(new AttributeHandler());
        this.register(new IfElementHandler());
        this.register(new TextNodeHandler());
        this.register(new ClassElementHandler());
        this.register(new OnAttributeHandler());
        this.register(new FuncAttributeHandler());
        this.register(new BindingAttributeHandler());
        this.register(new ContentElementHandler());
        this.register(new BehavoirElementHandler());
        this.register(new ForeachElementHandler());
        this.register(new HtmlElementHandler());
        this.register(new NodeElementHandler());
        this.register(new StyleAttributeHandler());
    }

    error(msg: string) {
        stderr.write("ERR: " + msg + "\n");
    }

    warning(msg: string) {
        if (!this.options.emitWarning)
            return;
        stderr.write("WARN: " + msg + "\n");
    }

    protected async readAllTextAsync(stream: ReadStream) {

        const chunks: Buffer[] = [];

        for await (let chunk of stream) {
            chunks.push(chunk);
        }

        return Buffer.concat(chunks).toString();
    }



    async compileAsync(input: string, outputDir?: string, isStdOut: boolean = false) {

        const inputDir = path.dirname(input);

        if (!isStdOut) {

            if (!outputDir )
                outputDir = inputDir;

            if (!fs.existsSync(outputDir))
                fs.mkdirSync(outputDir);
        }

        const stats = fs.statSync(input);

        let files: string[];
         
        if (stats.isDirectory()) 
            files = fs.readdirSync(input).map(a => path.join(input, a));
        else
            files = [input];

        for (const file of files) 
            await this.compileFileAsync(file, isStdOut ? null : path.join(outputDir, path.basename(file, ".ts")));
    }

    async compileFileAsync(input: string, output: string) {

        if (!fs.existsSync(input)) {
            this.error(`Template file '${input}' not found.`);
            return;
        }
        const inStream = fs.createReadStream(input);

        if (!output) {
            await this.compileStreamAsync(inStream, stdout);
        }
        else {

            if (this.options.generateOutput == TemplateOutputMode.IfNew) {

                if (fs.existsSync(output) && fs.statSync(output).mtime >= fs.statSync(input).mtime)
                    return;
            }

            if (fs.existsSync(output))
                fs.rmSync(output);
            const outStream = fs.createWriteStream(output);
            this.compileStreamAsync(inStream, outStream);
            outStream.close();
        }

        inStream.close();
    }

    async compileTextAsync(input: string) {

        const out = new StringBuilder();

        await this.compileStreamAsync(input, out);

        return out.toString();
    }

    async compileStreamAsync(input: ReadStream|string, output: IWriteable) {

        const html = typeof input == "string" ? input : await this.readAllTextAsync(input);

        const root = new JSDOM(`<t:root xmlns:t="http://www.eusoftnet/webapp">${html}</t:root>`, {
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

    readonly options: ITemplateCompilerOptions;
}