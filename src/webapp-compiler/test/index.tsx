import { Content, IContentInfo, IContentOptions, MaterialIcon, ViewNode } from "@eusoft/webapp-ui";
import { forModel } from "@eusoft/webapp-jsx";
import { Component } from "@eusoft/webapp-core";
import { SwipeView } from "@eusoft/webapp-ui/components/SwipeView";
import "./CreateOrderPage.scss";

export interface IButtonInfo {

    body?: ViewNode;
    value: string;
}

export class CashRegister extends Component {
    constructor() {

        super();

        this.init(CashRegister, {
            template: forModel<this>(m => <div className={m.className}>
                {m.buttons.forEach(b => <button on-click={() => m.onButtonClick(b.value)}>{b.body ?? b.value}</button>)}
            </div>)
        });

        this.buttons.push({ value: "1" });
        this.buttons.push({ value: "2" });
        this.buttons.push({ value: "3" });
        this.buttons.push({ value: " " });

        this.buttons.push({ value: "4" });
        this.buttons.push({ value: "5" });
        this.buttons.push({ value: "6" });
        this.buttons.push({ value: " " });

        this.buttons.push({ value: "7" });
        this.buttons.push({ value: "8" });
        this.buttons.push({ value: "9" });
        this.buttons.push({ value: " " });

        this.buttons.push({ value: "" });
        this.buttons.push({ value: "0" });
        this.buttons.push({ value: "" });
        this.buttons.push({ value: "" });

    }

    onButtonClick(value: string) {

    }

    buttons: IButtonInfo[] = [];
}

export class OrderItemView {

    delete() {

    }

    amount: number;
    description: string;
    quantity: number;
}

export class CreateOrderPage extends Content {
    constructor() {

        super();

        this.init(CreateOrderPage, {
            title: "pay",
            style: ["panel"],
            actions: [
                {
                    name: "nfcTest",
                    text: "Nfc",
                    executeAsync: () => null
                }
            ],
            body: forModel(this, m => <div>
                <ul>
                    {m.items.forEach(a => <li>
                    </li>)}
                </ul>
                <SwipeView>
                    <CashRegister />
                    <div>
                        dssdsd
                    </div>
                </SwipeView>
            </div>),
        } as IContentOptions<object>);
    }


    total: number;

    items: OrderItemView[] = [];

    static override info = {
        name: "create-order",
        route: "/pay",
        icon: { template: <MaterialIcon name="payments" /> }, //TODO fix
        factory: () => new CreateOrderPage()
    } as IContentInfo;
}