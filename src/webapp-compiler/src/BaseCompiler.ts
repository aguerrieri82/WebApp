import * as path from "path";
import * as fs from "fs";
import { StringBuilder } from "./StringBuilder.js";
import { type IWriteable } from "./Abstraction/IWriteable.js";
import { stderr, stdout } from "process";
import { TemplateContext } from "./TemplateContext.js";
import type { ITemplateAttribute, ITemplateElement, ITemplateNode } from "./Abstraction/ITemplateNode.js";
import { HandleResult, type ITemplateHandler } from "./Abstraction/ITemplateHandler.js";
import * as handlers from "./Handlers/index.js";
import { TemplateWriter } from "./Text/TemplateWriter.js";

interface IErrorLocation {
    line: number;
    column: number;
}

export enum CompilerOutMode {
    Always,
    IfNew
}

export enum CompilerLanguage {
    Typescript,
    Javascript
}

export interface ICompilerExtension {
    component: string;
    builder: string | { (ctx: TemplateContext, element: ITemplateElement): HandleResult }
}    

export interface ICompilerOptions {

    includeWhitespace?: boolean;
    generateOutput?: CompilerOutMode;
    emitWarning?: boolean;
    language?: CompilerLanguage;
    autoTrack?: (string | RegExp)[];
    autoInline?: boolean;
    extensions?: ICompilerExtension[];
}

export abstract class BaseCompiler<TOptions extends ICompilerOptions = ICompilerOptions>  {

    protected _handlers: ITemplateHandler[] = [];

    constructor(options?: Partial<TOptions>) {

        this.options = {
            language: CompilerLanguage.Javascript,
            emitWarning: true,
            generateOutput: CompilerOutMode.Always,
            includeWhitespace: false,
            autoInline: true,
            autoTrack: ["state"],
            ...options
        } as TOptions;

        const activeHandlers = handlers as Record<string, { new(): ITemplateHandler }>;

        for (const name in activeHandlers) {
            this.register(new activeHandlers[name]());
        }
    }

    protected createContext(writer: IWriteable) {
        const ctx = new TemplateContext();
        ctx.compiler = this;
        ctx.jsNamespace = "WebApp";
        ctx.htmlNamespace = "t";
        ctx.writer = new TemplateWriter(writer, ctx);
        return ctx;
    }

    generateTemplate(root: ITemplateElement) {
        const ctx = this.createContext(new StringBuilder());
        ctx.writer.writeElement(root);
        return ctx.writer.out.toString();
    }

    error(msg: string, loc?: IErrorLocation) {
        stderr.write("ERR: " + msg + "\n");
    }

    warning(msg: string, loc?: IErrorLocation) {
        if (!this.options.emitWarning)
            return;
        stderr.write("WARN: " + msg + "\n");
    }

    async compileAsync(input: string, outputDir?: string, isStdOut: boolean = false) {

        const inputDir = path.dirname(input);

        if (!isStdOut) {

            if (!outputDir)
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

            if (this.options.generateOutput == CompilerOutMode.IfNew) {

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

    abstract compileStreamAsync(input: fs.ReadStream | string, output: IWriteable): Promise<void>;

    register(handler: ITemplateHandler) {

        this._handlers.push(handler);

        this._handlers.sort((a, b) => (a.priority ?? 0) - (b.priority ?? 0));
    }

    getHandler(ctx: TemplateContext, node: ITemplateNode) {
        return this._handlers.find(a => a.canHandle(ctx, node));
    }

    compileAttribute(ctx: TemplateContext, attr: ITemplateAttribute) {

        const handler = this.getHandler(ctx, attr);
        if (!handler)
            this.warning(`no handler for attribute ${attr.name} in ${attr.owner.name}.`);
        else
            handler.handle(ctx, attr);
    }

    compileElements(ctx: TemplateContext, nodes: Iterable<ITemplateNode>) {
        for (const node of nodes)
            this.compileElement(ctx, node);
    }

    compileElement(ctx: TemplateContext, node: ITemplateNode) {

        const handler = this.getHandler(ctx, node);

        if (!handler) {
            this.warning(`no handler for '${(node as ITemplateElement).name}'`);
        }
        else {

            if (ctx.isElement(node))
                ctx.enter(handler, node);

            const result = handler.handle(ctx, node);

            if (result == HandleResult.CompileChildren) 
                this.compileElements(ctx, (node as ITemplateElement).childNodes);
       
            if (ctx.isElement(node))
                ctx.exit();
        }
    }

    type: "Jsx" | "Html";

    readonly options: TOptions;

}