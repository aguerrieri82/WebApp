import { type ComponentStyle, buildStyle } from "@eusoft/webapp-core";
import { type ViewNode } from "../Types";
import { type MaterialIconName, type MaterialSymbolName } from "./Material";
import "./Icon.scss";

export interface IIconOptions {
    content: ViewNode;
}

export type MaterialIconVariant = "filled" | "outlined" | "round" | "two-tone";

export type MaterialIconCategory = "symbols" | "icons";

export interface IMaterialIconOptions<TCat extends MaterialIconCategory> {

    category?: TCat;

    variant?: MaterialIconVariant;

    style?: ComponentStyle;

    name: TCat extends 'icons' ? MaterialIconName : MaterialSymbolName;
}

//TODO implement
export function Icon(options: IIconOptions) {

    return <>
       
    </>;
}

export function MaterialIcon<TCat extends MaterialIconCategory>(options: IMaterialIconOptions<TCat>) {

    const baseClass = options.category == "icons" ? "material-icons-" : "material-symbols-";

    return <i className={buildStyle("icon", baseClass + (options.variant ?? "outlined"), options.style)}>
        {options.name}
    </i>
}