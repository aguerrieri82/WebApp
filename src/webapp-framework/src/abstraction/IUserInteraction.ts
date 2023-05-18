import { ViewNode } from "@eusoft/webapp-ui";

export interface IUserInteraction {

    confirmAsync(body: ViewNode): Promise<boolean>;
}