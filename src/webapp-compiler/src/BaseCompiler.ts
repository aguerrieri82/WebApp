import * as path from "path";
import * as fs from "fs";
import { StringBuilder } from "./StringBuilder";
import { IWriteable } from "./Abstraction/IWriteable";
import { stderr, stdout } from "process";
import { TemplateContext } from "./TemplateContext";
import type { ITemplateAttribute, ITemplateElement, ITemplateNode } from "./Abstraction/ITemplateNode";
import { HandleResult, ITemplateHandler } from "./Abstraction/ITemplateHandler";

export enum CompilerOutMode {
    Always,
    IfNew
}
export enum CompilerLanguage {
    Typescript,
    Javascript
}

export interface ICompilerOptions {

    includeWhitespace?: boolean;
    generateOutput?: CompilerOutMode;
    emitWarning?: boolean;
    language?: CompilerLanguage;
}

export abstract class BaseCompiler<TOptions extends ICompilerOptions = ICompilerOptions>  {

    protected _handlers: ITemplateHandler[] = [];

    constructor(options?: TOptions) {

        this.options = options ?? {
            language: CompilerLanguage.Javascript,
            emitWarning: true,
            generateOutput: CompilerOutMode.Always,
            includeWhitespace: false
        } as TOptions;
    }

    error(msg: string) {
        stderr.write("ERR: " + msg + "\n");
    }

    warning(msg: string) {
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
   
            const result = handler.handle(ctx, node);
            if (result == HandleResult.CompileChildren && ctx.isElement(node)) {
                ctx.enter(handler, node);
                this.compileElements(ctx, node.childNodes);
                ctx.exit();
            }
  
        }
    }

    readonly options: TOptions;

}