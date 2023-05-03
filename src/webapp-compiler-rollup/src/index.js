import path from "path"
import { HtmlCompiler, JsxCompiler } from "@eusoft/webapp-compiler"

export default function (options) {

    return {
        name: 'template-loader',

        async transform (code, id) {
            const ext = path.extname(id);

            if (ext == ".tsx" || ext == ".jsx") {

                const compiler = new JsxCompiler();

                compiler.error = msg => this.error(msg);

                compiler.warning = msg => this.warn(msg);

                const text = await compiler.compileTextAsync(code);

                console.log(text);

                return text;
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
