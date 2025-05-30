import { type Component, SERVICE_TYPE, delayAsync, mount } from "@eusoft/webapp-core";
import { type IUserInteraction, USER_INTERACTION } from "../abstraction/IUserInteraction";
import { forModel } from "@eusoft/webapp-jsx";
import { type IEditor, type LocalString, Popup, type ViewNode, formatText, isCommitable } from "@eusoft/webapp-ui";

export type MessageType = "info" | "error" | "warning" | "success";
export enum MessageBoxButton {
    Ok = 1,
    Yes = 2,
    No = 4,
    YesNo = Yes | No,
}

class UserInteraction implements IUserInteraction {

    constructor() {

        mount(document.body, forModel(this, m => <div className="modal-container">
            {m.dialogs?.forEach(a => <>{a}</>)}
        </div>));
    }


    async messageBoxAsync(body: ViewNode, title: LocalString, buttons: MessageBoxButton): Promise<MessageBoxButton> {
        const popup = new Popup();
        popup.style = "message-box";
        popup.title = formatText(title);
        popup.body = body;
        popup.actions = [];
       
        for (const item of [MessageBoxButton.Ok, MessageBoxButton.Yes, MessageBoxButton.No]) {
            if ((buttons & item) != 0) {
                popup.actions.push({
                    text: formatText(MessageBoxButton[item].toLowerCase()) as string,
                    name: MessageBoxButton[item],
                    executeAsync: async () => true
                });
            }
        }  

        this.dialogs.push(popup);

        await delayAsync(0);

        const result = await popup.showAsync(); 

        this.dialogs.splice(this.dialogs.indexOf(popup), 1); 

        return MessageBoxButton[result];    
    }

    async confirmAsync(body: ViewNode, title: LocalString): Promise<boolean> {

        const result = await this.messageBoxAsync(body, title, MessageBoxButton.YesNo); 
        return result == MessageBoxButton.Yes;
    }

    async messageAsync(body: ViewNode, title: LocalString, displayTimeMs = 500) {


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