import { ViewNode } from "../../Types";
import { MaterialIconName } from "./Material";

export interface IIconOptions {
    content: ViewNode;
}

//TODO implement
export function Icon(options: IIconOptions) {

    return <>
       
    </>;
}

export function MaterialIcon(options: { name: MaterialIconName }) {
    return <i className="icon material-icons">{options.name}</i>
}