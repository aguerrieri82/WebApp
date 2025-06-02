
export function cloneObject<T>(obj: T): T {

    return JSON.parse(JSON.stringify(obj));
} 


let objTrack = 0;

export function emptyObject(src: string) {
    return cloneObject({ _track: objTrack++, _src: src }) as any;
}