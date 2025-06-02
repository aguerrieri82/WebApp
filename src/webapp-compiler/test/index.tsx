import { Component, type IComponentOptions, type TemplateMap } from "@eusoft/webapp-core";
import { Content, forModel } from "@eusoft/webapp-jsx";
import { type IContent } from "../abstraction/IContent";
import "./ContentHost.scss";
import type { IContentHost } from "../abstraction/IContentHost";

interface IContentHostOptions extends IComponentOptions {
    useTransition: boolean;
}

export const ContentHostTemplates: TemplateMap<ContentHost> = {

    "Single": forModel(m => <main className={m.className}>
        <section className="content">
            <Content src={m.content} />
        </section>
    </main>)

}