import { ComponentStyle } from "@eusoft/webapp-core";
import { ViewNode } from "../../Types";
import { MaterialIconName } from "./Material";
import { buildStyle } from "@eusoft/webapp-core/src/utils/Style";

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
    const style = buildStyle("icon", "material-symbols-" + + (options.variant ?? "outlined"), options.style);

    return <i className={style}>{options.name}</i>
}