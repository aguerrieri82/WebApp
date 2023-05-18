import { Content, Foreach, Text } from "@eusoft/webapp-jsx";
import { ViewNode } from "../../Types";

export interface INodeViewOptions {
    content: ViewNode;
}
export function NodeView(options: INodeViewOptions) {

    //TODO fix compiler <Content src={i}/> } 

    return <>
        <Foreach src={Array.isArray(options.content) ? options.content : [options.content]}>
            {i => <>
                {typeof i == "string" ? <Text src={i} /> :
                    typeof i == "function" && (i as Function).length == 0 ? <Text src={i()} /> :
                        <Content src={i => i}/> } 
            </>}
        </Foreach>
    </>;
}