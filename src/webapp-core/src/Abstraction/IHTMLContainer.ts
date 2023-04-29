export interface IHTMLContainer {

    nodes: Node[];

    isCacheEnabled: boolean;
}

export function isHTMLContainer(value: any): value is IHTMLContainer {

    return value && typeof value == "object" && "nodes" in value;
}