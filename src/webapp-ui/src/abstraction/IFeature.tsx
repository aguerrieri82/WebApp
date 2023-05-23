export interface IFeature<T> {

    (component: T): Promise<boolean>;
}