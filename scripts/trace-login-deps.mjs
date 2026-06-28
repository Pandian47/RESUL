/**
 * Login-focused Utils leak check — compares normal tracing vs full barrel fan-out.
 * Run: node scripts/trace-login-deps.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const SRC = path.join(ROOT, 'src');

const ALIASES = {
    src: SRC,
    Assets: path.join(SRC, 'Assets'),
    Components: path.join(SRC, 'Components'),
    Constants: path.join(SRC, 'Constants'),
    Hoc: path.join(SRC, 'Hoc'),
    Hooks: path.join(SRC, 'Hooks'),
    Pages: path.join(SRC, 'Pages'),
    Reducers: path.join(SRC, 'Reducers'),
    Routes: path.join(SRC, 'Routes'),
    Store: path.join(SRC, 'Store'),
    Utils: path.join(SRC, 'Utils'),
};

const IMPORT_RE =
    /import\s+(?:[\w*\s{},$]+\s+from\s+)?['"]([^'"]+)['"]|import\s*\(\s*['"]([^'"]+)['"]\s*\)/g;

const LOGIN_ENTRIES = [
    'src/main.jsx',
    'src/App.jsx',
    'src/Pages/RegistrationModule/Login/Pages/ExistingUser/index.jsx',
    'src/Pages/RegistrationModule/Login/Pages/NewUser/index.jsx',
    'src/Reducers/login/existingUser/request.js',
    'src/Reducers/globalState/request.js',
    'src/Components/RSHeader/index.jsx',
];

function resolveImport(specifier, fromFile) {
    if (specifier.startsWith('.')) {
        return resolveFile(path.resolve(path.dirname(fromFile), specifier));
    }
    for (const [alias, aliasPath] of Object.entries(ALIASES)) {
        if (specifier === alias || specifier.startsWith(`${alias}/`)) {
            const rest = specifier === alias ? '' : specifier.slice(alias.length + 1);
            return resolveFile(path.join(aliasPath, rest));
        }
    }
    return null;
}

function resolveFile(basePath) {
    for (const candidate of [
        basePath,
        `${basePath}.jsx`,
        `${basePath}.js`,
        path.join(basePath, 'index.jsx'),
        path.join(basePath, 'index.js'),
    ]) {
        if (fs.existsSync(candidate) && fs.statSync(candidate).isFile()) return candidate;
    }
    return null;
}

function trace(entries, { barrelFanout = false } = {}) {
    const visited = new Set();
    const queue = entries.map((e) => path.join(ROOT, e));
    const utilsModules = new Set();
    const heavyUtils = new Set();
    const authPages = new Set();
    const barrelHits = new Set();

    while (queue.length) {
        const file = queue.shift();
        if (!file || visited.has(file)) continue;
        visited.add(file);

        const rel = path.relative(ROOT, file).replace(/\\/g, '/');
        if (rel.startsWith('src/Pages/AuthenticationModule/')) authPages.add(rel);
        if (rel.startsWith('src/Utils/modules/')) utilsModules.add(rel);
        if (rel.endsWith('src/Utils/index.jsx')) barrelHits.add(rel);
        if (rel.includes('/Utils/modules/preview.') || rel.includes('/Utils/modules/warningPopup.')) {
            heavyUtils.add(rel);
        }

        let content;
        try {
            content = fs.readFileSync(file, 'utf8');
        } catch {
            continue;
        }

        if (barrelFanout && rel === 'src/Utils/index.jsx') {
            for (const match of content.matchAll(/from ['"](\.\/modules\/[^'"]+)['"]/g)) {
                const resolved = resolveImport(match[1], file);
                if (resolved) queue.push(resolved);
            }
            continue;
        }

        for (const match of content.matchAll(IMPORT_RE)) {
            const spec = match[1] || match[2];
            if (!spec || spec.startsWith('http')) continue;
            const resolved = resolveImport(spec, file);
            if (resolved) queue.push(resolved);
        }
    }

    return { visited: visited.size, utilsModules, heavyUtils, authPages, barrelHits };
}

function printResult(label, result) {
    console.log(`\n${label}`);
    console.log(`  Total modules:              ${result.visited}`);
    console.log(`  Utils/index.jsx referenced: ${result.barrelHits.size}`);
    console.log(`  Utils/modules loaded:       ${result.utilsModules.size}`);
    console.log(`  preview/warningPopup:       ${result.heavyUtils.size}`);
    console.log(`  Auth pages in graph:        ${result.authPages.size}`);
    if (result.utilsModules.size) {
        console.log('  Utils modules:');
        [...result.utilsModules]
            .map((f) => f.replace('src/Utils/modules/', ''))
            .sort()
            .forEach((f) => console.log(`    - ${f}`));
    }
}

console.log('Login Utils leak check');
console.log('======================');

const treeShaken = trace(LOGIN_ENTRIES);
const worstCase = trace(LOGIN_ENTRIES, { barrelFanout: true });

printResult('A) Current login graph (import-following, tree-shake friendly)', treeShaken);
printResult('B) Worst case if Utils/index loads ALL re-exports (old monolith behavior)', worstCase);

console.log('\nVerdict on Utils/index.jsx leak (~336 auth pages):');
if (treeShaken.heavyUtils.size === 0) {
    console.log('  YES — FIXED for login: preview.jsx / warningPopup.jsx are NOT pulled via Utils on login.');
} else {
    console.log('  NO — preview/warningPopup still reachable on login.');
}

if (worstCase.authPages.size >= 300) {
    console.log(`  If barrel fan-out happened (no tree-shaking), ${worstCase.authPages.size} auth pages would still load.`);
    console.log('  Production Vite/Rollup should tree-shake re-exports; dev may still request more modules.');
}

if (treeShaken.authPages.size > 50) {
    console.log(`  Note: ${treeShaken.authPages.size} auth pages still appear via OTHER paths (RSHeader WarningPopup, reducers, etc.) — not Utils/index barrel.`);
}

const loginUtilsIndexFiles = [
    'src/App.jsx',
    'src/Reducers/login/existingUser/request.js',
    'src/Reducers/globalState/request.js',
    'src/Components/RSHeader/Component/Notifications/index.jsx',
];
console.log('\nFiles still importing Utils/index on login path:');
for (const f of loginUtilsIndexFiles) {
    const content = fs.readFileSync(path.join(ROOT, f), 'utf8');
    if (/from ['"]Utils(\/index)?['"]/.test(content)) console.log(`  - ${f}`);
}

console.log('\nRecommendation:');
console.log('  Replace remaining Utils/index imports on login with Utils/modules/* direct imports');
console.log('  to guarantee dev + prod only load needed modules.');

function traceBarrelIsolation() {
    const visited = new Set();
    const queue = [path.join(SRC, 'Utils', 'index.jsx')];
    const authPages = new Set();

    while (queue.length) {
        const file = queue.shift();
        if (!file || visited.has(file)) continue;
        visited.add(file);

        const rel = path.relative(ROOT, file).replace(/\\/g, '/');
        if (rel.startsWith('src/Pages/AuthenticationModule/')) authPages.add(rel);

        let content;
        try {
            content = fs.readFileSync(file, 'utf8');
        } catch {
            continue;
        }

        if (rel === 'src/Utils/index.jsx') {
            for (const match of content.matchAll(/from ['"](\.\/modules\/[^'"]+)['"]/g)) {
                const resolved = resolveImport(match[1], file);
                if (resolved) queue.push(resolved);
            }
            continue;
        }

        for (const match of content.matchAll(IMPORT_RE)) {
            const spec = match[1] || match[2];
            if (!spec || spec.startsWith('http')) continue;
            const resolved = resolveImport(spec, file);
            if (resolved) queue.push(resolved);
        }
    }

    return { visited: visited.size, authPages: authPages.size };
}

const isolated = traceBarrelIsolation();
console.log('\nC) Utils/index.jsx isolated fan-out (simulates old monolith barrel load):');
console.log(`  Total modules:   ${isolated.visited}`);
console.log(`  Auth pages:      ${isolated.authPages}`);
console.log('  (Old monolith: any Utils import loaded the whole file + ~336 auth pages via preview/warningPopup)');
