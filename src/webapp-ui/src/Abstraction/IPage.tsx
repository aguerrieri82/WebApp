import { IViewComponent } from "@eusoft/webapp-core";


export interface IPage extends IViewComponent {

    loadAsync(): Promise<any>;

    onOpen(): void;

    onClose(): void;

    route: string;

    name: string;
}