import { type ReadStream } from "fs";
import type { IWriteable } from "./Abstraction/IWriteable.js";
import { JSDOM } from 'jsdom'
import { readAllTextAsync } from "./TextUtils.js";
import { BaseCompiler, type ICompilerOptions } from "./BaseCompiler.js";
import { type ITemplateElement, type ITemplateText, TemplateNodeType } from "./Abstraction/ITemplateNode.js";

export class HtmlCompiler extends BaseCompiler {

    constructor(options?: ICompilerOptions) {

        super(options);

        this.type = "Html";
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
      
            const ctx = this.createContext(output);

            ctx.writer.writeImport("@eusoft/webapp-core", "USE", "PARENT");

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