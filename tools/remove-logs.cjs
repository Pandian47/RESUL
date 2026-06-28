const fs = require('fs');

const listPath = process.argv[2] || 'tools/rg-logs.txt';
const files = fs
    .readFileSync(listPath, 'utf16le')
    .trim()
    .split(/\r?\n/)
    .filter(Boolean);

const stmt = /^\s*(console\.(log|info|warn|error|debug|trace)|rslog|RSLog)\s*\(.*\)\s*;?\s*$/;
const arrowConsole = /=>\s*console\.(log|info|warn|error|debug|trace)\s*\(.*\)\s*;?/;
const arrowRslog = /=>\s*(rslog|RSLog)\s*\(.*\)\s*;?/;
const returnConsole = /return\s+console\.(log|info|warn|error|debug|trace)\s*\(.*\)\s*;?/;
const returnRslog = /return\s+(rslog|RSLog)\s*\(.*\)\s*;?/;
const assignConsole = /console\.(log|info|warn|error|debug|trace)\s*=/;
const jsxConsole = /\{\s*console\.(log|info|warn|error|debug|trace)\s*\}/;
const callConsole = /console\.(log|info|warn|error|debug|trace)\s*\([^)]*\)/g;
const callRslog = /\b(rslog|RSLog)\s*\([^)]*\)/g;

for (const file of files) {
    const content = fs.readFileSync(file, 'utf8');
    const lines = content.split(/\r?\n/);
    let changed = false;
    const next = [];

    for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed.startsWith('//') || trimmed.startsWith('/*') || trimmed.startsWith('*')) {
            next.push(line);
            continue;
        }
        if (stmt.test(line)) {
            changed = true;
            continue;
        }
        if (arrowConsole.test(line)) {
            next.push(line.replace(arrowConsole, '=> {}'));
            changed = true;
            continue;
        }
        if (arrowRslog.test(line)) {
            next.push(line.replace(arrowRslog, '=> {}'));
            changed = true;
            continue;
        }
        if (returnConsole.test(line)) {
            next.push(line.replace(returnConsole, 'return undefined;'));
            changed = true;
            continue;
        }
        if (returnRslog.test(line)) {
            next.push(line.replace(returnRslog, 'return undefined;'));
            changed = true;
            continue;
        }
        if (assignConsole.test(line)) {
            next.push(line);
            continue;
        }
        if (jsxConsole.test(line)) {
            next.push(line.replace(jsxConsole, '{void 0}'));
            changed = true;
            continue;
        }
        let replaced = line.replace(callConsole, 'void 0').replace(callRslog, 'void 0');
        if (replaced !== line) {
            changed = true;
        }
        next.push(replaced);
    }

    if (changed) {
        fs.writeFileSync(file, next.join('\n'));
    }
}
