
export function isLetterOrDigit(value: string) {

    return value.length === 1 && value.match(/[a-z0-9]/i);
}