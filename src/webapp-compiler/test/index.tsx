import { Content, IContentInfo, ProgressView } from "@eusoft/webapp-ui";
import { Else, If, forModel } from "@eusoft/webapp-jsx";
import "./MainPage.scss";
import { ITemplateContext, delayAsync } from "@eusoft/webapp-core";
import { SceneView } from "../view/SceneView";
import { OrbitTool } from "../view/tools/OrbitTool";
import { sceneManager } from "../services/SceneManager";
import { RoomScene } from "../view/RoomScene";
import { apiClient } from "../services/ApiClient";
import { IOculusLogin, IOculusLoginResult } from "../services/Entities";
import { appSettings } from "../services/AppSettings";
import { actions } from "../services/Actions";
import { vrConnector } from "../services/VrConnector";
import { userSession } from "../services/UserSession";

export class MainPage extends Content {

    constructor() {

        super();

        this.sceneView = new SceneView();

        this.init(MainPage, {
            title: "Room Designer",
            style: [],
            body: forModel(this, m => <div>
                <div className="operation" visible={m.progressMessage != null}>
                    <ProgressView style="small" ref={m.progress} content=" " />
                    <div className="message">{m.progressMessage}</div>
                </div>
                <div className="login">
                    <If condition={!m.isConnected}>
                        <button on-click={() => m.connect()}>Connect</button>

                        <Else>
                            <span>{"Connesso (" + this.connectedUser + ")"}</span>
                        </Else>
                    </If>
                </div>
                <div className="scene-view" />
            </div>)
        });

    }

    async connect() {

        if (!userSession.user?.accessToken) {

            if (appSettings.isDev) {
                userSession.openAsync({
                    accessToken: "OCASsPbzZCrXOrdjUdwI5mhROuxok8gS8d68uuIUxSBb6Lhu4zaCF5ub4Ga0JOf47RwbRMIJ10NyZBc3I1f6nCwo2ItZBgalw3hZBSZBTknNgZDZD",
                    userId: "7782456301782093"
                });
            }
            else
                await actions.loginAsync();
        }

        if (userSession.user?.accessToken) {
            await vrConnector.startAsync(userSession.user?.accessToken);
            this.connectedUser = userSession.user.userId;
            this.isConnected = true;
        }
    }

    override mount(ctx: ITemplateContext) {

        super.mount(ctx);

        const element = ctx.element.querySelector(".scene-view") as HTMLDivElement;

        this.sceneView.attach(element);

        this.sceneView.addTool(new OrbitTool())

        this.loadSceneAsync("scenes/scene-andrea.json");
    }

    async loadSceneAsync(uri: string) {

        this.progressMessage = "Download scene " + uri;

        const sceneState = await sceneManager.loadAsync(uri);
        const room = await RoomScene.fromStateAsync(sceneState, (item, count, msg) => {
            this.progress.max = count;
            this.progress.value = item;
            this.progressMessage = msg;
            if (count == 0)
                return 0;
        });
        this.sceneView.loadRoom(room);
    }

    sceneView: SceneView;

    progress: ProgressView;

    progressMessage: string;

    isConnected: boolean;

    connectedUser: string;

    static override info = {
        name: "main-page",
        route: "/",
        factory: () => new MainPage()
    } as IContentInfo;
}
