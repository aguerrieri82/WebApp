import { type Component, SERVICE_TYPE, mount } from "@eusoft/webapp-core";
import { type IUserInteraction, USER_INTERACTION } from "../abstraction/IUserInteraction";
import { forModel } from "@eusoft/webapp-jsx";
import { type IEditor, type LocalString, Popup, Toaster, type ViewNode, formatText, isCommitable, withUnblock } from "@eusoft/webapp-ui";
import "./UserInteraction.scss";  

export type MessageType = "info" | "error" | "warning" | "success";
export enum MessageBoxButton {
    Ok = 1,
    Yes = 2,
    No = 4,
    Retry = 8,
    Cancel = 16,
    RetryCancel = Retry|Cancel,
    YesNo = Yes | No,
}

type MessageBoxCustomActions = Record<string, {
    label?: string;
}>;

class UserInteraction implements IUserInteraction {

    constructor() {

        mount(document.body, forModel(this, m => <div className="modal-container">
            {m.dialogs?.forEach(a => <>{a}</>)}
        </div>));
    }

    async messageBoxAsync(body: ViewNode, title: LocalString, buttons: MessageBoxButton): Promise<MessageBoxButton>;

    async messageBoxAsync<T extends MessageBoxCustomActions>(body: ViewNode, title: LocalString, buttons: T): Promise<keyof T>;

    async messageBoxAsync(body: ViewNode, title: LocalString, buttons) {

        const popup = new Popup();
        popup.style = "message-box";
        popup.title = formatText(title);
        popup.body = body;
        popup.actions = [];

        if (typeof buttons == "object") {
            for (const key in buttons) {

                const btn = buttons[key];

                popup.actions.push({
                    text: formatText(btn.label ?? key) as string,
                    name: key,
                    executeAsync: async () => true
                })
            }
        }
        else {
            for (const item of [MessageBoxButton.Ok, MessageBoxButton.Yes, MessageBoxButton.No, MessageBoxButton.Retry, MessageBoxButton.Cancel]) {
                if ((buttons & item) != 0) {
                    popup.actions.push({
                        text: formatText(MessageBoxButton[item].toLowerCase()) as string,
                        name: MessageBoxButton[item],
                        executeAsync: async () => true
                    });
                }
            }  
        }

        //this.dialogs.push(popup);

        //await delayAsync(0);
      
        const result = await withUnblock(() => popup.showAsync());

        //this.dialogs.splice(this.dialogs.indexOf(popup), 1); 

        if (typeof buttons == "object")
            return result;

        return MessageBoxButton[result];    
    }

    async confirmAsync(body: ViewNode, title: LocalString): Promise<boolean> {

        const result = await this.messageBoxAsync(body, title, MessageBoxButton.YesNo); 
        return result == MessageBoxButton.Yes;
    }

    async messageAsync(body: ViewNode, style: "info"|"error"|"success"|"warning", displayTimeMs = 2000) {

        Toaster.showAsync({
            content: body,
            style: style,
            timeout: displayTimeMs
        });

    }

    async inputAsync<T>(body: IEditor<T>, title: LocalString): Promise<T> {

        const popup = new Popup();
        
        popup.title = title;
        popup.body = body;
        popup.actions = [
            {
                text: "ok",
                name: "ok",
                executeAsync: async () => {

                    if (isCommitable(body)) {
                        await body.commitAsync();
                        return true;
                    }
                },
            },
            {
                text: "cancel",
                name: "cancel",
                executeAsync: async () => true
            }
        ]


        const result = await popup.showAsync();  

        return result == "ok" ? body.value : null;  
    }

    dialogs: Component[] = [];

    [SERVICE_TYPE] = USER_INTERACTION;

}

export const userInteraction = new UserInteraction();