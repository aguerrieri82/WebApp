import { IWriteable } from "./Abstraction/IWriteable.js";


export class StringBuilder implements IWriteable {

    protected _parts: string[] = [];

    clear() {
        this._parts = [];
    }

    write(value: any): void {

        if (typeof value == "string")
            this.append(value);
    }

    append(value: string) {
        this._parts.push(value);
    }

    toString() {
        return this._parts.join("");
    }
}