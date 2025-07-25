import { router, App } from "@eusoft/webapp-framework";
import { MainPage } from "./pages/MainPage";
import "./App.scss";

export class MyApp extends App {

    protected override async onStarted() {

        router.addPage(MainPage)

        router.startAsync();
    }
}