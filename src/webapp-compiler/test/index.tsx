import { forModel } from "@eusoft/webapp-jsx";
import { Action, Content, contentInfo, formatCurrency, formatDate, formatEnum, formatText, formatTextSimple, MaterialIcon, Message, objectEditor, Popup, required, requiredTrue, validEmail, type ViewNode } from "@eusoft/webapp-ui";
import { PaymentCardType, SortDirection, type Guid, type IPaymentCardInfo, type ITransactionView, type IWalletFullInfo } from "../../entities/Commands";
import { formatCardStatus, formatMarkDown } from "../../helpers/Format";
import { ApiError, executeAsync } from "../../services/DataService";
import { userSession } from "../../services/UserSession";
import "./CustomerWalletPage.scss";
import { TransactionList } from "../../components/TransactionList";
import { popupEditAsync } from "@eusoft/webapp-framework/helpers/Editor";
import { navigatePage } from "../../actions/Common";
import { Card } from "../../components/Card";
import { Field } from "../../components/Field";
import { StatusTag } from "../../components/StatusTag";
import { isNativeApp } from "../../services/NativePayment";


export interface ICustomerWalletArgs {
    walletId?: Guid;
}

interface IRegisterData {
    pin: number;
    name: string;
    email: string;
    phone: string;
    acceptPrivacy: boolean;
}

forModel(this, m => <>
    <div className="balance">{formatCurrency(m.wallet?.balance)}</div>
    <Card style="fieldset">
         <Field label="card-state">
            <StatusTag {...formatCardStatus(m.cardInfo.cardStatus)} />
        </Field>
    </Card>
    {m.transactions && <TransactionList transactions={m.transactions} />}
</>)