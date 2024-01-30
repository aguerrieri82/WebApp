import { App, router } from "@eusoft/webapp-framework";
import { ThirdPage } from "./Pages/ThirdPage";


export class TestApp extends App {

    protected onStarted() {

        router.addPage(ThirdPage);
        router.startAsync();
    }
}

declare module "@eusoft/webapp-ui" {
    interface IApp extends TestApp { }
}

