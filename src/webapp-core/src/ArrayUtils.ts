export function forEachRev<T>(items: T[], action: (item: T) => void) {

    if (!items || items.length == 0)
        return;

    for (let i = items.length - 1; i >= 0; i--)
        action(items[i]);
}
export async function forEachRevAsync<T>(items: T[], action: (item: T) => Promise<void>) {

    if (!items || items.length == 0)
        return;

    for (let i = items.length - 1; i >= 0; i--)
        await action(items[i]);
}
