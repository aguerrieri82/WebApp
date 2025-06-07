
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