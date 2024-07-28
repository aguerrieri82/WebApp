import { IItemListOptions, ItemListContent, declareContent } from "@eusoft/webapp-framework";
import { IListProduct, IProductListView } from "../../entities/Commands";
import { entityItemsSource } from "../../helpers/ItemsSources";
import { EmptyView } from "@eusoft/webapp-framework";
import { forModel } from "@eusoft/webapp-jsx";
import { MaterialIcon } from "@eusoft/webapp-ui";
import { CreateProductPage } from "./EditProduct";
import { context } from "../../services/Context";

export interface IListProducttAgs {
}


export const ListProductPage = declareContent(ItemListContent, {

    name: "product-list",
    title: "product-list",
    route: "/product",
    style: ["panel"],
    itemAddContent: CreateProductPage.factory,
    itemsSource: entityItemsSource("ListProduct"),
    prepareFilter: filter => ({
        ...filter,
        merchantId: context.merchant?.id
    }),
    canAdd: true,
    canDelete: true,
    canEdit: true,
    pageSize: 50,
    icon: <MaterialIcon name="shopping_cart" />, //TODO fix
    emptyView: forModel(m => <EmptyView
        iconName="shopping_cart"
        message="msg-no-product"
    />),
    columns: [{
        value: a => a.name,
        priority: "primary",
        header: "name",
    }],
    editMode: "page",
    filterMode: "tags",

    onLoadArgsAsync: async args => {

    },
} as IItemListOptions<IProductListView, IListProduct>);