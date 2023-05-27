import { SERVICE_TYPE, Services } from "@eusoft/webapp-core";
import { ILocalization, LOCALIZATION, LocalizationContent } from "@eusoft/webapp-ui";

interface ILocalTableOptions{
    lang: string;
}

class LocalTable implements ILocalization {

    private _tables: Record<string, Record<string, LocalizationContent>> = {};

    add(table: Record<string, LocalizationContent>, options: ILocalTableOptions) {

        if (!(options.lang in this._tables))
            this._tables[options.lang] = {};

        Object.assign(this._tables[options.lang], table);
    }

    getContent(id: string): LocalizationContent {

        if (this.language) {
            const table = this._tables[this.language];
            if (table && id in table) 
                return table[id];
        }

        return id;
    }

    language: string;

    readonly [SERVICE_TYPE] = LOCALIZATION;
}


export const localTable = new LocalTable();

export default localTable;

declare module "@eusoft/webapp-core" {
    interface IServices {

        //[LOCALIZATION]: ILocalization;
    }
}