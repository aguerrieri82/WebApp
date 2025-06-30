import { Behavoir, propOf, type ITemplateContext } from "@eusoft/webapp-core";

export interface IImageLoaderOptions {

    content: string|Blob;
}
export class ImageLoader extends Behavoir<IImageLoaderOptions>{

    override attach(ctx: ITemplateContext<this, HTMLImageElement>): void {

        const updateContent = (content: string | Blob) => {

            const element = ctx.element as HTMLImageElement;

            if (element.tagName != "IMG")
                return;

            if (typeof content === "string")
                element.src = content;

            else if (content instanceof Blob) {
                const url = URL.createObjectURL(content);
                element.src = url;
                element.onload = () => {
                    URL.revokeObjectURL(url);
                };
            }
        };

        propOf(this, "content").subscribe(v => updateContent(v));

        updateContent(this.content);   
    }

    content: string | Blob;
}
