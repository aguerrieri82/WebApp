export function isUpperCase(value: string): boolean {
    return value.toUpperCase() === value;
}

export function toKebabCase(name: string): string {

    if (!name)
        return;

    let s = 0;
    let result = "";
    for (let i = 0; i < name.length; i++) {
        const c = name.charAt(i);
        switch (s) {
            case 0:
                result += c.toLowerCase();
                if (!isUpperCase(c) || c == "-")
                    s = 1;
                break;
            case 1:
                if (isUpperCase(c) && c != "-") {
                    result += "-";
                    s = 0;
                }
                result += c.toLowerCase();
                break;
        }
    }
    return result;
}

export function generateRandomId(prefix = 'id'): string {
    const randomStr = Math.random().toString(36).substr(2, 8);
    return `${prefix}-${randomStr}`;
}