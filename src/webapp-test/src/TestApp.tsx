import { App } from "@eusoft/webapp-ui";
import { router } from "@eusoft/webapp-framework";
import { mainPage } from "./Pages/MainPage";
import { secondPage } from "./Pages/SecondPage";

export class TestApp extends App {

    protected onStarted() {
        router.addPage(mainPage);
        router.addPage(secondPage);
        router.startAsync();
    }
}

declare module "@eusoft/webapp-ui" {
    interface IApp extends TestApp { }
}

