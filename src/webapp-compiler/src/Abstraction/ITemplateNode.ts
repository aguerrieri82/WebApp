
export enum TemplateNodeType {
    Text,
    Element
}

export interface ITemplateAttribute {
    name: string;
    value: string;
}

export interface ITemplateNode {
    type: TemplateNodeType;
    name: string;
    attributes: ITemplateAttribute[];
    childNodes: ITemplateNode[];
}