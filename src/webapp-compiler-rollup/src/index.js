import path from "path"
import { HtmlCompiler, JsxCompiler } from "@eusoft/webapp-compiler"
import MagicString from "magic-string";

export default function (options) {

    return {
        name: 'template-loader',

        async transform(code, id) {

            const ext = path.extname(id);

            if (ext == ".tsx" || ext == ".jsx") {

                const srcMap = new MagicString(code);

                const compiler = new JsxCompiler(options);

                let replace = [];

                compiler.error = (message, loc) => this.error({ message, loc });

                compiler.warning = (message, loc) => this.warn({ message, loc });

                compiler.onReplaces = v => replace = v;

                try {
                    const text = await compiler.compileTextAsync(code);

                    for (const rep of replace) {
                        if (rep.src.end == rep.src.start)
                            srcMap.prependLeft(rep.src.start, text.substring(rep.dst.start, rep.dst.end));
                        else
                            srcMap.update(rep.src.start, rep.src.end, text.substring(rep.dst.start, rep.dst.end));
                    }

                    const newMap = srcMap.generateMap({
                        hires: true,
                        //source: id,
                        includeContent: false
                    });

  
                    if (id.indexOf("SwipeView") != -1) {
                        //console.log(this.getCombinedSourcemap());
                    }

       
                    return {
                        code: text,
                        map: newMap
                    }
                }
                catch (ex) {
                    this.error(ex);
                }
            }

            else if (ext == ".html" && !id.endsWith("index.html")) { 


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
