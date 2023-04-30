import path from "path"
import { TemplateCompiler } from "@eusoft/webapp-compiler"

export default function (options)  {

    options = {
        compiler: process.env.WEBAPP_COMPILER,
        ...options
    }

    return {
        name: 'template-loader',

        transform(code, id) {
            const ext = path.extname(id);
            if ( ext == ".html") { 
               
                const cmd = new TemplateCompiler();

            }
            return null; 
        }
    };
}
