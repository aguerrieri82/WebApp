# Elements


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
<div style={{color: m.myColor}}>
	<Style color={m.MyColor} fontSize="16px" />
</div>

```
---
## Foreach

**Builder**
```
t => t.foreach(m => m.items,
    t2 => t2.text(item => item.myItemProp));

```


**JSX**
```
<Foreach src={m.items} as="item">
	{item.myItemProp}
</Foreach>

```

**Expression**
```
{m.items.forEach(i=> <>{i.myItemProp}</>)}

```

!!! warning
    Do not use `map` function of an array, since will behave as expected 
	(transform an array to another array), not bind an array