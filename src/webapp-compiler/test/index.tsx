import { Template } from "cazzo";

function MyComp() {
    return null;
}

function test() {

    const t = <Template name="xxx">
        <div text={m => m.innerObj.name}>
            <button on-click={m => m.addMany()}>Add</button>
        </div>
        <img src="xxx"/>
        <Foreach src={m => m.items}>
            <div text={m => m.name} />
        </Foreach>
        <MyComp />
    </Template>;
}