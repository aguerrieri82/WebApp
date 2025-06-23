import { forModel } from "@eusoft/webapp-jsx/Helpers";
import { formatText, isCommitable, Popup, useOperation, type IEditor, type LocalString, type ViewNode } from "@eusoft/webapp-ui";



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