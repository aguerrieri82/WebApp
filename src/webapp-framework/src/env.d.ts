declare module "*.css" { }
declare module "*.scss" { }

declare module "environment" {
    const ENV: string;

    export default ENV;
}