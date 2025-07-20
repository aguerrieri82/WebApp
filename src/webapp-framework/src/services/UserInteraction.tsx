import { SERVICE_TYPE } from "@eusoft/webapp-core";
import { type IUserInteraction, USER_INTERACTION } from "../abstraction/IUserInteraction";
import { FloatingPanel, type IAction, type IEditor, type LocalString, MaterialIcon, Popup, Toaster, type ViewNode, createAction, formatText, isCommitable, withUnblock } from "@eusoft/webapp-ui";
import "./UserInteraction.scss";  
import { forModel } from "@eusoft/webapp-jsx/Helpers";

export type MessageType = "info" | "error" | "warning" | "success";
export enum MessageBoxButton {
    Ok = 1,
    Yes = 2,
    No = 4,
    Retry = 8,
    Cancel = 16,
    RetryCancel = Retry|Cancel,
    YesNo = Yes | No,
    Close = 32,
    Ignore = 64
}

type MessageBoxCustomActions = Record<string, {
    label?: string;
}>;

class UserInteraction implements IUserInteraction {

    constructor() {

    }

    async messageBoxAsync(body: ViewNode, title: LocalString, buttons: MessageBoxButton): Promise<MessageBoxButton>;

    async messageBoxAsync<T extends MessageBoxCustomActions>(body: ViewNode, title: LocalString, buttons: T): Promise<keyof T>;

    async messageBoxAsync(body: ViewNode, title: LocalString, buttons) {

        if (typeof body == "string")
            body = formatText(body);

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
            for (const item of [MessageBoxButton.Ok, MessageBoxButton.Yes, MessageBoxButton.No, MessageBoxButton.Retry, MessageBoxButton.Cancel, MessageBoxButton.Ignore]) {
                if ((buttons & item) != 0) {
                    popup.actions.push({
                        text: formatText(MessageBoxButton[item].toLowerCase()) as string,
                        name: MessageBoxButton[item],
                        executeAsync: async () => true
                    });
                }
            }  
        }
      
        const result = await withUnblock(() => popup.showAsync());

        if (typeof buttons == "object")
            return result;

        return MessageBoxButton[result];    
    }

    async confirmAsync(body: ViewNode, title: LocalString): Promise<boolean> {

        if (typeof body == "string")
            body = formatText(body);

        const result = await this.messageBoxAsync(body, title, MessageBoxButton.YesNo); 

        return result == MessageBoxButton.Yes;
    }

    async messageAsync(body: ViewNode, style: "info"|"error"|"success"|"warning", displayTimeMs = 2000) {

        if (typeof body == "string")
            body = formatText(body);

        Toaster.showAsync({
            content: body,
            style: style,
            timeout: displayTimeMs
        });

    }


    async fullMessageAsync(body: ViewNode, style: "info" | "error" | "success" | "warning", actions: (MessageBoxButton|IAction)[]) {

        if (typeof body == "string")
            body = formatText(body);

        let icon;
        if (style == "success")
            icon = <MaterialIcon name="check_circle" color="#0f0" />
        else if (style == "error")
            icon = <MaterialIcon name="error" color="#f00" />

        await withUnblock(() => new Promise<boolean>(res => {

            let popup: FloatingPanel;

            const onPopState = () => {
                popup.close();
            }

            const buildAction = (action: IAction | MessageBoxButton) => {

                if (typeof action != "object") {
                    action = {
                        text: formatText(MessageBoxButton[action].toLowerCase()) as string,
                        name: MessageBoxButton[action],
                        executeAsync: async () => true
                    } as IAction;
                }

                return createAction({
                    ...action,
                    executeAsync: async ctx => {
                        await action.executeAsync?.(ctx);
                        window.removeEventListener("popstate", onPopState);
                        popup.close();
                        res(true);
                    }
                }, "text");
            }

            popup = new FloatingPanel({
                style: [style, "full-message"],
                content: forModel(() => <>
                    {icon}
                    <div className="body">{body}</div>
                    <div className="actions">
                        {actions.forEach(a => buildAction(a))}
                    </div>
                </>)
            });

            popup.show();

            window.addEventListener("popstate", onPopState);
        }));


      
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


    [SERVICE_TYPE] = USER_INTERACTION;
}

export const userInteraction = new UserInteraction();