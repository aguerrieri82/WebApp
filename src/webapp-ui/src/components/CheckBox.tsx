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
}

export function CheckBox(options: ICheckBoxOptions) {

    return <div on-click={() => options.value = !options.value} className={buildStyle(options.style, "check-box")}>
        <Class name="checked" condition={options.value}/>
        <div className="box">
            <MaterialIcon name="check" />
        </div>
        <NodeView>{options.content}</NodeView> 
    </div>
}

configureBindings(CheckBox, {
    value: "two-ways"  
})