import { COMMUNICATION_NAME, MIN_LENGTH } from 'Constants/GlobalConstant/Regex';
import { QUIET_HOURS_BRAND_SHORTER_THAN_REGULATORY, QUIET_HOURS_CANNOT_SHORTEN_REGULATORY, QUIET_HOURS_WINDOW_END_NOT_BEFORE_START, QUIET_HOURS_WINDOW_TIMES_MUST_DIFFER } from 'Constants/GlobalConstant/Placeholders';
import { getChannelId } from 'Utils/modules/communicationChannels';
import { SPECIAL_CHATACTERS_NOT_ALlOWED, MINLENGTH } from 'Constants/GlobalConstant/ValidationMessage';
export const RULE_TYPES = {
    REGULATORY: 'Regulatory',
    BRAND: 'Brand',
};

export const QUIET_HOURS_CHANNEL_KEYS = {
    EMAIL: 'email',
    SMS: 'sms',
    WHATSAPP: 'whatsapp',
    RCS: 'rcs',
    WEB: 'web',
    MOBILE: 'mobile',
};

export const resolveQuietHoursChannelId = (
    channelId,
    channelKey = QUIET_HOURS_CHANNEL_KEYS.EMAIL,
) => {
    const normalizedId = Number(channelId);
    if (!Number.isNaN(normalizedId) && normalizedId > 0) {
        return normalizedId;
    }

    const lookupId = Number(getChannelId(channelKey || QUIET_HOURS_CHANNEL_KEYS.EMAIL)?.id);
    return !Number.isNaN(lookupId) && lookupId > 0 ? lookupId : null;
};

export const resolveQuietHoursChannel = (channelKey = QUIET_HOURS_CHANNEL_KEYS.EMAIL) => {
    const key = channelKey || QUIET_HOURS_CHANNEL_KEYS.EMAIL;
    const channel = getChannelId(key);
    return {
        channelKey: key,
        channelId: resolveQuietHoursChannelId(channel?.id, key),
        channelLabel: channel?.label || channel?.name || 'Email',
        embedded: key !== QUIET_HOURS_CHANNEL_KEYS.EMAIL,
    };
};

export const getChannelOptionForKey = (channelKey = QUIET_HOURS_CHANNEL_KEYS.EMAIL) => {
    const channel = getChannelId(channelKey);
    return {
        channelId: channel?.id,
        channelName: channel?.label || channel?.name || '',
    };
};

export const API_RULE_TYPES = {
    REGULATORY: 'REGULATORY',
    BRAND: 'BRAND',
};

export const QUIET_HOURS_API_KEYS = {
    LIST: 'CommunicationSetting/GetQuietHoursSettings',
    BY_ID: 'CommunicationSetting/GetQuietHoursSettingsId',
    LOOKUPS: 'CommunicationSetting/GetQuietHoursLookups',
    UPSERT: 'CommunicationSetting/UpsertQuietHoursSettings',
    STATUS: 'CommunicationSetting/UpdateQuietHoursStatus',
    DELETE: 'CommunicationSetting/DeleteQuietHoursSettings',
    DUPLICATE: 'CommunicationSetting/DuplicateQuietHoursSettings',
};

export const QUIET_HOURS_ADMIN_ROLE_IDS = [4, 7];

/** BRD admin (roleId 4 / 7): brand CRUD and grid actions. */
export const isQuietHoursAdminRole = (roleId) =>
    QUIET_HOURS_ADMIN_ROLE_IDS.includes(Number(roleId));

const pickApiField = (row, camelKey, pascalKey) => {
    if (row == null || typeof row !== 'object') return undefined;
    const camel = row[camelKey];
    if (camel !== undefined && camel !== null) return camel;
    return row[pascalKey];
};

const toQuietHoursPositiveInt = (value, fallback = 0) => {
    const parsed = Number(value);
    if (!Number.isFinite(parsed) || parsed < 0) return fallback;
    return Math.floor(parsed);
};

const toQuietHoursPageNumber = (value, fallback = 1) => {
    const parsed = toQuietHoursPositiveInt(value, fallback);
    return parsed > 0 ? parsed : fallback;
};

const toQuietHoursSessionId = (value) => {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : value;
};

const INVALID_QUIET_HOURS_FILTER_LITERALS = new Set(['undefined', 'null', 'nan']);

/** Grid / filter-menu display values — never surface undefined/null as text. */
const toQuietHoursGridFilterValue = (value) => {
    if (value == null) return '';
    const text = String(value).trim();
    if (!text || INVALID_QUIET_HOURS_FILTER_LITERALS.has(text.toLowerCase())) {
        return '';
    }
    return text;
};

const toQuietHoursFilterFieldValue = (value) => {
    const text = value == null ? '' : String(value).trim();
    if (!text || INVALID_QUIET_HOURS_FILTER_LITERALS.has(text.toLowerCase())) {
        return '';
    }
    return text;
};

export const isQuietHoursSessionReady = ({
    clientId,
    userId,
    departmentId,
    channelId,
} = {}) => {
    if (clientId == null || clientId === '') return false;
    if (userId == null || userId === '') return false;
    if (departmentId == null || departmentId === '') return false;
    const channel = Number(channelId);
    return Number.isFinite(channel) && channel > 0;
};

/** StatusID for grid toggle (1=Active, 0=Inactive). Not the IsActive soft-delete column. */
const pickQuietHoursRowStatusId = (row, defaultStatusId = 1) => {
    const raw = pickApiField(row, 'statusId', 'StatusID');
    if (raw === true || raw === 1 || raw === '1') return 1;
    if (raw === false || raw === 0 || raw === '0') return 0;
    if (raw === undefined || raw === null || raw === '') return defaultStatusId;
    const parsed = Number(raw);
    return Number.isNaN(parsed) ? defaultStatusId : parsed;
};

export const buildQuietHoursSessionPayload = ({ clientId, userId, departmentId }) => ({
    clientId: toQuietHoursSessionId(clientId),
    userId: toQuietHoursSessionId(userId),
    departmentId: toQuietHoursSessionId(departmentId),
});

export const QUIET_HOURS_DEFAULT_PAGE_SIZE = 5;

export const QUIET_HOURS_DEFAULT_FILTERATION = {
    ruleName: '',
    ruleType: '',
    countryRegion: '',
    window: '',
    days: '',
    messageType: '',
    behavior: '',
    statusLabel: '',
    startDate: '',
    endDate: '',
};

const QUIET_HOURS_FILTERATION_KEYS = Object.keys(QUIET_HOURS_DEFAULT_FILTERATION);

export const sanitizeQuietHoursFilteration = (filteration = QUIET_HOURS_DEFAULT_FILTERATION) => {
    const sanitized = { ...QUIET_HOURS_DEFAULT_FILTERATION };
    QUIET_HOURS_FILTERATION_KEYS.forEach((key) => {
        sanitized[key] = toQuietHoursFilterFieldValue(filteration?.[key]);
    });
    return sanitized;
};

const extractKendoFilterValues = (filter, accumulator = {}) => {
    if (!filter?.filters?.length) {
        return accumulator;
    }

    filter.filters.forEach((entry) => {
        if (entry?.filters?.length) {
            extractKendoFilterValues(entry, accumulator);
            return;
        }
        const field = entry?.field;
        const value = entry?.value;
        if (!field || !QUIET_HOURS_FILTERATION_KEYS.includes(field)) {
            return;
        }
        if (!toQuietHoursFilterFieldValue(value)) {
            return;
        }
        accumulator[field] = toQuietHoursFilterFieldValue(value);
    });

    return accumulator;
};

export const buildQuietHoursFilterationFromKendoFilter = (kendoFilter) =>
    sanitizeQuietHoursFilteration(extractKendoFilterValues(kendoFilter, {}));

export const hasActiveQuietHoursFilteration = (filteration = QUIET_HOURS_DEFAULT_FILTERATION) =>
    Object.values(sanitizeQuietHoursFilteration(filteration)).some(
        (value) => String(value ?? '').trim() !== '',
    );

export const buildQuietHoursListPayload = ({
    clientId,
    userId,
    departmentId,
    channelId,
    pageNo = 1,
    pageSize = QUIET_HOURS_DEFAULT_PAGE_SIZE,
    isFilter = false,
    filteration = QUIET_HOURS_DEFAULT_FILTERATION,
}) => ({
    ...buildQuietHoursSessionPayload({ clientId, userId, departmentId }),
    channelId: toQuietHoursPositiveInt(channelId),
    isFilter: Boolean(isFilter),
    filteration: sanitizeQuietHoursFilteration(filteration),
    pagination: {
        pageNo: toQuietHoursPageNumber(pageNo),
        pageSize: toQuietHoursPageNumber(pageSize, QUIET_HOURS_DEFAULT_PAGE_SIZE),
    },
});

export const buildQuietHoursByIdPayload = ({
    clientId,
    userId,
    departmentId,
    channelId,
    ruleId,
    ruleType,
}) => ({
    ...buildQuietHoursSessionPayload({ clientId, userId, departmentId }),
    channelId: toQuietHoursPositiveInt(channelId),
    ruleId: toQuietHoursPositiveInt(ruleId),
    ruleType,
});

export const buildQuietHoursLookupsPayload = ({
    clientId,
    userId,
    departmentId,
    channelId,
    // When true, returns all regions (regulatory + brand-selectable). When false, only brand-selectable rows.
    includeAllCountries = true,
}) => ({
    ...buildQuietHoursSessionPayload({ clientId, userId, departmentId }),
    channelId: toQuietHoursPositiveInt(channelId),
    includeAllCountries: Boolean(includeAllCountries),
});

const parseQuietHoursApiStatus = (rawStatus) =>
    rawStatus === true ||
    rawStatus === 1 ||
    rawStatus === '1' ||
    String(rawStatus).toLowerCase() === 'true';

const toQuietHoursFiniteNumber = (value) => {
    if (value == null || value === '') return undefined;
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : undefined;
};

export const parseQuietHoursApiResponse = (response) => {
    if (response == null || response === false) {
        return { status: false, data: null, message: '' };
    }

    if (typeof response === 'string') {
        return { status: false, data: null, message: response };
    }

    if (response instanceof Error) {
        return {
            status: false,
            data: null,
            message: String(response.message || ''),
        };
    }

    if (typeof response !== 'object') {
        return { status: false, data: null, message: '' };
    }

    if (
        response.response?.data != null &&
        typeof response.response.data === 'object' &&
        !Array.isArray(response.response.data)
    ) {
        return parseQuietHoursApiResponse(response.response.data);
    }

    const body =
        typeof response.status === 'number' &&
        response.data != null &&
        typeof response.data === 'object' &&
        !Array.isArray(response.data) &&
        ('status' in response.data || 'data' in response.data || 'message' in response.data)
            ? response.data
            : response;

    const status = parseQuietHoursApiStatus(body.status ?? body.Status);
    const message =
        typeof (body.message ?? body.Message) === 'string' ? body.message ?? body.Message : '';

    let data = body.data ?? body.Data ?? null;
    if (data == null && status && pickApiField(body, 'ruleId', 'RuleID') != null) {
        data = body;
    }
    if (
        data != null &&
        typeof data === 'object' &&
        !Array.isArray(data) &&
        pickApiField(data, 'ruleId', 'RuleID') == null
    ) {
        const nestedList = data.data ?? data.Data ?? data.items ?? data.Items;
        if (Array.isArray(nestedList)) {
            data = nestedList;
        }
    }

    const totalRows = pickApiField(body, 'totalRows', 'TotalRows');
    const pageNo = pickApiField(body, 'pageNo', 'PageNo');
    const pageSize = pickApiField(body, 'pageSize', 'PageSize');
    const ruleId = pickApiField(body, 'ruleId', 'RuleID');
    const warning =
        typeof (body.warning ?? body.Warning) === 'string' ? body.warning ?? body.Warning : '';

    return {
        status,
        data,
        message,
        warning,
        ruleId: toQuietHoursFiniteNumber(ruleId),
        totalRows: toQuietHoursFiniteNumber(totalRows),
        pageNo: toQuietHoursFiniteNumber(pageNo),
        pageSize: toQuietHoursFiniteNumber(pageSize),
    };
};

export const extractQuietHoursDetailData = (parsed) => {
    if (!parsed?.status || parsed.data == null) return null;

    const data = parsed.data;
    if (Array.isArray(data)) {
        return data[0] ?? null;
    }
    if (typeof data !== 'object') {
        return null;
    }
    if (pickApiField(data, 'ruleId', 'RuleID') != null) {
        return data;
    }

    const nested = data.data ?? data.Data;
    if (nested && typeof nested === 'object' && !Array.isArray(nested)) {
        return nested;
    }

    return null;
};

export const alignQuietHoursFormLookups = (
    formValues = {},
    lookups = EMPTY_LOOKUPS,
    { isRegulatory = false } = {},
) => {
    const countryRegions = lookups?.countryRegions || [];
    const countryOptions = isRegulatory
        ? getRegulatoryCountryOptions(countryRegions)
        : getBrandCountryOptions(countryRegions);
    const messageTypes = lookups?.messageTypes || [];
    const queueExpiryOptions = lookups?.queueExpiryOptions || [];

    const countryRegionId = formValues?.countryRegion?.countryRegionId;
    const alignedCountry =
        countryRegionId != null
            ? countryOptions.find((r) => Number(r?.countryRegionId) === Number(countryRegionId)) ||
              formValues.countryRegion
            : formValues.countryRegion;

    const messageTypeCode = formValues?.messageType?.messageTypeCode;
    const alignedMessageType =
        messageTypeCode != null
            ? messageTypes.find((m) => m?.messageTypeCode === messageTypeCode) || formValues.messageType
            : formValues.messageType;

    const queueExpiryCode = formValues?.queueExpiry?.queueExpiryCode;
    const alignedQueueExpiry =
        queueExpiryCode != null
            ? queueExpiryOptions.find((q) => q?.queueExpiryCode === queueExpiryCode) ||
              formValues.queueExpiry
            : formValues.queueExpiry;

    return {
        ...formValues,
        countryRegion: alignedCountry ?? null,
        messageType: alignedMessageType ?? null,
        queueExpiry: alignedQueueExpiry ?? null,
    };
};

export const normalizeQuietHoursLookupResponse = (response) => {
    const { status, data, message } = parseQuietHoursApiResponse(response);
    const source =
        data && typeof data === 'object' && !Array.isArray(data)
            ? data
            : response && typeof response === 'object'
              ? response
              : {};

    const countryRegions = Array.isArray(source.countryRegions)
        ? source.countryRegions
        : Array.isArray(source.CountryRegions)
          ? source.CountryRegions
          : [];
    const messageTypes = Array.isArray(source.messageTypes)
        ? source.messageTypes
        : Array.isArray(source.MessageTypes)
          ? source.MessageTypes
          : [];
    const queueExpiryOptions = Array.isArray(source.queueExpiryOptions)
        ? source.queueExpiryOptions
        : Array.isArray(source.QueueExpiryOptions)
          ? source.QueueExpiryOptions
          : [];

    return {
        status: status && hasQuietHoursLookupData({ countryRegions, messageTypes, queueExpiryOptions }),
        message,
        countryRegions: mapLookupCountryRegions(countryRegions),
        messageTypes: mapLookupMessageTypes(messageTypes),
        queueExpiryOptions: mapLookupQueueExpiry(queueExpiryOptions),
    };
};

export const hasQuietHoursLookupData = ({
    countryRegions = [],
    messageTypes = [],
    queueExpiryOptions = [],
} = {}) =>
    countryRegions.length > 0 || messageTypes.length > 0 || queueExpiryOptions.length > 0;

export const BEHAVIOR_OPTIONS = [
    { value: 'queue', label: 'Queue & Send' },
    { value: 'discard', label: 'Discard' },
];

export const WEEK_DAY_OPTIONS = [
    { key: 'mon', code: 'MON', label: 'Mon' },
    { key: 'tue', code: 'TUE', label: 'Tue' },
    { key: 'wed', code: 'WED', label: 'Wed' },
    { key: 'thu', code: 'THU', label: 'Thu' },
    { key: 'fri', code: 'FRI', label: 'Fri' },
    { key: 'sat', code: 'SAT', label: 'Sat' },
    { key: 'sun', code: 'SUN', label: 'Sun' },
];

const DEFAULT_DAYS_CUSTOM = {
    mon: true,
    tue: true,
    wed: true,
    thu: true,
    fri: true,
    sat: true,
    sun: true,
};

const ADD_FORM_DAYS_CUSTOM = {
    mon: true,
    tue: false,
    wed: false,
    thu: false,
    fri: false,
    sat: false,
    sun: false,
};

export const ADMIN_ACCESS_TOOLTIP = 'Admin access required to manage Quiet Hours rules';

export const QUIET_HOURS_REGULATORY_READONLY_TOOLTIP =
    'This setting cannot be changed for regulatory rules.';

export const QUIET_HOURS_BOTH_BEHAVIOR_TOOLTIP =
    'Queue & Send is applied automatically when Message type is Both. Discard is not available.';

export const QUIET_HOURS_DEFAULT_QUEUE_EXPIRY_CODE = '24H';

export const QUIET_HOURS_UNEXPECTED_ERROR_MESSAGE = 'An unexpected error occurred.';

export const QUIET_HOURS_SYSTEM_ERROR_MESSAGES = [
    QUIET_HOURS_UNEXPECTED_ERROR_MESSAGE,
    'Exception has occurred',
    'Exception has been occured.',
];

export const isQuietHoursSystemErrorMessage = (message) => {
    const normalized = String(message || '').trim().toLowerCase();
    if (!normalized) return false;
    if (QUIET_HOURS_SYSTEM_ERROR_MESSAGES.some((item) => normalized === item.toLowerCase())) {
        return true;
    }
    return (
        normalized.includes('exception has occurred') ||
        normalized.includes('exception has been occured') ||
        normalized.includes('pymysql') ||
        normalized.includes('sqlalchemy') ||
        normalized.includes('integrityerror')
    );
};

const DAYS_LABELS = {
    ALL: 'All days',
    WEEKDAYS: 'Weekdays',
    WEEKENDS: 'Weekends',
    CUSTOM: 'Custom',
};

const MESSAGE_TYPE_LABELS = {
    PROMOTIONAL: 'Promotional',
    BOTH: 'Both (Promotional + Transactional)',
};

const BEHAVIOR_LABELS = {
    QUEUE_AND_SEND: 'Queue & Send',
    DISCARD: 'Discard',
};

export const isDiscardBehavior = (behavior) =>
    behavior === BEHAVIOR_OPTIONS[1].label ||
    behavior === 'discard' ||
    behavior === 'DISCARD' ||
    behavior === BEHAVIOR_LABELS.DISCARD;

export const isQueueBehaviorValue = (behavior) => !isDiscardBehavior(behavior);

export const isBothMessageTypeCode = (messageType) =>
    String(messageType?.messageTypeCode ?? messageType ?? '').toUpperCase() === 'BOTH';

export const resolveSuppressionBehaviorForForm = (messageTypeCode, suppressionBehaviorApi) => {
    if (String(messageTypeCode || '').toUpperCase() === 'BOTH') {
        return BEHAVIOR_OPTIONS[0].label;
    }

    return BEHAVIOR_API_TO_FORM[suppressionBehaviorApi] || BEHAVIOR_OPTIONS[0].label;
};

const QUEUE_EXPIRY_FORM_TO_API = {
    '1h': '1H',
    '4h': '4H',
    '12h': '12H',
    '24h': '24H',
    none: 'NO_EXPIRY',
};

const BEHAVIOR_API_TO_FORM = {
    QUEUE_AND_SEND: BEHAVIOR_OPTIONS[0].label,
    DISCARD: BEHAVIOR_OPTIONS[1].label,
};

export const EMPTY_LOOKUPS = {
    countryRegions: [],
    messageTypes: [],
    queueExpiryOptions: [],
};

export const mapLookupCountryRegions = (rows = []) =>
    (Array.isArray(rows) ? rows : []).map((r) => {
        const countryRegionIdRaw = r?.countryRegionId ?? r?.CountryRegionID;
        const countryRegionId =
            countryRegionIdRaw != null && !Number.isNaN(Number(countryRegionIdRaw))
                ? Number(countryRegionIdRaw)
                : countryRegionIdRaw;
        const isBrandSelectableRaw = r?.isBrandSelectable ?? r?.IsBrandSelectable;
        return {
            countryRegionId,
            label: r?.label || r?.regionLabel || r?.RegionLabel || '',
            scopeType: r?.scopeType || r?.ScopeType || '',
            regionCode: r?.regionCode || r?.RegionCode || '',
            parentCountryRegionId: r?.parentCountryRegionId ?? r?.ParentCountryRegionID,
            stateCodes: r?.stateCodes || r?.StateCodes || '',
            isBrandSelectable:
                typeof isBrandSelectableRaw === 'boolean'
                    ? isBrandSelectableRaw
                    : Number(isBrandSelectableRaw) === 1,
        };
    });

export const mapLookupMessageTypes = (rows = []) =>
    (Array.isArray(rows) ? rows : []).map((r) => ({
        messageTypeId: r?.messageTypeId ?? r?.MessageTypeID,
        messageTypeCode: r?.messageTypeCode ?? r?.MessageTypeCode,
        label: r?.label || r?.messageTypeLabel || r?.MessageTypeLabel || '',
        value:
            String(r?.messageTypeCode ?? r?.MessageTypeCode ?? '').toLowerCase() === 'both'
                ? 'both'
                : 'promotional',
    }));

export const mapLookupQueueExpiry = (rows = []) =>
    (Array.isArray(rows) ? rows : []).map((r) => {
        const code = String(r?.queueExpiryCode ?? r?.QueueExpiryCode ?? '');
        return {
            queueExpiryId: r?.queueExpiryId ?? r?.QueueExpiryID,
            queueExpiryCode: code,
            label: r?.label || r?.queueExpiryLabel || r?.QueueExpiryLabel || '',
            value: code === 'NO_EXPIRY' ? 'none' : code.toLowerCase(),
        };
    });

export const getBrandCountryOptions = (countryRegions = []) =>
    countryRegions.filter((r) => r?.isBrandSelectable !== false);

export const getRegulatoryCountryOptions = (countryRegions = []) =>
    countryRegions.filter((r) => r?.scopeType !== 'ALL_COUNTRIES');

export const buildFormDefaults = (lookups = EMPTY_LOOKUPS, channelKey = QUIET_HOURS_CHANNEL_KEYS.EMAIL) => {
    const countryRegions = lookups?.countryRegions || [];
    const messageTypes = lookups?.messageTypes || [];
    const queueExpiryOptions = lookups?.queueExpiryOptions || [];
    const brandCountries = getBrandCountryOptions(countryRegions);

    return {
        ruleName: '',
        channel: getChannelOptionForKey(channelKey),
        countryRegion: brandCountries[0] || countryRegions[0] || null,
        windowStart: null,
        windowEnd: null,
        daysCustom: { ...ADD_FORM_DAYS_CUSTOM },
        messageType: messageTypes[0] || null,
        behavior: BEHAVIOR_OPTIONS[0].label,
        queueExpiry:
            queueExpiryOptions.find((o) => o?.queueExpiryCode === QUIET_HOURS_DEFAULT_QUEUE_EXPIRY_CODE) ||
            queueExpiryOptions[0] ||
            null,
        priorityOverride: false,
    };
};

export const buildSuggestedDuplicateRuleName = (ruleName = '') => {
    const base = String(ruleName || '').trim();
    const suffix = ' - Copy';
    if (!base) return 'Copy';
    const withoutCopySuffix = base.replace(/(?:\s*-\s*Copy)+$/i, '').trim() || base;
    const candidate = `${withoutCopySuffix}${suffix}`;
    if (candidate.length <= 100) return candidate;
    return `${withoutCopySuffix.slice(0, 100 - suffix.length)}${suffix}`;
};

export const getFormInitialState = (lookups = EMPTY_LOOKUPS, channelKey = QUIET_HOURS_CHANNEL_KEYS.EMAIL) => ({
    defaultValues: buildFormDefaults(lookups, channelKey),
    mode: 'onTouched',
    reValidateMode: 'onChange',
});

export const parseQuietTimeToDate = (timeStr) => {
    if (!timeStr) return null;
    const [hours, minutes] = String(timeStr).split(':').map(Number);
    if (Number.isNaN(hours)) return null;
    const date = new Date();
    date.setHours(hours, minutes || 0, 0, 0);
    return date;
};

const formatTimeLabel = (time) => {
    if (!time) return '';
    const str = String(time).trim();
    const match = str.match(/^(\d{1,2}):(\d{2})/);
    if (match) {
        const hours = Number(match[1]);
        const minutes = Number(match[2]);
        if (!Number.isNaN(hours) && !Number.isNaN(minutes)) {
            return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
        }
    }
    return str;
};

export const formatQuietWindow = (start, end) => {
    const startLabel = formatTimeLabel(start);
    const endLabel = formatTimeLabel(end);
    if (!startLabel && !endLabel) return '';
    if (!startLabel) return endLabel;
    if (!endLabel) return startLabel;
    return `${startLabel} – ${endLabel}`;
};

const normalizeQuietHoursList = (data) => {
    if (Array.isArray(data)) return data;
    if (data && typeof data === 'object' && Object.keys(data).length) return [data];
    return [];
};

export const coerceQuietHoursListRows = (data) => {
    try {
        return normalizeQuietHoursList(data);
    } catch {
        return [];
    }
};

export const formatQuietTimeForApi = (date) => {
    if (!date || !(date instanceof Date) || Number.isNaN(date.getTime())) return '';
    return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
};

/** Special-character check runs before min-length for Quiet Hours rule name (UI only). */
export const validateQuietHoursRuleName = (value) => {
    const data = String(value ?? '');
    if (!data.trim()) return true;
    if (COMMUNICATION_NAME.test(data)) {
        return SPECIAL_CHATACTERS_NOT_ALlOWED;
    }
    if (data.trim().length < MIN_LENGTH) {
        return MINLENGTH;
    }
    return true;
};

export const toQuietWindowMinutes = (value) => {
    if (!value) return null;
    if (value instanceof Date && !Number.isNaN(value.getTime())) {
        return value.getHours() * 60 + value.getMinutes();
    }
    const str = String(value).trim();
    const match = str.match(/^(\d{1,2}):(\d{2})/);
    if (!match) return null;
    return Number(match[1]) * 60 + Number(match[2]);
};

const QUIET_HOURS_EVENING_START_MINUTES = 18 * 60;

/**
 * Equal times — shown on the window end field.
 */
export const validateQuietHoursWindowEndField = (windowStart, windowEnd, placeholders = {}) => {
    const startMins = toQuietWindowMinutes(windowStart);
    const endMins = toQuietWindowMinutes(windowEnd);
    if (startMins == null || endMins == null) return true;
    if (startMins === endMins) {
        return QUIET_HOURS_WINDOW_TIMES_MUST_DIFFER || 'Start and end times must be different.';
    }
    return true;
};

/**
 * Invalid wrap (e.g. 12:00–11:00) — error shown on window start; window end is cleared.
 */
export const validateQuietHoursWindowStartField = (windowStart, windowEnd, placeholders = {}) => {
    const startMins = toQuietWindowMinutes(windowStart);
    const endMins = toQuietWindowMinutes(windowEnd);
    if (startMins == null || endMins == null) return true;
    if (startMins === endMins) return true;
    if (startMins < endMins) return true;
    if (startMins > endMins && startMins < QUIET_HOURS_EVENING_START_MINUTES) {
        return (
            QUIET_HOURS_WINDOW_END_NOT_BEFORE_START ||
            'Window end cannot be earlier than window start.'
        );
    }
    return true;
};

export const isQuietHoursWindowEndBeforeStartError = (message, placeholders = {}) => {
    if (!message) return false;
    return (
        message ===
        (QUIET_HOURS_WINDOW_END_NOT_BEFORE_START ||
            'Window end cannot be earlier than window start.')
    );
};

export const isUsaQuietHoursRegion = (countryRegion) => {
    if (!countryRegion) return false;
    const regionCode = String(countryRegion?.regionCode || '').toUpperCase();
    const countryRegionId = Number(countryRegion?.countryRegionId);
    const parentCountryRegionId = Number(countryRegion?.parentCountryRegionId);

    if (regionCode === 'US' || regionCode.startsWith('US-')) return true;
    if (countryRegionId === 2) return true;
    if (parentCountryRegionId === 2) return true;
    return false;
};

export const getQuietWindowMinutes = (start, end) => {
    const startMins = toQuietWindowMinutes(start);
    const endMins = toQuietWindowMinutes(end);
    if (startMins == null || endMins == null) return null;
    return (endMins - startMins + 24 * 60) % (24 * 60);
};

export const isQuietWindowShorterThan = (start, end, baselineStart, baselineEnd) => {
    const current = getQuietWindowMinutes(start, end);
    const baseline = getQuietWindowMinutes(baselineStart, baselineEnd);
    if (current == null || baseline == null) return false;
    return current < baseline;
};

export const getApplicableRegulatoryBaselines = (countryRegion, regulatoryRows = []) => {
    if (!Array.isArray(regulatoryRows) || !regulatoryRows.length) return [];

    if (countryRegion?.scopeType === 'ALL_COUNTRIES') {
        return regulatoryRows;
    }

    const label = String(countryRegion?.label || '').trim().toLowerCase();
    const regionCode = String(countryRegion?.regionCode || '').toUpperCase();
    const matched = regulatoryRows.filter((row) => {
        const regLabel = String(row?.countryRegion || '').trim().toLowerCase();
        return regLabel && regLabel === label;
    });

    if (countryRegion?.scopeType === 'STATE' && regionCode.startsWith('US-')) {
        const federal = regulatoryRows.find(
            (row) => String(row?.countryRegion || '').trim().toLowerCase() === 'usa (federal)',
        );
        if (federal && !matched.includes(federal)) {
            matched.push(federal);
        }
    }

    return matched.length ? matched : regulatoryRows;
};

export const validateBrandWindowAgainstRegulatory = (
    formValues,
    regulatoryRows = [],
    regulatoryMessage,
) => {
    if (!formValues?.countryRegion) return null;

    const baselines = getApplicableRegulatoryBaselines(formValues.countryRegion, regulatoryRows);
    const shorterBaseline = baselines.find((row) =>
        isQuietWindowShorterThan(
            formValues?.windowStart,
            formValues?.windowEnd,
            row?.quietStart,
            row?.quietEnd,
        ),
    );

    if (shorterBaseline) {
        return regulatoryMessage;
    }

    return null;
};

export const extractRegulatoryRowsFromList = (rows = []) =>
    coerceQuietHoursListRows(rows)
        .filter((row) => String(pickApiField(row, 'ruleType', 'RuleType')).toUpperCase() === API_RULE_TYPES.REGULATORY)
        .map((row) => ({
            quietStart: pickApiField(row, 'quietStart', 'QuietStart'),
            quietEnd: pickApiField(row, 'quietEnd', 'QuietEnd'),
            countryRegion: pickApiField(row, 'countryRegion', 'CountryRegion') || '',
            ruleName: pickApiField(row, 'ruleName', 'RuleName') || '',
        }));

export const mapQuietHoursValidationMessage = (apiMessage, placeholders = {}) => {
    const msg = String(apiMessage || '').trim();
    if (!msg) return '';

    if (isQuietHoursSystemErrorMessage(msg)) {
        return '';
    }

    const lower = msg.toLowerCase();
    if (lower.includes('must extend beyond')) {
        return msg;
    }
    if (lower.includes('brand quiet hours window cannot be shorter')) {
        return (
            QUIET_HOURS_BRAND_SHORTER_THAN_REGULATORY ||
            msg
        );
    }
    if (lower.includes('quiet period cannot be shorter than')) {
        return msg;
    }
    if (lower.includes('cannot be shorter than the regulatory requirement')) {
        return QUIET_HOURS_CANNOT_SHORTEN_REGULATORY || msg;
    }
    if (lower.includes('cannot be shorter than regulatory')) {
        return QUIET_HOURS_CANNOT_SHORTEN_REGULATORY || msg;
    }
    if (
        lower.includes('duplicate entry') ||
        lower.includes('uq_quiethoursbrandrule') ||
        lower.includes('rule name already exists') ||
        lower.includes('already exists for this channel')
    ) {
        return 'A rule with this name already exists for this channel.';
    }

    if (
        lower.includes('pymysql') ||
        lower.includes('sqlalchemy') ||
        lower.includes('integrityerror') ||
        lower.includes('[sql:')
    ) {
        return '';
    }

    return msg;
};

export const resolveQuietHoursFailureMessage = (response, placeholders = {}, fallback = '') => {
    const parsed = parseQuietHoursApiResponse(
        response != null && typeof response === 'object'
            ? response
            : { message: String(response ?? '') },
    );
    const mapped = mapQuietHoursValidationMessage(parsed?.message, placeholders);
    if (mapped) return mapped;
    if (!parsed?.status && parsed?.message) {
        return String(parsed.message);
    }
    return fallback;
};

const resolveCountryRegionFromDetail = (data = {}, lookups = EMPTY_LOOKUPS) => {
    const regions = lookups?.countryRegions || [];
    if (!regions.length) return null;

    const scope = String(pickApiField(data, 'scopeType', 'ScopeType') || '').toUpperCase();
    const stateIdsRaw = pickApiField(data, 'stateIds', 'StateIDs');
    const idsRaw = pickApiField(data, 'countryIds', 'CountryIDs');

    const resolveRegionId = (raw) => {
        if (Array.isArray(raw) && raw.length) {
            const firstId = Number(raw[0]);
            return Number.isNaN(firstId) ? null : firstId;
        }
        if (raw != null && raw !== '') {
            const firstId = Number(String(raw).split(',')[0]?.trim());
            return Number.isNaN(firstId) ? null : firstId;
        }
        return null;
    };

    if (scope === 'STATE') {
        const stateId = resolveRegionId(stateIdsRaw) ?? resolveRegionId(idsRaw);
        if (stateId != null) {
            const byStateId = regions.find((r) => Number(r?.countryRegionId) === stateId);
            if (byStateId) return byStateId;
        }
    }

    const countryId = resolveRegionId(idsRaw);
    if (countryId != null) {
        const byId = regions.find((r) => Number(r?.countryRegionId) === countryId);
        if (byId) return byId;
    }

    if (scope === 'ALL_COUNTRIES') {
        return (
            regions.find((r) => r?.scopeType === 'ALL_COUNTRIES') ||
            regions.find((r) => String(r?.label || '').toLowerCase() === 'all countries') ||
            regions[0]
        );
    }

    return null;
};

export const mapQuietHoursDetailToForm = (
    data = {},
    lookups = EMPTY_LOOKUPS,
) => {
    const ruleTypeApi = pickApiField(data, 'ruleType', 'RuleType');
    const isRegulatory = String(ruleTypeApi || '').toUpperCase() === API_RULE_TYPES.REGULATORY;
    const messageTypes = lookups?.messageTypes || [];
    const queueExpiryOptions = lookups?.queueExpiryOptions || [];

    const messageTypeCode = String(pickApiField(data, 'messageType', 'MessageType') || 'PROMOTIONAL').toUpperCase();
    const queueExpiryCode = String(
        pickApiField(data, 'queueExpiry', 'QueueExpiry') || QUIET_HOURS_DEFAULT_QUEUE_EXPIRY_CODE,
    ).toUpperCase();
    const quietStart = pickApiField(data, 'quietStart', 'QuietStart');
    const quietEnd = pickApiField(data, 'quietEnd', 'QuietEnd');
    const rawRuleId = pickApiField(data, 'ruleId', 'RuleID');
    const parsedRuleId = rawRuleId != null ? Number(rawRuleId) : undefined;

    return {
        ruleName: pickApiField(data, 'ruleName', 'RuleName') || '',
        countryRegion: resolveCountryRegionFromDetail(data, lookups),
        windowStart: parseQuietTimeToDate(quietStart),
        windowEnd: parseQuietTimeToDate(quietEnd),
        daysCustom: buildDaysCustomFromApi(
            pickApiField(data, 'daysOfWeek', 'DaysOfWeek'),
            pickApiField(data, 'daysCustom', 'DaysCustom'),
        ),
        messageType:
            messageTypes.find((o) => o?.messageTypeCode === messageTypeCode) ||
            messageTypes[0] ||
            null,
        behavior: resolveSuppressionBehaviorForForm(
            messageTypeCode,
            pickApiField(data, 'suppressionBehavior', 'SuppressionBehavior'),
        ),
        queueExpiry:
            queueExpiryOptions.find((o) => o?.queueExpiryCode === queueExpiryCode) ||
            queueExpiryOptions.find((o) => o?.queueExpiryCode === QUIET_HOURS_DEFAULT_QUEUE_EXPIRY_CODE) ||
            queueExpiryOptions[0] ||
            null,
        ruleId: Number.isFinite(parsedRuleId) ? parsedRuleId : undefined,
        ruleType: isRegulatory ? RULE_TYPES.REGULATORY : RULE_TYPES.BRAND,
        priorityOverride: Number(pickApiField(data, 'priorityOverride', 'PriorityOverride')) === 1,
        sourceRuleId: undefined,
    };
};

/** Mirror Python ScopeFromCountryRegionRow — STATE rows use stateIds + parent countryIds. */
export const buildCountryScopeFromRegion = (countryRegion) => {
    if (countryRegion?.countryRegionId == null || Number.isNaN(Number(countryRegion.countryRegionId))) {
        return {};
    }

    const countryRegionId = Number(countryRegion.countryRegionId);
    const scopeType = String(countryRegion?.scopeType || 'SPECIFIC_COUNTRIES').toUpperCase();

    if (scopeType === 'ALL_COUNTRIES') {
        return { scopeType: 'ALL_COUNTRIES' };
    }

    if (scopeType === 'STATE') {
        const parentCountryRegionId = Number(countryRegion?.parentCountryRegionId);
        return {
            scopeType: 'STATE',
            stateIds: [countryRegionId],
            ...(Number.isFinite(parentCountryRegionId) && parentCountryRegionId > 0
                ? { countryIds: [parentCountryRegionId] }
                : {}),
        };
    }

    return {
        scopeType,
        countryIds: [countryRegionId],
    };
};

export const buildQuietHoursUpsertPayload = (
    formValues,
    { clientId, userId, departmentId, channelId, ruleId },
) => {
    const { daysOfWeek, daysCustom } = buildDaysOfWeekFromCustom(formValues?.daysCustom);
    const scopeFields = buildCountryScopeFromRegion(formValues?.countryRegion);
    const messageTypeCode = formValues?.messageType?.messageTypeCode || 'PROMOTIONAL';
    const isBothMessageType = isBothMessageTypeCode(formValues?.messageType);
    const queueExpiryCode = isQueueBehaviorValue(formValues?.behavior)
        ? formValues?.queueExpiry?.queueExpiryCode ||
          QUEUE_EXPIRY_FORM_TO_API[formValues?.queueExpiry?.value] ||
          QUIET_HOURS_DEFAULT_QUEUE_EXPIRY_CODE
        : undefined;

    return {
        ...buildQuietHoursSessionPayload({ clientId, userId, departmentId }),
        ruleId: toQuietHoursPositiveInt(ruleId) > 0 ? toQuietHoursPositiveInt(ruleId) : 0,
        ruleName: (formValues?.ruleName || '').trim(),
        channelId: toQuietHoursPositiveInt(channelId),
        ...scopeFields,
        quietStart: formatQuietTimeForApi(formValues?.windowStart),
        quietEnd: formatQuietTimeForApi(formValues?.windowEnd),
        daysOfWeek,
        daysCustom,
        messageType: String(messageTypeCode || 'PROMOTIONAL').toUpperCase(),
        suppressionBehavior:
            isBothMessageType || !isDiscardBehavior(formValues?.behavior)
                ? 'QUEUE_AND_SEND'
                : 'DISCARD',
        queueExpiry: queueExpiryCode,
        priorityOverride: formValues?.priorityOverride ? 1 : 0,
    };
};

export const buildQuietHoursDuplicatePayload = (
    formValues,
    { clientId, userId, departmentId, channelId, sourceRuleId },
) => ({
    ...buildQuietHoursUpsertPayload(formValues, {
        clientId,
        userId,
        departmentId,
        channelId,
        ruleId: sourceRuleId,
    }),
    ruleId: Number(sourceRuleId),
});

export const toApiRuleType = (ruleType) =>
    ruleType === RULE_TYPES.REGULATORY ? API_RULE_TYPES.REGULATORY : API_RULE_TYPES.BRAND;

export const buildQuietHoursStatusPayload = ({
    clientId,
    userId,
    departmentId,
    channelId,
    ruleId,
    statusId,
    ruleType,
}) => ({
    ...buildQuietHoursSessionPayload({ clientId, userId, departmentId }),
    channelId: toQuietHoursPositiveInt(channelId),
    ruleId: toQuietHoursPositiveInt(ruleId),
    statusId: toQuietHoursPositiveInt(statusId) === 0 ? 0 : 1,
    ruleType: toApiRuleType(ruleType ?? RULE_TYPES.BRAND),
});

export const buildQuietHoursDeletePayload = ({
    clientId,
    userId,
    departmentId,
    channelId,
    ruleId,
    ruleType,
}) => ({
    ...buildQuietHoursSessionPayload({ clientId, userId, departmentId }),
    channelId: toQuietHoursPositiveInt(channelId),
    ruleId: toQuietHoursPositiveInt(ruleId),
    ...(ruleType != null ? { ruleType: toApiRuleType(ruleType) } : {}),
});

export const buildDaysCustomFromApi = (daysOfWeek, daysCustomCsv) => {
    const base = { mon: false, tue: false, wed: false, thu: false, fri: false, sat: false, sun: false };
    const apiDays = String(daysOfWeek || '').toUpperCase();

    if (apiDays === 'ALL') {
        return { ...DEFAULT_DAYS_CUSTOM };
    }
    if (apiDays === 'WEEKDAYS') {
        return { ...base, mon: true, tue: true, wed: true, thu: true, fri: true };
    }
    if (apiDays === 'WEEKENDS') {
        return { ...base, sat: true, sun: true };
    }

    const codes = String(daysCustomCsv || '')
        .split(',')
        .map((d) => d.trim().toUpperCase());
    WEEK_DAY_OPTIONS.forEach(({ key, code }) => {
        if (codes.includes(code)) base[key] = true;
    });
    return base;
};

export const buildDaysOfWeekFromCustom = (daysCustom = {}) => {
    const selected = WEEK_DAY_OPTIONS.filter(({ key }) => daysCustom[key]);
    if (!selected.length) {
        return { daysOfWeek: 'CUSTOM', daysCustom: [] };
    }
    if (selected.length === 7) return { daysOfWeek: 'ALL', daysCustom: null };
    if (
        selected.length === 5 &&
        daysCustom.mon &&
        daysCustom.tue &&
        daysCustom.wed &&
        daysCustom.thu &&
        daysCustom.fri
    ) {
        return { daysOfWeek: 'WEEKDAYS', daysCustom: null };
    }
    if (selected.length === 2 && daysCustom.sat && daysCustom.sun) {
        return { daysOfWeek: 'WEEKENDS', daysCustom: null };
    }
    return {
        daysOfWeek: 'CUSTOM',
        daysCustom: selected.map(({ code }) => code),
    };
};

export const hasQuietHoursDaysSelected = (daysCustom = {}) =>
    Object.values(daysCustom || {}).some(Boolean);

export const mapQuietHoursGridRow = (row = {}) => {
    const ruleTypeApi = pickApiField(row, 'ruleType', 'RuleType');
    const ruleType =
        String(ruleTypeApi || '').toUpperCase() === API_RULE_TYPES.REGULATORY
            ? RULE_TYPES.REGULATORY
            : RULE_TYPES.BRAND;
    const statusId = pickQuietHoursRowStatusId(row);
    const isStatusEnabled = ruleType === RULE_TYPES.REGULATORY ? true : statusId === 1;

    const quietStart = pickApiField(row, 'quietStart', 'QuietStart');
    const quietEnd = pickApiField(row, 'quietEnd', 'QuietEnd');
    const daysOfWeek = pickApiField(row, 'daysOfWeek', 'DaysOfWeek');
    const messageType = pickApiField(row, 'messageType', 'MessageType');
    const suppressionBehavior = pickApiField(row, 'suppressionBehavior', 'SuppressionBehavior');
    const rawRuleId = pickApiField(row, 'ruleId', 'RuleID');
    const parsedRuleId = rawRuleId != null ? Number(rawRuleId) : undefined;

    return {
        ruleId: Number.isFinite(parsedRuleId) ? parsedRuleId : undefined,
        ruleName: toQuietHoursGridFilterValue(pickApiField(row, 'ruleName', 'RuleName')),
        ruleSubtitle: toQuietHoursGridFilterValue(pickApiField(row, 'regulationRef', 'RegulationRef')),
        ruleType,
        countryRegion: toQuietHoursGridFilterValue(pickApiField(row, 'countryRegion', 'CountryRegion')),
        window: toQuietHoursGridFilterValue(formatQuietWindow(quietStart, quietEnd)),
        quietStart,
        quietEnd,
        days: toQuietHoursGridFilterValue(DAYS_LABELS[daysOfWeek] || daysOfWeek),
        messageType: toQuietHoursGridFilterValue(MESSAGE_TYPE_LABELS[messageType] || messageType),
        behavior: toQuietHoursGridFilterValue(BEHAVIOR_LABELS[suppressionBehavior] || suppressionBehavior),
        status: isStatusEnabled,
        statusLabel: isStatusEnabled ? 'Active' : 'Inactive',
        priorityOverride: Number(pickApiField(row, 'priorityOverride', 'PriorityOverride')) === 1,
        raw: row,
    };
};

export const mapQuietHoursApiRowsToGrid = (rows = []) =>
    coerceQuietHoursListRows(rows)
        .map((row) => {
            try {
                return mapQuietHoursGridRow(row);
            } catch {
                return null;
            }
        })
        .filter(Boolean);
