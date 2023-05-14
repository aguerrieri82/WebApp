import { mount } from "@eusoft/webapp-core";

const page = {
    message: "Hello World"
}

mount(document.body, t => t
    .beginChild("main")
    .beginChild("h1").text("$(project-name) Home").endChild()
    .beginChild("div").content(m => m.message).endChild()
    .endChild()
, page);

