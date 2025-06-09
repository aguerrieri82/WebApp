
# Components

## Functional Component

This example shows a simple functional component:

```typescript
function MyComponent(props: { text: string }) {
    const show = () => {
        alert(props.text);
    };

    return (
        <div>
            {props.text}
            <button on-click={ev => show()}>Show</button>
        </div>
    );
}

<MyComponent text=""/>

```

**Explanation**:  
A functional component is a function that receives `props` as input and returns JSX. 
In this example, the `show` function simply displays the `text` property in an alert box.

!!! note
    The function is **called only once** during its lifecycle and is not re-executed when properties change.

### State
Internal state can be tracked using a special `const state = {}` object  
You can configure the compiler to automatically track changes to specific variables:

```json
{
    autoTrack: ["myVarName", /myRegExp/]
}
```
Alternatively, decorate the variable with `Bind.track`, for example: `const myState = Bind.track({...})`.

!!! warning
    The variable must be declared with `const` and initialized as an object.


**Example**

```typescript
function App(p: { theme: string }) {

  const state = {
    text: "",
  };

  const show = () => {
    alert(state.text);
    state.text = "new";
  };

  return (
    <main clasName={p.theme}>
      <h1>Function component</h1>
      <input type="text" value={state.text} />
      <button on-click={show}>Show</button>
    </main>
  )
}

```

---

## Class Component

### Why Use a Class Component?

In functional components, the internal state is encapsulated and cannot be accessed or extended directly from outside the component. If you need to modify or trigger actions on the component’s state from outside, class components are more suitable.

Here’s an example of a class component:

```typescript
import { Component, type IComponentOptions } from "@eusoft/webapp-core";
import { forModel } from "@eusoft/webapp-jsx";

interface IOptions extends IComponentOptions {
  text: string;
}

export class MyComponent extends Component<IOptions> {
  constructor(options: IOptions) {
    super();

    this.init(MyComponent, {
      template: forModel<this>(m => (
        <div>
          {m.text}
          <button on-click={ev => m.show()}>Show</button>
        </div>
      )),
      ...options,
    });
  }

  show() {
    alert(this.text);
  }

  text: string;
}
```


    

**Key points**:

- The class must extend `Component` or a subclass of it.
- The constructor must call `this.init(MyComponent, {...options})`, where `MyComponent` is the class name.
- The `options` argument should extend `IComponentOptions`.

!!! note
    All properties in options that have a corrispictive in the components class, 
    will be automaticated assigned. Only properties in options intreface will be
    exposed as JSX attributes



---

### Compact Form

To reduce boilerplate code, you can use the `declareComponent` helper function to declare a class component more concisely.

The first argument is an object containing the class body (methods and properties), and the second argument is the component’s template or default options.

Example:

```typescript
import { declareComponent } from "@eusoft/webapp-core";

const MyComponent = declareComponent({

  show: function () {
    alert(this.text);
  },

  text: undefined as string

}, m => (
  <div>
    {m.text}
    <button on-click={ev => m.show()}>Show</button>
  </div>
));
```

`MyComponent` is now a standard class component that you can:

- Instantiate directly: `const x = new MyComponent({ text: "Hello" });`
- Use as a JSX element: `<MyComponent text="Hello" />`
- Extend in other class components: `class MyNewComponent extends MyComponent { /* ... */ }`


!!! warning
    All properties must be initialized with a default value, that can be `null` / `undefined`
    


---

### Referencing a Class Component

Here’s how you can reference a class component instance in a functional component:

```typescript
const TextInput = declareComponent({
  
  selectAll: function () {
    (this.context.element as HTMLInputElement).select();
  }

}, m => <input type="text" />);
  
function Page() {

  const state: {
    input?: InstanceType<typeof TextInput>;
  } = {};

  return (
    <div>
      <TextInput ref={state.input} />
      <button on-click={() => state.input.selectAll()}>Select</button>
    </div>
  );
}
```

**Explanation**:  
- `TextInput` is a class component that includes a `selectAll` method.  
- The `Page` component is a functional component. It declares a reference to the `TextInput` instance using the `ref` attribute.  
- The underlying DOM element of `TextInput` is accessible via `this.context.element`.

This demonstrates how class components can expose methods that can be called from outside the component,
something that functional components do not provide by default.

## Options / Attributes / Props

A class component’s available JSX attributes are defined by the type of its options parameter. 
Specifically, this type is declared as the first generic argument of `Component<TOptions>`, 
and it determines which attributes can be set when using the component in JSX. 

In functional components, instead, the available JSX attributes correspond to 
the properties of the first argument passed to the function. 


The special `content` option maps to the child nodes declared inside your component in JSX.

```typescript
function MyComponent(opt: { content: ViewNode }) {
    return <div>{opt.content}</div>;
}

<MyComponent>
    <span>Hello</span>
</MyComponent>
```

If no `content` type is specified, the component cannot have children. 
If multiple children are supported, the `content` type must be an array. 
To support both JSX and code-based initialization and to constrain 
the content to a particular component type, declare it as:

```typescript
MyChildComponent | JsxTypedComponent<IMyChildComponentOptions>
```

If any content is permissible, use the type `ViewNode` (which covers both single and multiple children).

To make an option bindable, meaning it dynamically reacts to changes, it must be declared as `Bindable`.

```typescript
interface IMyOptions {
    text: Bindable<string>;
}
```

A bindable option can accept different types of values:

1. A direct value  
2. An observable property (something implementing `IObservableProperty` or extracted from an object using `propOf`)  
3. A property/bind expression from an external model using `Bind.external`

```typescript
const myModel = {
    counter: 0
};

interface IMyComponentOptions {
    value1: Bindable<number>;
    value2: Bindable<number>;
    value3: Bindable<string>;
    value4: Bindable<number>;
}

const x = new MyComponent({
    value1: 5,
    value2: Bind.external(myModel, "counter"),
    value3: Bind.external(myModel, a => a.counter.toString() + " ticks"),
    value4: propOf(myModel, "counter")
});
```

!!! note
    Unfortunately, there is no way to enforce strict type checks on these attributes in JSX, 
    so any attribute is treated as "bindable" by default.

In functional components, the actual values passed to `props` 
can be bind expressions (e.g., `m => m.xxx`). These values are not meant to be read or manipulated outside the JSX.  
To enforce type check and avoid confusion, declare such options always as Bindable