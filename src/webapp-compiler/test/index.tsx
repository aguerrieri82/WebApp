import { forModel } from "@eusoft/webapp-jsx";
import { Content, contentInfo, formatCurrency, formatText } from "@eusoft/webapp-ui";
import { Field } from "../../components/Field";
import { StatusTag } from "../../components/StatusTag";
import { UserAccountType, type Guid, type IOrderDetailsView } from "../../entities/Commands";
import { formatOrderType, formatOrderStatus, formatPaymentMethod } from "../../helpers/Format";
import { Authorize } from "../../services/Authorize";
import { apiClient } from "../../services/PmApiClient";
import { formatDateTime } from "@eusoft/webapp-framework/helpers/Format";
import "./OrderDetailsPage.scss";
import { Card } from "../../components/Card";


export interface IOrderDetailsArgs {
    id?: Guid;
    order?: IOrderDetailsView;
}

export class OrderDetailsPage extends Content<IOrderDetailsArgs> {

    constructor() {

        super();

        this.init(OrderDetailsPage, {
            title: "order",
            style: ["panel"],
            body: forModel(this, m => <>

                <Card style="items">
                    <div>Q</div>

                    {m.order.items.forEach(a => <>
                        <div>{a.quantity}</div>
                        <div>{a.description}</div>
                        <div>{formatCurrency(a.unitAmount)}</div>
                    </>)}
                    <div>Test</div>

                </Card>
            </>)
        });
    }
}

export default OrderDetailsPage;