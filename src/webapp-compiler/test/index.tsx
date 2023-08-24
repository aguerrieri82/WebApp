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

function ContentList(options: { src: INavAction[] }) {

    return <div className="content-list">
        {options.src.forEach(a => <Action onExecuteAsync={() => a.action()}>
            <Style backgroundColor={a.color} />
            {[a.icon, formatText(a.label as LocalString)]}
        </Action>)}
    </div>
}