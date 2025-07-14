import { Component, type Bindable, type IComponentOptions, type TemplateMap } from "@eusoft/webapp-core";
import { forModel } from "@eusoft/webapp-jsx";
import "./WebView.scss"

export interface IWebViewArgs extends IComponentOptions {

    src: Bindable<string>;
    onCloseRequest?: () => void;

}

export const WebViewTemplates: TemplateMap<WebView> = {

    Default: forModel(m => <iframe
        on-load={(_, ev) => m.onFrameLoad(ev)}
        className={m.className}
        visible={m.visible}
        src={m.src} />
    )
}

export class WebView extends Component<IWebViewArgs> {

    private _document: Document;
    private _window: Window;
    private _messageHandler: (ev: MessageEvent) => unknown;

    constructor(options?: IWebViewArgs) {

        super();

        this.init(WebView, {
            template: WebViewTemplates.Default,
            ...options
        })

        this._messageHandler = (event: MessageEvent) => {
            console.log(event);
            if (event.data == "close") {
                console.log(history);
                this.onCloseRequest();
            }
                
        }

    }

    protected override onMounted() {

        console.log("add-listener");
        window.addEventListener("message", this._messageHandler);
    }

    protected override onUnmounted() {

        console.log("remove-listener");
        window.removeEventListener("message", this._messageHandler);
    }


    onCloseRequest() {

    }


    onFrameLoad(ev: Event) {

        const target = ev.target as HTMLIFrameElement;
        
        try {

            this._document = target?.contentDocument;

            this._window = target?.contentWindow;

            console.log("Iframe loaded:", this._document?.title);

        } catch (e) {

            console.warn("Cross-origin access blocked:", e);
        }
    }

    src: string;
}