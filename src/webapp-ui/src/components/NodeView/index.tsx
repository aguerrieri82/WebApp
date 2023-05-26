import { Default, Foreach, Switch, Text, When } from "@eusoft/webapp-jsx";
import { ViewNode } from "../../Types";
import { ITemplateProvider } from "@eusoft/webapp-core";
import { formatText } from "../../utils";

export interface INodeViewOptions {
    content: ViewNode;
}
export function NodeView(options: INodeViewOptions) {

    return <>
        <Foreach src={(Array.isArray(options.content) ? options.content : [options.content]) as []}>
            {i => <Switch src={i}>
                {v => <>
                    <When condition={typeof v == "string"}>
                        <Text src={formatText(v as string)} />
                    </When>
                    <When condition={typeof v == "function" && (v as Function).length == 0}>
                        <Text src={(v as unknown as Function)()} />
                    </When>
                    <Default>{v as ITemplateProvider}</Default>
                </>
                }
            </Switch>
           }
        </Foreach>
    </>;
}