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
            //upper mode or begin 
            case 0:
                result += c.toLowerCase();
                if (!isUpperCase(c) || c == "-")
                    s = 1;
                break;
            //first-mode
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