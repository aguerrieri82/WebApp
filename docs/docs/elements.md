# Elements

This chapter describes the different building blocks of the framework’s rendering system, 
including how to define templates, bind data, and handle dynamic DOM updates. 
It covers the syntax and conventions for building reactive interfaces with both 
the fluent API (Builder) and JSX syntax. 
The elements and attributes described here allow you to construct flexible, 
data-driven UIs with live updates and minimal manual DOM management.

Some elements are automatically detected using an expression inside the JSX as a shortcut.

## Template

Define a new template. A template is a function that builds or updates a DOM tree for a given model. 
The template is "live": it monitors the model for changes and updates the DOM accordingly. 
At least one template must be mounted in your document using the `mount(elementOrSelector, template)` function.

**Builder**

```javascript
import { template } from "@eusoft/webapp-core";

template(t => t);
```

**JSX**

```javascript
import { forModel } from "@eusoft/webapp-jsx";

forModel<TModel>(m => <>
</>);

forModel(myModel, m => <>
</>);

<Template name="">
</Template>
```

## HTML Elements

Standard HTML elements can be created using the fluent API in the template builder.

In JSX, events are mapped using special `on-*` attributes, where `*` is the event name (e.g., `on-click`).

In addition to standard HTML attributes:

- `focus`: two-way boolean expression to get/set the focus status.
- `visible`: adds or removes the "visible" or "hidden" class to an element based on the boolean expression.
- `html`: sets the inner HTML of an element.
- `text`: sets the inner text of an element.

For `input`, `textarea`, and `select` elements:

- `value-mode`: determines how the value update must be notified:
    - `change`: when the value changes (default).
    - `focus`: when the element loses focus.
    - `input`: when the value changes due to user input.
    - `keyup`: after every keyup event.
    - `pool`: periodically checks for value changes every `value-pool` milliseconds.
- `value-pool`: interval in milliseconds (default: 500).

**Builder**

```javascript
template(t => t
    .beginChild("div").class("myClass")
        .beginChild("span").set("title", "a span")
            .text("Text")
        .endChild()
        .beginChild("button").on("click", ev => console.log("Clicked!"))
            .text("Click me")
        .endChild()
    .endChild());
```

**JSX**

```typescript
<div className="myClass">
    <span title="a span">Text</span>
    <button on-click={ev => console.log("Clicked!")}>Click me</button>
</div>
```

## Component

**Builder**
```typescript
t.component(MyComponent, {
    attr1: "value",
    attr2: m => m.modelProp
})
```

**JSX**

```typescript
<MyComponent attr1="value" attr2={m.modelProp} />
```

## Content

Renders the specified content.

Valid content types are:

- Primitive types: String, Number, Boolean
- Components
- Templates
- Template providers `{model: ..., template: ...}`
- An object with an associated template using `setTemplate`
- Arrays of valid content

You can override the default template associated with the model by specifying the `template` attribute.

!!! warning
    A content array is not observed for internal changes, but only when the whole array object changes.
    To observe an array, use the `Foreach` element or expression.

**Builder**

```typescript
t.content(m => m.myContent)
```

**JSX**

```typescript
<Content src={m.myContent} />
<Content src={m.myContent} template={myTemplate} />
```

**Expression**

```typescript
<tagName>{m.myContent}</tagName>
```

---

## If

Conditionally render a subtree if the condition is true. You can optionally specify a false subtree.
This allows toggling parts of the UI based on the model’s state.

**Builder**

```typescript
t.if(m => m.test == 2, 
    t1 => t1.text("True"),
    t1 => t1.text("False"));
```

**JSX**

```typescript
<If condition={m.test == 2}>
    True
    <Else>False</Else>
</If>
```

**Expression**

```typescript
<tagName>
    {m.test == 2 ? 
        <>True</> 
        : 
        <>False</>
    }
</tagName>

<tagName>{m.test == 2 && <>True (no else)</>}</tagName>
```

---

## Class

Adds a class list to an HTML element or conditionally adds/removes it when a given expression is true.

**Builder**

```typescript
t.class(m => m.myClassList);

t.class(m => "my-class", m => m.myProp === true);
```

**JSX**

```typescript
<div>
    <Class condition={m.myProp === true} name="my-class" />
    <Class name={m.myClassList} />
</div>
<div className="class1 class2"/>
```

---

## Style

Associates a static style object to an HTML element or dynamically binds a particular state property.

**Builder**

```typescript
t => t.styles({
    "color": m => m.myColor,
    "font-size": "13px"
})

t => t.style("color", m => m.myColor)
```

**JSX**

```typescript
<div>
    <Style color={m.myColor} fontSize="16px" />
</div>

<div style={{ color: m.myColor }}/>

<div style-color={m.myColor}/>
```

!!! warning
    Static style properties provided as `{styleProp: value, ...}` won’t be bound and will maintain their initial value.

---

## Foreach

Specifies a template to be applied to each element of an array. The array is observed for subsequent 
changes and updates atomically propagate.

Observed methods include: `push`, `pop`, `sort`, `splice`, `shift`, `unshift`, `fill`.

To change an element’s value, use the new non-standard `set` function or proxy the array using `createObservableArray`.

**Builder**

```typescript
t => t.foreach(m => m.items,
    t2 => t2.beginChild("span")
        .text(item => item.myItemProp)
        .endChild());
```

**JSX**

```typescript
<Foreach src={m.items}>
    <span>{item.myItemProp}</span>
</Foreach>
```

**Expression**

```typescript
{m.items.forEach(i => <span>{i.myItemProp}</span>)}
```

!!! warning
    Do not use the `map` function on an array here, as it behaves as expected for transformations (producing a new array) but does not bind the array.

!!! warning
    Original array methods such as `push` will be overridden. Consider this for subsequent bulk operations on such arrays.

---

## Text

Creates a text node.

**Builder**

```typescript
t => t.text(m => m.myText)
```

**JSX**

```typescript
<Text src={m.myText}/>
```

---

## Node

Appends a DOM node as a child of the current element.

**Builder**

```typescript
t => t.appendChild(m => m.myDOMnode)
```

**JSX**

```typescript
<Node src={m.myDOMnode}/>
```

---

## Html

Creates elements from an HTML string.

**Builder**

```typescript
t => t.html(m => m.myHtmlString)
```

**JSX**

```typescript
<Html src={m.myHtmlString}/>
```

---
