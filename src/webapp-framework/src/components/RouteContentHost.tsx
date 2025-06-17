import { ContentHost, isResultContainer } from "@eusoft/webapp-ui";
import { router } from "../services";

export class RouteContentHost extends ContentHost {

    constructor() {

        super();

        this.init(RouteContentHost);
    }

    override async closeAsync(result: unknown) {

        if (isResultContainer(this.content))
            this.content.result = result;

        if (router.canGoBack)
            await router.backAsync();
        else
            this.loadContentAsync(null);
    }

    override get canGoBack() {
        return router.canGoBack;
    }
}