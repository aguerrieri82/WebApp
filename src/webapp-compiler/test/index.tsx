import { ItemEditContent } from "@eusoft/webapp-framework";
import { ObjectEditor, enumItemsSource, formatText, required, staticItemsSource } from "@eusoft/webapp-ui";
import { IAddressData, ICreateSaleCircuit, SaleCircuitType } from "../../entities/Commands";
import { AddressEditor } from "../../components/AddressEditor";
import { forModel } from "@eusoft/webapp-jsx";
import { appPage } from "../../components/AppPage";


const SaleCircuitEditor = new ObjectEditor<IEditSaleCircuit>({

    commitMode: "manual",
    style: "vertical",
    inputField: { style: "filled" },
    builder: bld => <>
        {bld.boolean(a => a.useAddress, {
            onChanged: (m, v) => {
                alert(JSON.stringify(m));
                m.address = {} as IAddressData;
            },
            editor: {
                label: "specify-address"
            }
        })}


    </>
});
