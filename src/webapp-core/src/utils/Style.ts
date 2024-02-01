import { ComponentStyle } from "../abstraction";



export function buildStyle(...style: ComponentStyle[]) {

    const result: string[] = [];

    const flat = (item: ComponentStyle) => {

        if (!item)
            return;
        if (typeof item == "string")
            result.push(item);
        else
            item.forEach(a => flat(a));
    }

    flat(style);

    return result.join(" ");
}