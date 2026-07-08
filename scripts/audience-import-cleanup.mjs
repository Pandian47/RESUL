/**
 * Codemod + audits + repairs for namespace → named import migration.
 *
 * Codemod (default):
 *   node scripts/audience-import-cleanup.mjs [audience|communication|analytics|...|all] [--dry-run]
 *
 * Audits (read-only):
 *   node scripts/audience-import-cleanup.mjs --audit missing-exports
 *   node scripts/audience-import-cleanup.mjs --audit all-exports
 *   node scripts/audience-import-cleanup.mjs --audit relative-imports
 *   node scripts/audience-import-cleanup.mjs --audit tab-constants
 *   node scripts/audience-import-cleanup.mjs --audit ph-collisions
 *
 * Repairs:
 *   node scripts/audience-import-cleanup.mjs --repair <name> [--dry-run]
 *   Names: build-exports | custom-error-message | placeholder-array | request-http |
 *         vm-ph-collisions | false-named-imports | charts-namespace | react-hook-form-errors
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SRC_ROOT = path.join(__dirname, '../src');
const MODULE_ROOTS = {
    audience: path.join(__dirname, '../src/Pages/AuthenticationModule/Audience'),
    communication: path.join(__dirname, '../src/Pages/AuthenticationModule/Communication'),
    analytics: path.join(__dirname, '../src/Pages/AuthenticationModule/Analytics'),
    analyticstwins: path.join(__dirname, '../src/Pages/AuthenticationModule/AnalyticsTwins'),
    preferences: path.join(__dirname, '../src/Pages/AuthenticationModule/Preferences'),
    components: path.join(__dirname, '../src/Components'),
    reducers: path.join(__dirname, '../src/Reducers'),
    dashboard: path.join(__dirname, '../src/Pages/AuthenticationModule/Dashboard'),
    dashboardtwins: path.join(__dirname, '../src/Pages/AuthenticationModule/DashboardTwins'),
    kendodocs: path.join(__dirname, '../src/Pages/KendoDocs'),
    hooks: path.join(__dirname, '../src/Hooks'),
    constants: path.join(__dirname, '../src/Constants'),
    authcomponents: path.join(__dirname, '../src/Pages/AuthenticationModule/Components'),
    genie: path.join(__dirname, '../src/Pages/AuthenticationModule/genie'),
    launchpad: path.join(__dirname, '../src/Pages/AuthenticationModule/LaunchPad'),
    registration: path.join(__dirname, '../src/Pages/RegistrationModule'),
    documentation: path.join(__dirname, '../src/Pages/Documentation'),
    utils: path.join(__dirname, '../src/Utils'),
    commoncomponents: path.join(__dirname, '../src/CommonComponents'),
};
const ANALYTICS_TARGETS = ['analytics', 'analyticstwins' ];

/** ValidationMessage namespace aliases — `.message` / string methods / form field paths are not VM exports */
const VM_NAMESPACE_PREFIXES = new Set(['error', 'errors', 'errorMessage', 'message', 'messages']);
const VM_FALSE_POSITIVE_SYMBOLS = new Set([
    'message',
    'includes',
    'startsWith',
    'importUrl',
    'name',
    'toString',
]);

const DATES_MODULE = 'Constants/Utils/dates';
/** Local date-range state and array methods — not exports from Constants/Utils/dates */
const DATES_FALSE_POSITIVE_SYMBOLS = new Set([
    'startDate',
    'endDate',
    'selectedDateText',
    'push',
    'filter',
    'map',
    'length',
    'find',
    'forEach',
    'reduce',
    'slice',
    'sort',
]);

const IMAGES_MODULE = 'Assets/Images';
/** DOM NodeList / array methods — not exports from Assets/Images */
const IMAGES_FALSE_POSITIVE_SYMBOLS = new Set([
    'length',
    'forEach',
    'map',
    'filter',
    'push',
    'slice',
    'find',
    'reduce',
    'sort',
]);

const REACT_HOOK_MAP = [
    ['React.useState', 'useState'],
    ['React.useEffect', 'useEffect'],
    ['React.useMemo', 'useMemo'],
    ['React.useCallback', 'useCallback'],
    ['React.useRef', 'useRef'],
    ['React.useLayoutEffect', 'useLayoutEffect'],
    ['React.useReducer', 'useReducer'],
    ['React.useContext', 'useContext'],
    ['React.useId', 'useId'],
    ['React.useDeferredValue', 'useDeferredValue'],
    ['React.lazy', 'lazy'],
    ['React.Suspense', 'Suspense'],
    ['React.memo', 'memo'],
    ['React.Fragment', 'Fragment'],
];

const REGEX_FALSE_POSITIVE_SYMBOLS = new Set(['exec', 'test', 'match', 'replace', 'search', 'split']);

/** PropTypes.*.isRequired must not be collected as func.* from Constants/Charts/commonFunction */
const FUNC_FALSE_POSITIVE_SYMBOLS = new Set([
    'isRequired',
    'propTypes',
    'object',
    'array',
    'string',
    'bool',
    'number',
    'func',
    'oneOfType',
    'oneOf',
    'shape',
    'node',
    'element',
    'instanceOf',
    'any',
]);

const COMMON_FUNCTION_MODULE = 'Constants/Charts/commonFunction';

const GLYPHICON_FALSE_POSITIVE_SYMBOLS = new Set([
    'propTypes',
    'default',
    'length',
]);

const NAMESPACE_CONFIG = [
    { pattern: /import \* as icons from ['"]Constants\/GlobalConstant\/Glyphicons(?:\/index)?['"];?\s*\n/g, prefix: 'icons', module: 'Constants/GlobalConstant/Glyphicons' },
    { pattern: /import \* as Icons from ['"]Constants\/GlobalConstant\/Glyphicons(?:\/index)?['"];?\s*\n/g, prefix: 'Icons', module: 'Constants/GlobalConstant/Glyphicons', exportAs: 'icons' },
    { pattern: /import \* as placeholder from ['"]Constants\/GlobalConstant\/Placeholders['"];?\s*\n/g, prefix: 'placeholder', module: 'Constants/GlobalConstant/Placeholders' },
    { pattern: /import \* as placeholders from ['"]Constants\/GlobalConstant\/Placeholders['"];?\s*\n/g, prefix: 'placeholders', module: 'Constants/GlobalConstant/Placeholders' },
    { pattern: /import \* as Placeholder from ['"]Constants\/GlobalConstant\/Placeholders['"];?\s*\n/g, prefix: 'Placeholder', module: 'Constants/GlobalConstant/Placeholders' },
    { pattern: /import \* as Placeholders from ['"]Constants\/GlobalConstant\/Placeholders['"];?\s*\n/g, prefix: 'Placeholders', module: 'Constants/GlobalConstant/Placeholders' },
    { pattern: /import \* as rules from ['"]Constants\/GlobalConstant\/Rules['"];?\s*\n/g, prefix: 'rules', module: 'Constants/GlobalConstant/Rules' },
    { pattern: /import \* as Rules from ['"]Constants\/GlobalConstant\/Rules['"];?\s*\n/g, prefix: 'Rules', module: 'Constants/GlobalConstant/Rules' },
    { pattern: /import \* as errorMessage from ['"]Constants\/GlobalConstant\/ValidationMessage['"];?\s*\n/g, prefix: 'errorMessage', module: 'Constants/GlobalConstant/ValidationMessage' },
    { pattern: /import \* as error from ['"]Constants\/GlobalConstant\/ValidationMessage['"];?\s*\n/g, prefix: 'error', module: 'Constants/GlobalConstant/ValidationMessage' },
    { pattern: /import \* as message from ['"]Constants\/GlobalConstant\/ValidationMessage['"];?\s*\n/g, prefix: 'message', module: 'Constants/GlobalConstant/ValidationMessage' },
    { pattern: /import \* as messages from ['"]Constants\/GlobalConstant\/ValidationMessage['"];?\s*\n/g, prefix: 'messages', module: 'Constants/GlobalConstant/ValidationMessage' },
    { pattern: /import \* as errors from ['"]Constants\/GlobalConstant\/ValidationMessage['"];?\s*\n/g, prefix: 'errors', module: 'Constants/GlobalConstant/ValidationMessage' },
    { pattern: /import \* as regex from ['"]Constants\/GlobalConstant\/Regex['"];?\s*\n/g, prefix: 'regex', module: 'Constants/GlobalConstant/Regex' },
    { pattern: /import \* as endpoints from ['"]Constants\/EndPoints['"];?\s*\n/g, prefix: 'endpoints', module: 'Constants/EndPoints' },
    { pattern: /import \* as endPoints from ['"]Constants\/EndPoints['"];?\s*\n/g, prefix: 'endPoints', module: 'Constants/EndPoints' },
    { pattern: /import \* as picture from ['"]Assets\/Images(?:\/index)?['"];?\s*\n/g, prefix: 'picture', module: 'Assets/Images' },
    { pattern: /import \* as skeletonConstants from ['"]Components\/Skeleton\/Components\/constants['"];?\s*\n/g, prefix: 'skeletonConstants', module: 'Components/Skeleton/Components/constants' },
];

const UTILS_INDEX_PATTERN = /from ['"]Utils(?:\/index)?['"]/g;
const UTILS_REPLACEMENTS = [
    { names: ['encodeUrl', 'encodeUrlLegacy', 'decodeUrl', 'deCodeId', 'encryptWithAES', 'decryptWithAES', 'getUserDetails', 'updatedPermissionList', 'convertObjectToBase64', 'getPermissions', 'converBase64ToText', 'isBase64'], from: 'Utils/modules/crypto' },
    { names: ['getEnvironment'], from: 'Utils/modules/environment' },
    { names: ['getWarningPopupMessage', 'getStatusFailureApiModal', 'getSseDisconnectPopup'], from: 'Utils/modules/warningPopup' },
    { names: ['formatName', 'numberWithCommas', 'formatBytes', 'showPercentage', 'parseFormattedNumber', 'mapAudienceWithChannelLabels', 'formatMaxFileSizeDisplay', 'numberWithCommasformatCurrency', 'formatChartPercentageLabelValue'], from: 'Utils/modules/formatters' },
    { names: ['truncateTitle', 'prepareTextForTruncate'], from: 'Utils/modules/displayCore' },
    { names: ['selectIcon', 'selectIconTooltip', 'renderCommunicationListingTags', 'checkScheduleDate'], from: 'Utils/modules/display' },
    { names: ['checkIsBrandExists', 'getBrandNameUIPrintable', 'getBrandName', 'updateBrandId'], from: 'Utils/modules/brandStorage' },
    { names: ['BRAND_ID_CHECK'], from: 'Utils/modules/communicationChannels' },
    { names: ['getCsvListType', 'getBrowserName'], from: 'Utils/modules/browserUtils' },
    { names: ['getYYYYMMDDHHMMSS', 'getUserCurrentFormat', 'getUserCurrentFormatWithSeconds', 'getUserCurrentFormatWithoutYear', 'getfullFormat', 'YEAR_LIST', 'MM_LIST', 'getYYMMDD', 'getDateWithDaynoFormat', 'getDDMMMYYYYWITHOUTCOMMAS', 'getMMMDDYYYY', 'getUserDateTimeFormat', 'standardizeDateFormat', 'removeDuplicates', 'getDateBasedonDay', 'dateTimeFormat', 'formatBytes', 'getCurrentTimeInUserTimezone', 'convertToUserTimezone', 'convertUTCtoUserTimezone', 'getCurrentTimeInUserTimezoneWithAbbreviation', 'getDateWithDayfullFormat', 'getDateWithAddMinutes', 'getDateBasedonMonth', 'addDaysToDate', 'isDateBeforeToday', 'getCreatedDate', 'convertUserTimezoneToTarget', 'getDateFormat', 'getFileDownloadDateTime', 'getAPICurrentDateTimeFormat', 'findDuplicates', 'isURLValid', 'YEAR_AFTER_LIST', 'YEAR_BELOW_LIST', 'MM_MONTHS', 'convertDateBetweenTimezones'], from: 'Utils/modules/dateTime' },
    { names: ['charNumUnderScore', 'charNum', 'onlyNumbers', 'onlyNumbersDecimal', 'onlyNumbersDecimalWithoutSpecialCharacters', 'onlyNumbersDecimalWithoutSpecialCharactersUpto3Digits', 'charNumDotWithoutSpecialCharacters', 'charNumatdotUnderScore', 'charNumDotWithoutSpace'], from: 'Utils/modules/inputValidators' },
    { names: ['safeParseJSON'], from: 'Utils/modules/stringUtils' },
    { names: ['maskStringRandomly', 'maskStringRandomlyNew', 'maskEmailTwoCharsBeforeAndAfterDomain', 'maskPhoneTwoDigitsInMiddle'], from: 'Utils/modules/masking' },
    { names: ['updateQueryParams', 'versiumConfigData', 'versiumConfigContactData', 'getBrandNameUIPrintable', 'UpdateState'], from: 'Utils/modules/misc' },
    { names: ['validateIsCustomNavigate', 'handleCustomNavigationDetails', 'handleAdvanceSearchDataFormat', 'createCommunicationSettingsNavState', 'NOTIFICATION_TAB_ID', 'MESSAGING_TAB_ID', 'MAIL_TAB_ID', 'buildCommunicationSettingsNavState'], from: 'Utils/modules/navigation' },
    { names: ['normalizeDisplayText', 'toTitleCase', 'textFormatter', 'removeTags'], from: 'Utils/modules/stringUtils' },
    { names: ['downloadCSVcommasFile', 'downloadCSV', 'csvlinkDownloadWithoutBaseUrl'], from: 'Utils/modules/download' },
    { names: ['getChartColor', 'chartBookMark', 'hasNonZeroEngagementData', 'hasNonZeroPieChartSeriesData', 'hasNonZeroSeriesChartData', 'hasValidPieChartData'], from: 'Utils/modules/charts' },
    { names: ['formatPercentage'], from: 'Utils/modules/formatters' },
    { names: ['formatNumber', 'formatTime', 'validateRFAMandatory', 'statusIdCheck', 'campaignSchedule', 'checkTrigger', 'diff_minutes', 'checkRFAApproved'], from: 'Utils/modules/campaignUtils' },
    { names: ['maskingString_New'], from: 'Utils/modules/masking' },
    { names: ['getListTypeName'], from: 'Utils/modules/stringUtils' },
    { names: ['getChannelId', 'CHANNELS_LIST', 'CHANNELSSOCIAL_LIST', 'STATUS_LIST', 'PAID_CHANNEL_LIST', 'getChannelSocialId', 'getChannelPaidMediaId', 'getWeekName', 'analyticsAvaliableIds', 'analyticsIds', 'channelIds', 'getNameType'], from: 'Utils/modules/communicationChannels' },
    { names: ['getmasterData'], from: 'Utils/modules/masterData' },
    { names: ['isValidDate'], from: 'Utils/modules/uiToast' },
    { names: ['GeneratePasswordpseudorandom', 'GenerateUserPassword', 'RANDOMCHAR'], from: 'Utils/modules/passwordUtils' },
    { names: ['iv'], from: 'Utils/modules/crypto' },
    { names: ['onKeyChar', 'charNumDot'], from: 'Utils/modules/inputValidators' },
    { names: ['getStatus', 'getIconByStatus', 'getIndexBasedOnCampaign', 'getPausePlayTrigger', 'getCommunicationType'], from: 'Utils/modules/communicationStatus' },
    { names: ['GetpopoverContent', 'GetpopoverContentPlanner', 'PREVIEW_SOURCE', 'isListingPreviewEligible', 'hasListingPreviewApiContent', 'hasPlannerItemPreviewContent', 'buildPlannerCarouselSlides', 'ListingPreviewNoDataPanel', 'getListingPreviewNoDataPopover'], from: 'Utils/modules/preview' },
];

function walkDir(dir, files = []) {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        const full = path.join(dir, entry.name);
        if (entry.isDirectory()) walkDir(full, files);
        else if (/\.(jsx|js)$/.test(entry.name)) files.push(full);
    }
    return files;
}

function stripComments(content) {
    return content
        .replace(/\/\*[\s\S]*?\*\//g, '')
        .replace(/\/\/[^\n]*/g, '');
}

function getModuleExports(filePath) {
    if (!fs.existsSync(filePath) || !fs.statSync(filePath).isFile()) return null;
    const content = fs.readFileSync(filePath, 'utf8');
    const exported = new Set();
    for (const m of content.matchAll(/export const\s+(\w+)/g)) exported.add(m[1]);
    for (const m of content.matchAll(/export function\s+(\w+)/g)) exported.add(m[1]);
    for (const m of content.matchAll(/export async function\s+(\w+)/g)) exported.add(m[1]);
    for (const m of content.matchAll(/export \{([^}]+)\}/g)) {
        for (const s of m[1].split(',')) {
            const chunk = s.trim();
            if (!chunk) continue;
            const asParts = chunk.split(/\s+as\s+/);
            exported.add((asParts[1] || asParts[0]).trim());
        }
    }
    return exported;
}

function resolveSrcModule(modulePath) {
    const base = path.join(__dirname, '../src', modulePath);
    const candidates = [
        `${base}.jsx`,
        `${base}.js`,
        path.join(base, 'index.js'),
        path.join(base, 'index.jsx'),
    ];
    return candidates.find((c) => fs.existsSync(c) && fs.statSync(c).isFile()) || null;
}
function resolveRelativeModule(fromFile, modulePath) {
    const base = path.resolve(path.dirname(fromFile), modulePath);
    const candidates = [
        base,
        `${base}.js`,
        `${base}.jsx`,
        path.join(base, 'index.js'),
        path.join(base, 'index.jsx'),
    ];
    return candidates.find((c) => fs.existsSync(c) && fs.statSync(c).isFile()) || null;
}

function collectSymbols(content, prefix) {
    const active = stripComments(content);
    const re = new RegExp(`\\b${prefix}\\??\\.([A-Za-z0-9_]+)`, 'g');
    const symbols = new Set();
    let m;
    while ((m = re.exec(active)) !== null) {
        // Skip path segments (e.g. WorkFlow/constant.js) — not namespace access (constant.foo)
        if (m.index > 0 && active[m.index - 1] === '/') continue;
        const sym = m[1];
        if (VM_NAMESPACE_PREFIXES.has(prefix) && VM_FALSE_POSITIVE_SYMBOLS.has(sym)) continue;
        if (prefix === 'dates' && DATES_FALSE_POSITIVE_SYMBOLS.has(sym)) continue;
        if ((prefix === 'images' || prefix === 'picture') && IMAGES_FALSE_POSITIVE_SYMBOLS.has(sym)) continue;
        if (prefix === 'regex' && REGEX_FALSE_POSITIVE_SYMBOLS.has(sym)) continue;
        if (prefix === 'func' && FUNC_FALSE_POSITIVE_SYMBOLS.has(sym)) continue;
        if (prefix === 'func' && m.index >= 10 && active.slice(m.index - 10, m.index) === 'PropTypes.') continue;
        if (['icons', 'Icons'].includes(prefix) && GLYPHICON_FALSE_POSITIVE_SYMBOLS.has(sym)) continue;
        if (VM_NAMESPACE_PREFIXES.has(prefix)) {
            const vmExports = getValidationMessageExports();
            if (!vmExports.has(sym)) continue;
        }
        symbols.add(sym);
    }
    return [...symbols].sort();
}

const EXTRA_NAMESPACE = [
    { pattern: /import \* as rules from ['"]Constants\/GlobalConstant\/Rules['"];?\s*\n/g, prefix: 'rules', module: 'Constants/GlobalConstant/Rules' },
    { pattern: /import \* as colors from ['"]Constants\/GlobalConstant\/Colors(?:\/colorsVariable)?['"];?\s*\n/g, prefix: 'colors', module: 'Constants/GlobalConstant/Colors/colorsVariable' },
    { pattern: /import \* as chart from ['"]Constants\/Charts['"];?\s*\n/g, prefix: 'chart', module: 'Constants/Charts' },
    { pattern: /import \* as chartOptions from ['"]Constants\/Charts['"];?\s*\n/g, prefix: 'chartOptions', module: 'Constants/Charts' },
    { pattern: /import \* as charts from ['"]Constants\/Charts['"];?\s*\n/g, prefix: 'charts', module: 'Constants/Charts' },
    { pattern: /import \* as func from ['"]Constants\/Charts\/commonFunction['"];?\s*\n/g, prefix: 'func', module: 'Constants/Charts/commonFunction' },
    { pattern: /import \* as dates from ['"]Constants\/Utils\/dates['"];?\s*\n/g, prefix: 'dates', module: 'Constants/Utils/dates' },
    { pattern: /import \* as images from ['"]Assets\/Images(?:\/index)?['"];?\s*\n/g, prefix: 'images', module: 'Assets/Images' },
    { pattern: /import \* as fonts from ['"]Constants\/GlobalConstant\/Fonts\/Fonts['"];?\s*\n/g, prefix: 'fonts', module: 'Constants/GlobalConstant/Fonts/Fonts' },
    { pattern: /import \* as skeletonConstants from ['"]Components\/Skeleton\/Components\/constants['"];?\s*\n/g, prefix: 'skeletonConstants', module: 'Components/Skeleton/Components/constants' },
    { pattern: /import \* as syncConstants from ['"]([^'"]+)['"];?\s*\n/g, prefix: 'syncConstants', module: null },
];

function replaceRelativeNamespace(content, importRe, prefix, filePath) {
    let result = content;
    const re = new RegExp(importRe, 'g');
    let match;
    const replacements = [];
    while ((match = re.exec(content)) !== null) {
        replacements.push({ full: match[0], modulePath: match[1] });
    }
    for (const { full, modulePath } of replacements) {
        let symbols = collectSymbols(result, prefix);
        const resolved = resolveRelativeModule(filePath, modulePath);
        const exports = resolved ? getModuleExports(resolved) : null;
        if (exports) {
            symbols = symbols.filter((sym) => exports.has(sym));
        }
        result = result.replace(full, '');
        if (symbols.length) {
            result = `import { ${symbols.join(', ')} } from '${modulePath}';\n` + result;
            for (const sym of symbols) {
                const symRe = new RegExp(`\\b${prefix}\\.${sym}\\b`, 'g');
                result = result.replace(symRe, sym);
            }
        }
    }
    return result;
}
function replaceNamespaceImports(content, filePath) {
    let result = content;
    const allConfigs = [...NAMESPACE_CONFIG, ...EXTRA_NAMESPACE.filter((c) => c.module)];
    for (const cfg of allConfigs) {
        if (!cfg.pattern.test(result)) {
            cfg.pattern.lastIndex = 0;
            continue;
        }
        cfg.pattern.lastIndex = 0;
        let symbols = collectSymbols(result, cfg.prefix);
        if (isValidationMessageModule(cfg.module)) {
            symbols = filterValidationMessageSymbols(symbols);
        }
        result = result.replace(cfg.pattern, '');
        if (symbols.length) {
            const importLine = `import { ${symbols.join(', ')} } from '${cfg.module}';\n`;
            result = importLine + result;
            for (const sym of symbols) {
                if (isValidationMessageModule(cfg.module)) {
                    result = rewriteValidationNamespaceAccess(result, cfg.prefix, sym);
                } else {
                    const re = new RegExp(`\\b${cfg.prefix}\\.${sym}\\b`, 'g');
                    result = result.replace(re, sym);
                    const reOpt = new RegExp(`\\b${cfg.prefix}\\?\\.${sym}\\b`, 'g');
                    result = result.replace(reOpt, sym);
                }
            }
        }
    }

    result = replaceRelativeNamespace(
        result,
        String.raw`import \* as constant from ['"]([^'"]+)['"];?\s*\n`,
        'constant',
        filePath,
    );
    result = replaceRelativeNamespace(
        result,
        String.raw`import \* as syncConstants from ['"]([^'"]+)['"];?\s*\n`,
        'syncConstants',
        filePath,
    );
    result = replaceRelativeNamespace(
        result,
        String.raw`import \* as skeleton from ['"]([^'"]+)['"];?\s*\n`,
        'skeleton',
        filePath,
    );
    result = replaceRelativeNamespace(
        result,
        String.raw`import \* as MYC from ['"]([^'"]+)['"];?\s*\n`,
        'MYC',
        filePath,
    );
    result = replaceRelativeNamespace(
        result,
        String.raw`import \* as func from ['"]([^'"]*Constants\/Charts\/commonFunction)['"];?\s*\n`,
        'func',
        filePath,
    );
    result = replaceRelativeNamespace(
        result,
        String.raw`import \* as constants from ['"]([^'"]+)['"];?\s*\n`,
        'constants',
        filePath,
    );
    result = replaceRelativeNamespace(
        result,
        String.raw`import \* as Constant from ['"]([^'"]+)['"];?\s*\n`,
        'Constant',
        filePath,
    );
    result = replaceRelativeNamespace(
        result,
        String.raw`import \* as pageConstant from ['"]([^'"]+)['"];?\s*\n`,
        'pageConstant',
        filePath,
    );
    result = replaceRelativeNamespace(
        result,
        String.raw`import \* as data from ['"]([^'"]+)['"];?\s*\n`,
        'data',
        filePath,
    );
    result = replaceRelativeNamespace(
        result,
        String.raw`import \* as webConstant from ['"]([^'"]+)['"];?\s*\n`,
        'webConstant',
        filePath,
    );
    result = replaceRelativeNamespace(
        result,
        String.raw`import \* as mobileConstant from ['"]([^'"]+)['"];?\s*\n`,
        'mobileConstant',
        filePath,
    );
    result = replaceRelativeNamespace(
        result,
        String.raw`import \* as request from ['"]([^'"]+)['"];?\s*\n`,
        'request',
        filePath,
    );

    return result;
}

function fixReactHooks(content) {
    let result = content;
    const needed = new Set();
    for (const [from, to] of REACT_HOOK_MAP) {
        if (result.includes(from)) {
            needed.add(to);
            result = result.split(from).join(to);
        }
    }
    if (!needed.size) return result;

    const reactImportRe = /import\s+React(?:\s*,\s*\{([^}]*)\})?\s+from\s+['"]react['"];?/;
    const match = result.match(reactImportRe);
    if (match) {
        const existing = match[1]
            ? match[1].split(',').map((s) => s.trim()).filter(Boolean)
            : [];
        const merged = [...new Set([...existing, ...needed])].sort();
        const replacement = `import React, { ${merged.join(', ')} } from 'react';`;
        result = result.replace(reactImportRe, replacement);
    } else {
        const replacement = `import { ${[...needed].sort().join(', ')} } from 'react';\n`;
        result = replacement + result;
    }
    return result;
}

function parseReactImportLine(line) {
    const trimmed = line.trim();
    const defaultOnly = /^import\s+React\s+from\s+['"]react['"];?\s*$/.test(trimmed);
    if (defaultOnly) return { hasDefault: true, named: [] };

    const defaultAndNamed = trimmed.match(/^import\s+React\s*,\s*\{([^}]*)\}\s+from\s+['"]react['"];?\s*$/);
    if (defaultAndNamed) {
        const named = defaultAndNamed[1].split(',').map((s) => s.trim()).filter(Boolean);
        return { hasDefault: true, named };
    }

    const namedOnly = trimmed.match(/^import\s*\{([^}]+)\}\s+from\s+['"]react['"];?\s*$/);
    if (namedOnly) {
        const named = namedOnly[1].split(',').map((s) => s.trim()).filter(Boolean);
        return { hasDefault: false, named };
    }

    return null;
}

function needsReactDefault(content) {
    return /\bReact\.[A-Za-z_]/.test(content)
        || /\bReact\s*</.test(content)
        || /\bReact\.createContext\b/.test(content)
        || /\bReact\.createElement\b/.test(content);
}

/** Merge multiple `import ... from 'react'` lines into one; dedupe named imports. */
function mergeDuplicateReactImports(content) {
    const lines = content.split('\n');
    const reactLineIndices = [];
    let hasDefault = false;
    const namedByKey = new Map();

    for (let i = 0; i < lines.length; i++) {
        const parsed = parseReactImportLine(lines[i]);
        if (!parsed) continue;
        reactLineIndices.push(i);
        if (parsed.hasDefault) hasDefault = true;
        for (const sym of parsed.named) {
            const key = sym.split(/\s+as\s+/)[0].trim();
            if (!namedByKey.has(key)) namedByKey.set(key, sym);
        }
    }

    if (reactLineIndices.length < 2) return content;

    const bodyWithoutImports = lines
        .map((line, i) => (reactLineIndices.includes(i) ? null : line))
        .filter((line) => line !== null);

    const needsDefault = hasDefault || needsReactDefault(bodyWithoutImports.join('\n'));
    const named = [...namedByKey.values()].sort((a, b) =>
        a.split(/\s+as\s+/)[0].localeCompare(b.split(/\s+as\s+/)[0]),
    );

    let mergedLine;
    if (needsDefault && named.length) {
        mergedLine = `import React, { ${named.join(', ')} } from 'react';`;
    } else if (needsDefault) {
        mergedLine = `import React from 'react';`;
    } else if (named.length) {
        mergedLine = `import { ${named.join(', ')} } from 'react';`;
    } else {
        return content;
    }

    const firstIdx = reactLineIndices[0];
    const result = [];
    let inserted = false;
    for (let i = 0; i < lines.length; i++) {
        if (reactLineIndices.includes(i)) {
            if (!inserted) {
                result.push(mergedLine);
                inserted = true;
            }
            continue;
        }
        result.push(lines[i]);
    }

    return result.join('\n');
}

function parseImportSymbolList(importBody) {
    return importBody
        .replace(/\/\/[^\n]*/g, '')
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);
}

function fixModuleImports(content, modulePath) {
    const escaped = modulePath.replace(/\//g, '\\/');
    const importRe = new RegExp(`import\\s*\\{([^}]+)\\}\\s*from\\s*['"]${escaped}['"];?`, 'g');
    let result = content;
    const allSymbols = [];
    const matches = [...content.matchAll(importRe)];
    if (!matches.length) return content;
    for (const match of matches) {
        allSymbols.push(...parseImportSymbolList(match[1]));
    }
    result = result.replace(importRe, '');
    const byModule = new Map();
    for (const sym of allSymbols) {
        const base = sym.split(' as ')[0].trim();
        if (!base) continue;
        const rule = UTILS_REPLACEMENTS.find((r) => r.names.includes(base));
        const mod = rule ? rule.from : modulePath;
        if (!byModule.has(mod)) byModule.set(mod, []);
        byModule.get(mod).push(sym);
    }
    const lines = [...byModule.entries()]
        .sort(([a], [b]) => a.localeCompare(b))
        .filter(([mod]) => mod !== modulePath)
        .map(([mod, syms]) => `import { ${[...new Set(syms)].join(', ')} } from '${mod}';`);
    return (lines.length ? lines.join('\n') + '\n' : '') + result;
}

function fixUtilsIndexImports(content) {
    return fixModuleImports(content, 'Utils/index').replace(
        /import\s*\{([^}]+)\}\s*from\s*['"]Utils['"];?/g,
        (_, body) => {
            const byModule = new Map();
            for (const sym of body.split(',').map((s) => s.trim()).filter(Boolean)) {
                const base = sym.split(' as ')[0].trim();
                const rule = UTILS_REPLACEMENTS.find((r) => r.names.includes(base));
                const mod = rule ? rule.from : 'Utils/modules/misc';
                if (!byModule.has(mod)) byModule.set(mod, []);
                byModule.get(mod).push(sym);
            }
            return [...byModule.entries()]
                .sort(([a], [b]) => a.localeCompare(b))
                .map(([mod, syms]) => `import { ${[...new Set(syms)].join(', ')} } from '${mod}';`)
                .join('\n');
        },
    );
}

function fixMiscMisroutes(content) {
    return fixModuleImports(content, 'Utils/modules/misc');
}

function parseImportSymbols(importBody) {
    return importBody.split(',').map((s) => {
        const parts = s.trim().split(/\s+as\s+/);
        return { imported: parts[0].trim(), local: (parts[1] || parts[0]).trim() };
    }).filter((s) => s.imported);
}

function getImportLine(content, modulePath) {
    const re = new RegExp(`import\\s*\\{([^}]+)\\}\\s*from\\s*['"]${modulePath.replace(/\//g, '\\/')}['"];?`);
    const match = content.match(re);
    return match ? { full: match[0], body: match[1], re } : null;
}

const VM_MODULE = 'Constants/GlobalConstant/ValidationMessage';
const PH_MODULE = 'Constants/GlobalConstant/Placeholders';
const NAMED_IMPORT_LINE_RE = /^import\s*\{([^}]+)\}\s*from\s*['"]([^'"]+)['"];?\s*$/;

function isConstantLikeModule(mod) {
    return /(?:^|\/)(constant|constants|data)(?:\.jsx?)?$/.test(mod) || /^\.{1,2}\//.test(mod);
}

function isPlaceholdersModule(mod) {
    return mod === PH_MODULE || mod.endsWith('/Placeholders');
}

function isValidationMessageModule(mod) {
    return mod === VM_MODULE || mod.endsWith('/ValidationMessage');
}

function isDataModule(mod) {
    return /(?:^|\/)(data)(?:\.jsx?)?$/.test(mod);
}

function getAllNamedImports(content) {
    const imports = [];
    for (const line of content.split('\n')) {
        const m = line.match(NAMED_IMPORT_LINE_RE);
        if (m) imports.push({ full: line.trim(), body: m[1], module: m[2] });
    }
    return imports;
}

function formatSymPart(imported, local) {
    return local === imported ? imported : `${imported} as ${local}`;
}

function updateImportSymbols(content, modulePath, symUpdater) {
    const escaped = modulePath.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const re = new RegExp(`import\\s*\\{([^}]+)\\}\\s*from\\s*['"]${escaped}['"];?`);
    const match = content.match(re);
    if (!match) return content;
    const syms = parseImportSymbols(match[1]);
    const newParts = syms.map((s) => {
        const next = symUpdater(s);
        if (!next) return formatSymPart(s.imported, s.local);
        return formatSymPart(next.imported, next.local);
    });
    return content.replace(match[0], `import { ${newParts.join(', ')} } from '${modulePath}';`);
}

function rewriteValidationMessageUsages(result, sym, alias) {
    const validationPatterns = [
        new RegExp(`(required:\\s*)${sym}\\b`, 'g'),
        new RegExp(`(message:\\s*)${sym}\\b`, 'g'),
        new RegExp(`(customErrorMessage=\\{)${sym}\\}`, 'g'),
        new RegExp(`(LIST_NAME_RULES\\()${sym}\\b`, 'g'),
        new RegExp(`(rules=\\{LIST_NAME_RULES\\()${sym}\\b`, 'g'),
        new RegExp(`(validate:\\s*)${sym}\\b`, 'g'),
        new RegExp(`(content:\\s*)${sym}\\b`, 'g'),
    ];
    for (const re of validationPatterns) {
        result = result.replace(re, `$1${alias}`);
    }
    return result;
}

function rewritePlaceholderUsages(result, sym, alias) {
    const patterns = [
        [new RegExp(`(label=\\{)${sym}(\\})`, 'g'), `$1${alias}$2`],
        [new RegExp(`(header=\\{)${sym}(\\})`, 'g'), `$1${alias}$2`],
        [new RegExp(`(title=\\{)${sym}(\\})`, 'g'), `$1${alias}$2`],
        [new RegExp(`(<label[^>]*>\\s*)\\{${sym}\\}(\\s*</label>)`, 'g'), `$1{${alias}}$2`],
        [new RegExp(`(className="control-label[^"]*"[^>]*>\\s*)\\{${sym}\\}`, 'g'), `$1{${alias}}`],
        [new RegExp(`(>)\\s*\\{${sym}\\}\\s*(</)`, 'g'), `$1{${alias}}$2`],
    ];
    for (const [re, repl] of patterns) {
        result = result.replace(re, repl);
    }
    return result;
}

function constantModulePriority(mod) {
    if (mod === './constant') return 0;
    if (/^\.{1,2}\/constant/.test(mod)) return 1;
    if (mod.includes('/constant') && !mod.includes('Notification')) return 2;
    if (mod.includes('Notification/constant') && !mod.includes('MobileNotification')) return 3;
    if (mod.includes('MobileNotification')) return 4;
    return 5;
}

function aliasForConstantModule(sym, mod) {
    if (sym === 'buildPayload') {
        if (mod.includes('MobileNotification')) return 'buildMobileNotificationPayload';
        if (mod.includes('Notification')) return 'buildWebNotificationPayload';
    }
    const hint = mod.split('/').filter((p) => p && p !== '..' && p !== '.').slice(-2, -1)[0] || 'alt';
    return `${sym}_${hint.replace(/[^A-Za-z0-9]/g, '')}`;
}

function rewriteBuildPayloadUsages(result) {
    result = result.replace(
        /\bbuildPayload\(\s*formState,\s*'web'/g,
        "buildWebNotificationPayload(formState, 'web'",
    );
    result = result.replace(
        /\bbuildPayload\(\s*formState,\s*timeZoneId,\s*mobileApp\s*\)/g,
        'buildMobileNotificationPayload(formState, timeZoneId, mobileApp)',
    );
    return result;
}

function findCrossModuleImportCollisions(content) {
    const byLocal = new Map();
    for (const imp of getAllNamedImports(content)) {
        for (const s of parseImportSymbols(imp.body)) {
            if (!byLocal.has(s.local)) byLocal.set(s.local, []);
            byLocal.get(s.local).push({ ...s, module: imp.module });
        }
    }
    return [...byLocal.entries()].filter(([, sources]) => new Set(sources.map((s) => s.module)).size > 1);
}

/** Resolve same local name imported from multiple modules (namespace codemod side effect). */
function fixDuplicateImportCollisions(content) {
    const collisions = findCrossModuleImportCollisions(content);
    if (!collisions.length) return content;

    let result = content;

    for (const [sym, sources] of collisions) {
        const modules = [...new Set(sources.map((s) => s.module))];
        const phMod = modules.find(isPlaceholdersModule);
        const vmMod = modules.find(isValidationMessageModule);
        const constantMods = modules.filter(isConstantLikeModule);
        const dataMod = modules.find(isDataModule);
        const parentConstantsMod = constantMods.find((m) => /constants(?:\.jsx?)?$/.test(m) && !isDataModule(m));

        if (phMod && constantMods.length) {
            const localMod = constantMods.find((m) => m !== phMod) || constantMods[0];
            result = updateImportSymbols(result, phMod, (s) => {
                if (s.imported === sym && s.local === sym) {
                    return { imported: sym, local: `${sym}_PH` };
                }
                return null;
            });
            result = rewritePlaceholderUsages(result, sym, `${sym}_PH`);
            if (localMod !== phMod) {
                // local constant keeps bare sym for data={sym}, array ops, etc.
            }
            continue;
        }

        if (vmMod && constantMods.length && !phMod) {
            result = updateImportSymbols(result, vmMod, (s) => {
                if (s.imported === sym && s.local === sym) {
                    return { imported: sym, local: `${sym}_MSG` };
                }
                return null;
            });
            result = rewriteValidationMessageUsages(result, sym, `${sym}_MSG`);
            continue;
        }

        if (dataMod && parentConstantsMod) {
            const dataAlias = `${sym}_DATA`;
            result = updateImportSymbols(result, dataMod, (s) => {
                if (s.imported === sym && s.local === sym) {
                    return { imported: sym, local: dataAlias };
                }
                return null;
            });
            result = result.replace(new RegExp(`(column=\\{)${sym}(\\})`, 'g'), `$1${dataAlias}$2`);
            result = result.replace(new RegExp(`(columnList=\\{)${sym}(\\})`, 'g'), `$1${dataAlias}$2`);
            continue;
        }

        if (constantMods.length > 1) {
            const ranked = [...constantMods].sort((a, b) => constantModulePriority(a) - constantModulePriority(b));
            const [primaryMod, ...rest] = ranked;
            for (const mod of rest) {
                const alias = aliasForConstantModule(sym, mod);
                result = updateImportSymbols(result, mod, (s) => {
                    if (s.imported === sym && s.local === sym) {
                        return { imported: sym, local: alias };
                    }
                    return null;
                });
            }
            if (sym === 'buildPayload') {
                result = rewriteBuildPayloadUsages(result);
            }
        }
    }

    return result;
}

function fixValidationPlaceholderCollisions(content) {
    const vm = getImportLine(content, VM_MODULE);
    const ph = getImportLine(content, PH_MODULE);
    if (!vm || !ph) return content;

    const vmSyms = parseImportSymbols(vm.body);
    const phSyms = parseImportSymbols(ph.body);
    const phNames = new Set(phSyms.map((s) => s.imported));
    const collisions = vmSyms.filter((s) => phNames.has(s.imported)).map((s) => s.imported);
    if (!collisions.length) return content;

    let result = content;
    const newVmParts = vmSyms.map((s) => {
        if (collisions.includes(s.imported) && s.local === s.imported) {
            return `${s.imported} as ${s.imported}_MSG`;
        }
        return s.local === s.imported ? s.imported : `${s.imported} as ${s.local}`;
    });
    result = result.replace(vm.full, `import { ${newVmParts.join(', ')} } from '${VM_MODULE}';`);

    for (const sym of collisions) {
        const msg = `${sym}_MSG`;
        const validationPatterns = [
            new RegExp(`(required:\\s*)${sym}\\b`, 'g'),
            new RegExp(`(message:\\s*)${sym}\\b`, 'g'),
            new RegExp(`(customErrorMessage=\\{)${sym}\\}`, 'g'),
            new RegExp(`(LIST_NAME_RULES\\()${sym}\\b`, 'g'),
            new RegExp(`(rules=\\{LIST_NAME_RULES\\()${sym}\\b`, 'g'),
            new RegExp(`(validate:\\s*)${sym}\\b`, 'g'),
            new RegExp(`(content:\\s*)${sym}\\b`, 'g'),
        ];
        for (const re of validationPatterns) {
            result = result.replace(re, `$1${msg}`);
        }
    }
    return result;
}

function replaceStaleNamespaceRefs(content) {
    const PREFIX_MAP = [
        ['placeholder', PH_MODULE],
        ['placeholders', PH_MODULE],
        ['Placeholder', PH_MODULE],
        ['Placeholders', PH_MODULE],
        ['icons', 'Constants/GlobalConstant/Glyphicons'],
        ['Icons', 'Constants/GlobalConstant/Glyphicons'],
        ['rules', 'Constants/GlobalConstant/Rules'],
        ['Rules', 'Constants/GlobalConstant/Rules'],
        ['error', VM_MODULE],
        ['errorMessage', VM_MODULE],
        ['message', VM_MODULE],
        ['messages', VM_MODULE],
        ['errors', VM_MODULE],
        ['regex', 'Constants/GlobalConstant/Regex'],
        ['skeleton', null],
        ['constant', null],
        ['constants', null],
        ['Constant', null],
        ['pageConstant', null],
        ['syncConstants', null],
        ['colors', 'Constants/GlobalConstant/Colors/colorsVariable'],
        ['chart', 'Constants/Charts'],
        ['chartOptions', 'Constants/Charts'],
        ['charts', 'Constants/Charts'],
        ['func', 'Constants/Charts/commonFunction'],
        ['dates', 'Constants/Utils/dates'],
        ['images', 'Assets/Images'],
        ['fonts', 'Constants/GlobalConstant/Fonts/Fonts'],
        ['skeletonConstants', 'Components/Skeleton/Components/constants'],
        ['endpoints', 'Constants/EndPoints'],
        ['endPoints', 'Constants/EndPoints'],
        ['picture', 'Assets/Images'],
        ['webConstant', null],
        ['mobileConstant', null],
        ['request', null],
        ['MYC', null],
    ];

    let result = content;
    for (const [prefix, modulePath] of PREFIX_MAP) {
        const symbols = collectSymbols(result, prefix);
        if (!symbols.length) continue;

        if (modulePath) {
            const resolved = resolveSrcModule(modulePath);
            const moduleExports = resolved ? getModuleExports(resolved) : null;
            const exportValidated = moduleExports
                ? symbols.filter((s) => moduleExports.has(s))
                : symbols;

            const existing = getImportLine(result, modulePath);
            const existingNames = new Set(
                existing ? parseImportSymbols(existing.body).map((s) => s.local) : [],
            );
            const missing = exportValidated.filter((s) => !existingNames.has(s));
            if (missing.length) {
                const merged = [...existingNames, ...missing].sort();
                const importLine = `import { ${merged.join(', ')} } from '${modulePath}';`;
                if (existing) {
                    result = result.replace(existing.full, importLine);
                } else {
                    result = `${importLine}\n${result}`;
                }
            }

            for (const sym of exportValidated) {
                if (isValidationMessageModule(modulePath)) {
                    result = rewriteValidationNamespaceAccess(result, prefix, sym);
                } else {
                    result = result.replace(new RegExp(`\\b${prefix}\\?\\.${sym}\\b`, 'g'), sym);
                    result = result.replace(new RegExp(`\\b${prefix}\\.${sym}\\b`, 'g'), sym);
                }
            }
            continue;
        }

        if (isValidationMessagePrefix(prefix)) {
            continue;
        }

        for (const sym of symbols) {
            result = result.replace(new RegExp(`\\b${prefix}\\?\\.${sym}\\b`, 'g'), sym);
            result = result.replace(new RegExp(`\\b${prefix}\\.${sym}\\b`, 'g'), sym);
        }
    }
    return result;
}

function escapeRegex(value) {
    return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function isValidationMessagePrefix(prefix) {
    return VM_NAMESPACE_PREFIXES.has(prefix);
}

function filterValidationMessageSymbols(symbols) {
    const exports = getValidationMessageExports();
    return symbols.filter((sym) => exports.has(sym));
}

/** Only rewrite ValidationMessage namespace access — never react-hook-form `errors?.field`. */
function rewriteValidationNamespaceAccess(content, prefix, sym) {
    const p = escapeRegex(prefix);
    const s = escapeRegex(sym);
  if (/^[A-Z][A-Z0-9_]*$/.test(sym)) {
        return content
            .replace(new RegExp(`\\b${p}\\?\\.${s}\\b`, 'g'), sym)
            .replace(new RegExp(`\\b${p}\\.${s}\\b`, 'g'), sym);
    }
    let result = content;
    const validationPatterns = [
        new RegExp(`(required:\\s*)${p}\\??\\.${s}\\b`, 'g'),
        new RegExp(`(message:\\s*)${p}\\??\\.${s}\\b`, 'g'),
        new RegExp(`(customErrorMessage=\\{)${p}\\??\\.${s}\\}`, 'g'),
        new RegExp(`(LIST_NAME_RULES\\()${p}\\??\\.${s}\\b`, 'g'),
        new RegExp(`(rules=\\{LIST_NAME_RULES\\()${p}\\??\\.${s}\\b`, 'g'),
        new RegExp(`(validate:\\s*)${p}\\??\\.${s}\\b`, 'g'),
        new RegExp(`(content:\\s*)${p}\\??\\.${s}\\b`, 'g'),
    ];
    for (const re of validationPatterns) {
        result = result.replace(re, `$1${sym}`);
    }
    return result;
}

function collectReactHookFormFieldNames(content) {
    const fields = new Set();
    for (const m of content.matchAll(
        /(?:setValue|watch|register|trigger|setError|clearErrors|getValues)\(\s*['"`]([^'"`$]+)['"`]/g,
    )) {
        const root = m[1].split('.')[0].split('[')[0];
        if (root) fields.add(root);
    }
    for (const m of content.matchAll(/\berrors\?\.\[?['"`]?([a-z][a-zA-Z0-9_]*)['"`]?\]?/g)) {
        fields.add(m[1]);
    }
    return [...fields];
}

let validationMessageExports = null;

function getValidationMessageExports() {
    if (validationMessageExports) return validationMessageExports;
    const vmPath = path.join(__dirname, '../src/Constants/GlobalConstant/ValidationMessage/index.js');
    const vmContent = fs.readFileSync(vmPath, 'utf8');
    validationMessageExports = new Set([...vmContent.matchAll(/export const (\w+)/g)].map((m) => m[1]));
    return validationMessageExports;
}

/** Undo codemod damage: error.message / errors.importUrl / API message string methods mistaken for VM exports */
function repairValidationNamespaceDamage(content) {
    let result = content;

    result = result.replace(
        /catch\s*\(\s*error\s*\)\s*\{([\s\S]*?)return\s*\[\s*false\s*,\s*message\s*\]/g,
        (match, body) => `catch (error) {${body}return [false, error.message]`,
    );

    result = result.replace(
        /catch\s*\(\s*error\s*\)\s*\{([\s\S]*?)'Error processing Excel file: '\s*\+\s*message\b/g,
        (match, body) => `catch (error) {${body}'Error processing Excel file: ' + error.message`,
    );

    result = result.replace(
        /(checkImportUrlError\s*=\s*isSplit\s*\?\s*errors\?\.\[fieldName\]\?\.importUrl\s*:\s*)importUrl\b/g,
        '$1errors?.importUrl',
    );

    result = result.replace(
        /\}\s*else\s+if\s*\(\s*startsWith\('AMP Validation'\)\s*\|\|\s*includes\('AMP Validation'\)\s*\)/g,
        "} else if (message.startsWith('AMP Validation') || message.includes('AMP Validation'))",
    );

    // RHF formState.errors?.field mistaken for ValidationMessage `errors` namespace
    result = result.replace(
        /\berror=\{profilePath\?\.message\}/g,
        "error={formState.errors?.['profilePath']?.message}",
    );

    return result;
}

/** Revert react-hook-form `errors?.field` damage from ValidationMessage namespace codemod. */
function repairReactHookFormErrors(content) {
    let result = repairValidationNamespaceDamage(content);

    const usesReactHookForm =
        /\buseForm\b/.test(content) &&
        (/\bformState:\s*\{[^}]*\berrors\b/.test(content) ||
            /\bconst\s*\{\s*errors\s*\}\s*=\s*formState/.test(content));

    if (!usesReactHookForm) return result;

    const formFields = collectReactHookFormFieldNames(result);
    for (const field of formFields) {
        if (/^[A-Z][A-Z0-9_]*$/.test(field)) continue;
        const f = escapeRegex(field);

        result = result.replace(
            new RegExp(`(disabled=\\{[^}]*?\\|\\|\\s*)!!${f}\\b`, 'g'),
            `$1!!errors?.${field}`,
        );
        result = result.replace(
            new RegExp(`(className=\\{\`\\$\\{)${f}(\\s*\\|\\|\\s*disable)`, 'g'),
            `$1errors?.${field}$2`,
        );
        result = result.replace(
            new RegExp(`\\berror=\\{${f}\\?\\.message\\}`, 'g'),
            `error={errors?.${field}?.message}`,
        );
    }

    return result;
}

let datesModuleExports = null;

function getDatesModuleExports() {
    if (datesModuleExports) return datesModuleExports;
    const datesPath = path.join(__dirname, '../src/Constants/Utils/dates.js');
    const datesContent = fs.readFileSync(datesPath, 'utf8');
    datesModuleExports = new Set([...datesContent.matchAll(/export const (\w+)/g)].map((m) => m[1]));
    return datesModuleExports;
}

/** Drop bogus named imports from Constants/Utils/dates (e.g. startDate from dates state). */
function stripInvalidDatesImports(content) {
    const datesImport = getImportLine(content, DATES_MODULE);
    if (!datesImport) return content;

    const exports = getDatesModuleExports();
    const syms = parseImportSymbols(datesImport.body);
    const valid = syms.filter((s) => exports.has(s.imported));
    if (valid.length === syms.length) return content;

    if (!valid.length) {
        return content.replace(`${datesImport.full}\n`, '').replace(datesImport.full, '');
    }

    const newLine = `import { ${valid.map((s) => formatSymPart(s.imported, s.local)).join(', ')} } from '${DATES_MODULE}';`;
    return content.replace(datesImport.full, newLine);
}

/** Undo codemod damage: dates.startDate / dates.push mistaken for Constants/Utils/dates exports */
function repairDatesNamespaceDamage(content) {
    let result = content;

    if (/\blet dates\s*=\s*\[\]/.test(result)) {
        result = result.replace(/(?<!dates\.)push\(new Date\(date\)\)/g, 'dates.push(new Date(date))');
        result = result.replace(/const filterDate = (?<!dates\.)filter\(/g, 'const filterDate = dates.filter(');
        result = result.replace(/\bdates\.dates\.push\(/g, 'dates.push(');
    }

    const hasDatesState =
        /\bconst \[dates, setDates\]/.test(result) ||
        /\bconst \{[^}]*\bdates\b[^}]*\}\s*=\s*useContext/.test(result);

    if (!hasDatesState) return result;

    result = result.replace(/\bstartDate=\{startDate\}/g, 'startDate={dates.startDate}');
    result = result.replace(/\bendDate=\{endDate\}/g, 'endDate={dates.endDate}');
    result = result.replace(
        /\bselectedDateText=\{selectedDateText\}/g,
        'selectedDateText={dates.selectedDateText}',
    );

    result = result.replace(
        /searchDate\.startDate \?\? getYYMMDD\(startDate\)/g,
        'searchDate.startDate ?? getYYMMDD(dates.startDate)',
    );
    result = result.replace(
        /searchDate\.endDate \?\? getYYMMDD\(endDate\)/g,
        'searchDate.endDate ?? getYYMMDD(dates.endDate)',
    );

    result = result.replace(
        /pipelinePayload\.startDate \?\? startDate\b/g,
        'pipelinePayload.startDate ?? dates?.startDate',
    );
    result = result.replace(
        /pipelinePayload\.endDate \?\? endDate\b/g,
        'pipelinePayload.endDate ?? dates?.endDate',
    );
    result = result.replace(
        /\} else if \(startDate && endDate\) \{/g,
        '} else if (dates?.startDate && dates?.endDate) {',
    );

    result = result.replace(
        /(getFetchPipeline\(\s*\n?\s*clientId,\s*\n?\s*defaultDagId,\s*\n?\s*)startDate,\s*\n?\s*endDate,/g,
        '$1dates.startDate,\n                        dates.endDate,',
    );

    result = result.replace(
        /startDate: startDate,\s*\n\s*endDate: endDate,\s*\n\s*openPipelineDetails/g,
        'startDate: dates.startDate,\n            endDate: dates.endDate,\n            openPipelineDetails',
    );

    result = result.replace(
        /pipelinePayload\?\.listType,\s*\n\s*startDate,\s*\n\s*endDate,\s*\n\s*setPipelinePayload/g,
        'pipelinePayload?.listType,\n        dates.startDate,\n        dates.endDate,\n        setPipelinePayload',
    );

    return result;
}

/** Drop bogus named imports from Assets/Images (e.g. length from NodeList). */
function stripInvalidImagesImports(content) {
    const imagesImport = getImportLine(content, IMAGES_MODULE);
    if (!imagesImport) return content;

    let exports;
    try {
        const imagesPath = path.join(__dirname, '../src/Assets/Images/index.js');
        const imagesContent = fs.readFileSync(imagesPath, 'utf8');
        exports = new Set([...imagesContent.matchAll(/export const (\w+)/g)].map((m) => m[1]));
        for (const m of imagesContent.matchAll(/export \{([^}]+)\}/g)) {
            m[1].split(',').forEach((s) => {
                const name = s.trim().split(/\s+as\s+/)[0].trim();
                if (name) exports.add(name);
            });
        }
    } catch {
        return content;
    }

    const syms = parseImportSymbols(imagesImport.body);
    const valid = syms.filter((s) => exports.has(s.imported) && !IMAGES_FALSE_POSITIVE_SYMBOLS.has(s.imported));
    if (valid.length === syms.length) return content;

    if (!valid.length) {
        return content.replace(`${imagesImport.full}\n`, '').replace(imagesImport.full, '');
    }

    const newLine = `import { ${valid.map((s) => formatSymPart(s.imported, s.local)).join(', ')} } from '${IMAGES_MODULE}';`;
    return content.replace(imagesImport.full, newLine);
}

/** Undo codemod damage: images.length / images.forEach mistaken for Assets/Images exports */
function repairImagesNamespaceDamage(content) {
    let result = content;

    if (!/\bconst images = body\.querySelectorAll\('img'\)/.test(result)) return result;

    result = result.replace(/\blet totalImages = length;/g, 'let totalImages = images.length;');
    result = result.replace(
        /(\s+)forEach\(\(img\) => \{/g,
        '$1images.forEach((img) => {',
    );

    return result;
}

/** Repair customErrorMessage={SYM_MSG missing closing brace after placeholder collision rewrite */
function repairCustomErrorMessageProps(content) {
    return content.replace(
        /customErrorMessage=\{([A-Z][A-Z0-9_]*_MSG)\s*\n/g,
        'customErrorMessage={$1}\n',
    );
}

/** Drop bogus named imports from Constants/Charts/commonFunction (e.g. isRequired from PropTypes.func). */
function stripInvalidCommonFunctionImports(content) {
    const cfImport = getImportLine(content, COMMON_FUNCTION_MODULE);
    if (!cfImport) return content;

    const resolved = resolveSrcModule(COMMON_FUNCTION_MODULE);
    const exports = resolved ? getModuleExports(resolved) : null;
    if (!exports) return content;

    const syms = parseImportSymbols(cfImport.body);
    const valid = syms.filter(
        (s) => exports.has(s.imported) && !FUNC_FALSE_POSITIVE_SYMBOLS.has(s.imported),
    );
    if (valid.length === syms.length) return content;

    if (!valid.length) {
        return content.replace(`${cfImport.full}\n`, '').replace(cfImport.full, '');
    }

    const newLine = `import { ${valid.map((s) => formatSymPart(s.imported, s.local)).join(', ')} } from '${COMMON_FUNCTION_MODULE}';`;
    return content.replace(cfImport.full, newLine);
}

/** Remove unused `import * as func from './commonFunction'` after namespace conversion. */
function removeStaleFuncNamespaceImport(content) {
    if (!/import \* as func from ['"]\.\/commonFunction['"];?\s*\n/.test(content)) return content;
    if (/\bfunc\./.test(stripComments(content))) return content;
    return content.replace(/import \* as func from ['"]\.\/commonFunction['"];?\s*\n/g, '');
}

/** Drop named imports from ValidationMessage that are not real exports (e.g. `{ message }`). */
function stripInvalidValidationMessageImports(content) {
    const vmImport = getImportLine(content, VM_MODULE);
    if (!vmImport) return content;

    const exports = getValidationMessageExports();
    const syms = parseImportSymbols(vmImport.body);
    const valid = syms.filter((s) => exports.has(s.imported));
    if (valid.length === syms.length) return content;

    if (!valid.length) {
        return content.replace(`${vmImport.full}\n`, '').replace(vmImport.full, '');
    }

    const newLine = `import { ${valid.map((s) => formatSymPart(s.imported, s.local)).join(', ')} } from '${VM_MODULE}';`;
    return content.replace(vmImport.full, newLine);
}

function removeUnusedReactNamespaceImport(content) {
    if (!/import \* as React from ['"]react['"];?\s*\n/.test(content)) return content;
    if (/\bReact\.[A-Za-z_]/.test(content)) return content;
    return content.replace(/import \* as React from ['"]react['"];?\s*\n/g, '');
}

/** Merge duplicate named imports in the leading import block (stabilizes Utils/index splits). */
function consolidateLeadingImports(content) {
    const lines = content.split('\n');
    const importsByModule = new Map();
    const moduleOrder = [];
    let i = 0;

    while (i < lines.length) {
        const trimmed = lines[i].trim();
        if (!trimmed) {
            i++;
            continue;
        }
        const match = trimmed.match(/^import\s*\{([^}]+)\}\s*from\s*['"]([^'"]+)['"];?$/);
        if (!match) break;
        const mod = match[2];
        const syms = match[1].split(',').map((s) => s.trim()).filter(Boolean);
        if (!importsByModule.has(mod)) {
            importsByModule.set(mod, []);
            moduleOrder.push(mod);
        }
        importsByModule.get(mod).push(...syms);
        i++;
    }

    if (!moduleOrder.length) return content;

    const hasDuplicateSymbols = [...importsByModule.values()].some((syms) => {
        const seen = new Set();
        for (const sym of syms) {
            const key = sym.split(/\s+as\s+/)[0].trim();
            if (seen.has(key)) return true;
            seen.add(key);
        }
        return false;
    });
    const hasDuplicateLines = moduleOrder.length !== new Set(moduleOrder).size;
    const leadingSection = lines.slice(0, i);
    const blankLinesInLeadingBlock = leadingSection.filter((line) => !line.trim()).length;
    if (!hasDuplicateSymbols && !hasDuplicateLines && blankLinesInLeadingBlock === 0) return content;

    while (i < lines.length && lines[i].trim() === '') i++;

    const mergedLines = [];
    const seenModules = new Set();
    for (const mod of moduleOrder) {
        if (seenModules.has(mod)) continue;
        seenModules.add(mod);
        const deduped = new Map();
        for (const sym of importsByModule.get(mod)) {
            const key = sym.split(/\s+as\s+/)[0].trim();
            if (!deduped.has(key)) deduped.set(key, sym);
        }
        const unique = [...deduped.values()].sort((a, b) =>
            a.split(/\s+as\s+/)[0].localeCompare(b.split(/\s+as\s+/)[0]),
        );
        mergedLines.push(`import { ${unique.join(', ')} } from '${mod}';`);
    }

    return [...mergedLines, ...lines.slice(i)].join('\n');
}

function processFile(filePath, { dryRun = false } = {}) {
    let content = fs.readFileSync(filePath, 'utf8');
    const original = content;

    const runPipeline = (input) => {
        let result = input;
        result = replaceNamespaceImports(result, filePath);
        result = fixReactHooks(result);
        result = mergeDuplicateReactImports(result);
        result = fixUtilsIndexImports(result);
        result = fixMiscMisroutes(result);
        result = replaceStaleNamespaceRefs(result);
        result = repairReactHookFormErrors(result);
        result = repairDatesNamespaceDamage(result);
        result = repairImagesNamespaceDamage(result);
        result = stripInvalidDatesImports(result);
        result = stripInvalidImagesImports(result);
        result = stripInvalidCommonFunctionImports(result);
        result = removeStaleFuncNamespaceImport(result);
        result = stripInvalidValidationMessageImports(result);
        result = fixValidationPlaceholderCollisions(result);
        result = repairCustomErrorMessageProps(result);
        result = fixDuplicateImportCollisions(result);
        result = consolidateLeadingImports(result);
        result = fixUtilsIndexImports(result);
        result = consolidateLeadingImports(result);
        result = removeUnusedReactNamespaceImport(result);
        return result;
    };

    for (let pass = 0; pass < 5; pass++) {
        const next = runPipeline(content);
        if (next === content) break;
        content = next;
    }

    if (content !== original) {
        if (!dryRun) {
            fs.writeFileSync(filePath, content, 'utf8');
        }
        return true;
    }
    return false;
}

// ─── Shared audit helpers ───────────────────────────────────────────────────

function walkSrc(dir, files = []) {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        const full = path.join(dir, entry.name);
        if (entry.isDirectory() && entry.name !== 'node_modules') walkSrc(full, files);
        else if (/\.(jsx|js)$/.test(entry.name)) files.push(full);
    }
    return files;
}

function addExportsFromFile(exported, filePath, seen = new Set()) {
    if (!filePath || seen.has(filePath) || !fs.existsSync(filePath) || !fs.statSync(filePath).isFile()) return;
    seen.add(filePath);
    const content = fs.readFileSync(filePath, 'utf8');
    for (const m of content.matchAll(/export\s+const\s+(\w+)/g)) exported.add(m[1]);
    for (const m of content.matchAll(/export\s+function\s+(\w+)/g)) exported.add(m[1]);
    for (const m of content.matchAll(/export\s+async\s+function\s+(\w+)/g)) exported.add(m[1]);
    for (const m of content.matchAll(/export\s+\{([^}]+)\}/g)) {
        for (const s of m[1].split(',')) {
            const chunk = s.trim();
            if (!chunk) continue;
            const asParts = chunk.split(/\s+as\s+/);
            exported.add((asParts[1] || asParts[0]).trim());
        }
    }
    for (const m of content.matchAll(/export\s+\*\s+from\s+['"]([^'"]+)['"]/g)) {
        const reExport = path.resolve(path.dirname(filePath), m[1]);
        const candidates = [reExport, `${reExport}.js`, `${reExport}.jsx`];
        const resolved = candidates.find((c) => fs.existsSync(c) && fs.statSync(c).isFile());
        if (resolved) addExportsFromFile(exported, resolved, seen);
    }
}

function getExportsDeep(filePath) {
    if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) return null;
    const exported = new Set();
    addExportsFromFile(exported, filePath);
    return exported;
}

function resolveRelativeImport(fromFile, importPath) {
    if (!importPath.startsWith('.')) return null;
    const base = path.resolve(path.dirname(fromFile), importPath);
    const candidates = [base, `${base}.js`, `${base}.jsx`, path.join(base, 'index.js'), path.join(base, 'index.jsx')];
    return candidates.find((c) => fs.existsSync(c) && fs.statSync(c).isFile()) || null;
}

function parseImportSymbolNames(body) {
    return body
        .replace(/\/\/[^\n]*/g, '')
        .split(',')
        .map((s) => s.trim().split(/\s+as\s+/)[0].trim())
        .filter(Boolean);
}

function writeIfChanged(filePath, content, original, { dryRun = false } = {}) {
    if (content === original) return false;
    if (!dryRun) fs.writeFileSync(filePath, content, 'utf8');
    return true;
}

const AUDIT_CONSTANT_MODULES = [
    { importPath: 'Constants/EndPoints', file: 'Constants/EndPoints/index.js' },
    { importPath: 'Constants/GlobalConstant/Glyphicons', file: 'Constants/GlobalConstant/Glyphicons/index.js' },
    { importPath: 'Constants/GlobalConstant/ValidationMessage', file: 'Constants/GlobalConstant/ValidationMessage/index.js' },
    { importPath: 'Constants/GlobalConstant/Placeholders', file: 'Constants/GlobalConstant/Placeholders/index.js' },
    { importPath: 'Constants/Charts', file: 'Constants/Charts/index.js' },
    { importPath: 'Constants/Charts/commonFunction', file: 'Constants/Charts/commonFunction.jsx' },
    { importPath: 'Constants/GlobalConstant/Regex', file: 'Constants/GlobalConstant/Regex/index.js' },
    { importPath: 'Constants/GlobalConstant/Rules', file: 'Constants/GlobalConstant/Rules/index.js' },
    { importPath: 'Constants/Utils/dates', file: 'Constants/Utils/dates.js' },
    { importPath: 'Assets/Images', file: 'Assets/Images/index.js' },
];

// ─── Audits ─────────────────────────────────────────────────────────────────

function auditMissingExports() {
    for (const mod of AUDIT_CONSTANT_MODULES) {
        const exported = getExportsDeep(path.join(SRC_ROOT, mod.file));
        const missing = new Map();
        const importRe = new RegExp(`import\\s*\\{([^}]+)\\}\\s*from\\s*['"]${mod.importPath.replace(/\//g, '\\/')}['"]`, 'g');
        for (const file of walkSrc(SRC_ROOT)) {
            const content = fs.readFileSync(file, 'utf8');
            let m;
            while ((m = importRe.exec(content))) {
                for (const sym of parseImportSymbolNames(m[1])) {
                    if (!exported?.has(sym)) {
                        if (!missing.has(sym)) missing.set(sym, []);
                        missing.get(sym).push(path.relative(SRC_ROOT, file));
                    }
                }
            }
        }
        if (missing.size) {
            console.log(`\n=== ${mod.importPath} — ${missing.size} missing ===`);
            for (const [sym, files] of [...missing.entries()].sort()) {
                console.log(`${sym} (${files.length})`);
            }
        }
    }
}

function auditAllExports() {
    const modules = [];
    for (const file of walkSrc(path.join(SRC_ROOT, 'Constants'))) {
        if (/index\.(js|jsx)$/.test(file) || file.endsWith('.jsx') || file.endsWith('.js')) {
            const rel = path.relative(SRC_ROOT, file).replace(/\\/g, '/').replace(/\.(jsx|js)$/, '');
            modules.push({ importPath: rel, file: path.relative(SRC_ROOT, file).replace(/\\/g, '/') });
        }
    }
    const allMissing = new Map();
    for (const mod of modules) {
        const fullPath = path.join(SRC_ROOT, mod.file);
        if (!fs.existsSync(fullPath)) continue;
        const exported = getExportsDeep(fullPath);
        const importRe = new RegExp(`import\\s*\\{([^}]+)\\}\\s*from\\s*['"]${mod.importPath.replace(/\//g, '\\/')}['"]`, 'g');
        for (const file of walkSrc(SRC_ROOT)) {
            const content = fs.readFileSync(file, 'utf8');
            let m;
            while ((m = importRe.exec(content))) {
                for (const sym of parseImportSymbolNames(m[1])) {
                    if (!exported?.has(sym)) {
                        const key = `${mod.importPath}::${sym}`;
                        if (!allMissing.has(key)) allMissing.set(key, []);
                        allMissing.get(key).push(path.relative(SRC_ROOT, file));
                    }
                }
            }
        }
    }
    console.log(`Total missing: ${allMissing.size}`);
    for (const [key, files] of [...allMissing.entries()].sort()) {
        console.log(`${key} (${files.length})`);
    }
}

function auditRelativeImports() {
    const missing = [];
    for (const file of walkSrc(SRC_ROOT)) {
        const content = fs.readFileSync(file, 'utf8');
        const importRe = /import\s*\{([^}]+)\}\s*from\s*['"](\.[^'"]+)['"]/g;
        let m;
        while ((m = importRe.exec(content))) {
            const target = resolveRelativeImport(file, m[2]);
            if (!target) continue;
            const exported = getExportsDeep(target);
            if (!exported) continue;
            for (const sym of parseImportSymbolNames(m[1])) {
                if (!exported.has(sym)) {
                    missing.push({
                        symbol: sym,
                        importer: path.relative(SRC_ROOT, file),
                        source: path.relative(SRC_ROOT, target),
                    });
                }
            }
        }
    }
    const grouped = new Map();
    for (const item of missing) {
        const key = `${item.source}::${item.symbol}`;
        if (!grouped.has(key)) grouped.set(key, []);
        grouped.get(key).push(item.importer);
    }
    console.log(`Total missing relative imports: ${missing.length}`);
    for (const [key, files] of [...grouped.entries()].sort()) {
        const [source, symbol] = key.split('::');
        console.log(`${symbol} from ${source} (${files.length}): ${files.slice(0, 3).join(', ')}${files.length > 3 ? '...' : ''}`);
    }
}

function auditTabConstants() {
    const tabsDir = path.join(
        SRC_ROOT,
        'Pages/AuthenticationModule/Communication/CreateCommunication/CreationSteps/Create/Tabs',
    );
    const tabDirs = fs.readdirSync(tabsDir, { withFileTypes: true }).filter((d) => d.isDirectory()).map((d) => d.name);
    const issues = [];
    for (const tab of tabDirs) {
        const tabPath = path.join(tabsDir, tab);
        const jsxFiles = fs.readdirSync(tabPath).filter((f) => f.endsWith('.jsx') && !f.startsWith('constant'));
        const constFile = ['constant.jsx', 'constant.js'].map((f) => path.join(tabPath, f)).find(fs.existsSync);
        if (!constFile) continue;
        const constSrc = fs.readFileSync(constFile, 'utf8');
        const exports = new Set();
        for (const m of constSrc.matchAll(/export\s+(?:const|function|async function|class)\s+(\w+)/g)) exports.add(m[1]);
        for (const m of constSrc.matchAll(/export\s*\{([^}]+)\}/g)) {
            m[1].split(',').forEach((s) => {
                const name = s.trim().split(/\s+as\s+/)[0].trim();
                if (name) exports.add(name);
            });
        }
        for (const jsx of jsxFiles) {
            const src = fs.readFileSync(path.join(tabPath, jsx), 'utf8');
            const re = /import\s*\{([^}]+)\}\s*from\s*['"]\.\/constant(?:\.jsx?)?['"]/g;
            let im;
            while ((im = re.exec(src)) !== null) {
                im[1].split(',').forEach((s) => {
                    const sym = s.trim().split(/\s+as\s+/)[0].trim();
                    if (sym && !exports.has(sym)) issues.push({ tab, file: jsx, sym });
                });
            }
        }
    }
    issues.forEach((i) => console.log(`${i.tab}/${i.file}: ${i.sym}`));
    console.log(`TOTAL ${issues.length}`);
}

function auditPhCollisions() {
    const PH_MODULE = 'Constants/GlobalConstant/Placeholders';
    const NAMED_IMPORT_RE = /^import\s*\{([^}]+)\}\s*from\s*['"]([^'"]+)['"];?\s*$/;
    const isConstantsModule = (mod) => /(?:^|\/)(constant|constants)(?:\.jsx?)?$/.test(mod) || /^\.{1,2}\//.test(mod);
    const issues = [];
    for (const file of walkSrc(SRC_ROOT)) {
        const lines = fs.readFileSync(file, 'utf8').split('\n');
        const byLocal = new Map();
        for (const line of lines) {
            const m = line.match(NAMED_IMPORT_RE);
            if (!m) continue;
            for (const s of m[1].split(',').map((part) => {
                const parts = part.trim().split(/\s+as\s+/);
                return { imported: parts[0].trim(), local: (parts[1] || parts[0]).trim() };
            }).filter((s) => s.imported)) {
                if (!byLocal.has(s.local)) byLocal.set(s.local, []);
                byLocal.get(s.local).push({ ...s, module: m[2], line });
            }
        }
        for (const [sym, sources] of byLocal) {
            const modules = [...new Set(sources.map((s) => s.module))];
            if (modules.length < 2) continue;
            const hasPh = modules.some((m) => m === PH_MODULE || m.endsWith('/Placeholders'));
            const hasConst = modules.some(isConstantsModule);
            if (hasPh && hasConst) {
                issues.push({ file: path.relative(SRC_ROOT, file), sym, modules });
            }
        }
    }
    issues.forEach((i) => console.log(`${i.file}: ${i.sym} from [${i.modules.join(', ')}]`));
    console.log(`TOTAL ${issues.length}`);
}

// ─── Repairs ───────────────────────────────────────────────────────────────

function repairBuildExports({ dryRun = false } = {}) {
    const MISSING_GLYPH_ALIASES = {
        chevron_left: 'icon-rs-arrow-left-medium',
        chevron_right: 'icon-rs-arrow-right-medium',
        circle_exclamation_mini: 'icon-rs-circle-exclamation-mini',
        close_circle_mini: 'icon-rs-circle-close-mini',
        close_circle_fill_mini: 'icon-rs-circle-close-fill-mini',
        document_medium: 'icon-rs-text-document-medium',
        info_mini: 'icon-rs-circle-info-mini',
        loading_mini: 'icon-rs-loading-mini',
        location_mini: 'icon-rs-geo-location-mini',
        map_marker_mini: 'icon-rs-map-marker-mini',
        save: 'icon-rs-save-medium',
        tick_circle_medium: 'icon-rs-circle-tick-medium',
        tick_small: 'icon-rs-tick-medium',
        trash_medium: 'icon-rs-delete-medium',
        upload_mini: 'icon-rs-builder-upload-mini',
        user_identified_mini: 'icon-rs-user-identified-mini',
        users_persona_large: 'icon-rs-users-persona-large',
        video_share_xlarge: 'icon-rs-video-share-large',
        web_analytics_xlarge: 'icon-rs-web-analytics-large',
        webinar_xlarge: 'icon-rs-webinar-large',
    };
    const MISSING_ENDPOINTS = {
        GET_ACTIVE_DST_TIMEZONES: 'AccountSetup/GetActiveDSTTimezones',
        DELETE_RCS_SETTINGS: 'CommunicationSetting/DeleteRcsSettings',
    };
    const BOGUS_GLYPH = new Set(['map', 'properties', 'value', 'draggedFromBlock', '// circle_question_mark_medium']);

    function appendExports(filePath, entries) {
        let content = fs.readFileSync(filePath, 'utf8');
        const existing = getModuleExports(filePath);
        const lines = [];
        for (const [name, value] of Object.entries(entries)) {
            if (!existing?.has(name)) lines.push(`export const ${name} = '${value}';`);
        }
        if (!lines.length) return 0;
        const next = `${content.trimEnd()}\n\n// Aliases restored after namespace-import codemod\n${lines.join('\n')}\n`;
        if (!dryRun) fs.writeFileSync(filePath, next, 'utf8');
        return lines.length;
    }

    const glyphAdded = appendExports(path.join(SRC_ROOT, 'Constants/GlobalConstant/Glyphicons/index.js'), MISSING_GLYPH_ALIASES);
    const epAdded = appendExports(path.join(SRC_ROOT, 'Constants/EndPoints/index.js'), MISSING_ENDPOINTS);
    console.log(`Glyphicons: added ${glyphAdded} exports`);
    console.log(`EndPoints: added ${epAdded} exports`);

    let fixed = 0;
    for (const file of walkSrc(SRC_ROOT)) {
        let content = fs.readFileSync(file, 'utf8');
        const match = content.match(/import \{([^}]+)\} from 'Constants\/GlobalConstant\/Glyphicons';/);
        if (!match) continue;
        const parts = match[1].split(',').map((s) => s.trim()).filter(Boolean);
        const bogus = parts.filter((p) => BOGUS_GLYPH.has(p.split(/\s+as\s+/)[0].trim()));
        if (!bogus.length) continue;
        const kept = parts.filter((p) => !bogus.includes(p));
        const bogusNames = bogus.map((p) => p.split(/\s+as\s+/)[0].trim());
        let next = content;
        if (kept.length) {
            next = next.replace(match[0], `import { ${kept.join(', ')} } from 'Constants/GlobalConstant/Glyphicons';`);
        } else {
            next = next.replace(`${match[0]}\n`, '');
        }
        for (const name of bogusNames) {
            next = next.replace(new RegExp(`\\$\\{${name}\\}`, 'g'), `'icon-rs-${name.replace(/_/g, '-')}'`);
        }
        if (writeIfChanged(file, next, content, { dryRun })) {
            fixed++;
            console.log('fixed bogus glyph import:', path.relative(SRC_ROOT, file), bogusNames);
        }
    }

    const uiToastPath = path.join(SRC_ROOT, 'Utils/modules/uiToast.jsx');
    if (fs.existsSync(uiToastPath)) {
        let uiToast = fs.readFileSync(uiToastPath, 'utf8');
        const original = uiToast;
        if (uiToast.includes("import * as icons from 'Constants/GlobalConstant/Glyphicons'")) {
            uiToast = uiToast.replace(
                "import * as icons from 'Constants/GlobalConstant/Glyphicons';",
                "import { circle_close_fill_mini, circle_close_mini } from 'Constants/GlobalConstant/Glyphicons';",
            );
            uiToast = uiToast.replace(/icons\.close_circle_mini/g, 'circle_close_mini');
            uiToast = uiToast.replace(/icons\.close_circle_fill_mini/g, 'circle_close_fill_mini');
        }
        if (writeIfChanged(uiToastPath, uiToast, original, { dryRun })) {
            console.log('fixed uiToast.jsx');
        }
    }
    console.log(`Done (${fixed} bogus glyph file(s))`);
}

function repairCustomErrorMessage({ dryRun = false } = {}) {
    let fixed = 0;
    for (const file of walkSrc(SRC_ROOT)) {
        const content = fs.readFileSync(file, 'utf8');
        const next = content.replace(/customErrorMessage=\{([A-Z][A-Z0-9_]*_MSG)\s*\n/g, 'customErrorMessage={$1}\n');
        if (writeIfChanged(file, next, content, { dryRun })) {
            fixed++;
            console.log('fixed:', path.relative(SRC_ROOT, file));
        }
    }
    console.log(`TOTAL ${fixed}`);
}

function repairPlaceholderArray({ dryRun = false } = {}) {
    const PH_MODULE = 'Constants/GlobalConstant/Placeholders';
    const BOGUS_PH_SYMBOLS = new Set(['length', 'filter', 'map', 'forEach', 'push', 'slice', 'find', 'reduce', 'sort']);
    const stripBogusFromImportLine = (line) => {
        const m = line.match(/^import\s*\{([^}]+)\}\s*from\s*['"]([^'"]+)['"];?\s*$/);
        if (!m || (m[2] !== PH_MODULE && !m[2].endsWith('/Placeholders'))) return line;
        const kept = m[1].split(',').map((s) => s.trim()).filter((s) => {
            const sym = s.split(/\s+as\s+/)[0].trim();
            return sym && !BOGUS_PH_SYMBOLS.has(sym);
        });
        if (!kept.length) return '';
        return `import { ${kept.join(', ')} } from '${m[2]}';`;
    };
    let fixed = 0;
    for (const file of walkSrc(SRC_ROOT)) {
        let content = fs.readFileSync(file, 'utf8');
        const original = content;
        content = content.split('\n').map(stripBogusFromImportLine).filter((line, i, arr) => line !== '' || arr[i - 1] !== '').join('\n');
        content = content.replace(/\bconst resolvedPlaceholder = length > 0 \? placeholder/g, 'const resolvedPlaceholder = placeholder?.length > 0 ? placeholder');
        content = content.replace(/\bresolvedPlaceholder = length > 0 \? placeholder/g, 'resolvedPlaceholder = placeholder?.length > 0 ? placeholder');
        if (writeIfChanged(file, content, original, { dryRun })) {
            fixed++;
            console.log('fixed:', path.relative(SRC_ROOT, file));
        }
    }
    console.log(`TOTAL ${fixed}`);
}

function repairRequestHttp({ dryRun = false } = {}) {
    const reducersRoot = path.join(SRC_ROOT, 'Reducers');
    let fixed = 0;
    for (const file of walkDir(reducersRoot).filter((f) => path.basename(f) === 'request.js')) {
        let content = fs.readFileSync(file, 'utf8');
        if (!/import\s+request\b/.test(content) || !content.includes("'Utils/Http'")) continue;
        const original = content;
        content = content.replace(/(?<!\.)\bpost\(\{/g, 'request.post({');
        content = content.replace(/(?<!\.)\bget\(\{/g, 'request.get({');
        content = content.replace(/(?<!\.)\bput\(\{/g, 'request.put({');
        content = content.replace(/(?<!\.)\bdelete\(\{/g, 'request.delete({');
        if (writeIfChanged(file, content, original, { dryRun })) {
            fixed++;
            console.log('fixed:', path.relative(reducersRoot, file));
        }
    }
    console.log(`TOTAL ${fixed}`);
}

function repairVmPhCollisions({ dryRun = false } = {}) {
    const VM_MODULE = 'Constants/GlobalConstant/ValidationMessage';
    const PH_MODULE = 'Constants/GlobalConstant/Placeholders';
    const NAMED_IMPORT_RE = /^import\s*\{([^}]+)\}\s*from\s*['"]([^'"]+)['"];?\s*$/;
    const parseSymbols = (body) =>
        body.split(',').map((s) => {
            const parts = s.trim().split(/\s+as\s+/);
            return { imported: parts[0].trim(), local: (parts[1] || parts[0]).trim(), raw: s.trim() };
        }).filter((s) => s.imported);
    const formatSym = (s) => (s.local === s.imported ? s.imported : `${s.imported} as ${s.local}`);
    const isVm = (mod) => mod === VM_MODULE || mod.endsWith('/ValidationMessage');
    const isPh = (mod) => mod === PH_MODULE || mod.endsWith('/Placeholders');
    const rewriteVmUsages = (content, sym, alias) => {
        const patterns = [
            new RegExp(`(required:\\s*)${sym}\\b`, 'g'),
            new RegExp(`(message:\\s*)${sym}\\b`, 'g'),
            new RegExp(`(customErrorMessage=\\{)${sym}\\}`, 'g'),
            new RegExp(`(LIST_NAME_RULES\\()${sym}\\b`, 'g'),
            new RegExp(`(rules=\\{LIST_NAME_RULES\\()${sym}\\b`, 'g'),
            new RegExp(`(validate:\\s*)${sym}\\b`, 'g'),
            new RegExp(`(content:\\s*)${sym}\\b`, 'g'),
        ];
        let result = content;
        for (const re of patterns) result = result.replace(re, `$1${alias}`);
        return result;
    };
    const rewritePhUsages = (content, sym, alias) => {
        const patterns = [
            [new RegExp(`(label=\\{)${sym}(\\})`, 'g'), `$1${alias}$2`],
            [new RegExp(`(header=\\{)${sym}(\\})`, 'g'), `$1${alias}$2`],
            [new RegExp(`(title=\\{)${sym}(\\})`, 'g'), `$1${alias}$2`],
            [new RegExp(`(placeholder=\\{)${sym}(\\})`, 'g'), `$1${alias}$2`],
            [new RegExp(`(<label[^>]*>\\s*)\\{${sym}\\}(\\s*</label>)`, 'g'), `$1{${alias}}$2`],
        ];
        let result = content;
        for (const [re, repl] of patterns) result = result.replace(re, repl);
        return result;
    };
    let fixed = 0;
    for (const file of walkSrc(SRC_ROOT)) {
        const original = fs.readFileSync(file, 'utf8');
        let content = original;
        const lines = content.split('\n');
        const imports = [];
        for (let i = 0; i < lines.length; i++) {
            const m = lines[i].match(NAMED_IMPORT_RE);
            if (m) imports.push({ lineIdx: i, body: m[1], module: m[2], full: m[0] });
        }
        const byLocal = new Map();
        for (const imp of imports) {
            for (const s of parseSymbols(imp.body)) {
                if (!byLocal.has(s.local)) byLocal.set(s.local, []);
                byLocal.get(s.local).push({ ...s, module: imp.module, lineIdx: imp.lineIdx });
            }
        }
        let changed = false;
        for (const [sym, sources] of byLocal) {
            const modules = [...new Set(sources.map((s) => s.module))];
            if (modules.length < 2) continue;
            const vmSources = sources.filter((s) => isVm(s.module));
            const phSources = sources.filter((s) => isPh(s.module));
            if (!vmSources.length || !phSources.length) continue;
            for (const imp of imports) {
                if (!isVm(imp.module)) continue;
                const syms = parseSymbols(imp.body);
                const newParts = syms.map((s) => (s.imported === sym && s.local === sym ? `${s.imported} as ${sym}_MSG` : formatSym(s)));
                const newLine = `import { ${newParts.join(', ')} } from '${imp.module}';`;
                if (lines[imp.lineIdx] !== newLine) {
                    lines[imp.lineIdx] = newLine;
                    changed = true;
                }
            }
            for (const imp of imports) {
                if (!isPh(imp.module)) continue;
                const syms = parseSymbols(imp.body);
                const newParts = syms.map((s) => (s.imported === sym && s.local === sym ? `${s.imported} as ${sym}_PH` : formatSym(s)));
                const newLine = `import { ${newParts.join(', ')} } from '${imp.module}';`;
                if (lines[imp.lineIdx] !== newLine) {
                    lines[imp.lineIdx] = newLine;
                    changed = true;
                }
            }
            content = lines.join('\n');
            content = rewriteVmUsages(content, sym, `${sym}_MSG`);
            content = rewritePhUsages(content, sym, `${sym}_PH`);
            changed = true;
        }
        if (changed && writeIfChanged(file, content, original, { dryRun })) {
            fixed++;
            console.log('fixed:', path.relative(SRC_ROOT, file));
        }
    }
    console.log(`TOTAL ${fixed}`);
}

function repairFalseNamedImports({ dryRun = false } = {}) {
    const CONSTANTS_MODULES = [
        'Constants/Charts/commonFunction',
        'Constants/Charts',
        'Constants/GlobalConstant/Rules',
        'Constants/GlobalConstant/Placeholders',
        'Constants/GlobalConstant/Glyphicons',
        'Constants/GlobalConstant/ValidationMessage',
        'Constants/EndPoints',
        'Assets/Images',
    ];
    const parseSymbols = (body) =>
        body.replace(/\/\/[^\n]*/g, '').split(',').map((s) => {
            const parts = s.trim().split(/\s+as\s+/);
            return { imported: parts[0].trim(), local: (parts[1] || parts[0]).trim(), raw: s.trim() };
        }).filter((s) => s.imported);
    const formatSym = (s) => (s.local === s.imported ? s.imported : `${s.imported} as ${s.local}`);
    const isUsedInCode = (content, localName) => new RegExp(`\\b${localName}\\b`).test(stripComments(content));
    const importRe = /^import\s*\{([^}]+)\}\s*from\s*['"]([^'"]+)['"];?\s*$/gm;
    let fixedFiles = 0;
    const stillBroken = [];
    for (const file of walkSrc(SRC_ROOT)) {
        let content = fs.readFileSync(file, 'utf8');
        let changed = false;
        content = content.replace(importRe, (full, body, modPath) => {
            const isRelative = modPath.startsWith('.');
            const isConstants = CONSTANTS_MODULES.some((m) => modPath === m);
            if (!isRelative && !isConstants) return full;
            const target = modPath.startsWith('.') ? resolveRelativeImport(file, modPath) : resolveSrcModule(modPath);
            if (!target) return full;
            const exported = getExportsDeep(target);
            if (!exported) return full;
            const symbols = parseSymbols(body);
            const kept = [];
            const removed = [];
            for (const sym of symbols) {
                if (FUNC_FALSE_POSITIVE_SYMBOLS.has(sym.imported) && modPath === 'Constants/Charts/commonFunction') {
                    removed.push(sym.imported);
                    continue;
                }
                if (exported.has(sym.imported)) {
                    kept.push(sym);
                    continue;
                }
                if (isUsedInCode(content, sym.local)) {
                    kept.push(sym);
                    stillBroken.push({ file: path.relative(SRC_ROOT, file), symbol: sym.imported, source: path.relative(SRC_ROOT, target) });
                    continue;
                }
                removed.push(sym.imported);
            }
            if (!removed.length) return full;
            changed = true;
            if (!kept.length) return '';
            return `import { ${kept.map(formatSym).join(', ')} } from '${modPath}';\n`;
        });
        if (changed) {
            fixedFiles += 1;
            if (!dryRun) fs.writeFileSync(file, content, 'utf8');
            console.log(`fixed: ${path.relative(SRC_ROOT, file)}`);
        }
    }
    console.log(`\n${dryRun ? 'Would fix' : 'Fixed'} ${fixedFiles} file(s)`);
    if (stillBroken.length) {
        console.log(`\nStill broken (used but not exported): ${stillBroken.length}`);
        for (const item of stillBroken.slice(0, 30)) {
            console.log(`  ${item.symbol} in ${item.file} from ${item.source}`);
        }
    }
}

function repairChartsNamespace({ dryRun = false } = {}) {
    const CHARTS_MODULE = 'Constants/Charts';
    const COMMON_FUNCTION_MODULE = 'Constants/Charts/commonFunction';
    const CHARTS_FALSE_POSITIVE_SYMBOLS = new Set(['series', 'categories', 'reflow', 'plotWidth', 'plotHeight', 'plotLeft', 'plotTop', 'renderTo', 'chartWidth', 'forEach', 'map', 'mt30']);
    const RULES_FALSE_POSITIVE_SYMBOLS = new Set(['allow_negative', 'alphanumeric', 'currency_format', 'email_validation', 'end_date', 'fixed_length', 'is_special_characters', 'length_type', 'max_length', 'min_length', 'mobile_number_validation', 'pattern', 'rules', 'special_characters', 'start_date']);
    const PLACEHOLDERS_FALSE_POSITIVE_SYMBOLS = new Set(['com', 'replace']);
    const stripFalsePositiveImports = (content, modulePath, falsePositives) => {
        const escaped = modulePath.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const re = new RegExp(`import\\s*\\{([^}]+)\\}\\s*from\\s*['"]${escaped}['"];?`, 'g');
        return content.replace(re, (full, body) => {
            const parts = body.split(',').map((s) => s.trim()).filter(Boolean);
            const kept = parts.filter((p) => !falsePositives.has(p.split(/\s+as\s+/)[0].trim()));
            if (kept.length === parts.length) return full;
            if (!kept.length) return '';
            return `import { ${kept.join(', ')} } from '${modulePath}';`;
        });
    };
    let fixed = 0;
    for (const file of walkSrc(SRC_ROOT)) {
        let content = fs.readFileSync(file, 'utf8');
        const original = content;
        content = stripFalsePositiveImports(content, COMMON_FUNCTION_MODULE, FUNC_FALSE_POSITIVE_SYMBOLS);
        content = stripFalsePositiveImports(content, CHARTS_MODULE, CHARTS_FALSE_POSITIVE_SYMBOLS);
        content = stripFalsePositiveImports(content, 'Constants/GlobalConstant/Rules', RULES_FALSE_POSITIVE_SYMBOLS);
        content = stripFalsePositiveImports(content, 'Constants/GlobalConstant/Placeholders', PLACEHOLDERS_FALSE_POSITIVE_SYMBOLS);
        content = content.replace(/const series = series \|\| \[\];/g, 'const chartSeries = chart?.series || [];');
        content = content.replace(/series: _map\(series,/g, 'series: _map(chartSeries,');
        content = content.replace(/categories: categories,/g, 'categories: chart?.categories,');
        content = content.replace(/const series = ([a-zA-Z_$][\w$]*)\?\.series \|\| \[\];/g, 'const chartSeries = $1?.series || [];');
        content = content.replace(/typeof reflow !== 'function'/g, "typeof chart.reflow !== 'function'");
        content = content.replace(/try \{\s*reflow\(\);\s*\} catch/g, 'try {\n            chart.reflow();\n        } catch');
        content = content.replace(/try \{\s*reflow\?\.\(\);\s*\} catch/g, 'try {\n                chart?.reflow?.();\n            } catch');
        content = content.replace(/chartRef\.current\?\.reflow\?\.\(\)/g, 'chartRef.current?.chart?.reflow?.()');
        content = content.replace(/import \{([^}]*)\} from 'Constants\/Charts\/commonFunction';/g, (full, body) => {
            const parts = body.split(',').map((s) => s.trim()).filter(Boolean);
            const kept = parts.filter((p) => !FUNC_FALSE_POSITIVE_SYMBOLS.has(p.split(/\s+as\s+/)[0].trim()));
            if (kept.length === parts.length) return full;
            if (!kept.length) return '';
            return `import { ${kept.join(', ')} } from '${COMMON_FUNCTION_MODULE}';`;
        });
        content = content.replace(/import \* as func from ['"]\.\/commonFunction['"];?\s*\n/g, (match, offset, str) => {
            const active = str.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/[^\n]*/g, '');
            return /\bfunc\./.test(active) ? match : '';
        });
        if (writeIfChanged(file, content, original, { dryRun })) {
            fixed++;
            console.log('fixed:', path.relative(SRC_ROOT, file));
        }
    }
    console.log(`TOTAL ${fixed}`);
}

function repairReactHookFormErrorsFiles({ dryRun = false } = {}) {
    let fixed = 0;
    for (const file of walkSrc(SRC_ROOT)) {
        const content = fs.readFileSync(file, 'utf8');
        const next = repairReactHookFormErrors(content);
        if (writeIfChanged(file, next, content, { dryRun })) {
            fixed++;
            console.log('fixed:', path.relative(SRC_ROOT, file));
        }
    }
    console.log(`TOTAL ${fixed}`);
}

const AUDIT_HANDLERS = {
    'missing-exports': auditMissingExports,
    'all-exports': auditAllExports,
    'relative-imports': auditRelativeImports,
    'tab-constants': auditTabConstants,
    'ph-collisions': auditPhCollisions,
};

const REPAIR_HANDLERS = {
    'build-exports': repairBuildExports,
    'custom-error-message': repairCustomErrorMessage,
    'placeholder-array': repairPlaceholderArray,
    'request-http': repairRequestHttp,
    'vm-ph-collisions': repairVmPhCollisions,
    'false-named-imports': repairFalseNamedImports,
    'charts-namespace': repairChartsNamespace,
    'react-hook-form-errors': repairReactHookFormErrorsFiles,
};

const cliArgs = process.argv.slice(2);
const isDryRun = cliArgs.includes('--dry-run');
const auditIdx = cliArgs.indexOf('--audit');
const repairIdx = cliArgs.indexOf('--repair');

if (auditIdx !== -1) {
    const auditName = cliArgs[auditIdx + 1];
    const handler = AUDIT_HANDLERS[auditName];
    if (!handler) {
        console.error(`Unknown --audit "${auditName}". Use: ${Object.keys(AUDIT_HANDLERS).join(' | ')}`);
        process.exit(1);
    }
    handler();
    process.exit(0);
}

if (repairIdx !== -1) {
    const repairName = cliArgs[repairIdx + 1];
    const handler = REPAIR_HANDLERS[repairName];
    if (!handler) {
        console.error(`Unknown --repair "${repairName}". Use: ${Object.keys(REPAIR_HANDLERS).join(' | ')}`);
        process.exit(1);
    }
    handler({ dryRun: isDryRun });
    process.exit(0);
}

const targetArg = (cliArgs.find((a) => !a.startsWith('--')) || 'audience').toLowerCase();
const targets =
    targetArg === 'all'
        ? Object.entries(MODULE_ROOTS)
        : targetArg === 'analyticsall'
          ? ANALYTICS_TARGETS.map((key) => [key, MODULE_ROOTS[key]])
          : MODULE_ROOTS[targetArg]
            ? [[targetArg, MODULE_ROOTS[targetArg]]]
            : null;

if (!targets) {
    console.error(`Unknown target "${targetArg}". Use: audience | communication | analytics | analyticsTwins | analyticsAll | preferences | components | reducers | dashboard | dashboardtwins | constants | registration | documentation | utils | commoncomponents | all`);
    process.exit(1);
}

let totalChanged = 0;
let totalFiles = 0;

for (const [name, root] of targets) {
    if (!fs.existsSync(root)) {
        console.error(`Module root not found: ${root}`);
        process.exit(1);
    }
    const files = walkDir(root);
    let changed = 0;
    console.log(`\n--- ${name} (${files.length} files) ---`);
    for (const f of files) {
        if (processFile(f, { dryRun: isDryRun })) {
            changed++;
            console.log(`${isDryRun ? 'would update' : 'updated'}:`, path.relative(root, f));
        }
    }
    console.log(`${name}: ${changed}/${files.length} files ${isDryRun ? 'would be ' : ''}updated.`);
    totalChanged += changed;
    totalFiles += files.length;
}

console.log(`\nDone${isDryRun ? ' (dry-run)' : ''}. ${totalChanged}/${totalFiles} files ${isDryRun ? 'would be ' : ''}updated across ${targets.length} module(s).`);
