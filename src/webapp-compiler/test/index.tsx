import { Class, forModel } from "@eusoft/webapp-jsx";
import { IFurnitureDetailsView } from "../entities/Types";
import "./FurnitureDetailsView.scss";
import { Component } from "@eusoft/webapp-core";
import { apiClient } from "../services/ApiClient";
import { MaterialIcon } from "@eusoft/webapp-ui/components/Icon";
import { appBridge } from "../services/Bridge";
import { formatText } from "@eusoft/webapp-ui/utils/Format";
import { Action } from "@eusoft/webapp-ui/components/Action";
import { distinct } from "../Utils";
import { useNetwork } from "@eusoft/webapp-framework/helpers/Network";


function RateView(options: { value: number, count: number }) {

    const stars = [];

    for (let i = 0; i < 5; i++) {

        if (options.value >= i + 0.5 && options.value < i + 1)
            stars.push(<MaterialIcon name="star_half"  />);
        else if (i + 1 > options.value)
            stars.push(<MaterialIcon name="star_outline"  />);
        else
            stars.push(<MaterialIcon name="star" style="fill" />)
    }
    return <div className="rate-view">
        <span>{stars}</span>
        <span>{options.value}</span>
        <span>({options.count})</span>
    </div>;
}


export class FurnitureDetailsView extends Component {

    constructor() {

        super();
        
        this.init(FurnitureDetailsView);

        this.onChanged("value", async () => {

            if (!this.value)
                return;
            const variant = this.value.variants.find(a => a.modelId == this.value.id);

            this.activeColor = variant?.color;
            this.activeSize = variant?.size;

            this.colors = distinct(this.value.variants, a => a.color).map(a => a.color);   
            this.sizes = distinct(this.value.variants, a => a.size).filter(a=> a != null).map(a => a.size);   
            this.isFavorite = await appBridge.isFavoriteAsync(this.value.id);


        });

        this.template = forModel(m => <div className={m.className} visible={m.visible}>
            {m.colors.forEach(s =>
                <div className="color" on-click={() => m.selectVariant(m.activeColor, s)}>
                    <Class name="active" condition={m.activeSize == s} />
                    <span>{s}</span>
                </div>
            )}
        </div>);
    }

    async selectVariant(color: string, size: string) {

        const variant = this.value.variants.find(a => a.color == color && a.size == size);

        this.value = await useNetwork(() => apiClient.getFurnitureDetailsAsync("ikea", variant.modelId));
    }

    async addAsync() {

    }

    async toggleFavoriteAsync() {

        this.isFavorite = !this.isFavorite;
        await appBridge.setFavoriteAsync(this.value.id, this.isFavorite);
    }

    getResUri(res: string) {
        if (!res)
            return;
        return apiClient.getResourceUri("ikea", res.substring(14));
    }


    activeColor: string;

    activeSize: string;

    colors: string[];

    sizes: string[];

    isFavorite: boolean;

    value: IFurnitureDetailsView;
}

export default FurnitureDetailsView;

