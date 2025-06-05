import { type ReadStream } from "fs";
import { type IWriteable } from "./Abstraction/IWriteable.js";
import * as parser from "@babel/parser";
import traverse, { type NodePath } from "@babel/traverse";
import { readAllTextAsync } from "./TextUtils.js";
import { BaseCompiler, type ICompilerOptions } from "./BaseCompiler.js";
import { type JSXElement, type Identifier, type ImportDeclaration, type JSXFragment } from "@babel/types";
import { type ITemplateElement } from "./Abstraction/ITemplateNode.js";
import { CORE_MODULE } from "./Consts.js";
import { JsxParseContext } from "./Jsx/JsxParseContext.js";

const trav = (traverse as any).default as typeof import("@babel/traverse").default;

interface ITextBlock {
    start: number;
    end: number;
}
interface ITextReplacement {
    src: ITextBlock;
    dst: ITextBlock;
}



export class JsxCompiler extends BaseCompiler {

    constructor(options?: ICompilerOptions) {
        super(options);
        this.type = "Jsx";
    }

    protected parse(template: NodePath<JSXElement | JSXFragment>, toImport: string[]): ITemplateElement {

        const ctx = new JsxParseContext(this);

        const result = ctx.parse(template);

        for (const error of ctx.errors)
            this.error(error.message, error.path.node.loc.start);

        for (const imp of ctx.usedImports)
            if (!toImport.includes(imp))
                toImport.push(imp);

        return result;
    }

    onReplaces(replaces: ITextReplacement[]) {
        
    }


    async compileStreamAsync(input: ReadStream | string, output: IWriteable) {

        const js = typeof input == "string" ? input : await readAllTextAsync(input);
        const coreImports: string[] = [];
        const toImport: string[] = [];

        const getIndentLevel = (start: number) => {

            const startLine = js.lastIndexOf('\n', start) + 1;

            let i = startLine;
            while (true) {
                const c = js[i];
                if (c != ' ' && c != '\t')
                    break;
                i++;
            }

            return i - startLine;
        }

        const ast = parser.parse(js, {
            sourceType: "module",
            plugins: ["jsx", "typescript", "decorators"]
        });

        const templates: NodePath<JSXElement | JSXFragment>[] = [];


        trav(ast, {

            JSXFragment(path) {
                templates.push(path);
                path.shouldSkip = true;
            },


            ImportSpecifier(path) {

                const dec = path.findParent(a => a.isImportDeclaration()) as NodePath<ImportDeclaration>;

                if (dec.node.source?.value.startsWith(CORE_MODULE)) {

                    const local = path.get("local").node.name;
                    const imported = (path.get("imported").node as Identifier)?.name;
                    if (imported == local)
                        coreImports.push(imported);
                }
            },

            JSXElement(path) {
                templates.push(path);
                path.shouldSkip = true;
            }
        });

        const ctx = this.createContext(output);

        let curPos = 0;

        const replaces: ITextReplacement[] = [];

        //TODO: import are written before the parse, so i don't have toImport arrat
        const toImport2 = ["use", "cleanProxy", "template", "Bind"].filter(a => coreImports.indexOf(a) == -1);

        if (toImport2.length > 0)
            ctx.writer.writeImport("@eusoft/webapp-core", ...toImport2);

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

            const tempNode = this.parse(temp, toImport);

            const curLen = ctx.writer.length;

            const indentLevel = Math.ceil(getIndentLevel(temp.node.start) / 4);

            ctx.writer.indentLevel += indentLevel;
            ctx.writer.resetLine();

            this.compileElement(ctx, tempNode);

            ctx.writer.indentLevel -= indentLevel;

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