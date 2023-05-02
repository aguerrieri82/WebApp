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
            this.msg = "Nuovo messaggio" + new Date().getTime();
            if (this.items.length > 0)
                this.items[0].name = "Item change" + new Date().getTime();
            this.innerObj.name = "Inner change" + new Date().getTime()
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
        },
        addMany() {

            const newItems = [];

            for (let i = 0; i < 10000; i++)
                newItems.push({ name: "Item " + i });

            this.items.push(...newItems);
   
        }
    }; 


    setInterval(() => {
        rootModel.msg = "Time is: " + new Date();
    }, 1000);


    template(document.body, Index, rootModel);
}

window.addEventListener("load", runAsync);