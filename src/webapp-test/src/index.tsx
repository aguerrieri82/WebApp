import { App, app, runApp } from "@eusoft/webapp-ui";
import { mainPage } from "./Pages/MainPage";

runApp(new App())
    .pageHost.push(mainPage);


