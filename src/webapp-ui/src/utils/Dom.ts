export function isParentOrSelf(element: HTMLElement, parent: HTMLElement): boolean {

    let curElement = element;

    while (curElement) {
        if (curElement == parent)
            return true;
        curElement = curElement.parentElement;
    }
    return false;
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