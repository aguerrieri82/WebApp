import { RouteContentHost } from "@eusoft/webapp-framework";
import { Class } from "@eusoft/webapp-jsx/components/Class";
import { Content } from "@eusoft/webapp-jsx/components/Content";
import { forModel } from "@eusoft/webapp-jsx/Helpers";
import { NodeView, MaterialIcon, type Content as UIContent } from "@eusoft/webapp-ui";
import { Action } from "@eusoft/webapp-ui/components/Action";
import { formatText } from "@eusoft/webapp-ui/utils/Format";
import { ContextView, type IContextInfo } from "./ContextView";
import "./AppContentHost.scss"
import { userSession } from "../services/UserSession";


const ContentHostTemplate = forModel<AppContentHost>(m => <main className={m.className}>
    {m.content && <section className="content">
        <div className={m.content?.className}>

            <Class name="page" />

            <header>
                <Class name="hide-context" condition={!m.showContext || m.content?.hideContext} />
                <div className="action-bar">
                    {m.content?.showBack && <Action inline={false} name="back" onExecuteAsync={() => m.content?.host.closeAsync()} style="icon">❮</Action>}
                    <span className="title">{formatText(m.content?.title)}</span>
                    {m.supportContext && <Action name="toggle-context" style="icon" onExecuteAsync={() => m.toggleContext()} >
                        <MaterialIcon name="keyboard_arrow_down" />
                    </Action>}
                </div>
                {m.supportContext && <ContextView />}
            </header>
            <div className="body">
                <Content src={m.content?.body} update="" />
                <NodeView>{m.test}</NodeView>
            </div>
            <footer>
                {m.content?.actions?.forEach(a =>
                    <Action name={a.name} type={a.type} onExecuteAsync={a.executeAsync}>
                        {a.icon}
                        {formatText(a.text)}
                    </Action>
                )}
            </footer>
        </div>
    </section>}
</main>)
