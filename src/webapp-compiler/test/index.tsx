import { Action, ActionTemplates, Content, IAction, IContentInfo, IContentOptions, IItemViewOptions, ItemView, ListView, MaterialIcon, ViewNode, formatCurrency, formatDate } from "@eusoft/webapp-ui";
import { forModel } from "@eusoft/webapp-jsx";
import { Bind, Bindable, Binder, Component, IComponentOptions, declareComponent, delayAsync } from "@eusoft/webapp-core";
import { SwipeView } from "@eusoft/webapp-ui/components/SwipeView";
import "./CreateOrderPage.scss";
import { Authorize } from "../../services/Authorize";
import { UserAccountType } from "../../entities/Commands";
function text(v: string) {

    return <span><Text src={v} /></span>;
}
