import path from "path"
import { HtmlCompiler, JsxCompiler } from "@eusoft/webapp-compiler"
import MagicString from "magic-string";
export default function (options) {

    return {
        name: 'template-loader',

        async transform (code, id) {
            const ext = path.extname(id);

            if (ext == ".tsx" || ext == ".jsx") {

                const srcMap = new MagicString(code);

                const compiler = new JsxCompiler();

                let replace = [];

                compiler.error = msg => this.error(msg);

                compiler.warning = msg => this.warn(msg);

                compiler.onReplaces = v => replace = v;

                try {
                    const text = await compiler.compileTextAsync(code);

                    for (const rep of replace) {
                        srcMap.update(rep.src.start, rep.src.end, text.substring(rep.dst.start, rep.dst.end));
                    }

                    return {
                        code: text,
                        map: srcMap.generateMap({ hires: true })
                    }
                }
                catch (ex) {
                    this.error(ex);
                }
            }

            else if (ext == ".html") { 

                const compiler = new HtmlCompiler();

                compiler.error = msg => this.error(msg);

                compiler.warning = msg => this.warn(msg);

                const text = await compiler.compileTextAsync(code);

                return text;

            }
            return null; 
        }
    };
}
