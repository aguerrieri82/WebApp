


function test() {

    const t = <Template name="xxx">
        <div text={m => m.innerObj.name}>
            <button on-click={m => m.addMany()}>Add</button>
        </div>
        <Foreach src={m => m.items}>
            <div text={m => m.name} />
        </Foreach>
    </Template>;
}