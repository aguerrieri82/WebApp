import { Class, forModel } from "@eusoft/webapp-jsx";
import { Action, Content, formatCurrency, formatDate, formatText, formatTextSimple, InputField, MaterialIcon, NumberEditor, type IContentInfo } from "@eusoft/webapp-ui";
import { paymentService } from "../../abstraction/IPaymentService";
import { OrderType, PaymentMethod, SortDirection, TransactionType, UserAccountType, type Guid, type IPaymentCardInfo, type ITransactionView } from "../../entities/Commands";
import { Authorize } from "../../services/Authorize";
import { context } from "../../services/Context";
import { apiClient } from "../../services/PmApiClient";
import "./CheckBalancePage.scss";
import { Field } from "../../components/Field";
import { WithContext } from "../../services/WithContext";
import { StatusTag } from "../../components/StatusTag";
import { formatCardStatus } from "../../helpers/Format";
import { template } from "@eusoft/webapp-core";


export interface ICheckBalancePageArgs {
    cardCode?: string;
    walletId?: Guid;
}

export class CheckBalancePage extends Content<ICheckBalancePageArgs> {

    constructor() {

        super();

        this.init(CheckBalancePage, {
            name: CheckBalancePage.info.name,
            title: "check-balance",
            style: ["panel"],
            body: forModel(this, m => <>

                <div className="balance">€ {formatCurrency(m.cardInfo.balance)}</div>
                <div className="card">
                    <Field label="card-number">{m.code}</Field>
                    <Field label="owner">{m.cardInfo.customerFullName}</Field>
                    <Field label="emitted-on">{formatDate(m.cardInfo.emissionTime, formatTextSimple("format-date-time") as string)}</Field>
                    <Field label="card-state">
                        <StatusTag {...formatCardStatus(m.cardInfo.cardStatus)} />
                    </Field>
                </div>
                {m.transactions && <div className="trans-list">
                    <h3>{formatText("last-transactions")}</h3>
                    {m.transactions.forEach(a => <div>
                        <Class name="green" condition={a.type == TransactionType.Charge} />
                        <MaterialIcon name={a.type == TransactionType.Buy ? "shopping_cart" : "arrow_circle_up"} />
                        <div className="main">
                            <div className="name">
                                {a.type == TransactionType.Buy ? a.salePoint.name : formatText("recharge")}
                            </div>
                            <div className="time">
                                {formatDate(a.time, formatTextSimple("format-date-time") as string)}
                            </div>

                        </div>
                        <div className="amount">
                            {a.type == TransactionType.Buy ? "-" : ""}
                            € {formatCurrency(a.amount)}
                        </div>
                    </div>)}
                </div>}
                <Action type="global" onExecuteAsync={m.checkAsync}>
                    check-new
                </Action>
            </>),
            features: [
                Authorize({ accountType: UserAccountType.Business }),
                WithContext("sale-circuit")
            ]
        });
    }



    override async onLoadAsync(args: ICheckBalancePageArgs) {

        this.code = args.cardCode;

        this.cardInfo = await apiClient.executeAsync("GetCardInfo", { cardCode: args.cardCode });

        if (this.cardInfo?.walletId) {

            this.transactions = (await apiClient.executeAsync("ListTransactions", {
                fromWalletId: this.cardInfo.walletId,
                toWalletId: this.cardInfo.walletId,
                saleCircuitId: context.saleCircuit.id,
                sort: {
                    direction: SortDirection.Descending,
                    property: "Time"
                },
                pagination: {
                    limit: 10,
                    offset: 0
                }
            }))?.items;

        }
        else
            this.transactions = null;

        return true;
    }


    override async onLoadArgsAsync(args: ICheckBalancePageArgs) {

        if (!args.cardCode) {
            const card = await paymentService.readCardAsync({});
            if (!card?.code)
                return false;
            args.cardCode = card.code;
        }
        return true;
    }

    async checkAsync() {
        const args = {}
        await this.onLoadArgsAsync(args);
        await this.onLoadAsync(args);
    }

    cardInfo: IPaymentCardInfo;
    code: string;
    transactions: ITransactionView[];

    static override info = {
        name: "check-balance-card",
        route: "/cards/balance",
        factory: () => new CheckBalancePage()
    } as IContentInfo;
}

export default CheckBalancePage;