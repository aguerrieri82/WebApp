import type { ComponentStyle } from "@eusoft/webapp-core";
import { forModel } from "@eusoft/webapp-jsx/Helpers";
import { formatText, isCommitable, Popup, useOperation, type IContent, type IContentHost, type IEditor, type IPopUpAction, type LocalString, type ViewNode } from "@eusoft/webapp-ui";

export interface IPopupEditorOptions {
    message?: ViewNode;
    title?: LocalString;
    cancelLabel?: LocalString;
    okLabel?: LocalString;
}

export interface IPopupContentOptions {
    style?: ComponentStyle;
    closeLabel?: LocalString;
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



export async function showContentPopup<
    TContent extends IContent<TArgs> & { result?: TResult },
    TArgs extends ObjectLike,
    TResult>
    (content: TContent, args?: TArgs, options?: IPopupContentOptions) : Promise<TResult> {

    const popup = new Popup({
        body: content.body,
        style: [options?.style],
        bodyStyle: content.className?.split(" "),
        actions: content.actions?.map(a => ({
            name: a.name,
            text: a.text,
            executeAsync: a.executeAsync,
            priority: a.priority
        } as IPopUpAction)),
        title: formatText(content.title),
        hideOnClick: true,
        name: content.name
    }); 

    popup.actions ??= [];

    popup.actions.unshift({
        name: "close",
        text: options?.closeLabel ?? "close",
        executeAsync: () => Promise.resolve(true)
    });


    const host: IContentHost = {
        canGoBack: false,
        result: undefined,
        closeAsync: async (result: TResult) => {
            content.host.result = result;
            popup.close();
        }
    };

    if (!await content.loadAsync(host, args))
        return;

    await popup.showAsync();

    return content.host.result as TResult;
}