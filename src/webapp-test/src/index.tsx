import { App, runApp } from "@eusoft/webapp-ui";
import { mainPage } from "./Pages/MainPage";

export const app = runApp(new App());

app.pageHost.push(mainPage);
