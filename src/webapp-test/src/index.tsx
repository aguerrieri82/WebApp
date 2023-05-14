import { mount } from "@eusoft/webapp-core";
import { forModel } from "@eusoft/webapp-jsx";


const page = {
    message: "Hello World"
} 

mount(document.body, forModel(t => <main><h1>asassa</h1><div>{t.message}</div></main>), page);


