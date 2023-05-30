import { IAction, IEditor, IItemsSource, ItemView, ListView, ViewNode } from "@eusoft/webapp-ui";
import { Content, IContentOptions } from "../Content";
import { IFilterField } from "../../abstraction/IFilterEditor";
import { Bind, Class, cleanProxy } from "@eusoft/webapp-core";
import { forModel } from "@eusoft/webapp-jsx";


forModel(m => <div>
                {m.items.length == 0 ?
                    <>{m.emptyView}</> :
                    <>
                    </>
                }
                <ListView createItemView={Bind.action(item => m.createItemView(item, m.getItemActions(item)))}>
                    {this.items}
                </ListView>
            </div>)