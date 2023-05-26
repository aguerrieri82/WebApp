import { App, router } from "@eusoft/webapp-framework";
import { mainPage } from "./Pages/MainPage";
import { secondPage } from "./Pages/SecondPage";
import { thirdPage } from "./Pages/ThirdPage";

export class TestApp extends App {

    protected onStarted() {
        //router.addPage(mainPage);
        //router.addPage(secondPage);
        router.addPage(thirdPage);
        router.startAsync();
    }
}

declare module "@eusoft/webapp-ui" {
    interface IApp extends TestApp { }
}

