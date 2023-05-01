import path from "path"
import { TemplateCompiler } from "@eusoft/webapp-compiler"


export default function (options) {

    return {
        name: 'template-loader',

        async transform (code, id) {
            const ext = path.extname(id);

            if (ext == ".html") { 

                const compiler = new TemplateCompiler();

                const text = await compiler.compileTextAsync(code);

                return text;

            }
            return null; 
        }
    };
}
