import { forModel } from "@eusoft/webapp-jsx";
import type { IContentInfo, IContentOptions, IResultContainer, SingleSelector } from "@eusoft/webapp-ui";
import { Content, ObjectEditor, arrayItemsSource, required, validateWhen } from "@eusoft/webapp-ui";
import type { ISaleCircuitListView, ISalePointListView } from "../entities/Commands";
import { UserAccountType } from "../entities/Commands";
import { Authorize } from "../services/Authorize";
import { type ContextEntityFeature, type ContextEntityType, context } from "../services/Context";
import { Bind } from "@eusoft/webapp-core";

export interface IContextSelectorArgs {

    type: ContextEntityType;

    feature?: ContextEntityFeature;
}


export class ContextSelectorPage extends Content<IContextSelectorArgs> implements IResultContainer<boolean> {

    constructor() {
        super();

        this.init(ContextSelectorPage, {
            title: "select-context",
            style: ["panel"],
            features: [Authorize({ accountType: UserAccountType.Business })],
            actions: [{
                name: "select",
                text: "select",
                executeAsync: ()=> this.selectAsync()
            }],
            body: forModel(this, m => <>
                <ObjectEditor<this>
                    commitMode="auto-inplace"
                    inputField={{ style: "filled" }}
                    style="vertical"
                    ref={m.editor}
                    value={m}

                    builder={bld => <>
                        {bld.singleSelector(a => a.saleCircuit, {
                            label: "sale-circuit",
                            editor: {
                                emptyItem: "[select]",
                                itemsSource: arrayItemsSource(() => this.saleCircuitList, i => i.name)
                            }
                        })}
                        {bld.singleSelector(a => a.salePoint, {
                            label: "sale-point",
                            validators: [validateWhen(()=> this.contextType == "sale-point", required)],
                            editor: {
             
                                itemsSource: arrayItemsSource(() => this.getSalePoints(), i => i.name)
                            }
                        })}
                    </>}
                />
            </>),
        } as IContentOptions<object>);


        this.onChanged("saleCircuit", () => {
            this.refreshSelector("salePoint");
        });

    }

    protected refreshSelector(name: keyof this & string) {

        this.editor?.getPropEditor<SingleSelector<unknown, unknown>>(name)?.refreshAsync();
    }

    override async onLoadAsync(args: IContextSelectorArgs) {

        await context.refreshAsync();

        this.contextType = args.type;

        this.contextFeature = args.feature;

        this.saleCircuitList = context.saleCircutList;

        this.saleCircuit = context.saleCircutList?.find(a => a.id == context.saleCircuit?.id) ?? context.saleCircutList[0];

        return true;
    }

    getSalePoints() {

        return this.saleCircuit?.merchants.map(a=> a.salePoints).flat().filter(a => {
            if (this.contextType == "sale-point" && this.contextFeature !== undefined)
                return (a.type & this.contextFeature) != 0;
            return true;
        })
    }

    async selectAsync() {

        if (!await this.editor.validateAsync())
            return;

        if (!this.salePoint && this.contextType == "sale-point")
            return;

        context.saleCircuit = this.saleCircuit ? {
            name: this.saleCircuit?.name,
            id: this.saleCircuit?.id
        } : undefined;

        context.salePoint = this.salePoint ? {
            name: this.salePoint?.name,
            id: this.salePoint?.id
        } : undefined;

        if (this.salePoint) {

            const merchant = this.saleCircuit.merchants.find(a => a.merchant?.id == this.salePoint.merchantId);
            context.merchant = { ...merchant.merchant };
        }


        context.save();

        this.result = true;

        await this.host.closeAsync();
    }

    editor: ObjectEditor<this>;

    contextType: ContextEntityType;

    contextFeature: ContextEntityFeature;

    saleCircuit: ISaleCircuitListView;

    salePoint: ISalePointListView;

    saleCircuitList: ISaleCircuitListView[];

    result = false;

    static override info = {
        name: "context-selector",
        route: "/context",
        icon: "",
        factory: () => new ContextSelectorPage()
    } as IContentInfo;
}
