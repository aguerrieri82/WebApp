# Components



## Functional Component

```

function MyComponent(props: { text: string }) {

    const show = () => {
        alert(props.text);
    }

    return <div>
        {props.text}
        <button on-click={ev => show()}>Show</button>
    </div>
}

```

## Class Component

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

### Compact form


```
import { type IComponentOptions, declareComponent } from "@eusoft/webapp-core";


interface IOptions extends IComponentOptions {
  text: string;
}

const MyComponent = declareComponent<IOptions>({
    
    template: m => (
        <div>
            {m.text}
            <button on-click={ev => m.show()}>Show</button>
        </div>),

    show: function() {
        alert(this.text);
    }
});

```
`MyComponent` would be a standard class, so can be used both as Jsx element or as a base class for another componet

```
const x = new MyComponent({text: "Hello"});

<MyComponent text="Hello"/>

class MyNewComponent extends Component { ... }

```