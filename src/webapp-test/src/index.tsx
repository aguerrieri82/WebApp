import { CatalogTemplate, template } from "@eusoft/webapp-core";
import { Template } from "@eusoft/webapp-jsx";
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
        logo: "/logo.png",
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
   
        },
        newImage() {
            this.logo = "https://www.google.com/images/branding/googlelogo/1x/googlelogo_color_272x92dp.png";
        }
    }; 
      

    setInterval(() => {
        //rootModel.msg = "Time is: " + new Date();
    }, 1000);

    const t  = <Template name="xxx">
        <div text={m => m.innerObj.name}>
            <button on-click={m => m.newImage() }>Miao</button>
        </div>
    </Template>;


    template(document.body, t, rootModel);
}

window.addEventListener("load", runAsync);