import { template } from 'webapp-core';

async function runAsync() {
    const rootModel = {
        items: [],
        msg: "",
        innerObj: {
            name: "Inner"
        }
    };
    window["root"] = rootModel;
    template(document.body, bld => bld
        .child("div", c => c.text(m => m.msg))
        .child("div", c => c.text(m => m.msg))
        .child("div", c => c.text(m => {
        return "Primo: " + m.items[0]?.name;
    }))
        .child("div", c => c.text(m => {
        return "Inner: " + m.innerObj.name;
    }))
        .foreach(a => a.items, it => it.beginChild("div").text(a => a?.name).endChild())
        .beginChild("button")
        .on("click", (m, e) => m.items.push({ name: "Luca" }))
        .text("Add")
        .endChild()
        .beginChild("button")
        .on("click", (m, e) => {
        m.msg = "Nuovo messaggio";
        if (m.items.length > 0)
            m.items[0].name = "Item change";
        m.innerObj.name = "Inner change";
    })
        .text("Change Msg")
        .endChild()
        .beginChild("button")
        .on("click", (m, e) => {
        if (m.items.length > 0)
            m.items[0] = {
                name: "Pippo"
            };
        m.innerObj = {
            name: "Replace inner"
        };
    })
        .text("Replace")
        .endChild(), rootModel);
}
window.addEventListener("load", runAsync);
//# sourceMappingURL=app.js.map
