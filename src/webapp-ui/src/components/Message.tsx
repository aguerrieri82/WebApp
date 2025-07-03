import { buildStyle } from "@eusoft/webapp-core/utils/Style";
import type { ComponentStyle } from "@eusoft/webapp-core/abstraction/IComponentOptions";
import "./Message.scss";
import type { ViewNode } from "../types";
import type { MaterialSymbolName } from "./Material";
import { MaterialIcon } from "./Icon";

interface IMessageOptions {
    type: "info" | "error" | "warning" | "success";
    content: ViewNode;
    style?: ComponentStyle;
}

export function Message(options: IMessageOptions) {

    function getIconName(type: IMessageOptions["type"]): MaterialSymbolName {

        if (type == "warning")
            return "warning";

        if (type == "error")
            return "error";

        if (type == "info")
            return "info";
    }

    return <div className={buildStyle("inline-message", options.style, options.type)}>
        <MaterialIcon name={getIconName(options.type)}/>
        <div className="body">{options.content}</div> 
    </div>
}