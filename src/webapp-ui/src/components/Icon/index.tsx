import { ComponentStyle, buildStyle } from "@eusoft/webapp-core";
import { ViewNode } from "../../Types";
import { MaterialIconName } from "./Material";
import "./index.scss";

export interface IIconOptions {
    content: ViewNode;
}
export type MaterialIconVariant = "filled" | "outlined" | "round" | "two-tone";

export interface IMaterialIconOptions {
    name: MaterialIconName;
    variant?: MaterialIconVariant;
    style?: ComponentStyle;
}

//TODO implement
export function Icon(options: IIconOptions) {

    return <>
       
    </>;
}

export function MaterialIcon(options: IMaterialIconOptions) {

    return <i className={buildStyle("icon", "material-symbols-" + (options.variant ?? "outlined"), options.style)}>
        {options.name}
    </i>
}