# Elements

## Template

**Builder**

```
import { template } from "@eusoft/webapp-core";

template(t => t);
```


**JSX**
```
import { forModel } from "@eusoft/webapp-jsx";

forModel<TModel>(m => <>
</>);

forModel(myModel, m => <>
</>);

<Template name="">
</Template>
```


## Content

**Builder**
```
t.content(m=> m.myContent)
```

**JSX**
```
<Content src = {m.myContent} />
```

**Expression**
```
<tagName>{m.myContent}</tagName>
```
---
## If 

**Builder**
```
t.if(m=> m.test == 2, 
	t1 => t1.text("True"),
	t1 => t1.text("False"))
```

**JSX**
```
<If condition = {m.test == 2} >
	True
	<Else>False</Else>
</If>
```

**Expression**
```
<tagName>
	{m.test == 2 ? 
		<>True</> 
		: 
		<>False</>
	}
</tagName>

<tagName>{m.test == 2 && <>True not else</>}</tagName>
```
---
## Class

**Builder**

```
t.class(m=> m.myClassList);

t.class(m=> "my-class", m => m.myProp == true);
```

**JSX**
```
<div>
	<Class condition = {m.myProp == true} name="my-class" />
	<Class name={m.myClassList} />
</div>
<div className="class1 class2"/>
```

---
## Style

**Builder**

```
t => t.styles({
    "color": m=> m.myColor,
	"font-size": "13px"
})

t => t.style("color", m=> m.myColor)
```

**JSX**
```
<div>
	<Style color={m.MyColor} fontSize="16px" />
</div>

<div style={{color: m.myColor}}/>

<div style-color={m.myColor}/>
```
---
## Foreach

**Builder**
```
t => t.foreach(m => m.items,
    t2 => t2.beginChild("span")
			.text(item => item.myItemProp))
			.endChild();

```


**JSX**
```
<Foreach src={m.items}>
	<span>{item.myItemProp}</span>
</Foreach>
```

**Expression**
```
{m.items.forEach(i=> <span>{i.myItemProp}<span/>)}
```

!!! warning
    Do not use `map` function of an array, since will behave as expected 
	(transform an array to another array), not bind an array


---
## Text

**Builder**
```
t => t.text(m => m.myText)
```


**JSX**
```
<Text src={m.myText}/>
```

---
## Node

**Builder**
```
t => t.appendChild(m => m.myDOMnode)
```


**JSX**
```
<Node src={m.myDOMnode}/>
```

---
## Html

**Builder**
```
t => t.html(m => m.myHtmlString)
```


**JSX**
```
<Html src={m.myHtmlString}/>
```

---
