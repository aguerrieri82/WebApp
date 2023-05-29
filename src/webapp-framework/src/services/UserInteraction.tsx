import { Component, SERVICE_TYPE, mount } from "@eusoft/webapp-core";
import { IUserInteraction, USER_INTERACTION } from "../abstraction/IUserInteraction";
import { forModel } from "@eusoft/webapp-jsx";
import { LocalString, ViewNode, formatText } from "@eusoft/webapp-ui";

class UserInteraction implements IUserInteraction {

    constructor() {

        mount(document.body, forModel(this, m => <div className="modal-container">
            {m.dialogs.forEach(a => <>{a}</>)}
        </div>));
    }

    async confirmAsync(body: ViewNode, title: LocalString): Promise<boolean> {

        return confirm(formatText(body as string) as string);
    }

    dialogs: Component[];

    [SERVICE_TYPE] = USER_INTERACTION;

}

export const userInteraction = new UserInteraction();