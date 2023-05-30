import { ContentHost } from "@eusoft/webapp-ui";
import { router } from "../../services";

export class RouteContentHost extends ContentHost {

    constructor() {

        super();

        this.init(RouteContentHost);
    }

    override closeAsync() {
        return router.backAsync();
    }

    override get canGoBack() {
        return router.canGoBack;
    }
}