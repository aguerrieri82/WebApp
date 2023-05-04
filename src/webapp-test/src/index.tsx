import { App, runApp } from "@eusoft/webapp-ui";
import { MainPage } from "./Pages/MainPage";

export const app = runApp(new App());

app.pageHost.push(new MainPage());
