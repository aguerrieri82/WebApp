import type { IBehavoir } from "./Abstraction/IBehavoir";
import type { BindValue } from "./Abstraction/IBinder";
import { isHTMLContainer } from "./Abstraction/IHTMLContainer";
import { IObservableArrayHandler, isObservableArray } from "./Abstraction/IObservableArray";
import type { ITemplate } from "./Abstraction/ITemplate";
import type { IChildTemplateBuilder, ITemplateBuilder, RefNodePosition, TemplateValueMap } from "./Abstraction/ITemplateBuilder";
import type { CatalogTemplate, ITemplateProvider } from "./Abstraction/ITemplateProvider";
import { Binder } from "./Binder";
import { getTypeName } from "./ObjectUtils";

type TemplateInlineMode = "never" | "always" | "auto" | "explicit" | "replace-parent" | "embed-child" | "inherit";

/****************************************/

export const TemplateCatalog: { [key: string]: ITemplate<any> } = {};

export const BehavoirCatalog: { [key: string]: () => IBehavoir } = {}

/****************************************/

export function defineTemplate(name: string, template: ITemplate<any>) {
    TemplateCatalog[name] = template;
    return template;
}

/****************************************/

export class TemplateBuilder<TModel, TElement extends HTMLElement = HTMLElement>
    extends Binder<TModel>
    implements ITemplateBuilder<TModel> {

    protected _endElement: Node;
    protected _startElement: Node;
    protected _lastElement: Node;
    protected _childCount = 0;
    protected _updateCount = 0;
    protected _updateNode: Node = null;
    protected _shadowUpdate = false;

    constructor(model: TModel, element: TElement, parent?: TemplateBuilder<any>) {

        super(model);
         
        this.parent = parent;

        this.element = element;

        if (element.namespaceURI && element.namespaceURI != "http://www.w3.org/1999/xhtml")
            this.namespace = element.namespaceURI;
    }


    protected beginTemplate<TInnerModel>(model?: TInnerModel, refNode?: Node, refNodePos: RefNodePosition = "after", marker?: string): TemplateBuilder<TInnerModel> {

        const innerBuilder = new TemplateBuilder<TInnerModel>(model, this.element, this);

        innerBuilder._lastElement = this._lastElement;

        innerBuilder.begin(refNode, refNodePos, marker);

        if (this.inlineMode == "explicit") {
            innerBuilder.isInline = this.isInline;
            innerBuilder.inlineMode = "inherit";
        }

        return innerBuilder;
    }


    protected endTemplate<TInnerMode>(childBuilder: TemplateBuilder<TInnerMode>) {

        childBuilder.end();

        if (childBuilder.element == this.element)
            this._lastElement = childBuilder._lastElement;
    }

    protected beginUpdate() {

        if (this._updateCount == 0 && this.element.parentNode && this._shadowUpdate) {

            this._updateNode = document.createTextNode("");
            this.element.parentNode.replaceChild(this._updateNode, this.element)
        }
        this._updateCount++;
    }

    protected endUpdate() {

        this._updateCount--;

        if (this._updateCount == 0 && this._updateNode && this._shadowUpdate) {

            this._updateNode.parentNode.replaceChild(this.element, this._updateNode)
            this._updateNode = null;
        }
    }

    begin(refNode?: Node, refNodePos?: RefNodePosition, marker?: string): this {

        this._startElement = marker ? document.createComment("begin-" + marker) : document.createTextNode("");

        if (refNode) {

            if (refNodePos == "after") {
                if (!refNode.nextSibling)
                    refNode.parentNode.appendChild(this._startElement);
                else
                    refNode.parentNode.insertBefore(this._startElement, refNode.nextSibling);
            }

            else if (refNodePos == "before")
                refNode.parentNode.insertBefore(this._startElement, refNode);

            else if (refNodePos == "inside")
                refNode.appendChild(this._startElement);
        }
        else
            this.appendChild(this._startElement);

        this._lastElement = this._startElement;

        return this;
    }

    end(): this {

        if (this._endElement)
            return;

        if (this._startElement.nodeType == Node.COMMENT_NODE)
            this._endElement = document.createComment(this._startElement.textContent.replace("begin-", "end-"));
        else
            this._endElement = document.createTextNode("");

        this.appendChild(this._endElement);

        return this;
    }

    clear(remove: boolean = false): this {

        this._childCount = 0;

        if (!this._endElement) {
            console.warn("Missing end element: " + this.model);
            this.end();
        }

        let curNode = this._endElement;

        while (true) {

            let mustDelete = true;

            if ((curNode == this._startElement || curNode == this._endElement) && !remove)
                mustDelete = false;

            const prev = curNode.previousSibling;

            if (mustDelete) {

                if (mustDelete)
                    curNode.parentNode.removeChild(curNode);
            }

            if (curNode == this._startElement)
                break;

            curNode = prev;
        }

        if (remove) {
            this._endElement = null;
            this._startElement = null;
            this._lastElement = null;
        }
        else
            this._lastElement = this._startElement;

        this.cleanBindings(true);

        return this;
    }

    appendChild(node: Node): this {

        if (!this._lastElement || !this._lastElement.parentNode) //TODO this || didn't exists
            this.element.appendChild(node);
        else {
            if (this._lastElement.nextSibling)
                this._lastElement.parentNode.insertBefore(node, this._lastElement.nextSibling);
            else
                this._lastElement.parentNode.appendChild(node);

        }
        //TODO this line was inside else
        this._lastElement = node;
        //
        return this;
    }

    foreach<TItem>(selector: BindValue<TModel, TItem[]>, templateOrName: CatalogTemplate<TItem>): this {

        let itemsBuilders: TemplateBuilder<TItem>[] = [];

        const template = this.loadTemplate(templateOrName);

        const marker = document.createTextNode("");

        this.appendChild(marker);

        const handler: IObservableArrayHandler<TItem> = {

            onClear: () => {
                itemsBuilders.forEach(a => a.clear(true));
                itemsBuilders = [];
            },

            onItemRemoved: (item, index, reason) => {

                if (reason == "replace" || reason == "clear")
                    return;

                itemsBuilders[index].clear(true);
                itemsBuilders.splice(index, 1);
            },

            onItemSwap: (index: number, newIndex: number) => {

            },

            onItemReplaced: (newItem, oldItem, index) => {

                itemsBuilders[index].updateModel(newItem);
            },

            onReorder: () => {

                const value = this.getBindValue(selector);

                handler.onClear();
                for (let i = 0; i < value.length; i++)
                    handler.onItemAdded(value[i], i, "add");
            },

            onItemAdded: (item, index, reason) => {

                if (reason == "replace")
                    return;

                let itemBuilder: TemplateBuilder<TItem>;

                if (index == itemsBuilders.length) {
                    if (index == 0)
                        itemBuilder = this.beginTemplate(item, marker, "after", this.createMarker(item));
                    else
                        itemBuilder = this.beginTemplate(item, itemsBuilders[index - 1]._endElement, "after", this.createMarker(item));

                    itemsBuilders.push(itemBuilder);
                }
                else {
                    itemBuilder = this.beginTemplate(item, itemsBuilders[index]._startElement, "before", this.createMarker(item));
                    itemsBuilders.splice(index, 0, itemBuilder);
                }

                itemBuilder.index = index;

                template(itemBuilder);

                this.endTemplate(itemBuilder);
            }
        };

        this.bind(selector, (value, oldValue, isUpdate, isClear) => {

            if (isClear)
                return;

            this.beginUpdate();

            if (isUpdate)
                handler.onClear();

            if (isObservableArray(oldValue))
                oldValue.unsubscribe(handler);

            if (value) {

                if (isObservableArray(value))
                    value.subscribe(handler);

                for (let i = 0; i < value.length; i++)
                    handler.onItemAdded(value[i], i, "add");
            }

            this.endUpdate();
        });
        return this;
    }

    if(condition: BindValue<TModel, boolean>, trueTemplate: ITemplate<TModel>, falseTemplate?: ITemplate<TModel>): this {

        const childBuilder = this.beginTemplate(this.model);

        this.register(childBuilder);

        this.bind(condition, (value, oldValue, isUpdate, isClear) => {

            if (isClear)
                return;

            if (isUpdate)
                childBuilder.clear();

            if (value)
                childBuilder.template(trueTemplate);
            else if (falseTemplate)
                childBuilder.template(falseTemplate);

        });

        this.endTemplate(childBuilder);

        return this;
    }

    protected replaceContent(nodes: Node[]) {

        if (this.isInline)
            throw new Error("'replaceContent' not supported in inline elements");

        this.clear();

        for (const node of nodes)
            this.appendChild(node);
    }

    protected extractContent(): Node[] {

        const result: Node[] = [];
        for (const child of this.element.childNodes) {
            if (child != this._startElement && child != this._endElement)
                result.push(child);
        }
        return result;
    }

    content<TInnerModel extends ITemplateProvider>(content: BindValue<TModel, TInnerModel>, inline: boolean = false): this {

        const childBuilder = this.beginTemplate<TInnerModel>(undefined, undefined, undefined, this.createMarker(content));

        childBuilder.isInline = inline;
        childBuilder.inlineMode = "explicit";

        this.bind(content, (value, oldValue, isUpdate, isClear) => {

            if (isClear)
                return;

            this.beginUpdate();

            if (!childBuilder.isInline && isHTMLContainer(value) && value.nodes && value.isCacheEnabled === true)
                childBuilder.replaceContent(value.nodes);

            else {

                if (oldValue && value && oldValue.template == value.template)
                    childBuilder.updateModel(value);
                else {

           
                    if (isUpdate)
                        childBuilder.clear();

                    if (value) {

                        const template = this.templateFor(value);

                        if (!template)
                            throw new Error("Template '" + value.template + "' not found.");

                        childBuilder.updateModel(value);

                        //console.debug("Rebuild", this.model);

                        template(childBuilder);
                    }
                }

                if (isHTMLContainer(value) && value.isCacheEnabled === true)
                    value.nodes = this.extractContent();
            }

            this.endUpdate();
        });

        this.endTemplate(childBuilder);

        return this;
    }

    templateFor<TModel>(value: TModel): ITemplate<TModel> {

        if (typeof value == "string" || typeof value == "number")
            return this.loadTemplate<TModel>("Text");

        if (typeof value == "object" && "template" in value)
            return this.loadTemplate<TModel>((value as any).template);

        throw new Error("cannot determine template for model");
    }

    loadTemplate<TModel>(templateOrName: CatalogTemplate<TModel>): ITemplate<TModel> {

        if (typeof templateOrName == "string") {
            const result = TemplateCatalog[templateOrName];
            if (!result)
                console.error("Template ", templateOrName, " not found.");
            return result;
        }

        return <ITemplate<TModel>>templateOrName;
    }

    template(templateOrName: CatalogTemplate<TModel>): this;

    template<TInnerModel>(templateOrName: CatalogTemplate<TInnerModel>, model: BindValue<TModel, TInnerModel>): this;

    template(templateOrName: CatalogTemplate<any>, model?: BindValue<TModel, any>): this {

        const template = this.loadTemplate(templateOrName);

        if (model) {

            const childBuilder = this.beginTemplate(undefined, undefined, undefined, this.createMarker(model, "template"));

            this.bind(model, (value, oldValue, isUpdate, isClear) => {

                if (isClear)
                    return;

                childBuilder.updateModel(value);

                if (!isUpdate)
                    template(childBuilder);
            });

            this.endTemplate(childBuilder);
        }
        else
            template(this);

        return this;
    }

    exec(action: (buidler: this) => void): this {
        action(this);
        return this;
    }

    beginChild<TKey extends keyof HTMLElementTagNameMap>(name: TKey, namespace?: string): ChildTemplateBuilder<TModel, HTMLElementTagNameMap[TKey] | TElement, this> {

        if (this.isInline && this._childCount > 0)
            throw new Error("In inline mode you must have a single root element for your template");

        const childElement = this.isInline && name.toUpperCase() == this.element.tagName ? this.element : this.createElement(name, namespace);

        const childBuilder = new ChildTemplateBuilder<TModel, HTMLElementTagNameMap[TKey] | TElement, this>(this.model, childElement, this);

        if (childElement == this.element)
            childBuilder._lastElement = this._lastElement;

        this.register(childBuilder);

        this._childCount++;

        return childBuilder;
    }

    child<TKey extends keyof HTMLElementTagNameMap>(name: TKey, attributes?: TemplateValueMap<TModel, TElement>, namespace?: string): this

    child<TKey extends keyof HTMLElementTagNameMap>(name: TKey, builder: (builder: TemplateBuilder<TModel, HTMLElementTagNameMap[TKey]>, namespace?: string) => void): this

    child<TKey extends keyof HTMLElementTagNameMap>(name: TKey, builderOrAttributes?: any, namespace?: string): this {

        const childBuilder = new TemplateBuilder<TModel, HTMLElementTagNameMap[TKey]>(this.model, this.createElement(name, namespace), this);

        this.register(childBuilder);

        if (typeof builderOrAttributes == "function")
            builderOrAttributes(childBuilder);
        else
            childBuilder.attribs(builderOrAttributes);

        this.appendChild(childBuilder.element);

        return this;
    }

    set(attribute: string, value: BindValue<TModel, string | number | boolean | Promise<string | number | boolean>>): this {

        this.bind(value, a => {
            if (a !== null && a !== undefined) {
                if (a instanceof Promise) {
                    a.then(newValue => this.element.setAttribute(attribute, newValue as string));
                }
                else
                    this.element.setAttribute(attribute, a as string);
            }
            else
                this.element.removeAttribute(attribute);
        });
        return this;
    }

    on<TKey extends keyof HTMLElementEventMap>(event: TKey, handler: (model: TModel, e?: HTMLElementEventMap[TKey]) => void): this {
        this.element.addEventListener(event, ev => handler(this.model, ev));
        return this;
    }

    class(name: BindValue<TModel, string>): this;

    class(name: string, condition: BindValue<TModel, Boolean>): this;

    class(name: string | BindValue<TModel, string>, condition?: BindValue<TModel, Boolean>): this {
        if (condition && typeof(name) == "string") {
            const nameParts: string[] = name ? name.split(" ") : [];
            this.bind(condition, value => {
                if (value)
                    nameParts.forEach(a => this.element.classList.add(a));
                else
                    nameParts.forEach(a => this.element.classList.remove(a));
            })
        }
        else
            this.bind(name, (value, oldValue) => {
                if (oldValue)
                    oldValue.split(" ").forEach(item =>
                        this.element.classList.remove(item));
                if (value)
                    value.split(" ").forEach(item =>
                        this.element.classList.add(item));
            });
        return this;
    }

    visible(value: BindValue<TModel, boolean>): this {

        this.bind(value, (newValue, oldValue, isUpdate, isClear) => {

            if (isClear)
                return;

            if (newValue) {
                this.element.classList.add("visible");
                this.element.classList.remove("hidden");
            }
            else {
                this.element.classList.add("hidden");
                this.element.classList.remove("visible");
            }
        });
        return this;
    }

    text(value: BindValue<TModel, string | number>): this {
        const textNode = document.createTextNode("");

        this.appendChild(textNode);

        this.bind(value, a => textNode.textContent = <any>a);

        return this;
    }

    html(value: BindValue<TModel, string>): this {
        this.bind(value, a => this.element.innerHTML = a);
        return this;
    }

    focus(value: BindValue<TModel, boolean>): this {

        const valueProp = this.getBindingProperty(value);

        if (valueProp) {
            this.element.addEventListener("focus", ev =>
                valueProp.set(true));
            this.element.addEventListener("focusout", ev =>
                valueProp.set(false));
        }
        this.bind(value, a => {
            if (a && document.activeElement != this.element)
                this.element.focus();
        });
        return this;
    }

    value(value: BindValue<TModel, string | boolean>): this {

        const element = <HTMLInputElement><any>this.element;

        const valueProp = this.getBindingProperty(value);

        if (valueProp) {
            if (element.tagName == "INPUT" || element.tagName == "TEXTAREA") {

                if (element.type == "checkbox" || element.type == "radio")
                    element.addEventListener("change", ev => {
                        valueProp.set(element.checked);
                    });
                else {
                    element.addEventListener("keyup", ev => {
                        valueProp.set(element.value);
                    });
                    element.addEventListener("change", ev => {
                        valueProp.set(element.value);
                    });
                }
            }
            else if (element.tagName == "SELECT") {
                element.addEventListener("change", ev => {
                    valueProp.set(element.value);
                });
            }

        }
        if (element.tagName == "INPUT" || element.tagName == "TEXTAREA" || element.tagName == "SELECT") {

            if (element.type == "checkbox" || element.type == "radio")
                this.bind(value, (a: boolean) => element.checked = a);
            else
                this.bind(value, (a: string) => a ? element.value = a : element.value = null);
        }
        return this;
    }

    style<TKey extends keyof CSSStyleDeclaration>(name: TKey, value: BindValue<TModel, CSSStyleDeclaration[TKey]>): this {
        this.bind(value, a => this.element.style[name] = a);
        return this;
    }

    behavoir(value: IBehavoir<TElement, TModel>): this;

    behavoir(name: string): this;

    behavoir(nameOrValue: any): this {

        if (typeof nameOrValue == "string")
            BehavoirCatalog[nameOrValue]().attach(this.element, this.model);
        else
            (nameOrValue as IBehavoir).attach(this.element, this.model);

        return this;
    }

    styles(value: TemplateValueMap<TModel, CSSStyleDeclaration>): this {
        for (const name in value)
            this.bind(value[name], a => this.element.style[name] = a);
        return this;
    }

    attribs(value: { [key: string]: BindValue<TModel, string | number | boolean> }): this {

        for (const name in value)
            this.set(name, value[name]);

        return this;
    }

    debugger(): this {

        debugger;
        return this;
    }

    protected createElement<TKey extends keyof HTMLElementTagNameMap>(name: TKey, namespace?: string): HTMLElementTagNameMap[TKey] {
        if (!namespace)
            namespace = this.namespace;
        if (namespace)
            return document.createElementNS(namespace, name) as HTMLElementTagNameMap[TKey];
        return document.createElement(name);
    }

    protected createMarker(obj: any, baseName: string = ""): string {

        return undefined;

        if (typeof obj == "function")
            return this.createMarker(obj(this.model), baseName);

        if (typeof obj == "string")
            return baseName + obj;

        if (obj == null)
            return baseName + "null";

        return this.createMarker(getTypeName(obj), baseName);
    }


    namespace: string = null;

    element: TElement = null;

    parent: TemplateBuilder<any> = null;

    isInline: boolean = false;

    inlineMode: TemplateInlineMode = "never";

    index: number = 0;
}

/****************************************/

class ChildTemplateBuilder<TModel, TElement extends HTMLElement, TParent extends TemplateBuilder<TModel>>
    extends TemplateBuilder<TModel, TElement>
    implements IChildTemplateBuilder<TModel, TElement, TParent> {

    constructor(model: TModel, element: TElement, parent?: TParent) {
        super(model, element, parent);
    }


    endChild(): TParent {

        if (this.parent.element != this.element)
            this.parent.appendChild(this.element);
        else {

            if (this._lastElement)
                this.parent["_lastElement"] = this._lastElement;
        }

        return <TParent>this.parent;
    }
}


/****************************************/

export function mount<TModel>(root: HTMLElement, template: CatalogTemplate<TModel>, model: TModel) : void;
export function mount(root: HTMLElement, component: ITemplateProvider): void;
export function mount<TModel>(root: HTMLElement, templateOrProvider: CatalogTemplate<TModel> | ITemplateProvider, model?: TModel) : void {

    root.innerHTML = "";

    const template = model === undefined ? (templateOrProvider as ITemplateProvider).template : templateOrProvider as CatalogTemplate<TModel>;

    if (!model)
        model = templateOrProvider as TModel;

    const builder = new TemplateBuilder(model, root);

    builder.begin();

    builder.loadTemplate(template)(builder);

    builder.end();
}

/****************************************/

defineTemplate("Text", t => t.text(m => m));