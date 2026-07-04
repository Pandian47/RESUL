import { safeParseJSON } from 'Utils/modules/stringUtils';
export const EMPTY_AUDIENCE_LIST = [];
export const EMPTY_AUDIENCE_GRID = { data: [], total: 0 };
export const EMPTY_RULE_JSON = { Expressions: [], RuleGroups: [] };

/** Parse JSON object fields from audience APIs; never throws. */
export function parseAudienceJson(value, fallback = {}) {
    if (value == null || value === '') return fallback;
    if (typeof value === 'object' && !Array.isArray(value)) return value;
    const parsed = safeParseJSON(value, fallback);
    return parsed != null ? parsed : fallback;
}

/** True when left-panel payload has at least one category to render. */
export function hasTargetListLeftPanelData(parsed) {
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return false;
    const categories = parsed.brand_category ?? parsed.category;
    return Array.isArray(categories) && categories.length > 0;
}

/** True when edit-target-list API payload contains a list record. */
export function hasTargetListEditData(data) {
    const item = data?.targetlist?.[0];
    return Boolean(item && typeof item === 'object' && Object.keys(item).length);
}

export function resolveSegmentListName(editListData = {}, navigationState = null) {
    const editRecord = editListData && typeof editListData === 'object' ? editListData : {};
    const isMdcSubSegment = Boolean(navigationState?.isMDCSubSegment);

    if (isMdcSubSegment) {
        return (
            editRecord?.SubSegmentName ??
            navigationState?.listName ??
            editRecord?.recipientsBunchName ??
            ''
        );
    }

    return (
        editRecord?.recipientsBunchName ??
        editRecord?.SubSegmentName ??
        navigationState?.listName ??
        ''
    );
}

/** Parse JSON array fields (dropdowns, attributes, groups); never throws. */
export function parseAudienceJsonArray(value, fallback = []) {
    if (value == null || value === '') return fallback;
    if (Array.isArray(value)) return value;
    const parsed = safeParseJSON(value, fallback);
    return Array.isArray(parsed) ? parsed : fallback;
}
export function mergeFilterBindSegments(filterFrontEndBind, indices = [1, 2, 3]) {
    try {
        const parsed = JSON.parse(filterFrontEndBind || '""');
        const segments = parsed?.split('||') || [];

        return indices.flatMap((segment) => {
            try {
                return JSON.parse(segments[segment] || '[]').map((item) => ({
                    ...item,
                    segment,
                }));
            } catch {
                return [];
            }
        });
    } catch {
        return [];
    }
}
export function parseLegacyJson(value, fallback = {}) {
    if (!value) return fallback;

    try {
        const normalized = value
            .toString()
            .replace(/True/g, 'true')
            .replace(/False/g, 'false');

        return JSON.parse(normalized);
    } catch (error) {
        console.error('Failed to parse JSON:', error);
        return fallback;
    }
}
/**
 * Dynamic list / segmentation ruleJSON (often single-quoted Python-style strings).
 */
export function parseRuleJSON(ruleJSON, fallback = null) {
    if (ruleJSON == null || ruleJSON === '') return fallback;
    if (typeof ruleJSON === 'object') return ruleJSON;
    const normalized = String(ruleJSON)
        .replaceAll(`'`, `"`)
        .replaceAll('True', 'True')
        .replaceAll('False', 'False');
    return safeParseJSON(normalized, fallback);
}

/** Decrypt + parse URL/query payloads (Data Exchange social flows). */
export function parseDecryptedAudienceQuery(encryptedValue, decryptFn, fallback = {}) {
    if (encryptedValue == null || encryptedValue === '') return fallback;
    try {
        const decrypted = decryptFn(decodeURIComponent(encryptedValue));
        return parseAudienceJson(decrypted, fallback);
    } catch {
        return fallback;
    }
}

/**
 * RDS filterFrontEndBind: outer JSON string split by `||`, segments are JSON arrays.
 */
export function parseFilterBindSegment(filterFrontEndBind, segmentIndex = 1) {

    const first = parseAudienceJson(filterFrontEndBind, '');
    const str = typeof first === 'string' ? first : String(filterFrontEndBind ?? '');
    const segment = str.split('||')[segmentIndex] ?? '[]';
    return parseAudienceJsonArray(segment, []);
}



export function getFilterBindOuterString(filterFrontEndBind) {
    try {
        const parsed = JSON.parse(filterFrontEndBind || '""');
        return typeof parsed === 'string' ? parsed : '';
    } catch {
        return '';
    }
}

export function getFilterBindCount(filterFrontEndBind, fallback = 0) {
    const str = getFilterBindOuterString(filterFrontEndBind);

    if (!str) return fallback;

    const count = Number.parseInt(str.split('||')[0], 10);

    return Number.isFinite(count) ? count : fallback;
}

export function hasFilterBindSegments(filterFrontEndBind) {
    return getFilterBindOuterString(filterFrontEndBind).split('||').length > 0;
}

/** Coerce API value to array; never throws. */
export function ensureArray(value, fallback = []) {
    return Array.isArray(value) ? value : fallback;
}

/** Coerce API value to plain object; never throws. */
export function ensureObject(value, fallback = {}) {
    return value && typeof value === 'object' && !Array.isArray(value) ? value : fallback;
}

/** MDM counts / chart metrics: null, NaN, and negatives become fallback. */
export function sanitizeMdmMetric(value, fallback = 0) {
    const n = Number(value);
    if (!Number.isFinite(n) || n < 0) return fallback;
    return n;
}

/** Grid / sample-record cell values from audience list APIs. */
export function sanitizeMdmCellValue(value) {
    if (value === null || value === undefined || value === '' || value === 'nan' || value === 'NaN' || value === 'null') {
        return '';
    }
    if (typeof value === 'number' && (Number.isNaN(value) || value < 0)) return '';
    if (typeof value === 'string' && !Number.isNaN(Number(value)) && Number(value) < 0) return '';
    return value;
}

/** Safe chart y-value from colon-delimited bind-audience strings. */
export function sanitizeMdmChartValue(value) {
    const n = Number(value);
    if (!Number.isFinite(n) || n < 0) return 0;
    return n;
}

/** Normalize audience grid API payload so list attributes are always arrays. */
export function normalizeMdmAudienceGrid(raw) {
    const grid = ensureObject(raw);
    return {
        ...grid,
        availableattributes: ensureArray(grid.availableattributes),
        selectedattributes: ensureArray(grid.selectedattributes),
    };
}

/** Safe localeCompare for MDM attribute / chart labels. */
export function compareMdmStrings(a, b) {
    return String(a ?? '').localeCompare(String(b ?? ''));
}

const LEFT_ALIGNED_FIELD_KEYWORDS = [
    'mobile',
    'age',
    'year',
    'email',
    'phone',
    'pin',
    'zip',
    'postal',
    'name',
    'city',
];

/** Attribute/config columns stay left-aligned even when cell values are numeric. */
export function isConfigurationAttributeColumn(fieldName) {
    if (!fieldName) return false;
    const normalized = String(fieldName).toLowerCase();
    return LEFT_ALIGNED_FIELD_KEYWORDS.some((keyword) => normalized.includes(keyword));
}

export function isNumericGridValue(value) {
    if (value == null || value === '') return false;
    if (typeof value === 'number') return Number.isFinite(value);
    if (typeof value !== 'string' || value.includes('_invalid')) return false;
    return /^-?\d+(\.\d+)?$/.test(value.trim());
}

const isInvalidMdmCountValue = (value) => String(value ?? '').toLowerCase().includes('null');

/** MDM popup lists: drop null-like object values before sort/render. */
export function filterValidMdmCountEntries(data) {
    return Object.entries(ensureObject(data)).filter(([, value]) => !isInvalidMdmCountValue(value));
}

export function sortMdmCountRowsByCountDesc(rows) {
    return [...rows].sort((rowA, rowB) => sanitizeMdmMetric(rowB.count) - sanitizeMdmMetric(rowA.count));
}

/** Object map `{ label: count }` → rows sorted high count first. */
export function buildMdmCountRowsFromObject(data, totalRecipients = 0) {
    const rows = filterValidMdmCountEntries(data).map(([label, value]) => {
        const count = sanitizeMdmMetric(value);
        const percentage = totalRecipients ? (count / totalRecipients) * 100 : 0;
        return { label, count, percentage };
    });
    return sortMdmCountRowsByCountDesc(rows);
}

/** Array `{ name, value, percentage }` → rows sorted high count first. */
export function buildMdmCountRowsFromItems(items) {
    const rows = ensureArray(items)
        .map((item) => ({
            label: item?.name ?? '',
            count: sanitizeMdmMetric(item?.value),
            percentage: sanitizeMdmMetric(item?.percentage),
        }))
        .filter((row) => row.label);
    return sortMdmCountRowsByCountDesc(rows);
}

export { lockBodyScroll, unlockBodyScroll } from 'Hooks/useBodyPointerLock';
