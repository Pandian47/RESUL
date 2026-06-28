const fs = require('fs');

const list = fs
    .readFileSync('tools/rg-rslog.txt', 'utf16le')
    .trim()
    .split(/\r?\n/)
    .filter(Boolean);

for (const file of list) {
    const content = fs.readFileSync(file, 'utf8');
    const lines = content.split(/\r?\n/);
    let changed = false;
    const next = [];
    for (const line of lines) {
        if (/import\s+.*\bRSLog\b.*from\s+['"]Utils\/RSLog['"]/.test(line)) {
            changed = true;
            continue;
        }
        next.push(line);
    }
    if (changed) {
        fs.writeFileSync(file, next.join('\n'));
    }
}
