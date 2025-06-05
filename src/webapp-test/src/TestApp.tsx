import { App, router } from "@eusoft/webapp-framework";
import { ThirdPage } from "./Pages/ThirdPage";
import { MainPage } from "./Pages/MainPage";
import { SecondPage } from "./Pages/SecondPage";


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

