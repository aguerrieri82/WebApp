import { App, router } from "@eusoft/webapp-framework";
import { ThirdPage } from "./Pages/ThirdPage";
import { MainPage } from "./Pages/MainPage";
import { SecondPage } from "./Pages/SecondPage";
import { declareComponent } from "@eusoft/webapp-core";
import { forModel } from "../../webapp-jsx/src";


const Test = declareComponent({
    
    construct: function (opt) {

        console.log(opt);
    },
    
    show: function()  {
        alert(this.text + "cazzo");   
    },

    text: ""

}, forModel(m => <>
    <div>{m.text}</div>
</>));


const xxx = new Test({
    text: "Hello World!"
});


xxx.show();

export class TestApp extends App {

    protected onStarted() {

        router.addPage(ThirdPage);
        router.addPage(SecondPage);
        router.addPage(MainPage) 
        router.startAsync();
    }
}

declare module "@eusoft/webapp-ui" {
    interface IApp extends TestApp { }
}


