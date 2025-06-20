import type { ComponentStyle } from "@eusoft/webapp-core/abstraction/IComponentOptions";
import { buildStyle } from "@eusoft/webapp-core/utils/Style";
import { ImageLoader } from "../behavoirs/ImageLoader";


export interface IImageOptions {
    content: Blob | string;
    style?: ComponentStyle;
    name?: string;  
}

export function Image(opt: IImageOptions) {

    return <img className={buildStyle(opt.style, opt.name)}>
        <ImageLoader content={opt.content} />   
    </img>
}