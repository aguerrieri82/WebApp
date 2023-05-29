import { ItemEditContent } from "@eusoft/webapp-framework";
import { contentPage } from "../../components/AppPage";
import { ObjectEditor, enumItemsSource, formatText, required, staticItemsSource } from "@eusoft/webapp-ui";
import { ICreateSaleCircuit, SaleCircuitType } from "../../entities/Commands";
import { AddressEditor } from "../../components/AddressEditor";
import { forModel } from "@eusoft/webapp-jsx";

interface IEditSaleCircuit extends ICreateSaleCircuit {
    useCurrency?: boolean;
}


export const saleCircuitEditor = value => new ItemEditContent<IEditSaleCircuit>({

    name: "sale-circuit-create",
    title: "create-sale-circuit",
    editor: new ObjectEditor({

        commitMode: "manual",
        style: "vertical",
        inputField: { style: "filled" },
        builder: bld => <>

            {bld.text(a => a.name, {
                validators: [required]
            })}

            {bld.singleSelector(a => a.type, {
                validators: [required],
                editor: {
                    itemsSource: enumItemsSource(SaleCircuitType)
                }
            })}

            {bld.editor(a => a.address, AddressEditor, {
                label: "address",
                style: ["vertical-label", "no-box", "no-error"],
                editor: {
                    inputField: { style: "filled" },
                }
            })}

            {bld.boolean(a => a.useCurrency, {
                onChanged: (m, v) => {
                    if (!v) {
                        m.conversionRate = null;
                        m.currency = null;
                    }
                },
                editor: {
                    label: "use-custom-currency"
                }
            })}

            {bld.text(a => a.currency, {
                validators: [required],
                disabled: m => !m.useCurrency,
                label: "currency-name",
                editor: {
                }
            })}

            {bld.singleSelector(a => a.conversionCurrency, {
                validators: [required],
                disabled: m => !m.useCurrency,
                editor: {
                    itemsSource: staticItemsSource(["Euro", "EUR"])
                }
            })}

            {bld.number(a => a.conversionRate, {
                validators: [required],
                disabled: m => !m.useCurrency,
                editor: {
                }
            })}

            {bld.content(a => <>
                {a.currency && a.conversionRate &&
                    <span>{formatText("", a.currency, a.conversionCurrency, a.conversionRate)}</span>}
            </>)}

        </>
    }),

    saveAsync: async value => {

        alert(JSON.stringify(value));

        return true;
    },

    value

})


export const createSaleCircuitPage = contentPage(saleCircuitEditor({}), {
    route: "/sale-circuit/create",
    showBack: true,
    style: ["panel"]
});