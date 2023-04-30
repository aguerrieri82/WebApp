

export class StringBuilder {
    protected _parts: string[] = [];

    clear() {
        this._parts = [];
    }

    append(value: string) {
        this._parts.push(value);
    }

    toString() {
        return this._parts.join("");
    }
}