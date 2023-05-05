import { IComponent } from "@eusoft/webapp-core";

export interface IPage extends IComponent {

    loadAsync(): Promise<any>;

    onOpen(): void;

    onClose(): void;

    route: string;

    name: string;
}