
export const SERVICE_TYPE: unique symbol = Symbol.for("@serviceType")

export type ServiceType = symbol;

export interface IService<TService extends ServiceType = ServiceType> {

    readonly [SERVICE_TYPE]: TService;
}