import { ViewNode } from "../../Types";
import { MaterialIconName } from "./Material";

export interface IIconOptions {
    content: ViewNode;
}
export type MaterialIconVariant = "filled" | "outlined" | "round" | "two-tone";

export interface IMaterialIconOptions {
    name: MaterialIconName;
    variant?: MaterialIconVariant;
}

//TODO implement
export function Icon(options: IIconOptions) {

    return <>
       
    </>;
}

export function MaterialIcon(options: IMaterialIconOptions) {
    return <i className={"icon material-icons" + (options.variant && options.variant != "filled" ? "-" + options.variant : "")}>{options.name}</i>
}