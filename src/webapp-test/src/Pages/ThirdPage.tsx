import { forModel } from "@eusoft/webapp-jsx";
import { Page } from "@eusoft/webapp-ui";

class ThirdPage extends Page {

    constructor() {
        super();

        this.init(ThirdPage, {
            name: "third",
            title: "Terza Pagina",
            route: "/",
            content: forModel(this, m => <div>
                <input value={m.firstName}/>
                {m.isMaria && <span>sono maria</span>}
            </div>)
        });
    }

    get isMaria() {
        return this.firstName == "maria";
    }

    firstName: string;
}

export const thirdPage = new ThirdPage();