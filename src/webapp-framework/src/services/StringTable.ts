import { SERVICE_TYPE, Services } from "@eusoft/webapp-core";
import { ILocalization, LOCALIZATION } from "@eusoft/webapp-ui";

interface IStringTableOptions{
    lang: string;
}
class StringTable implements ILocalization {

    private _tables: Record<string, Record<string, string>> = {};

    add(table: Record<string, string>, options: IStringTableOptions) {

        if (!(options.lang in this._tables))
            this._tables[options.lang] = {};

        Object.assign(this._tables[options.lang], table);
    }

    getString(id: string): string {

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


export const stringTable = new StringTable();

export default stringTable;

Services[LOCALIZATION] = stringTable;

declare module "@eusoft/webapp-core" {
    interface IServices {

        //[LOCALIZATION]: ILocalization;
    }
}