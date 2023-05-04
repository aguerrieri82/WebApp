import { ReadStream } from "fs";
import {  ITemplateHandler } from "./Abstraction/ITemplateHandler";
import { TemplateContext } from "./TemplateContext";
import { TemplateWriter } from "./Text/TemplateWriter";
import type { IWriteable } from "./Abstraction/IWriteable";
import { JSDOM } from 'jsdom'
import { readAllTextAsync } from "./TextUtils";
import { BaseCompiler, ICompilerOptions } from "./BaseCompiler";
import { ITemplateElement, ITemplateText, TemplateNodeType } from "./Abstraction/ITemplateNode";

export class HtmlCompiler extends BaseCompiler {

    constructor(options?: ICompilerOptions) {

        super(options);

   
    }

    protected parse(text: string) {

        const root = new JSDOM(`<t:root xmlns:t="http://www.eusoft.net/webapp">${text}</t:root>`, {
            contentType: "application/xhtml+xml",
        });

        const result: ITemplateElement[] = [];

        const visitNode = (node: Node) => {

            if (node.nodeType == 1) {

                const item: ITemplateElement = {
                    type: TemplateNodeType.Element,
                    name: node.nodeName,
                    attributes: {},
                    childNodes: Array.from(node.childNodes).map(a => visitNode(a)).filter(a=> a !== undefined)
                }

                for (const attr of (node as Element).attributes)
                    item.attributes[attr.name] = {
                        name: attr.name,
                        value: attr.value,
                        type: TemplateNodeType.Attribute,
                        owner: item
                    };

                if (item.name.toLocaleLowerCase() == "t:template")
                    result.push(item);

                return item;
            }
            else if (node.nodeType == 3) {

                const item: ITemplateText = {
                    type: TemplateNodeType.Text,
                    value: node.nodeValue
                }

                return item;
            }
        }

        visitNode(root.window.document.documentElement);

        return result;
    }

    async compileStreamAsync(input: ReadStream|string, output: IWriteable) {

        try {
            const text = typeof input == "string" ? input : await readAllTextAsync(input);

            const templates = this.parse(text);
      
            const ctx = new TemplateContext();
            ctx.compiler = this;
            ctx.jsNamespace = "WebApp";
            ctx.htmlNamespace = "t";
            ctx.writer = new TemplateWriter(output, ctx);

            this.compileElements(ctx, templates);

            if (ctx.templates.length == 1)
                ctx.writer.ensureNewLine().write("export default ").write(ctx.templates[0]).write(";");

    
        }
        catch (ex) {
            console.log(ex);
            this.error(ex.toString());
        }
       
    }

  
}