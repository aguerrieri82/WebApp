import { COMPONENT, ServiceType, StringLike, isComponent } from "./abstraction";
import { IBehavoir, isBehavoir } from "./abstraction/IBehavoir";
import type { BindValue, BoundObject, BoundObjectModes } from "./abstraction/IBinder";
import { isHTMLContainer } from "./abstraction/IHTMLContainer";
import { isMountListener } from "./abstraction/IMountListener";
import { IObservableArrayHandler, isObservableArray } from "./abstraction/IObservableArray";
import { ITemplate, isTemplate } from "./abstraction/ITemplate";
import { ITemplateContext } from "./abstraction/ITemplateContext";
import { CatalogTemplate, ITemplateProvider, isTemplateProvider } from "./abstraction/ITemplateProvider";
import { Binder } from "./Binder";
import { cleanProxy, proxyEquals } from "./Expression";
import { getTypeName, isClass, setTypeName } from "./utils/Object";
import { ArrayTemplate, BehavoirCatalog, TemplateCatalog, TextTemplate } from "./Templates";
import { getComponent } from "./Component";
import Services from "./Services";

type TemplateValueMap<TModel, TObj> = {

    [TKey in keyof TObj]?: BindValue<TModel, TObj[TKey]>
}

type TemplateInlineMode = "never" | "always" | "auto" | "explicit" | "replace-parent" | "embed-child" | "inherit";

type RefNodePosition = "after" | "before" | "inside";

type ClassComponenType<TProps> = IBehavoir | ITemplateProvider<TProps> & TProps;

type FunctionalComponenType<TProps> = ITemplate<TProps> | null | undefined | void;

type BehavoirType<TElement extends Element, TModel> = string | { new(): IBehavoir } | IBehavoir | BehavoirType<TElement, TModel>[];

type ComponentType<TProps, TComp extends ClassComponenType<TProps>, TResult extends FunctionalComponenType<TProps>> =
    { new(props?: TProps): TComp } |
    { (props?: TProps): TResult }

type StyleBinding<TModel> = {
    [K in keyof CSSStyleDeclaration]: BindValue<TModel, CSSStyleDeclaration[K]>
}
interface IComponentInfo<TModel> {
    model?: TModel;
    component: ClassComponenType<TModel> | FunctionalComponenType<TModel>;
}
interface ISwitchCondition<TValue> {

    condition: BindValue<TValue, boolean>;

    template: CatalogTemplate<TValue>;
}

export type InputValueMode = "focus" | "change" | "keyup" | "pool";

/****************************************/

export class TemplateBuilder<TModel, TElement extends HTMLElement = HTMLElement>
    extends Binder<TModel>  {

    protected _endElement: Node;
    protected _startElement: Node;
    protected _lastElement: Node;
    protected _childCount = 0;
    protected _updateCount = 0;
    protected _updateNode: Node = null;
    protected _shadowUpdate = false;
    protected _isRemoved = false;
    protected _behavoirs: IBehavoir<HTMLElement, unknown>[] = [];

    constructor(model: TModel, element: TElement, parent?: TemplateBuilder<unknown>) {

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

        this._childBinders.push(innerBuilder);

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

    logTempatesTree() {

        console.group(`[${this._tag ?? ""}] ${this.element?.nodeName} (${getTypeName(this.model)})`);

        console.log("Model", getTypeName(this.model));

        console.group(`Bindings (${this._bindings.length})`);

        for (const bind of this._bindings) {
            console.group(`"${bind.value.toString()}" (${bind.subscriptions.length})`);
            console.log(bind);
            console.groupEnd();
        }

        console.groupEnd();

        for (const child of this._childBinders as TemplateBuilder<unknown>[]) {
            if (this._modelBinders.indexOf(child as TemplateBuilder<TModel>) == -1)
                child.logTempatesTree();
        }

        for (const child of this._modelBinders as TemplateBuilder<TModel>[])
            child.logTempatesTree();

        console.groupEnd();
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

    clear(remove: boolean = false, cleanValue = true): this {

        this._childCount = 0;

        if (!this._endElement) {
            console.warn("Missing end element: " + this.model);
            this.end();
        }

        let curNode = this._endElement;

        while (true) {

            if (!curNode.parentElement) {
                console.warn("orphan node:", curNode);
                break;
            }

            let mustDelete = true;

            if ((curNode == this._startElement || curNode == this._endElement) && !remove)
                mustDelete = false;

            const prev = curNode.previousSibling;

        
            if (mustDelete) 
                curNode.parentNode.removeChild(curNode);
            
            if (curNode == this._startElement)
                break;

            curNode = prev;
        }

        if (!remove)
            this._lastElement = this._startElement;

        this.execForSubBinders(bld => {

            if (remove) {
                bld._endElement = null;
                bld._startElement = null;
                bld._lastElement = null;
                bld._isRemoved = true;
            }

            if (bld._behavoirs) {

                for (const item of bld._behavoirs)
                    item.detach(this.getContext());

                bld._behavoirs = [];
            }
   
            bld.cleanBindings(cleanValue, false);

        }, true);

        return this;
    }

    protected onRemoved() {

        this._isRemoved = true;
    }

    protected getContext() {

        const ctx = {

            logTree: () => {

                ctx.visitChildComponents((ctx, level) => {

                    const compo = getComponent(ctx.model);

                    console.log(" ".repeat(level * 3), getTypeName(compo));
                })
            },

            require: <TService,>(service: ServiceType) => {

                const parent = ctx.parent(m => typeof(m) == "object" && service in m);
                if (parent)
                    return (parent.model as Record<ServiceType, TService>)[service];

                return (Services)[service] as TService; 
            },

            visitChildComponents: (visitor) => ctx.visitChildren(visitor, m => getComponent(m) != undefined),

            visitChildren: (visitor, selector) => {

                const visit = (item: this, curModel: unknown, level: number) => {

                    const allBinders = [...item._childBinders, ...item._modelBinders] as this[];

                    for (const binder of allBinders) {

                        let nextModel = curModel;
                        let nextLevel = level;

                        if (binder.model != curModel) {

                            if ((!selector || selector(binder.model))) {

                                const result = visitor(binder.getContext(), level);

                                if (result == "stop")
                                    return false;

                                if (result == "skip-children") 
                                    continue;

                                nextLevel = level + 1;
                            }
                
                            nextModel = binder.model;
                        }

                        if (!visit(binder, nextModel, nextLevel))
                            return false;
                    }

                    return true;
                }

                visit(this, this.model, 0);
            },

            parent: selector => {

                let curParent = this.parent;

                while (curParent && (curParent.model == this.model || (selector && !selector(curParent.model))))
                    curParent = curParent.parent;

                if (curParent)
                    return curParent.getContext();
            },

            parentOfType: type => ctx.parent(m => m instanceof type),

            parentComponent: () => ctx.parent(m => isComponent(m)),

            model: this.model,

            element: this._lastElement

        } as ITemplateContext

        return ctx;
    }

    appendChild(node: Node): this {

        if (!this._lastElement || !this._lastElement.parentNode) //TODO WARN: this || didn't exists
            this.element.appendChild(node);
        else {
            if (this._lastElement.nextSibling)
                this._lastElement.parentNode.insertBefore(node, this._lastElement.nextSibling);
            else
                this._lastElement.parentNode.appendChild(node);

        }
        //TODO WARN: this line was inside else
        this._lastElement = node;
        //
        return this;
    }


    foreach<TItem>(selector: BindValue<TModel, TItem[]>, templateOrName?: CatalogTemplate<TItem>): this {

        let itemsBuilders: TemplateBuilder<TItem>[] = [];

        let template = templateOrName ? this.loadTemplate(templateOrName) : undefined;

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
                itemBuilder._tag = "array[" + index + "]";

                let itemTemplate = template;

                if (!itemTemplate)
                    itemTemplate = this.templateFor(item);

                itemTemplate(itemBuilder);

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

    switch<TValue>(selector: BindValue<TModel, TValue>, build: (bld: SwitchBuilder<TValue>) => void): this {

        const builder = new SwitchBuilder<TValue>();

        build(builder);

        const childBuilder = this.beginTemplate<TValue>();
        childBuilder._tag = "switch";

        this.bind(selector, (value, oldValue, isUpdate, isClear) => {

            if (isClear)
                return;

            if (isUpdate)
                childBuilder.clear();

            childBuilder.updateModel(value);

            for (const cond of builder.conditions) {

                const match = typeof cond.condition == "function" ? cond.condition(value) : cond;

                if (match) {
                    childBuilder.template(cond.template);
                    return;
                }
            }

            if (builder.defaultTemplate)
                childBuilder.template(builder.defaultTemplate);
        });

        this.endTemplate(childBuilder);

        return this;
    }

    enter<TInnerModel>(expression: BindValue<TModel, TInnerModel>, action: (t: TemplateBuilder<TInnerModel>) => any) {

        const childBuilder = this.beginTemplate<TInnerModel>(undefined, undefined, undefined, this.createMarker(expression));
        childBuilder._tag = "enter";

        this.bind(expression, (value, oldValue, isUpdate, isClear) => {

            if (isClear)
                return;

            if (isUpdate)
                childBuilder.clear();

            childBuilder.updateModel(value);

            action(childBuilder);
        });

        this.endTemplate(childBuilder);

        return this;
    }

    if(condition: BindValue<TModel, boolean>, trueTemplate: ITemplate<TModel>, falseTemplate?: ITemplate<TModel>): this {

        const childBuilder = this.beginTemplate(this.model);

        this.register(childBuilder, "if");

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
                result.push(child.cloneNode(true));
        }
        return result;
    }

    protected createComponent<TProps extends Record<string, unknown>, TComp extends ClassComponenType<TProps> & TProps, TResult extends FunctionalComponenType<TProps>>(constructor: ComponentType<TProps, TComp, TResult>, props: BoundObject<TProps>, modes?: BoundObjectModes<TProps>): IComponentInfo<TProps> {

        let model: Record<string, unknown>;
        let callOnChange = false;

        if (isClass(constructor))
            model = new constructor()
        else 
            model = {}
        

        if (props) {

            for (const prop in props) {

                const propValue = props[prop] as BindValue<TProps, unknown>;

                if (prop == "ref") {

                    this.bind(propValue, () => {
                        const refProp = this.getBindingProperty(propValue);
                        if (refProp)
                            refProp.set(model);
                    }, "exec-always");
                    continue;
                }

                const mode = modes ? modes[prop] : undefined;

                if (mode == "two-ways") {

                    this.bindTwoWays(propValue, model, m => m[prop], "srcToDst", () => {
                        if (callOnChange && !isClass(constructor))
                            constructor(model as TProps);
                    });
                }
                else {
                    //TODO call bindOneWay?
                    this.bind(propValue, value => {
                        model[prop] = value;
                        if (callOnChange && !isClass(constructor))
                            constructor(model as TProps);
                    }, prop == "builder" || mode == "no-bind" || mode == "action" ? "no-bind" : undefined);
                }
            }

            if (!isClass(constructor)) {
                (props as Record<symbol, unknown>)[COMPONENT] = constructor;
                setTypeName(props, getTypeName(constructor));
            }

        }

        if (isClass(constructor))
            return {
                component: model as TComp
            }

        const result = constructor(model as TProps);

        callOnChange = !isTemplate(result);

        return {
            component: result,
            model: model as TProps
        }
    }

    componentContent<TProps extends Record<string, unknown>, TComp extends ClassComponenType<TProps> & TProps, TResult extends FunctionalComponenType<TProps>>(constructor: ComponentType<TProps, TComp, TResult>, props: BoundObject<TProps>, modes?: BoundObjectModes<TProps>): ITemplateProvider<TProps> {

        const result = this.createComponent(constructor, props, modes);

        if (!result.model) {

            if (isTemplateProvider(result.component))
                return result.component;
        }

        if (isTemplate(result.component))
            return {
                template: result.component,
                model: result.model
            };

        throw new Error(`Component '${getTypeName(constructor)}' not supported`);
    }

    component<TProps extends Record<string, unknown>, TComp extends ClassComponenType<TProps> & TProps, TResult extends FunctionalComponenType<TProps>>(constructor: ComponentType<TProps, TComp, TResult>, props: BoundObject<TProps>, modes?: BoundObjectModes<TProps>): this {

        const result = this.createComponent(constructor, props, modes);

        if (!result.model) {

            if (isTemplateProvider(result.component))
                return this.content(result.component);

            if (isBehavoir(result.component))
                return this.behavoir(result.component);
        }

        if (isTemplate(result.component))
            return this.template(result.component, result.model);

        return this;

    }

    content<TInnerModel extends ITemplateProvider | string>(content: BindValue<TModel, TInnerModel>, inline?: boolean): this {

        const childBuilder = this.beginTemplate<TInnerModel>(undefined, undefined, undefined, this.createMarker(content));

        childBuilder.isInline = inline;
        childBuilder.inlineMode = "explicit";
        childBuilder._tag = "content";

        this.bind(content, (value, oldValue, isUpdate, isClear) => {

            if (isClear)
                return;

            const model = cleanProxy(isTemplateProvider(value) && value.model ? value.model : value);

            this.beginUpdate();

            if (!childBuilder.isInline && isHTMLContainer(value) && value.nodes && value.isCacheEnabled === true) {
                childBuilder.replaceContent(value.nodes);
            }
            else {

                if (oldValue &&
                    value &&
                    isTemplateProvider(oldValue) &&
                    isTemplateProvider(value) &&
                    proxyEquals(oldValue.template, value.template)) { //TODO proxy should be already clean...

                    childBuilder.updateModel(model);
                }
                else {

                    if (isUpdate)
                        childBuilder.clear(); //TODO WARN: cleanValue was true

                    if (value) {

                        const template = cleanProxy(this.templateFor(value));

                        if (!template)
                            throw new Error("Template '" + value + "' not found.");

                        childBuilder.updateModel(model);

                        template(childBuilder);

                        if (isMountListener(value)) {
                            value.mount(childBuilder.getContext());
                            childBuilder.onClean(() => value.unmount());
                        }
                    }
                }

                if (isHTMLContainer(value) && value.isCacheEnabled === true) {
                    value.nodes = childBuilder.extractContent();
                }
             
            }

            this.endUpdate();
        });

        this.endTemplate(childBuilder);

        return this;
    }

    templateFor<TInnerModel>(value: TInnerModel): ITemplate<TInnerModel> {

        if (typeof value == "string" || typeof value == "number" || typeof value == "boolean")
            return this.loadTemplate<TInnerModel>(TextTemplate);

        if (Array.isArray(value) && !isObservableArray(value))
            return this.loadTemplate<TInnerModel>(ArrayTemplate as any); //TODO: TS shit

        if (isTemplateProvider(value))
            return this.loadTemplate<TInnerModel>(value.template);

        if (isTemplate(value))
            return value;

        throw new Error("cannot determine template for model");
    }

    loadTemplate<TInnerModel>(templateOrName: CatalogTemplate<TInnerModel>): ITemplate<TInnerModel> {

        if (typeof templateOrName == "string") {
            const result = TemplateCatalog[templateOrName];
            if (!result)
                console.error("Template ", templateOrName, " not found.");
            return result;
        }

        return templateOrName as ITemplate<TInnerModel>;
    }

    template(templateOrName: CatalogTemplate<TModel>): this;

    template<TInnerModel>(templateOrName: CatalogTemplate<TInnerModel>, model: BindValue<TModel, TInnerModel>): this;

    template(templateOrName: CatalogTemplate<unknown>, model?: BindValue<TModel, unknown>): this {

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

        this.register(childBuilder, "beginChild");

        this._childCount++;

        return childBuilder;
    }

    child<TKey extends keyof HTMLElementTagNameMap>(name: TKey, attributes?: TemplateValueMap<TModel, TElement>, namespace?: string): this

    child<TKey extends keyof HTMLElementTagNameMap>(name: TKey, builder: (builder: TemplateBuilder<TModel, HTMLElementTagNameMap[TKey]>, namespace?: string) => void): this

    child<TKey extends keyof HTMLElementTagNameMap>(name: TKey, builderOrAttributes?: unknown, namespace?: string): this {

        const childBuilder = new TemplateBuilder<TModel, HTMLElementTagNameMap[TKey]>(this.model, this.createElement(name, namespace), this);

        this.register(childBuilder, "child");

        if (typeof builderOrAttributes == "function")
            builderOrAttributes(childBuilder);
        else
            childBuilder.attribs(builderOrAttributes as TemplateValueMap<TModel, TElement>);

        this.appendChild(childBuilder.element);

        return this;
    }

    set(attribute: string, value: BindValue<TModel, StringLike | Promise<StringLike>>): this {

        this.bind(value, a => {

            const mustRemove = a === null ||
                a === undefined ||
                (!a && attribute == "disabled");

            if (!mustRemove) {
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
        this.element.addEventListener(event, ev =>
            handler(this.model, ev));
        return this;
    }

    class(name: BindValue<TModel, string>): this;

    class(name: string, condition: BindValue<TModel, Boolean>): this;

    class(name: string | BindValue<TModel, string>, condition?: BindValue<TModel, Boolean>): this {
        if (condition && typeof (name) == "string") {
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

            if (newValue === false) {
                this.element.classList.add("hidden");
                this.element.classList.remove("visible");

            }
            else {
                this.element.classList.add("visible");
                this.element.classList.remove("hidden");
            }
        });
        return this;
    }

    text(value: BindValue<TModel, StringLike>): this {
        const textNode = document.createTextNode("");

        this.appendChild(textNode);

        this.bind(value, a => textNode.textContent = a as string);

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

    ref(value: BindValue<TModel, TModel>): this {

        const valueProp = this.getBindingProperty(value);
        if (valueProp)
            valueProp.set(this.model);

        return this;
    }

    value(value: BindValue<TModel, string | boolean>, mode: InputValueMode = "change", poolTime: number = 500): this {

        const element = this.element as unknown as HTMLInputElement;

        if (element.tagName == "OPTION")
            return this.set("value", value);

        const valueProp = this.getBindingProperty(value);

        if (valueProp) {

            if (mode == "change" || mode == "keyup") {

                if (element.tagName == "INPUT" || element.tagName == "TEXTAREA") {

                    if (element.type == "checkbox" || element.type == "radio")
                        element.addEventListener("change", ev => {
                            valueProp.set(element.checked);
                        });
                    else {
                        if (mode == "change") {
                            element.addEventListener("change", ev => {
                                valueProp.set(element.value);
                            });
                        }
                        else {
                            element.addEventListener("keyup", ev => {
                                valueProp.set(element.value);
                            });
                        }
                    }
                }
                else if (element.tagName == "SELECT") {
                    element.addEventListener("change", ev => {
                        valueProp.set(element.value);
                    });
                }
            }
            else if (mode == "focus") {
                element.addEventListener("blur", ev => {
                    valueProp.set(element.value);
                });
            }
            else if (mode == "pool") {
                let lastValue: string;

                const check = () => {

                    if (!element.isConnected || this._isRemoved)
                        return;

                    if (lastValue !== undefined && lastValue != element.value)
                        valueProp.set(element.value);

                    lastValue = element.value;

                    setTimeout(check, poolTime);
                };

                setTimeout(check, poolTime);
            }


        }
        if (element.tagName == "INPUT" || element.tagName == "TEXTAREA" || element.tagName == "SELECT") {

            if (element.type == "checkbox" || element.type == "radio")
                this.bind(value, (a: boolean) => element.checked = a);
            else
                this.bind(value, (a: string) => {

                    element.value = a ?? null;
                });
        }
        return this;
    }

    style(value: StyleBinding<TModel>): this;

    style<TKey extends keyof CSSStyleDeclaration>(name: TKey, value: BindValue<TModel, CSSStyleDeclaration[TKey]>): this;

    style<TKey extends keyof CSSStyleDeclaration>(nameOrValue: TKey | StyleBinding<TModel>, value?: BindValue<TModel, CSSStyleDeclaration[TKey]>): this {

        if (typeof nameOrValue != "object")
            this.bind(value, a => this.element.style[nameOrValue] = a);
        else {

            for (const prop in nameOrValue)
                this.bind(nameOrValue[prop], a => this.element.style[prop] = a);

        }
        return this;
    }


    behavoir(nameOrValue: BehavoirType<TElement, TModel>): this {

        if (!Array.isArray(nameOrValue))
            nameOrValue = [nameOrValue];

        for (let item of nameOrValue) {

            if (typeof item == "string")
                item = BehavoirCatalog[item]();

            else if (typeof item == "function")
                item = new item();

            this._behavoirs.push(item as IBehavoir);
        }

        return this;
    }

    styles(value: TemplateValueMap<TModel, CSSStyleDeclaration>): this {
        for (const name in value)
            this.bind(value[name], a => this.element.style[name] = a);
        return this;
    }

    attribs(value: Record<string, BindValue<TModel, StringLike>>): this {

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

        return;

        if (typeof obj == "function")
            return this.createMarker(obj(this.model), baseName);

        if (typeof obj == "string")
            return baseName + obj;

        if (obj == null)
            return baseName + "null";

        return this.createMarker(getTypeName(obj), baseName);
    }

    namespace: string;

    element: TElement;

    declare parent: TemplateBuilder<unknown>;

    isInline: boolean = false;

    inlineMode: TemplateInlineMode = "never";

    index: number = 0;
}

/****************************************/

class ChildTemplateBuilder<TModel, TElement extends HTMLElement, TParent extends TemplateBuilder<TModel>>
    extends TemplateBuilder<TModel, TElement> {

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

        for (const item of this._behavoirs)
            item.attach(this.getContext());

        return <TParent>this.parent;
    }
}

/****************************************/
export class SwitchBuilder<TValue>{

    when(condition: BindValue<TValue, boolean>, template: CatalogTemplate<TValue>) {

        this.conditions.push({
            condition,
            template
        });

        return this;
    }

    default(template: CatalogTemplate<TValue>) {

        this.defaultTemplate = template;

        return this;
    }

    readonly conditions: ISwitchCondition<TValue>[] = [];

    defaultTemplate: CatalogTemplate<TValue>;
}

/****************************************/

export function withCleanup<T>(template: ITemplate<T>, action: () => void): ITemplate<T> {

    return t => {
        action();
        template(t);
    };
}

export function mount<TModel>(root: HTMLElement, template: CatalogTemplate<TModel>, model?: TModel): void;
export function mount(root: HTMLElement, component: ITemplateProvider): void;
export function mount<TModel>(root: HTMLElement, templateOrProvider: CatalogTemplate<TModel> | ITemplateProvider, model?: TModel): void {

    //root.innerHTML = "";

    const template = isTemplateProvider(templateOrProvider) ? templateOrProvider.template : templateOrProvider;

    if (!model) {
        if (isTemplateProvider(templateOrProvider))
            model = templateOrProvider as TModel;
        else
            model = {} as TModel;
    }


    const builder = new TemplateBuilder(model, root);

    webApp.root = builder;

    builder.begin();

    builder.loadTemplate(template)(builder);

    builder.end();
}
