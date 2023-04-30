import { StringBuilder } from "./StringBuilder";

export function isLetterOrDigit(value: string) {

    return value.length === 1 && value.match(/[a-z0-9]/i);
}

export function formatStyle(value: string)
{
    const builder = new StringBuilder();
    let state = 0;
    let i = 0;
    while (i < value.length) {
        const c = value[i];
        switch (state) {
            case 0:
                if (c == '-')
                    state = 1;
                else
                    builder.append(c);
                break;
            case 1:
                builder.append(c.toUpperCase());
                state = 0;
                break;
        }
        i++;
    }
    return builder.toString();
}