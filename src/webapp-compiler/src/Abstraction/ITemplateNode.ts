
export type BindMode = "two-ways" | undefined;

export enum TemplateNodeType {
    Text,
    Element,
    Attribute
}

export interface ITemplateNode {
    type: TemplateNodeType;
}

export interface ITemplateText extends ITemplateNode {
    value: string;
}
export interface ITemplateAttribute extends ITemplateNode {
    name: string;
    value: string;
    owner: ITemplateElement;
    bindMode?: BindMode;
}

export interface ITemplateElement extends ITemplateNode {
    name: string;
    attributes: Record<string, ITemplateAttribute>;
    childNodes: ITemplateNode[];
}