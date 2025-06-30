import type { ITemplateContext } from "@eusoft/webapp-core/abstraction/ITemplateContext";
import { forModel } from "@eusoft/webapp-jsx/Helpers";
import type { IEditorOptions } from "@eusoft/webapp-ui/abstraction/IEditor";
import { Editor } from "@eusoft/webapp-ui/editors/Editor";
import Pikaday from 'pikaday';
import localTable from "../services/LocalTable";
import 'pikaday/css/pikaday.css';
import './CalendarEditor.scss';

const langs = {
    "IT": {
        previousMonth: 'Mese prec.',
        nextMonth: 'Mese succ.',
        months: [
            'Gennaio', 'Febbraio', 'Marzo', 'Aprile', 'Maggio', 'Giugno',
            'Luglio', 'Agosto', 'Settembre', 'Ottobre', 'Novembre', 'Dicembre'
        ],
        weekdays: [
            'Domenica', 'Lunedì', 'Martedì', 'Mercoledì',
            'Giovedì', 'Venerdì', 'Sabato'
        ],
        weekdaysShort: ['Dom', 'Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab']
    }
}

interface ICalendarEditorOptions extends IEditorOptions<Date> {
    initialValue?: Date;
}

export class CalendarEditor extends Editor<Date, ICalendarEditorOptions> {

    protected _pick: Pikaday;

    constructor(options?: ICalendarEditorOptions) {

        super();

        this.init(CalendarEditor, {
            template: forModel<this>(m => <div className={m.className}>
            </div>),
            ...options
        });
    }

    override mount(ctx: ITemplateContext) {

        super.mount(ctx);

        setTimeout(() => {
            this._pick = new Pikaday({
                field: document.createElement("input"),
                container: ctx.element,
                i18n: langs[localTable.language],
                bound: false,
                defaultDate: this.initialValue, 
                setDefaultDate: true,
                onSelect: v => this.value = v
            })

        }, 0);
    }

    initialValue: Date;
}