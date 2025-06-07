
# Components

## Functional Component

This example shows a simple functional component:

```
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
```

**Explanation**:  
A functional component is a function that receives `props` as input and returns JSX. In this example, the `show` function simply displays the `text` property in an alert box.

---

## Class Component

### Why Use a Class Component?

In functional components, the internal state is encapsulated and cannot be accessed or extended directly from outside the component. If you need to modify or trigger actions on the component’s state from outside, class components are more suitable.

Here’s an example of a class component:

```
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

---

### Compact Form

To reduce boilerplate code, you can use the `declareComponent` helper function to declare a class component more concisely.

The first argument is an object containing the class body (methods and properties), and the second argument is the component’s template or default options.

Example:

```
import { declareComponent } from "@eusoft/webapp-core";

const MyComponent = declareComponent({
  show: function () {
    alert(this.text);
  },

  text: undefined as string,
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

---

### Referencing a Class Component

Here’s how you can reference a class component instance in a functional component:

```typescript
const TextInput = declareComponent({
  selectAll: function () {
    (this.context.element as HTMLInputElement).select();
  },
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
- When the Select button is clicked, it calls `selectAll()` on the `TextInput` instance, which selects all the text in the input field.  
- The underlying DOM element of `TextInput` is accessible via `this.context.element`.

This demonstrates how class components can expose methods that can be called from outside the component, something that functional components do not provide by default.
