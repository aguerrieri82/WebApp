import { TextWriter } from "./TextWriter";
export class JsWriter extends TextWriter {

    beginBlock() {
        return this.write("{").indentAdd();
    }

    endBlock() {
        return this.indentSub().ensureNewLine().write("}");
    }

    writeJson(data: any) {
        return this.write(JSON.stringify(data));
    }

    beginInlineFunction(paramName: string, paramType?: string, paramTypeNs?: string) {
        if (paramType) {
            this.write("(").write(paramName).write(": ");
            if (paramTypeNs)
                this.write(paramTypeNs).write(".");
            this.write(paramType).write(") => ");
        }
        else
            this.write(paramName).write(" => ");

        return this;
    }

    endInlineFunction() {
        return this;
    }
}