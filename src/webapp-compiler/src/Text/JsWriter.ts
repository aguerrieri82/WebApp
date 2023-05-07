import { TextWriter } from "./TextWriter";
export class JsWriter extends TextWriter {

    beginBlock() {
        return this.write("{").indentAdd();
    }

    endBlock() {
        return this.indentSub().ensureNewLine().write("}");
    }

    writeImport(module: string, ...symbols: string[]) {
        return this.write("import { ").write(symbols.join(", ")).write(" } from ").writeJson(module).write(";\n");
    }

    writeJson(data: any) {
        return this.write(JSON.stringify(data));
    }

    writeObject(obj: Record<string, string>) {
        this.write("({").indentAdd();
        let i = 0;
        for (const prop in obj) {
            if (i > 0)
                this.write(", ");
            this.ensureNewLine().writeJson(prop).write(": ").write(obj[prop]);
            i++;
        }
        return this.indentSub().write("})");
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