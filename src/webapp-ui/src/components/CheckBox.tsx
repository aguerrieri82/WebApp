import type { ComponentStyle } from "@eusoft/webapp-core/abstraction/IComponentOptions";
import { buildStyle } from "@eusoft/webapp-core/utils/Style";
import type { ViewNode } from "../types";
import { NodeView } from "./NodeView";
import { MaterialIcon } from "./Icon";
import { configureBindings } from "@eusoft/webapp-core";
import { Class } from "@eusoft/webapp-jsx/components/Class";
import "./CheckBox.scss";

interface ICheckBoxOptions {
    style?: ComponentStyle;
    value: boolean;
    content: ViewNode;
    disabled?: boolean;
    visible?: boolean;
}

export function CheckBox(options: ICheckBoxOptions) {

    return <div visible={options.visible}
        on-click={() => options.value = !options.value}
        className={buildStyle(options.style, "check-box")}>
        <Class name="checked" condition={options.value} />
        <Class name="disabled" condition={options.disabled} />
        <div className="box">
            <MaterialIcon name="check" />
        </div>
        <div className="content"><NodeView>{options.content}</NodeView></div> 
    </div>
}

configureBindings(CheckBox, {
    value: "two-ways"  
})