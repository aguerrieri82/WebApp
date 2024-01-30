import { forModel } from "@eusoft/webapp-jsx";
import { Content, IContentInfo } from "@eusoft/webapp-ui";


export class ThirdPage extends Content {

    constructor() {
        super();

        this.init(ThirdPage, {
            name: "third",
            title: "Terza Pagina",
            route: "/",
            body: forModel(this, m => <div>
                <input value={m.firstName}/>
                {m.isMaria && <span>sono maria</span>}
            </div>)
        });
    }

    get isMaria() {
        return this.firstName == "maria";
    }

    firstName: string;

    static override info = {
        name: "third-page",
        route: "/third",
        factory: () => thirdPage
    } as IContentInfo;
}

export const thirdPage = new ThirdPage();