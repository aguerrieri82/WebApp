import { ReadStream } from "fs";
import { IWriteable } from "./Abstraction/IWriteable";
import * as parser from "@babel/parser";
import traverse, { NodePath } from "@babel/traverse";
import { readAllTextAsync } from "./TextUtils";
import { BaseCompiler, ICompilerOptions } from "./BaseCompiler";
import { JSXElement, Identifier, ImportDeclaration, JSXFragment } from "@babel/types";
import { ITemplateElement } from "./Abstraction/ITemplateNode";
import { CORE_MODULE } from "./Consts";
import { JsxParseContext } from "./Jsx/JsxParseContext";

const trav = (traverse as any).default as typeof traverse;

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

    protected parse(template: NodePath<JSXElement | JSXFragment>): ITemplateElement {

        const ctx = new JsxParseContext(this);

        return ctx.parse(template);
    }

    onReplaces(replaces: ITextReplacement[]) {

    }


    async compileStreamAsync(input: ReadStream | string, output: IWriteable) {

        const js = typeof input == "string" ? input : await readAllTextAsync(input);
        const coreImports: string[] = [];

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

                if (dec.node.source?.value == CORE_MODULE) {

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

        const toImport = ["USE", "cleanProxy"].filter(a => coreImports.indexOf(a) == -1);

        if (toImport.length > 0)
            ctx.writer.writeImport("@eusoft/webapp-core", ...toImport);

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