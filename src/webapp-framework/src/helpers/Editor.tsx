import { forModel } from "@eusoft/webapp-jsx/Helpers";
import { formatText, isCommitable, Popup, useOperation, type IContent, type IContentHost, type IEditor, type IPopUpAction, type LocalString, type ViewNode } from "@eusoft/webapp-ui";

export interface IPopupEditorOptions {
    message?: ViewNode;
    title?: LocalString;
    cancelLabel?: LocalString;
    okLabel?: LocalString;
}


export async function popupEditAsync<T>(editor: IEditor<T>, value?: T, options?: IPopupEditorOptions) {

    const popup = new Popup({
        body: forModel(() => <>
            {options.message}
            {editor}
        </>),
        "name": options?.title as string,
        title: formatText(options?.title),
        actions: [{
            name: "cancel",
            text: options?.cancelLabel ?? "cancel",
        }, {
            name: "ok",
            text: options?.okLabel ?? "ok",
            executeAsync: async () => {
                if (isCommitable(editor))
                    return await editor.commitAsync();
                return true;
            }
        }]
    });

    editor.value = value;

    const res = await popup.showAsync();

    if (res == "cancel")
        return;

    return editor.value;
}



export async function showContentPopup<TContent extends IContent<TArgs>, TArgs extends ObjectLike>
    (content: TContent, args?: TArgs) {

    const popup = new Popup({
        body: content.body,
        actions: content.actions.map(a => ({
            name: a.name,
            text: a.text,
            executeAsync: a.executeAsync,
            priority: a.priority
        } as IPopUpAction)),
        title: formatText(content.title),
        hideOnClick: true,
        name: content.name
    });

    popup.actions.unshift({
        name: "close",
        text: "close",
        executeAsync: () => Promise.resolve(true)
    });


    const host: IContentHost = {
        canGoBack: false,
        result: undefined,
        closeAsync: async (result) => {
            content.host.result = result;
            popup.close();
        }
    };

    if (!await content.loadAsync(host, args))
        return;

    await popup.showAsync();

    return content.host.result as boolean;
}