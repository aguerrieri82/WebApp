import { Action, LocalString, MaterialIcon, ViewNode, formatText } from "@eusoft/webapp-ui"
import { MaterialIconName } from "@eusoft/webapp-ui"
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