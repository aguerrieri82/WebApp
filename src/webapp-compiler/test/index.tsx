import { forModel } from "@eusoft/webapp-jsx";
import { Image, Action, Content, contentInfo, formatCurrency, formatDate, formatText, formatTextSimple, MaterialIcon, Popup, type IStateContext, type IStateManager } from "@eusoft/webapp-ui";
import { paymentService } from "../../abstraction/IPaymentService";
import { Card } from "../../components/Card";
import { Field } from "../../components/Field";
import { StatusTag } from "../../components/StatusTag";
import { TransactionList } from "../../components/TransactionList";
import { SortDirection, type Guid, type IPaymentCardInfo, type ITransactionView } from "../../entities/Commands";
import { formatCardStatus } from "../../helpers/Format";
import { Authorize } from "../../services/Authorize";
import { context } from "../../services/Context";
import { executeAsync } from "../../services/DataService";
import { WithContext } from "../../services/WithContext";
import "./CardDetailsPage.scss";
import { fullUri } from "@eusoft/webapp-framework/helpers/Utils";
import { apiClient } from "../../services/PmApiClient";

export interface ICardDetailsArgs {
    cardCode?: string;
    walletId?: Guid;
}

export class CardDetailsPage extends Content<ICardDetailsArgs> implements IStateManager {

    constructor() {

        super();
    }


    test(props) {
        return <div>{props}</div>;
    }
}