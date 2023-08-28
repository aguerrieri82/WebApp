import { Action, Content, IContentConstructor, IContentInfo, ViewNode } from "@eusoft/webapp-ui";
import { Authorize } from "../services/Authorize";
import { ICreateSaleCircuit, UserAccountType } from "../entities/Commands";
import { apiClient } from "../services/PmApiClient";
import { useNetwork, userInteraction } from "@eusoft/webapp-framework";
import { navigatePage, navigatePageForResult } from "../entities/Pages";
import { ListSalePointPage } from "./saleCircuit/ListSalePoint";
import { EmptyView } from "@eusoft/webapp-framework/components/EmptyView";
import "./BusinessHomePage.scss";
import { Style } from "@eusoft/webapp-jsx";

forModel(this, m => <div className="item-list">
    {m.items?.length == 0 ?
        <>{m.emptyView}</> :
        <>
        </>
    }
    <ListView createItemView={Bind.action(item => m.createItemView(item, m.getItemActions(item)))}>
        {this.items}
    </ListView>
</div>)