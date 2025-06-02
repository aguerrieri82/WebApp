import { writeFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

interface IconData {
    host: string;
    asset_url_pattern: string;
    families: string[];
    icons: Icon[];
}

interface Icon {
    name: string;
    version: number;
    popularity: number;
    codepoint: number;
    unsupported_families: string[];
    categories: string[];
    tags: string[];
    sizes_px: number[];
}


console.log("Updating icons...");    

const text = await (await fetch("http://fonts.google.com/metadata/icons?incomplete=1&key=material_symbols")).text();

const data = JSON.parse(text.substring(5)) as IconData;

const symbols: string[] = [];   
const icons: string[] = [];   

for (const icon of data.icons) {
    if (!icon.unsupported_families.includes("Material Symbols Outlined"))
        symbols.push(icon.name);
    if (!icon.unsupported_families.includes("Material Icons"))
        icons.push(icon.name);
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

let file = "export type MaterialIconName = " + icons.map(a=> '"' + a + '"').join(" |\n") + ";"; 

file += "\n\nexport type MaterialSymbolName = " + symbols.map(a => '"' + a + '"').join(" |\n") + ";";


const filePath = join(__dirname, '../src/components/Material.ts');

writeFileSync(filePath, file, 'utf-8');



