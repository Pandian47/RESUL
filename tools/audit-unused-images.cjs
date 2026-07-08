const fs = require('fs');
const path = require('path');

const root = process.cwd();
const imageExts = new Set(['.png', '.jpg', '.jpeg', '.gif', '.webp', '.svg', '.ico']);
const textExts = new Set([
    '.js',
    '.jsx',
    '.ts',
    '.tsx',
    '.css',
    '.scss',
    '.sass',
    '.html',
    '.json',
    '.mjs',
    '.cjs',
]);
const ignoredDirs = new Set(['.git', 'node_modules', 'build', 'dist', '.vite']);
const conservativeKeep = [
    'public/genie-assets/',
    'public/assets/social/',
    'public/assets/social/iconStyle/',
    'public/csat/',
    'src/Assets/Images/rs-checkbox-mini.svg',
    'src/Assets/Images/data_exchange/',
    'src/Styles/fonts/rs-icons/',
];

const toPosix = (value) => value.split(path.sep).join('/');

const walk = (dir, files = []) => {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        if (ignoredDirs.has(entry.name)) continue;
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) walk(fullPath, files);
        else files.push(fullPath);
    }
    return files;
};

const allFiles = walk(root);
const imageFiles = allFiles.filter((file) => imageExts.has(path.extname(file).toLowerCase()));
const textFiles = allFiles.filter((file) => {
    if (imageExts.has(path.extname(file).toLowerCase())) return false;
    return textExts.has(path.extname(file).toLowerCase());
});

const corpus = textFiles
    .map((file) => {
        try {
            return fs.readFileSync(file, 'utf8');
        } catch {
            return '';
        }
    })
    .join('\n');

const hasReference = (imageFile) => {
    const relative = toPosix(path.relative(root, imageFile));
    const srcRelative = relative.startsWith('src/') ? relative.slice(4) : relative;
    const publicRelative = relative.startsWith('public/') ? relative.slice(6) : relative;
    const fileName = path.basename(imageFile);

    if (conservativeKeep.some((prefix) => relative.startsWith(prefix))) return true;

    const variants = new Set([
        relative,
        `/${relative}`,
        srcRelative,
        `/${srcRelative}`,
        publicRelative,
        `/${publicRelative}`,
        fileName,
        encodeURI(fileName),
    ]);

    return [...variants].some((variant) => corpus.includes(variant));
};

const unused = imageFiles
    .filter((file) => !hasReference(file))
    .map((file) => toPosix(path.relative(root, file)))
    .sort();

console.log(JSON.stringify({
    imageCount: imageFiles.length,
    textFileCount: textFiles.length,
    unusedCount: unused.length,
    unused,
}, null, 2));
