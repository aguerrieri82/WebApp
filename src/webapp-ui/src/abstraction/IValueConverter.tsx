export interface IValueConverter<TFrom, TTo> {

    convertFrom(form: TFrom): TTo;

    convertTo(form: TTo): TFrom;
}