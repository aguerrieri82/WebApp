import { type IService, type ServiceType } from "./IService";


export type ServiceContainer<TServiceType extends ServiceType, TService extends IService<ServiceType> = IService<ServiceType>> =
    Record<TServiceType, TService>;

export interface IServiceProvider {

    provides<TService extends IService>(service: TService): void
}