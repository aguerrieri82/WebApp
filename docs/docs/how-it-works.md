# How it works
The framework is an MVVM framework that doesn’t require any ceremony. 
It has no virtual DOM, no special conventions, and doesn’t use hooks. 
The core engine is a template builder that simplifies DOM construction 
associated with a particular model through a fluent API.


```javascript

import { template } from "@eusoft/webapp-core";

const myTemplate = template(t => t
    .beginChild("div").class("myClass")
        .beginChild("span").set("title", "a span")
            .text("Text")
        .endChild()
        .beginChild("button").on("click", ev => console.log("Clicked!"))
            .text("Click me")
        .endChild()
    .endChild());
```

that will produce

```html
<div className="myClass">
    <span title="a span">Text</span>
    <button click="console.log("Clicked!")">Click me</button>
</div>
```

The template can be mounted using the `mount` function, 
specifying the DOM element or selector and the template itself.

```typescript
import { mount } from "@eusoft/webapp-core";

mount("body", myTemplate);
mount(document.body, myTemplate);
mount("#myRootElementId", myTemplate);

```

## Model binding

A template can have a model associated.
Once you have the model, you can create bind expression to associate
a particular value for a template to a model

```typescript

import { mount, template } from "@eusoft/webapp-core";

interface IMyModel {
    text: string;
}

const myTemplate = template<IMyModel>(t => t
    .beginChild("span").text(m => m.text).endChild());

const model = { } as IMyModel;

mount(document.body, myTemplate, model);

model.text = "Hello word";

```
Any changes to a model property will be propagated to each binding expression that uses it. In this example, 
the inner text of the span will reflect the value of the `text` property in the model

## Tracking binding

Binding expressions can have arbitrary complexity. 
Behind the scenes, a `Proxy` is created to track the expression and collect all references, even complex ones.

Once all references are collected, each referenced property descriptor is modified 
to make it observable and to provide a notification when the property changes. 
The original descriptor is preserved and called back as needed. 
These observed properties are stored inside the special symbol `@props` within the object.

In this scenario

```typescript

model => model.obj.test ? model.c : model.d;

// the old obj and obj.test would be untracked, new obj, obj.test, model.c tracked, and model.d untracked.
model.obj = { test: true };

//no effect, d is not tracked
model.d = 'new value';

//model.c untracked and model.d tracked
model.obj.test = false;
```

Only when the value of the binding expression really changes (has a new value different from the last one), 
the template will be updated.

## Array Tracking

When a model is represented by an array, the framework automatically tracks changes to both the array and its items. 
It overrides the native array methods so that any modification will trigger updates in the template.

Observed methods include: `push`, `pop`, `sort`, `splice`, `shift`, `unshift`, `fill`.

A new method, `myArray.set(index, value)` is also available to change an element’s value directly, since the native array
methods do not support 'observe' this operation. 
To use direct item assignment `myArray[index] = value`, you can use wrap the array with `createObservableArray` function to 
create a proxy for the array.


## JSX Compiler

WebApp supports JSX syntax through the `@eusoft/webapp-jsx` package.
A compiler is available to convert JSX code into the framework template builder syntax `@eusoft/webapp-compiler`.
A plugin for Rollup or Vite is available to handle the compilation `@eusoft/webapp-compiler-rollup`.

for example, the following JSX code:

```typescript

export function ConfirmBox(options: IConfirmBoxOptions) {
  
    return <div className="confirm-box">
        {options.isSuccess ?
            <MaterialIcon name="check_circle" style="green"/> :
            <MaterialIcon name="error" style="red" />
        }
        <div className="message">
            <NodeView>{options.message}</NodeView>
        </div>
        {options.actions && <div className="actions">
            {options.actions?.forEach(a =>
                <Action name={a.name} style={["action", "text"]} type={a.type} onExecuteAsync={a.executeAsync}>
                    {a.icon}
                    {formatText(a.text)}
                </Action>
            )}
            </div>
         }
    </div>
}
```

will be converted in

```typescript

function ConfirmBox(options) {
    return template(t => t
        .beginChild("div").class("confirm-box")
            .if(Bind.exp(options => options.isSuccess), template(t2 => t2
                .component(MaterialIcon, ({
                    "name": "check_circle", 
                    "style": "green"}))), template(t2 => t2
                .component(MaterialIcon, ({
                    "name": "error", 
                    "style": "red"})))
            )
            .beginChild("div").class("message")
                .component(NodeView, ({
                    "content": Bind.exp(options => options.message)})).endChild()
            .if(Bind.exp(options => options.actions), template(t2 => t2
                .beginChild("div").class("actions")
                    .foreach(Bind.exp(options => options.actions), template(t5 => t5
                        .component(Action, ({
                            "name": Bind.exp(a => a.name), 
                            "style": ["action", "text"], 
                            "type": Bind.exp(a => a.type), 
                            "onExecuteAsync": Bind.exp(a => a.executeAsync), 
                            "content": {
                                model: t5.model,
                                template: template(t6 => t6
                                    .content(Bind.exp(a => a.icon), false).content(Bind.exp(a => use(a, formatText)(a.text)), false))
                            }})))
                    )
                .endChild()
                )
            )
        .endChild()
    );
}
```