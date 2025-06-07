



const Input = declareComponent({
    selectAll: function () {
        this.element.selectAll();
    }
});

function Page() {

    const state = {
        input: Input
    }

    const select = () => {
        state.input.selectAll();
    }

    return <div>
        <Input ref={state.input}/>
        <button on-click={()=> select() }
    </div>
}