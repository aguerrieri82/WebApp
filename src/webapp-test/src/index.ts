import { template } from "@eusoft/webapp-core";
import Index from "./Index.html";

interface IItem {
    name: string;
}
async function runAsync() { 

    const rootModel = {
        items: [] as IItem[],
        msg: "",
        innerObj: {
            name:"Inner"
        },
        change() {
            this.msg = "Nuovo messaggio";
            if (this.items.length > 0)
                this.items[0].name = "Item change";
            this.innerObj.name = "Inner change"
        },
        replace() {
            if (this.items.length > 0)
                this.items[0] = {
                    name: "Pippo"
                }
            this.innerObj = {
                name: "Replace inner"
            }
        },
        add() { 
            this.items.push({ name: "Luca" }, {name: "Mario"});
        }
    }; 
     
    (window as any)["root"] = rootModel;

    template(document.body, Index, rootModel);
}

window.addEventListener("load", runAsync);