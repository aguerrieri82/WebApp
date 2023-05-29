import { IService } from "@eusoft/webapp-core";
import { LocalString, ViewNode } from "@eusoft/webapp-ui";


export const USER_INTERACTION: any = Symbol.for("$userInteraction");

export interface IUserInteraction extends IService<typeof USER_INTERACTION> {

    confirmAsync(body: ViewNode, title: LocalString): Promise<boolean>;
}