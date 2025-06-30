const testCanvas = document.createElement("canvas").getContext("2d");

export function bestContrastWhiteOrBlack(bgColor: string): string {

    const hex = toHex(bgColor);

    if (!hex)
        return "#000000"; 

    const contrastWithWhite = getContrastRatio(hex, "#ffffff");
    const contrastWithBlack = getContrastRatio(hex, "#000000");

    return contrastWithWhite >= contrastWithBlack ? "white" : "black";
}

function toHex(color: string): string | null {

    testCanvas.fillStyle = "#000"; 
    testCanvas.fillStyle = color;
    const computed = testCanvas.fillStyle;
    return computed.length === 7 ? computed : null;
}

function getContrastRatio(hex1: string, hex2: string): number {
    const lum1 = getLuminance(hex1);
    const lum2 = getLuminance(hex2);
    const brightest = Math.max(lum1, lum2);
    const darkest = Math.min(lum1, lum2);
    return (brightest + 0.05) / (darkest + 0.05);
}

function getLuminance(hex: string): number {
    const [r, g, b] = [0, 1, 2].map(i => {
        const c = parseInt(hex.slice(1 + i * 2, 3 + i * 2), 16) / 255;
        return c <= 0.03928
            ? c / 12.92
            : Math.pow((c + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}