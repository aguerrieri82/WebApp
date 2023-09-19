import { App, router, runApp } from "@eusoft/webapp-framework";
import { MainPage } from "./pages/MainPage";
import "./App.scss";

router.addPage(MainPage);

runApp(new App());