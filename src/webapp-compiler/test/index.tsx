import { Action, ActionTemplates, Content, IAction, IContentInfo, IContentOptions, IItemViewOptions, ItemView, ListView, MaterialIcon, ViewNode, formatCurrency, formatDate } from "@eusoft/webapp-ui";
import { forModel } from "@eusoft/webapp-jsx";
import { Bind, Bindable, Binder, Component, IComponentOptions, declareComponent, delayAsync } from "@eusoft/webapp-core";
import { SwipeView } from "@eusoft/webapp-ui/components/SwipeView";
import "./CreateOrderPage.scss";
import { Authorize } from "../../services/Authorize";
import { UserAccountType } from "../../entities/Commands";

const DISCOUNT = /^-?\d+(?:\.\d+)?%$/;
const MANY_ITEMS = /^(-?\d+(?:\.\d+)?)x(\d+(?:\.\d+)?)$/;
const SIMPLE = /^-?\d+(?:\.\d+)?$/;

export interface IButtonInfo {

    body?: ViewNode;
    value: string;
}

export interface IOrderItem {

    total?: number;
    itemAmount: number;
    description?: string;
    quantity: number;
    isPercentage?: boolean;
}

export interface ICashRegisterOptions extends IComponentOptions {

    onNewItem: (item: IOrderItem) => void;
}

export class CashRegister extends Component<ICashRegisterOptions> {
    constructor(options: ICashRegisterOptions) {

        super();

        this.init(CashRegister, {
            template: forModel<this>(m => <div className={m.className}>
                <div className="current-line">
                    {m.currentLine}
                </div>
                <div className="buttons">
                    {m.buttons.forEach(b => <button on-pointerdown={() => m.onButtonClick(b.value)}>{b.body ?? b.value}</button>)}
                </div>
            </div>),
            ...options
        });

        this.buttons.push({ value: "1" });
        this.buttons.push({ value: "2" });
        this.buttons.push({ value: "3" });
        this.buttons.push({ value: "b", body: <MaterialIcon variant="outlined" name="backspace" /> });

        this.buttons.push({ value: "4" });
        this.buttons.push({ value: "5" });
        this.buttons.push({ value: "6" });
        this.buttons.push({ value: "x" });

        this.buttons.push({ value: "7" });
        this.buttons.push({ value: "8" });
        this.buttons.push({ value: "9" });
        this.buttons.push({ value: "%" });

        this.buttons.push({ value: "-" });
        this.buttons.push({ value: "0" });
        this.buttons.push({ value: "." });
        this.buttons.push({ value: "\n", body: <MaterialIcon variant="outlined" name="check" /> });

    }

    protected parseLine(line: string) {

        let result: IOrderItem;

        if (DISCOUNT.exec(line)) {

            result = {
                isPercentage: true,
                itemAmount: parseFloat(line),
                quantity: 1
            }
        }
        else if (SIMPLE.test(line)) {
            result = {
                itemAmount: parseFloat(line),
                quantity: 1
            }
        }
        else if (MANY_ITEMS.test(line)) {
            const grops = MANY_ITEMS.exec(line);
            result = {
                itemAmount: parseFloat(grops[2]),
                quantity: parseFloat(grops[1]),
            }
        }

        return result;
    }

    onButtonClick(value: string) {

        let validateLine = false;

        if (value == "b") {
            if (this.currentLine.length > 0)
                this.currentLine = this.currentLine.substring(0, this.currentLine.length - 1);
        }


        else if (value == "C") {
            this.currentLine = "";
        }
        else if (value == "\n") {
            validateLine = true;
        }
        else {
            const newLine = this.currentLine + value;
            if (this.parseLine(newLine) || (value == "." || value == "x") || (value == '-' && this.currentLine.length == 0)) {
                this.currentLine = newLine;
                if (value == "%")
                    validateLine = true;
            }
        }

        if (validateLine) {
            const result = this.parseLine(this.currentLine);
            if (result) {
                this.onNewItem(result);
                this.currentLine = "";
            }

        }
    }

    onNewItem(item: IOrderItem) {

    }

    currentLine: string = "";

    buttons: IButtonInfo[] = [];
}

export interface IOrderItemViewProps {
    value: IOrderItem;
    parent: CreateOrderPage;
}

export function OrderItemView(props: IOrderItemViewProps) {

    const a = props.value;

    const actions = [
        {
            name: "delete",
            priority: "secondary",
            icon: <MaterialIcon name="delete" />,
            executeAsync: async () => props.parent.deleteItem(a)
        }
    ] as IAction[];

    return <ItemView
        content={a}
        primary={<>
            <span className="quantity">{a.isPercentage ? `${a.itemAmount} %` : `${a.quantity} x ${formatCurrency(a.itemAmount)}`}</span>
            <span className="desc">{a.description ?? ""}</span>
            <span className="amount">{`€ ${formatCurrency(a.total)}`}</span>
        </>}
        actions={actions} />
}

export class CreateOrderPage extends Content {
    constructor() {

        super();

        this.init(CreateOrderPage, {
            title: "create-order",
            style: ["panel"],
            features: [Authorize({ accountType: UserAccountType.Business })],
            body: forModel(this, m => <div>
                <ListView content={m.items} createItemView={Bind.action(a => <OrderItemView parent={m} value={a} />)} />
                <ul className="item-list">
                    {m.items.forEach(a => <li>
                        <span className="quantity">{a.isPercentage ? `${a.itemAmount} %` : `${a.quantity} x ${formatCurrency(a.itemAmount)}`}</span>
                        <span className="desc">{a.description ?? ""}</span>
                        <span className="amount">{`€ ${formatCurrency(a.total)}`}</span>
                        <Action onExecuteAsync={() => m.deleteItem(a)} style="text"><MaterialIcon name="delete" /></Action>
                    </li>)}
                </ul>

                <SwipeView>
                    <CashRegister onNewItem={m.onNewItem.bind(m)} />
                    <div>
                        dssdsd
                    </div>
                </SwipeView>
                <div className="actions">
                    {m.total > 0 && <Action>
                        Paga € {formatCurrency(m.total)}
                    </Action>}
                </div>

            </div>),
        } as IContentOptions<object>);
    }

    deleteItem(item: IOrderItem) {

        this.items.splice(this.items.indexOf(item), 1);
        this.compute();
    }

    protected async onNewItem(item: IOrderItem) {

        this.items.push(item);
        this.compute();
        await delayAsync(50);
        const list = this.context?.element.querySelector("ul.item-list") as HTMLUListElement;
        if (list)
            list.scrollTop = list.scrollHeight - list.clientHeight;
    }

    protected compute() {
        let curTotal = 0;
        for (const item of this.items) {
            if (item.isPercentage)
                item.total = curTotal * item.itemAmount / 100;
            else
                item.total = item.itemAmount * item.quantity;
            curTotal += item.total;
        }

        this.total = curTotal;
    }

    total: number;

    items: IOrderItem[] = [];

    static override info = {
        name: "create-order",
        route: "/pay",
        icon: { template: <MaterialIcon name="payments" /> }, //TODO fix
        factory: () => new CreateOrderPage()
    } as IContentInfo;
}