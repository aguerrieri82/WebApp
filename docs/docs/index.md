# WebApp


## Getting started

```
import { mount } from "@eusoft/webapp-core";

const root = document.querySelector("body");
mount(root, <div>Hello word</div>);

```

## Setup

Install `@eusoft/webapp-core` and `@eusoft/webapp-jsx` packages
using you favorite package manager.

You will need a boundle tool to compile the code, you can use Vite or Rollup.
Webpack, is not supported anymore.

### Vite 

if you are using vite, install the compiler package `@eusoft/webapp-compiler-rollup`
as dev dependence. 

In `vite.config.js`

```javascript
import webapp from "@eusoft/webapp-compiler-rollup"


export default defineConfig({
    //...
    plugins: [
        webapp({
            //... compiler options
        })
    ],
    esbuild: {
        jsx: "preserve"
    }
});
```

### Rollup

if you are using roolup, install the compiler package `@eusoft/webapp-compiler-rollup`
as dev dependence, add the plugin to your rollup config file.

in `rollup.config.js`

```javascript
import webapp from "@eusoft/webapp-compiler-rollup"

export default [
    {
        //...
        plugins: [
            // ... other plugins
            webapp({
                //compiler options
            }),      
        ]
    }
];
```

### Typescript

If you are using typescript, ensure tsconfig has `"jsx": "preserve"`

in `tsconfig.json`

```
{
  "compilerOptions": {
    "jsx": "preserve",
    "experimentalDecorators": true,
  },
}

```