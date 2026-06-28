import { getChannelId, getChannelSocialId } from 'Utils/modules/communicationChannels';
import { getUserDetails } from 'Utils/modules/crypto';
import { getmasterData } from 'Utils/modules/masterData';
import { email_medium, mobile_sms_medium, notification_medium, social_facebook_medium, social_twitter_medium } from 'Constants/GlobalConstant/Glyphicons';
/**
 * factModel channel-wise count key config: which field to use for channel count/percentage.
 * Email uses deliveredCount; other channels use channelSentCount. Add more entries as needed.
 */
export const FACTMODEL_CHANNEL_COUNT_KEY = {
    email: 'deliveredCount',
    default: 'channelSentCount',
};

/** Display name / API channel name -> factModel key (for factModel.email, factModel.mobile, etc.) */
const DISPLAY_NAME_TO_FACTMODEL_KEY = {
    email: 'email',
    Email: 'email',
    sms: 'mobile',
    SMS: 'mobile',
    mobile: 'mobile',
    'Web notification': 'webPush',
    webpush: 'webPush',
    'Mobile notification': 'mobilePush',
    mobilenotification: 'mobilePush',
    whatsapp: 'whatsapp',
    WhatsApp: 'whatsapp',
    rcs: 'rcs',
    RCS: 'rcs',
    qrcode: 'qrCode',
    qr: 'qrCode',
};

/** Get the factModel count field key for a channel (factModel key or display name). */
export function getFactModelCountKey(channelKey) {
    const k = (channelKey || '').toString().toLowerCase().replace(/\s+/g, '');
    return FACTMODEL_CHANNEL_COUNT_KEY[k] ?? FACTMODEL_CHANNEL_COUNT_KEY.default;
}

/** Get factModel key from channel display name or API key (e.g. "Email" -> "email", "SMS" -> "mobile"). */
export function getFactModelKeyFromChannelName(nameOrKey) {
    const s = (nameOrKey || '').toString().trim();
    const lower = s.toLowerCase().replace(/\s+/g, '');
    return DISPLAY_NAME_TO_FACTMODEL_KEY[lower] || lower || null;
}

/** Sum channel count from factModel using config (Email -> deliveredCount, others -> channelSentCount). */
export function getChannelCountFromFactModel(factModel, channelNameOrKey) {
    if (!factModel || typeof factModel !== 'object') return 0;
    const factKey = getFactModelKeyFromChannelName(channelNameOrKey);
    const list = factModel[factKey];
    if (!Array.isArray(list) || list.length === 0) return 0;
    const countKey = getFactModelCountKey(factKey);
    return list.reduce((sum, item) => sum + (Number(item?.[countKey]) || 0), 0);
}

/** Total audience from factModel using channel-wise count config. */
export function getTotalAudienceFromFactModel(factModel) {
    if (!factModel || typeof factModel !== 'object') return 0;
    let total = 0;
    Object.keys(factModel).forEach((key) => {
        const list = factModel[key];
        if (!Array.isArray(list) || list.length === 0) return;
        const countKey = getFactModelCountKey(key);
        list.forEach((item) => { total += Number(item?.[countKey]) || 0; });
    });
    return total;
}

/** factModel key -> key for getChannelConfigFromUtils (name/icon/color) */
const FACTMODEL_KEY_TO_CONFIG_KEY = {
    email: 'email',
    mobile: 'sms',
    webPush: 'webpush',
    mobilePush: 'mobilenotification',
    whatsapp: 'whatsapp',
    rcs: 'rcs',
    qrCode: 'qrcode',
};

/**
 * Build Single touch display list from factModel: count and percentage from factModel only.
 * Percentage = (channel count / total) * 100 using config (Email deliveredCount, others channelSentCount).
 * Includes channels with 0 count so API response can be overridden with factModel percentages.
 */
export function mapFactModelToRoiSingleTouch(factModel) {
    if (!factModel || typeof factModel !== 'object') return [];
    const total = getTotalAudienceFromFactModel(factModel);
    const list = [];
    Object.keys(factModel).forEach((factKey) => {
        const arr = factModel[factKey];
        if (!Array.isArray(arr) || arr.length === 0) return;
        const count = getChannelCountFromFactModel(factModel, factKey);
        const configKey = FACTMODEL_KEY_TO_CONFIG_KEY[factKey] ?? factKey;
        const config = getChannelConfigFromUtils(configKey) || getChannelConfigFromUtils(factKey);
        if (!config) return;
        const percentage = total > 0 ? Math.round((count / total) * 1000) / 10 : 0;
        list.push({
            name: config.name,
            icon: config.icon,
            color: config.color,
            count,
            data: [{ firstTouch: percentage, lastTouch: 0 }],
        });
    });
    return list;
}

/**
 * Overlay factModel-based count and percentage onto a display list (e.g. from API).
 * Use when API returns count: 0 but factModel has deliveredCount/channelSentCount – show factModel % and hover count.
 */
export function mergeFactModelIntoRoiDisplayList(displayList, factModel) {
    if (!factModel || typeof factModel !== 'object' || !Array.isArray(displayList) || displayList.length === 0) return displayList;
    const total = getTotalAudienceFromFactModel(factModel);
    return displayList.map((item) => {
        const count = getChannelCountFromFactModel(factModel, item.name);
        const percentage = total > 0 ? Math.round((count / total) * 1000) / 10 : 0;
        return {
            ...item,
            count,
            data: item.data?.length ? [{ ...item.data[0], firstTouch: percentage }] : [{ firstTouch: percentage, lastTouch: item.data?.[0]?.lastTouch ?? 0 }],
        };
    });
}

/**
 * Percentage = (API count / factModel total) × 100.
 * FactModel total = deliveredCount (Email) + channelSentCount (others). Do not use totalRecipientsCount for percentage.
 * Hover shows API count.
 */
export function mergeApiCountWithFactModelTotal(apiList, factModel) {
    if (!factModel || typeof factModel !== 'object' || !Array.isArray(apiList) || apiList.length === 0) return apiList;
    const total = getTotalAudienceFromFactModel(factModel);
    if (total <= 0) return apiList;
    return apiList.map((item) => {
        const apiCount = Number(item.data?.[0]?.firstTouch) ?? 0;
        const percentage = Math.round((apiCount / total) * 1000) / 10;
        return {
            ...item,
            count: apiCount,
            data: item.data?.length ? [{ ...item.data[0], firstTouch: percentage }] : [{ firstTouch: percentage, lastTouch: item.data?.[0]?.lastTouch ?? 0 }],
        };
    });
}

const API_KEY_TO_CHANNEL_LOOKUP = {
    email: () => getChannelId(1),
    sms: () => getChannelId(2),
    notification: () => getChannelId(9),
    webpush: () => getChannelId(8),
    mobilenotification: () => getChannelId(9),
    facebook: () => getChannelSocialId('facebook'),
    x: () => getChannelSocialId('twitter'),
    whatsapp: () => getChannelId(21),
    rcs: () => getChannelId(41),
    qr: () => getChannelId(3),
    qrcode: () => getChannelId(3),
};

function getChannelConfigFromUtils(apiKey) {
    const key = (apiKey || '').toString().toLowerCase();
    const lookup = API_KEY_TO_CHANNEL_LOOKUP[key];
    let ch = typeof lookup === 'function' ? lookup() : lookup;
    if (!ch) {
        ch = getChannelId(key);
        if (!ch?.label) ch = getChannelSocialId(key);
    }
    if (!ch) return null;
    return {
        name: key === 'x' ? 'X' : (ch.label || ch.name || ''),
        icon: ch.icon,
        color: ch.bgColor || 'bg-others',
    };
}

const getChannelKeysForDomain = () => ['email', 'notification', 'sms', 'facebook', 'x'];

export const getRoiSingleTouchConfig = () => {
    const keys = getChannelKeysForDomain();
    return keys
        .map((key) => {
            const config = getChannelConfigFromUtils(key);
            if (!config) return null;
            return {
                name: config.name,
                icon: config.icon,
                color: config.color,
                data: [{ firstTouch: 0, lastTouch: 0 }],
            };
        })
        .filter(Boolean);
};

const getChannelDataFromApi = (apiData, channelKey) => {
    if (apiData[channelKey] && Array.isArray(apiData[channelKey])) return apiData[channelKey];
    const found = Object.keys(apiData).find((k) => k.toLowerCase() === channelKey.toLowerCase());
    return found && Array.isArray(apiData[found]) ? apiData[found] : [];
};

/** Normalize GetSingleandMultiTouch body: `{ percentage: [...] }` or legacy array / channel-keyed object */
export function getAttributionRoiRowArray(apiData) {
    if (!apiData || typeof apiData !== 'object') return [];
    if (Array.isArray(apiData)) return apiData;
    if (Array.isArray(apiData.percentage)) return apiData.percentage;
    return [];
}

function isGetSingleTouchPercentageRow(row) {
    if (!row || typeof row !== 'object') return false;
    return (
        row.r_first_touch_CPR !== undefined ||
        row.c_first_touch_CPC !== undefined ||
        row.r_last_touch_CPR !== undefined
    );
}

function getUserCurrencySymbol() {
    const { currencyMasterList } = getmasterData();
    const { currencyId } = getUserDetails();
    let currsymbol = '₹';
    const matchingCurrency = currencyMasterList?.find((currency) => currency.currencyID === currencyId);
    currsymbol = matchingCurrency ? matchingCurrency.currenySymbol : currsymbol;
    return currsymbol;
}

function formatSeqCurrency(val) {
    const sym = getUserCurrencySymbol();
    const n = Number(val);
    if (!Number.isFinite(n)) return `${sym}0.00`;
    return `${sym}${n.toFixed(2)}`;
}

function formatSeqRoiMultiplier(val) {
    const n = Number(val);
    if (!Number.isFinite(n)) return '0x';
    if (n === 0) return '0x';
    const t = Math.abs(n) >= 100 ? n.toFixed(1) : n.toFixed(2);
    return `${t}x`;
}

/**
 * @param {string} [touchLabel] — 'First touch' | 'Last touch'; only that block is shown in the tooltip.
 */
export function buildSequenceContributionMetrics(row, touchLabel = 'First touch') {
    if (!row || typeof row !== 'object') {
        return { layout: 'sections', sections: [] };
    }
    const useLast = touchLabel === 'Last touch';
    const firstTiles = [
        { label: 'Cost / Reach', value: formatSeqCurrency(row.r_first_touch_CPR) },
        { label: 'Cost / Engagement', value: formatSeqCurrency(row.i_first_touch_CPE) },
        { label: 'Cost / Conversion', value: formatSeqCurrency(row.c_first_touch_CPC) },
        { label: 'Revenue / Reach', value: formatSeqCurrency(row.fT_Attr_Reach_Rev) },
        { label: 'Revenue / Engagement', value: formatSeqCurrency(row.fT_Attr_Engage_Rev) },
        { label: 'Revenue / Conversion', value: formatSeqCurrency(row.fT_Attr_Conv_Rev) },
        { label: 'Channel ROI', value: formatSeqRoiMultiplier(row.fT_Channel_ROI), fullWidth: true },
    ];
    const lastTiles = [
        { label: 'Cost / Reach', value: formatSeqCurrency(row.r_last_touch_CPR) },
        { label: 'Cost / Engagement', value: formatSeqCurrency(row.i_last_touch_CPE) },
        { label: 'Cost / Conversion', value: formatSeqCurrency(row.c_last_touch_CPC) },
        { label: 'Revenue / Reach', value: formatSeqCurrency(row.lT_Attr_Reach_Rev) },
        { label: 'Revenue / Engagement', value: formatSeqCurrency(row.lT_Attr_Engage_Rev) },
        { label: 'Revenue / Conversion', value: formatSeqCurrency(row.lT_Attr_Conv_Rev) },
        { label: 'Channel ROI', value: formatSeqRoiMultiplier(row.lT_Channel_ROI), fullWidth: true },
    ];
    const tiles = useLast ? lastTiles : firstTiles;
    const sectionTitle = useLast ? 'Last Touch' : 'First Touch';
    return {
        layout: 'sections',
        sections: [{ title: sectionTitle, tiles }],
    };
}

function computePercentageBarWidths(rows, touchLabel) {
    const totalFirst = rows.reduce((s, r) => s + (Number(r?.r_first_touch_CPR) || 0), 0);
    const totalLast = rows.reduce((s, r) => s + (Number(r?.r_last_touch_CPR) || 0), 0);
    const totalSpend = rows.reduce((s, r) => s + (Number(r?.spend) || 0), 0);
    const useLast = touchLabel === 'Last touch';
    const denom = useLast ? totalLast : totalFirst;
    const pick = (r) => (useLast ? Number(r?.r_last_touch_CPR) || 0 : Number(r?.r_first_touch_CPR) || 0);
    return rows.map((row) => {
        let w = denom > 0 ? (pick(row) / denom) * 100 : 0;
        if (!Number.isFinite(w) || w === 0) {
            w = totalSpend > 0 ? ((Number(row?.spend) || 0) / totalSpend) * 100 : 0;
        }
        return Math.round(w * 10) / 10;
    });
}

function mapPercentageTouchRowsToRoiList(apiArray = [], touchLabel = 'First touch', _factModel) {
    if (!Array.isArray(apiArray) || apiArray.length === 0) return [];
    const widths = computePercentageBarWidths(apiArray, touchLabel);
    return apiArray
        .map((row, idx) => {
            const channelKey = (row?.channel || '').toString().toLowerCase().replace(/\s+/g, '');
            const config = getChannelConfigFromUtils(channelKey) || getChannelConfigFromUtils(row?.channel);
            if (!config) return null;
            const w = widths[idx] ?? 0;
            const spend = Number(row.spend) || 0;
            return {
                name: config.name,
                icon: config.icon,
                color: config.color,
                count: spend,
                roiAmount: row.lT_Total_Attr_Rev != null ? Number(row.lT_Total_Attr_Rev) : undefined,
                data: [{ firstTouch: w, lastTouch: w, roiValue: row.lT_Channel_ROI }],
                sequenceContribution: buildSequenceContributionMetrics(row, touchLabel),
            };
        })
        .filter(Boolean);
}

/** Support both legacy object format and new array format: data: [{ channel, count, roiCount }] */
export const getTotalAudienceFromApiResponse = (apiData) => {
    if (!apiData || typeof apiData !== 'object') return 0;
    if (Array.isArray(apiData.percentage)) {
        return apiData.percentage.reduce((sum, r) => sum + (Number(r?.spend) || 0), 0);
    }
    if (Array.isArray(apiData)) {
        return (apiData || []).reduce((sum, item) => sum + (Number(item?.count) || 0), 0);
    }
    const keys = Object.keys(apiData).filter(
        (k) => k !== 'campaignGuid' && k !== 'totalAudience' && typeof apiData[k] === 'object' && Array.isArray(apiData[k])
    );
    let total = 0;
    keys.forEach((key) => {
        (apiData[key] || []).forEach((item) => {
            total += Number(item?.count) || 0;
        });
    });
    return total;
};

const NON_CHANNEL_KEYS = new Set(['campaignguid', 'totalaudience', 'b1', 't1', 'percentage']);

function getChannelKeysFromApiData(apiData) {
    return Object.keys(apiData).filter((k) => {
        const keyLower = (k || '').toString().toLowerCase();
        if (NON_CHANNEL_KEYS.has(keyLower)) return false;
        const val = apiData[k];
        return Array.isArray(val) && val.length > 0;
    });
}

/** Map new API response format: data: [{ channel, count, roiCount, roiAmount/amount }] */
function mapArrayResponseToRoiSingleTouch(apiData) {
    if (!Array.isArray(apiData) || apiData.length === 0) return [];
    return apiData
        .map((item) => {
            const channelKey = (item?.channel || '').toString().toLowerCase().replace(/\s+/g, '');
            const config = getChannelConfigFromUtils(channelKey) || getChannelConfigFromUtils((item?.channel || '').toString());
            if (!config) return null;
            const count = Number(item?.count) ?? 0;
            const roiCount = Number(item?.roiCount) ?? 0;
            const roiAmount = Number(item?.roiAmount ?? item?.amount ?? 0);
            return {
                name: config.name,
                icon: config.icon,
                color: config.color,
                count,
                roiCount,
                roiAmount,
                data: [{ firstTouch: count, lastTouch: roiCount }],
            };
        })
        .filter(Boolean);
}

export const mapApiResponseToRoiSingleTouch = (apiData, _domain, touchLabel = 'First touch') => {
    if (!apiData || typeof apiData !== 'object') return [];
    if (Array.isArray(apiData.percentage) && apiData.percentage.length > 0 && isGetSingleTouchPercentageRow(apiData.percentage[0])) {
        const widths = computePercentageBarWidths(apiData.percentage, touchLabel);
        return apiData.percentage
            .map((row, idx) => {
                const channelKey = (row?.channel || '').toString().toLowerCase().replace(/\s+/g, '');
                const config = getChannelConfigFromUtils(channelKey) || getChannelConfigFromUtils(row?.channel);
                if (!config) return null;
                const w = widths[idx] ?? 0;
                const spend = Number(row.spend) || 0;
                return {
                    name: config.name,
                    icon: config.icon,
                    color: config.color,
                    count: spend,
                    roiAmount: row.lT_Total_Attr_Rev != null ? Number(row.lT_Total_Attr_Rev) : undefined,
                    data: [{ firstTouch: w, lastTouch: w, roiValue: row.lT_Channel_ROI }],
                    sequenceContribution: buildSequenceContributionMetrics(row, touchLabel),
                };
            })
            .filter(Boolean);
    }
    if (Array.isArray(apiData)) return mapArrayResponseToRoiSingleTouch(apiData);
    const keys = getChannelKeysFromApiData(apiData);
    return keys
        .map((key) => {
            const config = getChannelConfigFromUtils(key);
            const rawList = getChannelDataFromApi(apiData, key);
            if (!config || !rawList?.length) return null;
            const first = rawList[0];
            const firstTouch = first?.percentage ?? 0;
            const lastTouch = rawList[1]?.percentage ?? first?.percentage ?? 0;
            const count = Number(first?.count) ?? 0;
            const roiCount = Number(first?.roiCount ?? rawList[1]?.roiCount) ?? 0;
            const roiAmount = Number(first?.roiAmount ?? first?.amount ?? rawList[1]?.roiAmount ?? rawList[1]?.amount) ?? 0;
            return {
                name: config.name,
                icon: config.icon,
                color: config.color,
                count,
                roiCount,
                roiAmount,
                data: [{ firstTouch: Number(firstTouch), lastTouch: Number(lastTouch) }],
            };
        })
        .filter(Boolean);
};

/**
 * Build payload for GetSingleandMultiTouch API from summary (factModel-based).
 * Payload: { data: [{ campaignGuid, …, TenantID, campaignId }], touchType }
 * @param {string|number} [campaignId] — from route/query (e.g. state.from); falls back to summary
 */
export const buildSingleMultiTouchPayload = (summary, touchType, selectedTouch, campaignId) => {
    const factModel = summary?.factModel || {};
    const campaignGuid = summary?.campaignGuid || '';
    const B1 = summary?.B2 ?? 'CH';
    const T1 = touchType === 'multi' ? 'L' : 'F';
    const TenantID = summary?.tenantGuid || '';
    const resolvedCampaignId = campaignId ?? summary?.campaignId ?? summary?.campaignID;

    const emailSent = factModel?.email?.[0]?.sentCount || 0;
    const smsSent = factModel?.mobile?.[0]?.channelSentCount || 0;
    const wpSentCount = factModel?.webPush?.[0]?.channelSentCount || 0;
    const mpSentCount = factModel?.mobilePush?.[0]?.channelSentCount || 0;
    const data = [
        {
            campaignGuid,
            Emailsent: emailSent,
            SMSsent: smsSent,
            WPSent: wpSentCount,
            MPSent: mpSentCount,
            TenantID: TenantID,
            CampaignId:
                resolvedCampaignId != null && resolvedCampaignId !== ''
                    ? Number(resolvedCampaignId)
                    : undefined,
        },
    ];

    return {
        data,
        touchType: selectedTouch === 'First touch' ? 'SFT' : 'SLT',
    };
};


export const roiSingleTouch = [
    {
        name: 'Email',
        icon: email_medium,
        color: 'bg-email',
        data: [
            {
                firstTouch: 25,
                lastTouch: 23,
            }
        ],
    },
    {
        name: 'Notifications',
        icon: notification_medium,
        color: 'bg-notification',
        data: [
            {
                firstTouch: 40,
                lastTouch: 20,
            },
        ],
    },
    {
        name: 'SMS',
        icon: mobile_sms_medium,
        color: 'bg-sms',
        data: [
            {
                firstTouch: 5,
                lastTouch: 10,
            }
        ],
    },
    {
        name: 'Facebook',
        icon: social_facebook_medium,
        color: 'bg-facebook',
        data: [
            {
                firstTouch: 3,
                lastTouch: 10,
            },
        ],
    },
    {
        name: 'X',
        icon: social_twitter_medium,
        color: 'bg-twitter',
        data: [
            {
                firstTouch: 27,
                lastTouch: 37,
            },
        ],
    },
]
export const ROI_DD_DATA = ['Single touch', 'Multi touch'];

export const TOUCH_DROPDOWN_DATA = ['First touch', 'Last touch'];

const TOUCH_KEY_MAP = {
    'First touch': { pct: 'first_touch_pct', count: 'first_touch_count', conv: 'first_touch_convrate' },
    'In between': { pct: 'in_between_pct', count: 'in_between_count', conv: 'in_between_convrate' },
    'Last touch': { pct: 'last_touch_pct', count: 'last_touch_count', conv: 'last_touch_convrate' },
};

function toFixedMaybe(val, digits = 2) {
    const n = Number(val);
    if (!Number.isFinite(n)) return 0;
    const f = Number(n.toFixed(digits));
    return Number.isFinite(f) ? f : 0;
}

const goalConfig = {
    'R' : 'Reach',
    'E' : 'Engagement',
    'C' : 'Conversion'
}

export function mapAttributionTouchArrayToRoiList(apiArray = [], touchLabel = 'First touch', factModel) {
    if (!Array.isArray(apiArray) || apiArray.length === 0) return [];
    if (isGetSingleTouchPercentageRow(apiArray[0])) {
        return mapPercentageTouchRowsToRoiList(apiArray, touchLabel, factModel);
    }
    const goalType = factModel?.goalPerformance?.goalStatus;
    const keys = TOUCH_KEY_MAP[touchLabel] ?? TOUCH_KEY_MAP['First touch'];
    return apiArray
        .map((row) => {
            const channelKey = (row?.channel || '').toString().toLowerCase().replace(/\s+/g, '');
            const config = getChannelConfigFromUtils(channelKey) || getChannelConfigFromUtils(row?.channel);
            if (!config) return null;
            const pct = row?.[keys.pct];
            const count = Number(row?.[keys.count]) || 0;
            const convRaw = row?.[keys.conv];
            const convPct = convRaw == null ? 0 : toFixedMaybe(Number(convRaw) * 100, 2);
            return {
                name: config.name,
                icon: config.icon,
                color: config.color,
                count,
                data: [{ firstTouch: pct, lastTouch: 0, roiValue: convRaw }],
                sequenceContribution: [{ label: `Cost / ${goalConfig[goalType]}`, value: convRaw }],
            };
        })
        .filter(Boolean);
}

export function getTotalAudienceFromTouchArray(apiArray = []) {
    if (!Array.isArray(apiArray) || apiArray.length === 0) return 0;
    return apiArray.reduce((sum, row) => sum + (Number(row?.first_touch_count) || 0), 0);
}