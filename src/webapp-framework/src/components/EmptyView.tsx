import { Action, MaterialIcon, NodeView, type ViewNode } from "@eusoft/webapp-ui"
import { type MaterialIconName } from "@eusoft/webapp-ui"
import "./EmptyView.scss"

export interface IEmptyViewOptions {
    message: ViewNode;
    iconName: MaterialIconName;
    addLabel?: ViewNode;
    addAction?: () => unknown;
}

export function EmptyView(options: IEmptyViewOptions) {

    return <div className="empty-view">
        <MaterialIcon name={options.iconName} />
        <NodeView>{options.message}</NodeView>
        <Action style="text" type="local" onExecuteAsync={async () => options.addAction()}>
            {options.addLabel}
        </Action>
    </div>
}