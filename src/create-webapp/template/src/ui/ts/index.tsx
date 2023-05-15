import { App, app, runApp } from "@eusoft/webapp-ui";
import { mainPage } from "./pages/MainPage";
import "./App.scss";

runApp(new App());

app.pageHost.push(mainPage);  