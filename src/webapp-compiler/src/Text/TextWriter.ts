import type { IWriteable } from "../Abstraction/IWriteable";
export class TextWriter {

    protected _indentLevel: number = 0;
    protected _indentText: string = "";
    protected _isInNewLine: boolean = false;
    protected _length = 0;

    constructor(stream: IWriteable) {
        this.out = stream;
    }

    writeRaw(value: string) {
        this.out.write(value);
        this._length += value.length;
    }

    write(value: any) {

        const text : string = typeof value == "string" ? value : value.toString();

        for (const c of text) {
            if (this._isInNewLine && this._indentLevel > 0)
                this.writeRaw(this._indentText); 
            this.writeRaw(c);
            this._isInNewLine = c == '\n';
        }
        return this;
    }

    indentAdd() {
        this.indentLevel++;
        return this;
    }

    indentSub() {
        this.indentLevel--;
        return this;
    }

    writeLine(value?: any) {
        if (value)
            this.write(value);
        this.write("\n");
        return this;
    }

    ensureNewLine() {
        if (!this._isInNewLine)
            this.writeLine();
        return this;
    }

    set indentLevel(value: number) {
        this._indentLevel = value;
        this.updateIndent();
    }

    get indentLevel() {
        return this._indentLevel;
    }

    protected updateIndent() {
        this._indentText = "    ".repeat(this._indentLevel);
    }

    get length() {
        return this._length;
    }

    readonly out: IWriteable;
}