import { App, app, runApp } from "@eusoft/webapp-ui";
import { mainPage } from "./pages/MainPage";

runApp(new App());

app.pageHost.push(mainPage);  