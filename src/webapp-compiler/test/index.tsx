import { Action, Content, IContentInfo } from "@eusoft/webapp-ui";
import { Text, JsxNode, forModel, debug } from "@eusoft/webapp-jsx";
import { Behavoir, Bind, Component, ITemplateContext, OptionsFor, TwoWays, declareComponent, template } from "@eusoft/webapp-core";
import { router } from "@eusoft/webapp-framework";
import { onChanged } from "@eusoft/webapp-core";
import {  Style } from "../../../webapp-jsx/src";
import { Bindable } from "@eusoft/webapp-core";
import { IComponentOptions } from "@eusoft/webapp-core";



const TextInput = declareComponent({

    selectAll: function () {
        (this.context.element as HTMLInputElement).select();
    }
}, m => <input type="text"/>);

function Page2() {

    const state: {
        input?: InstanceType<typeof TextInput>
    } = {}

    return <div>
        <TextInput ref={state.input} />
        <button on-click={() => state.input.selectAll()}>Select</button>
    </div>
}
