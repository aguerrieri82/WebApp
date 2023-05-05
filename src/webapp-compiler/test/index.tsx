import { Template } from "cazzo";

function MyComp() {
    return null;
}

function test() {

    const rootModel = {
        items: [],
        msg: "",
        innerObj: {
            name: "Inner"
        },
        logo: "/logo.png",
        change() {
            this.msg = "Nuovo messaggio" + new Date().getTime();
            if (this.items.length > 0)
                this.items[0].name = "Item change" + new Date().getTime();
            this.innerObj.name = "Inner change" + new Date().getTime()
        },
        replace() {
            if (this.items.length > 0)
                this.items[0] = {
                    name: "Pippo"
                }
            this.innerObj = {
                name: "Replace inner"
            }
        },
        add() {
            this.items.push({ name: "Luca" }, { name: "Mario" });
        },
        addMany() {

            const newItems = [];

            for (let i = 0; i < 10000; i++)
                newItems.push({ name: "Item " + i });

            this.items.push(...newItems);

        },
        newImage() {
            this.logo = "https://www.google.com/images/branding/googlelogo/1x/googlelogo_color_272x92dp.png";
        }
    };


    setInterval(() => {
        rootModel.msg = "Time is: " + new Date();
    }, 1000);

   const ActionTemplates = {

        "Button": forModel(a => <Template name="Action">
            <button behavoir="Ripple" className={a.className} on-click={a.executeAsync()}>
                <Content src={a.content} />
            </button>
        </Template>)

    }

    const t = <Template name="xxx">
        <div text={m => m.innerObj.name}>
            <button on-click={m => m.addMany()}>Add</button>
        </div>
        <Foreach src={m => m.items}>
            <div text={m => m.name} />
            {m => m.cazzo}
        </Foreach>
    </Template>;


    const t2 = <Template name="yyy">
    </Template>;

    template(document.body, t, rootModel);
}