import path from "path"
import { TemplateCompiler } from "@eusoft/webapp-compiler"


export default function (options) {

    return {
        name: 'template-loader',

        async transform (code, id) {
            const ext = path.extname(id);

            if (ext == ".html") { 

                const compiler = new TemplateCompiler();

                compiler.error = msg => this.error(msg);

                compiler.warning = msg => this.warn(msg);

                const text = await compiler.compileTextAsync(code);

                console.log(text);

                return text;

            }
            return null; 
        }
    };
}
