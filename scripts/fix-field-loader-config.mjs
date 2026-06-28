import fs from 'fs';
import path from 'path';

const root = 'src/Pages/AuthenticationModule/Preferences';
const pattern = /^const fieldLoaderConfig = \{ create: LOADER_TYPE\.FIELD, edit: LOADER_TYPE\.FIELD \};$/m;
let count = 0;

function walk(dir) {
    for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
        const p = path.join(dir, ent.name);
        if (ent.isDirectory()) walk(p);
        else if (/\.(jsx?|tsx?)$/.test(ent.name)) {
            let src = fs.readFileSync(p, 'utf8');
            if (!pattern.test(src)) continue;

            src = src.replace(pattern, '');

            const loaderTypeCount = (src.match(/LOADER_TYPE/g) || []).length;
            const useApiLoaderImport = "import useApiLoader, { LOADER_TYPE } from 'Hooks/useApiLoader'";

            if (src.includes(useApiLoaderImport)) {
                if (loaderTypeCount <= 2) {
                    src = src.replace(
                        useApiLoaderImport,
                        "import useApiLoader from 'Hooks/useApiLoader';\nimport { FIELD_BOTH_LOADER_CONFIG as fieldLoaderConfig } from 'Hooks/loaderTypes'",
                    );
                } else {
                    src = src.replace(
                        useApiLoaderImport,
                        "import useApiLoader from 'Hooks/useApiLoader';\nimport { LOADER_TYPE, FIELD_BOTH_LOADER_CONFIG as fieldLoaderConfig } from 'Hooks/loaderTypes'",
                    );
                }
            } else if (!src.includes('FIELD_BOTH_LOADER_CONFIG as fieldLoaderConfig')) {
                src = src.replace(
                    /(import useApiLoader[^\n]+\n)/,
                    "$1import { FIELD_BOTH_LOADER_CONFIG as fieldLoaderConfig } from 'Hooks/loaderTypes';\n",
                );
            }

            src = src.replace(/\n{3,}/g, '\n\n');
            fs.writeFileSync(p, src);
            count++;
            console.log('updated', p);
        }
    }
}

walk(root);
console.log('total', count);
