function isObservableArray(value) {
    return Array.isArray(value) && "subscribe" in value && typeof (value["subscribe"]) == "function";
}

function forEachRev(items, action) {
    if (!items || items.length == 0)
        return;
    for (let i = items.length - 1; i >= 0; i--)
        action(items[i]);
}

function createObservableArray(value) {
    if (isObservableArray(value))
        return;
    let handlers;
    const newValue = value;
    newValue.raise = action => {
        if (!handlers)
            return;
        handlers.forEach(handler => action(handler));
    };
    newValue.subscribe = function (handler) {
        if (!handlers)
            handlers = [];
        const index = handlers.indexOf(handler);
        if (index == -1)
            handlers.push(handler);
        return handler;
    };
    newValue.unsubscribe = function (handler) {
        if (!handlers)
            return;
        const index = handlers.indexOf(handler);
        if (index != -1)
            handlers.splice(index, 1);
    };
    value.reverse = function () {
        const retValue = Array.prototype.reverse.call(this);
        this.raise(a => a.onReorder && a.onReorder());
        return retValue;
    };
    value.sort = function (...args) {
        const retValue = Array.prototype.sort.call(this, ...args);
        this.raise(a => a.onReorder && a.onReorder());
        return retValue;
    };
    value.push = function (...items) {
        const curIndex = this.length;
        const retValue = Array.prototype.push.call(this, ...items);
        for (let i = curIndex; i < this.length; i++)
            this.raise(a => a.onItemAdded && a.onItemAdded(this[i], i, "add"));
        this.raise(a => a.onChanged && a.onChanged());
        return retValue;
    };
    value.shift = function () {
        const result = Array.prototype.shift.call(this);
        if (result !== undefined) {
            this.raise(a => a.onItemRemoved && a.onItemRemoved(result, 0, "remove"));
            this.raise(a => a.onChanged && a.onChanged());
        }
        return result;
    };
    value.pop = function () {
        const result = Array.prototype.pop.call(this);
        if (result !== undefined) {
            this.raise(a => a.onItemRemoved && a.onItemRemoved(result, this.length, "remove"));
            this.raise(a => a.onChanged && a.onChanged());
        }
        return result;
    };
    value.splice = function (start, deleteCount, ...items) {
        const result = Array.prototype.splice.call(this, start, deleteCount, ...items);
        if (start == 0 && deleteCount >= this.length && (!items || items.length == 0))
            this.raise(a => a.onClear && a.onClear());
        if (deleteCount > 0) {
            for (let i = 0; i < deleteCount; i++)
                this.raise(a => a.onItemRemoved && a.onItemRemoved(result[i], i + start, "remove"));
        }
        if (items.length > 0) {
            for (let i = 0; i < items.length; i++)
                this.raise(a => a.onItemAdded && a.onItemAdded(items[i], i + start, "insert"));
        }
        this.raise(a => a.onChanged && a.onChanged());
        return result;
    };
    return newValue;
}

const PROPS = Symbol("Props");

function getFunctionName(func) {
    let curName = func.name;
    if (!curName) {
        const funcNameRegex = /function\s([^(]{1,})\(/;
        const results = (funcNameRegex).exec(func.toString());
        curName = (results && results.length > 1) ? results[1].trim() : "";
    }
    return curName;
}
function getTypeName(obj) {
    if (!obj)
        return undefined;
    let name = obj["@typeName"];
    if (!name) {
        name = typeof obj;
        if (name == "function")
            return getFunctionName(obj);
        if (name == "object") {
            const constFunc = obj.constructor;
            if (constFunc)
                return getTypeName(constFunc);
        }
    }
    return name;
}

class ObservableProperty {
    _handlers;
    _descriptor;
    constructor(desc, name) {
        this._descriptor = desc;
        this.name = name;
    }
    get() {
        if (this._descriptor.get)
            return this._descriptor.get();
        return this._descriptor.value;
    }
    set(value) {
        const oldValue = this.get();
        if (this._descriptor.set)
            this._descriptor.set(value);
        else
            this._descriptor.value = value;
        if (oldValue !== value && this._handlers) {
            forEachRev(this._handlers, handler => handler(value, oldValue));
        }
    }
    notifyChanged() {
        const value = this.get();
        forEachRev(this._handlers, handler => handler(value, undefined));
    }
    subscribe(handler) {
        if (!this._handlers)
            this._handlers = [];
        const index = this._handlers.indexOf(handler);
        if (index == -1)
            this._handlers.push(handler);
        return handler;
    }
    unsubscribe(handler) {
        if (!this._handlers)
            return;
        const index = this._handlers.indexOf(handler);
        if (index != -1)
            this._handlers.splice(index, 1);
    }
    name;
}

function getOrCreateProp(obj, propName, property, defValue) {
    const prop = getProp(obj, propName);
    if (prop)
        return prop;
    const newProp = createProp(obj, propName, property);
    if (defValue !== undefined && newProp.get() === undefined)
        newProp.set(defValue);
    return newProp;
}
function getProp(obj, propName) {
    if (PROPS in obj)
        return obj[PROPS][propName];
    return undefined;
}
function createProp(obj, propName, property) {
    let desc = Object.getOwnPropertyDescriptor(obj, propName);
    if (!desc) {
        console.warn("'", propName, "' not defined in ", getTypeName(obj));
        desc = {};
    }
    if (!property)
        property = new ObservableProperty(desc, propName);
    if (!(PROPS in obj)) {
        Object.defineProperty(obj, PROPS, {
            value: {},
            enumerable: false,
            writable: false
        });
    }
    obj[PROPS][propName] = property;
    Object.defineProperty(obj, propName, {
        get: () => property.get(),
        set: (newValue) => property.set(newValue)
    });
    return property;
}

const IS_PROXY = Symbol("isProxy");
class Binder {
    _bindings = [];
    _modelBinders = [];
    constructor(model) {
        this.updateModel(model);
    }
    register(binder) {
        this._modelBinders.push(binder);
    }
    getBindValue(value) {
        if (typeof value == "function")
            return value(this.model);
        return value;
    }
    getBindingValue(binding, subscribe = true) {
        return binding.value(this.createProxy(this.model, (obj, propName) => {
            if (subscribe)
                this.subscribe(obj, propName, binding);
            return true;
        }));
    }
    bind(value, action) {
        if (typeof value == "function") {
            const binding = {
                value: value,
                action: action,
                subscriptions: [],
                lastValue: undefined,
                suspend: 0
            };
            this._bindings.push(binding);
            const bindValue = this.getBindingValue(binding);
            binding.action(bindValue, undefined, false);
            binding.lastValue = bindValue;
        }
        else
            action(value, undefined, false);
    }
    unsubscribe(binding, cleanValue) {
        binding.subscriptions.forEach(sub => {
            if (isObservableArray(sub.source))
                sub.source.unsubscribe(sub.handler);
            if (sub.property)
                sub.property.unsubscribe(sub.handler);
        });
        if (cleanValue && binding.lastValue) {
            binding.action(null, binding.lastValue, true, true);
            binding.lastValue = null;
        }
        binding.subscriptions = [];
    }
    subscribe(obj, propName, binding) {
        for (let i = 0; i < binding.subscriptions.length; i++) {
            const sub = binding.subscriptions[i];
            if (sub.source == obj && sub.name == propName)
                return;
        }
        if (isObservableArray(obj)) {
            const handler = {
                onChanged: () => {
                    const bindValue = this.getBindingValue(binding);
                    if (bindValue == binding.lastValue)
                        return;
                    binding.action(bindValue, binding.lastValue, true);
                    binding.lastValue = bindValue;
                }
            };
            obj.subscribe(handler);
        }
        const propDesc = Object.getOwnPropertyDescriptor(obj, propName);
        if ((!propDesc && Array.isArray(obj)) || (!propDesc.writable && !propDesc.set)) {
            console.warn("Property ", propName, " for object ", obj, " not exists or is not writeable.");
            return;
        }
        const prop = getOrCreateProp(obj, propName);
        const handler = (value, oldValue) => {
            if (binding.suspend > 0)
                return;
            binding.suspend++;
            try {
                const bindValue = this.getBindingValue(binding, false);
                if (bindValue == binding.lastValue)
                    return;
                this.unsubscribe(binding, false);
                this.getBindingValue(binding);
                binding.action(bindValue, binding.lastValue, true);
                if (isObservableArray(obj)) {
                    obj.raise(a => a.onChanged && a.onChanged());
                    obj.raise(a => a.onItemReplaced && a.onItemReplaced(value, oldValue, parseInt(propName)));
                }
                binding.lastValue = bindValue;
            }
            finally {
                binding.suspend--;
            }
        };
        prop.subscribe(handler);
        binding.subscriptions.push({
            source: obj,
            property: prop,
            name: propName,
            handler: handler
        });
    }
    getBindingProperty(value) {
        if (typeof value != "function")
            return null;
        let lastProp;
        value(this.createProxy(this.model, (obj, propName) => {
            lastProp = {
                obj: obj,
                propName: propName
            };
            return true;
        }));
        if (lastProp && lastProp.obj)
            return getOrCreateProp(lastProp.obj, lastProp.propName);
    }
    findParentModel() {
        let current = this.parent;
        while (current) {
            if (current.model != this.model)
                return current.model;
            current = current.parent;
        }
    }
    createProxy(obj, action) {
        if (!obj || typeof (obj) !== "object" || obj[IS_PROXY])
            return obj;
        const innerProxies = {};
        if (Array.isArray(obj)) {
            if (!isObservableArray(obj))
                createObservableArray(obj);
        }
        return new Proxy(obj, {
            get: (target, prop) => {
                if (prop === IS_PROXY)
                    return true;
                if (prop === "@parent")
                    return this.createProxy(this.findParentModel(), action);
                if (typeof prop === "symbol" || typeof target[prop] === "function" || (Array.isArray(obj) && prop === "length"))
                    return target[prop];
                if (!(prop in innerProxies)) {
                    if (action(obj, prop))
                        innerProxies[prop] = this.createProxy(target[prop], action);
                    else
                        innerProxies[prop] = target[prop];
                }
                return innerProxies[prop];
            }
        });
    }
    cleanBindings(cleanValue) {
        this._bindings.forEach(binding => this.unsubscribe(binding, cleanValue));
        this._modelBinders.forEach(binder => binder.cleanBindings(cleanValue));
        this._modelBinders = [];
        this._bindings = [];
    }
    updateModel(model) {
        this.model = model;
        forEachRev(this._bindings, binding => {
            const value = this.getBindingValue(binding);
            if (binding.lastValue == value)
                return;
            binding.action(value, binding.lastValue, true);
            binding.lastValue = value;
        });
        forEachRev(this._modelBinders, binder => binder.updateModel(model));
    }
    model;
    parent;
}

function isHTMLContainer(value) {
    return value && typeof value == "object" && "nodes" in value;
}

/****************************************/
const TemplateCatalog = {};
const BehavoirCatalog = {};
/****************************************/
function defineTemplate(name, template) {
    TemplateCatalog[name] = template;
    return template;
}
/****************************************/
class TemplateBuilder extends Binder {
    _endElement;
    _startElement;
    _lastElement;
    _childCount = 0;
    _updateCount = 0;
    _updateNode = null;
    constructor(model, element, parent) {
        super(model);
        this.parent = parent;
        this.element = element;
        if (element.namespaceURI && element.namespaceURI != "http://www.w3.org/1999/xhtml")
            this.namespace = element.namespaceURI;
    }
    beginTemplate(model, refNode, refNodePos = "after", marker) {
        const innerBuilder = new TemplateBuilder(model, this.element, this);
        innerBuilder._lastElement = this._lastElement;
        innerBuilder.begin(refNode, refNodePos, marker);
        if (this.inlineMode == "explicit") {
            innerBuilder.isInline = this.isInline;
            innerBuilder.inlineMode = "inherit";
        }
        return innerBuilder;
    }
    endTemplate(childBuilder) {
        childBuilder.end();
        if (childBuilder.element == this.element)
            this._lastElement = childBuilder._lastElement;
    }
    beginUpdate() {
        if (this._updateCount == 0 && this.element.parentNode) {
            this._updateNode = document.createTextNode("");
            this.element.parentNode.replaceChild(this._updateNode, this.element);
        }
        this._updateCount++;
    }
    endUpdate() {
        this._updateCount--;
        if (this._updateCount == 0 && this._updateNode) {
            this._updateNode.parentNode.replaceChild(this.element, this._updateNode);
            this._updateNode = null;
        }
    }
    begin(refNode, refNodePos, marker) {
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
    end() {
        if (this._endElement)
            return;
        if (this._startElement.nodeType == Node.COMMENT_NODE)
            this._endElement = document.createComment(this._startElement.textContent.replace("begin-", "end-"));
        else
            this._endElement = document.createTextNode("");
        this.appendChild(this._endElement);
        return this;
    }
    clear(remove = false) {
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
    appendChild(node) {
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
    foreach(selector, templateOrName) {
        let itemsBuilders = [];
        const template = this.loadTemplate(templateOrName);
        const marker = document.createTextNode("");
        this.appendChild(marker);
        const handler = {
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
            onItemSwap: (index, newIndex) => {
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
                let itemBuilder;
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
    if(condition, trueTemplate, falseTemplate) {
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
    replaceContent(nodes) {
        if (this.isInline)
            throw new Error("'replaceContent' not supported in inline elements");
        this.clear();
        for (const node of nodes)
            this.appendChild(node);
    }
    extractContent() {
        const result = [];
        for (const child of this.element.childNodes) {
            if (child != this._startElement && child != this._endElement)
                result.push(child);
        }
        return result;
    }
    content(content, inline = false) {
        const childBuilder = this.beginTemplate(undefined, undefined, undefined, this.createMarker(content));
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
    templateFor(value) {
        if (typeof value == "string" || typeof value == "number")
            return this.loadTemplate("Text");
        if (typeof value == "object" && "template" in value)
            return this.loadTemplate(value.template);
        throw new Error("cannot determine template for model");
    }
    loadTemplate(templateOrName) {
        if (typeof templateOrName == "string") {
            const result = TemplateCatalog[templateOrName];
            if (!result)
                console.error("Template ", templateOrName, " not found.");
            return result;
        }
        return templateOrName;
    }
    template(templateOrName, model) {
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
    exec(action) {
        action(this);
        return this;
    }
    beginChild(name, namespace) {
        if (this.isInline && this._childCount > 0)
            throw new Error("In inline mode you must have a single root element for your template");
        const childElement = this.isInline && name.toUpperCase() == this.element.tagName ? this.element : this.createElement(name, namespace);
        const childBuilder = new ChildTemplateBuilder(this.model, childElement, this);
        if (childElement == this.element)
            childBuilder._lastElement = this._lastElement;
        this.register(childBuilder);
        this._childCount++;
        return childBuilder;
    }
    child(name, builderOrAttributes, namespace) {
        const childBuilder = new TemplateBuilder(this.model, this.createElement(name, namespace), this);
        this.register(childBuilder);
        if (typeof builderOrAttributes == "function")
            builderOrAttributes(childBuilder);
        else
            childBuilder.attribs(builderOrAttributes);
        this.appendChild(childBuilder.element);
        return this;
    }
    set(attribute, value) {
        this.bind(value, a => {
            if (a !== null && a !== undefined) {
                if (a instanceof Promise) {
                    a.then(newValue => this.element.setAttribute(attribute, newValue));
                }
                else
                    this.element.setAttribute(attribute, a);
            }
            else
                this.element.removeAttribute(attribute);
        });
        return this;
    }
    on(event, handler) {
        this.element.addEventListener(event, ev => handler(this.model, ev));
        return this;
    }
    class(name, condition) {
        if (condition && typeof (name) == "string") {
            const nameParts = name ? name.split(" ") : [];
            this.bind(condition, value => {
                if (value)
                    nameParts.forEach(a => this.element.classList.add(a));
                else
                    nameParts.forEach(a => this.element.classList.remove(a));
            });
        }
        else
            this.bind(name, (value, oldValue) => {
                if (oldValue)
                    oldValue.split(" ").forEach(item => this.element.classList.remove(item));
                if (value)
                    value.split(" ").forEach(item => this.element.classList.add(item));
            });
        return this;
    }
    visible(value) {
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
    text(value) {
        const textNode = document.createTextNode("");
        this.appendChild(textNode);
        this.bind(value, a => textNode.textContent = a);
        return this;
    }
    html(value) {
        this.bind(value, a => this.element.innerHTML = a);
        return this;
    }
    focus(value) {
        const valueProp = this.getBindingProperty(value);
        if (valueProp) {
            this.element.addEventListener("focus", ev => valueProp.set(true));
            this.element.addEventListener("focusout", ev => valueProp.set(false));
        }
        this.bind(value, a => {
            if (a && document.activeElement != this.element)
                this.element.focus();
        });
        return this;
    }
    value(value) {
        const element = this.element;
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
                this.bind(value, (a) => element.checked = a);
            else
                this.bind(value, (a) => a ? element.value = a : element.value = null);
        }
        return this;
    }
    style(name, value) {
        this.bind(value, a => this.element.style[name] = a);
        return this;
    }
    behavoir(nameOrValue) {
        if (typeof nameOrValue == "string")
            BehavoirCatalog[nameOrValue]().attach(this.element, this.model);
        else
            nameOrValue.attach(this.element, this.model);
        return this;
    }
    styles(value) {
        for (const name in value)
            this.bind(value[name], a => this.element.style[name] = a);
        return this;
    }
    attribs(value) {
        for (const name in value)
            this.set(name, value[name]);
        return this;
    }
    debugger() {
        debugger;
        return this;
    }
    createElement(name, namespace) {
        if (!namespace)
            namespace = this.namespace;
        if (namespace)
            return document.createElementNS(namespace, name);
        return document.createElement(name);
    }
    createMarker(obj, baseName = "") {
        return undefined;
    }
    namespace = null;
    element = null;
    parent = null;
    isInline = false;
    inlineMode = "never";
    index = 0;
}
/****************************************/
class ChildTemplateBuilder extends TemplateBuilder {
    constructor(model, element, parent) {
        super(model, element, parent);
    }
    endChild() {
        if (this.parent.element != this.element)
            this.parent.appendChild(this.element);
        else {
            if (this._lastElement)
                this.parent["_lastElement"] = this._lastElement;
        }
        return this.parent;
    }
}
/****************************************/
function template(root, template, model) {
    root.innerHTML = "";
    const builder = new TemplateBuilder(model, root);
    builder.begin();
    builder.loadTemplate(template)(builder);
    builder.end();
}

window.__defineTemplate = defineTemplate;

const Index = __defineTemplate("Index", t => { t
    .beginChild("div").text(m => m.msg).endChild()
    .beginChild("div").text(m => m.msg).endChild()
    .beginChild("div").text(m => 'Primo: ' + m.items[0]?.name).endChild()
    .beginChild("div").text(m => 'Primo: ' + m.innerObj.name).endChild()
    .foreach(m => m.items, t1 => t1
        .beginChild("div")
            .beginChild("span").text(m => m.name).endChild()
            .beginChild("button").on("click", m => m.name = m.name == 'cambiato' ? 'ripristinato' : 'cambiato').text("Change").endChild()
            .if(m => m.name == 'cambiato', t3 => t3
                .beginChild("img").set("width","50").set("src",m => m['@parent'].logo).endChild()
            )
        .endChild()
    )
    .beginChild("button").on("click", m => m.add()).text("Add").endChild()
    .beginChild("button").on("click", m => m.replace()).text("Replace").endChild()
    .beginChild("button").on("click", m => m.change()).text("Change").endChild()
    .beginChild("button").on("click", m => m.addMany()).text("Add Many").endChild()
    .beginChild("button").on("click", m => m.newImage()).text("New Image").endChild();
});

async function runAsync() {
    const rootModel = {
        items: [],
        msg: "",
        innerObj: {
            name: "Inner"
        },
        logo: "/logo.png",
        change() {
            this.msg = "Nuovo messaggio" + new Date().getTime();
            if (this.items.length > 0)
                this.items[0].name = "Item change" + new Date().getTime();
            this.innerObj.name = "Inner change" + new Date().getTime();
        },
        replace() {
            if (this.items.length > 0)
                this.items[0] = {
                    name: "Pippo"
                };
            this.innerObj = {
                name: "Replace inner"
            };
        },
        add() {
            this.items.push({ name: "Luca" }, { name: "Mario" });
        },
        addMany() {
            const newItems = [];
            for (let i = 0; i < 10000; i++)
                newItems.push({ name: "Item " + i });
            this.items.push(...newItems);
        },
        newImage() {
            this.logo = "https://www.google.com/images/branding/googlelogo/1x/googlelogo_color_272x92dp.png";
        }
    };
    setInterval(() => {
        //rootModel.msg = "Time is: " + new Date();
    }, 1000);
    template(document.body, Index, rootModel);
}
window.addEventListener("load", runAsync);
//# sourceMappingURL=app.js.map
