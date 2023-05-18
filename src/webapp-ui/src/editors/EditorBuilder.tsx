import { IEditor } from "../abstraction/IEditor";



interface EditorBuilderOptions {
    attach?: (editor: IEditor<any>) => void;
}

export class EditorBuilder<TModel> {

    constructor(options?: EditorBuilderOptions) {

    }
}