
export type BindMode = "two-ways" | "no-bind" | "one-way" | undefined;

export enum TemplateNodeType {
    Text,
    Element,
    Attribute
}

export interface ITemplateNode {
    type: TemplateNodeType;
}

export interface ITemplateText extends ITemplateNode {
    type: TemplateNodeType.Text;
    value: string;
}
export interface ITemplateAttribute extends ITemplateNode {
    type: TemplateNodeType.Attribute;
    name: string;
    value: string;
    owner: ITemplateElement;
    bindMode?: BindMode;
}

export interface ITemplateElement extends ITemplateNode {
    type: TemplateNodeType.Element;
    name: string;
    attributes: Record<string, ITemplateAttribute>;
    childNodes: (ITemplateText | ITemplateElement)[];
}