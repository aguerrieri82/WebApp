
export function delayAsync(timeout: number) {
    return new Promise(res => setTimeout(res, timeout));
}