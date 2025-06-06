import { Action, Content, IContentInfo } from "@eusoft/webapp-ui";
import { Text, JsxNode, forModel } from "@eusoft/webapp-jsx";
import { Behavoir, Bind, Component, ITemplateContext, OptionsFor, TwoWays, template } from "@eusoft/webapp-core";
import { router } from "@eusoft/webapp-framework";
import { onChanged } from "@eusoft/webapp-core";
import { Style } from "../../../webapp-jsx/src";
import { Bindable } from "@eusoft/webapp-core";
import { IComponentOptions } from "@eusoft/webapp-core";

function Counter(props: { label: string }) {

    const state = Bind.track({
        count: 1
    });

    setInterval(() => {
        state.count++
    }, 500);

    onChanged(state, "count", v => {
        if (v == 10)
            state.count = 0;
    });

    const showAlert = () => {
        alert("Hello");
    }

    return <div on-click={showAlert}>
        <Style opacity={(state.count / 10).toString()} />
        {props.label}: {state.count}
    </div>;
}
