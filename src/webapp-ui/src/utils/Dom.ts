export function isParentOrSelf(element: HTMLElement, parent: HTMLElement): boolean {

    let curElement = element;

    while (curElement) {
        if (curElement == parent)
            return true;
        curElement = curElement.parentElement;
    }
    return false;
}

export function findParent(element: HTMLElement, selector: (el: HTMLElement) => boolean ): HTMLElement {

    let curElement = element;

    while (curElement) {
        if (selector(curElement))
            return curElement;
        curElement = curElement.parentElement;
    }
}

export function getScreenPos(element: HTMLElement, includeScroll = true, skipBody = false) {

    let curEl = element;
    let offsetEl = element;

    const curOfs = { x: 0, y: 0 };

    while (curEl) {
        if (curEl == offsetEl) {
            curOfs.y += curEl.offsetTop;
            curOfs.x += curEl.offsetLeft;
            offsetEl = curEl.offsetParent as HTMLElement;
        }

        if (includeScroll && (!skipBody || curEl != document.documentElement)) {
            curOfs.y -= curEl.scrollTop;
            curOfs.x -= curEl.scrollLeft;
        }
        curEl = curEl.parentElement;
    }

    return curOfs;
}

export function getScrollParent(element: HTMLElement): HTMLElement {

    if (!element)
        return null;

    if (element.scrollHeight > element.clientHeight)
        return element;

    return getScrollParent(element.parentElement);
}

export function isScrolledIntoView(element: HTMLElement): boolean {

    const scrollParent = getScrollParent(element);
    if (!scrollParent)
        return true;

    const scrollTop = scrollParent.scrollTop;
    const scrollBottom = scrollTop + scrollParent.clientHeight;

    const elemTop = element.offsetTop;
    const elemBottom = element.clientHeight + elemTop;

    return elemTop < scrollBottom && elemBottom > scrollTop;
}