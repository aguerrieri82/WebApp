import { Action, type LocalString, MaterialIcon, type ViewNode, formatText } from "@eusoft/webapp-ui"
import { type MaterialIconName } from "@eusoft/webapp-ui"
import "./index.scss"
export interface IEmptyViewOptions {
    message: LocalString;
    iconName: MaterialIconName;
    addLabel?: ViewNode;
    addAction?: () => any;
}


export function EmptyView(options: IEmptyViewOptions) {


    return <div className="empty-view">

        <MaterialIcon name={options.iconName} />

        {formatText(options.message)}

        <Action style="text" type="local" onExecuteAsync={() => options.addAction()}>
            {options.addLabel}
        </Action>
    </div>
}