import { safeParseJSON } from 'Utils/modules/stringUtils';
/** Inlined — do not import Communication listing defaults (circular TDZ in analytics prod chunk). */
export const EMPTY_ANALYTICS_FILTER_OPTIONS = {
    productType: [],
    communicationType: [],
    tags: [],
    users: [],
};

/** Communication analytics summary list API shape. */
export const EMPTY_ANALYTICS_SUMMARY_DATA = {
    campaignsList: [],
    campaignsListInfo: [],
    totalCampaigns: 0,
};

export const EMPTY_ANALYTICS_LIST_ITEM = {
    campaignID: null,
    campaignGUID: '',
    campaignName: '',
    channelId: [],
    channels: [],
    expanded: false,
    statusID: 0,
    subChannelId: 0,
    campaignTypeValue: '',
    startDate: null,
    endDate: null,
    createdDate: null,
    modifiedDate: null,
};

export const EMPTY_ANALYTICS_DETAIL_STATE = {
    detailsList: {},
    channelDetail: {},
    overviewDetail: {},
    preBlastList: [],
};

/** Reset document scroll when entering analytics report / detail pages (listing pages preserve scrollY). */
export const scrollAnalyticsPageToTop = () => {
    if (typeof window === 'undefined' || typeof document === 'undefined') {
        return;
    }

    try {
        window.scrollTo?.(0, 0);

        if (document.documentElement) {
            document.documentElement.scrollTop = 0;
        }

        if (document.body) {
            document.body.scrollTop = 0;
        }

        const pageContentWrapper = document.querySelector?.('.rs-page-content-wrapper');
        if (pageContentWrapper) {
            pageContentWrapper.scrollTop = 0;
            pageContentWrapper.scrollTo?.(0, 0);
        }
    } catch {
        // Ignore scroll failures in unsupported or partially mounted contexts
    }
};

/** Parse JSON object fields from analytics APIs; never throws. */
export function parseAnalyticsJson(value, fallback = {}) {
    if (value == null || value === '') return fallback;
    if (typeof value === 'object' && !Array.isArray(value)) return value;
    const parsed = safeParseJSON(value, fallback);
    return parsed != null && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : fallback;
}

/** Parse JSON array fields (charts, series, status steps); never throws. */
export function parseAnalyticsJsonArray(value, fallback = []) {
    if (value == null || value === '') return fallback;
    if (Array.isArray(value)) return value;
    const parsed = safeParseJSON(value, fallback);
    return Array.isArray(parsed) ? parsed : fallback;
}

export function normalizeAnalyticsSummaryResponse(raw) {
    if (raw == null || typeof raw !== 'object') {
        return { ...EMPTY_ANALYTICS_SUMMARY_DATA };
    }
    const campaignsList = Array.isArray(raw.campaignsList) ? raw.campaignsList : [];
    const campaignsListInfo = Array.isArray(raw.campaignsListInfo) ? raw.campaignsListInfo : [];
    return {
        ...EMPTY_ANALYTICS_SUMMARY_DATA,
        ...raw,
        campaignsList: campaignsList.map((item) => ({
            ...EMPTY_ANALYTICS_LIST_ITEM,
            ...(item && typeof item === 'object' ? item : {}),
            channelId: Array.isArray(item?.channelId) ? item.channelId : [],
            channels: Array.isArray(item?.channels) ? item.channels : [],
        })),
        campaignsListInfo,
        totalCampaigns: Number(raw.totalCampaigns) || campaignsList.length || 0,
    };
}

export function normalizeAnalyticsFilterOptions(mapped = {}) {
    return {
        productType: Array.isArray(mapped.productType) ? mapped.productType : [],
        communicationType: Array.isArray(mapped.communicationType) ? mapped.communicationType : [],
        tags: Array.isArray(mapped.tags) ? mapped.tags : [],
        users: Array.isArray(mapped.users) ? mapped.users : [],
    };
}

export function coerceAnalyticsSummaryApiResult(apiWrapper) {
    if (apiWrapper == null || apiWrapper === false) {
        return {
            status: false,
            totalCampaigns: 0,
            data: { ...EMPTY_ANALYTICS_SUMMARY_DATA },
        };
    }
    if (typeof apiWrapper === 'object' && 'status' in apiWrapper) {
        const inner = apiWrapper.data;
        const normalized = normalizeAnalyticsSummaryResponse(
            inner != null && typeof inner === 'object' ? inner : {},
        );
        return {
            ...apiWrapper,
            totalCampaigns: Number(apiWrapper.totalCampaigns) || normalized.totalCampaigns || 0,
            data: normalized,
        };
    }
    const normalized = normalizeAnalyticsSummaryResponse(apiWrapper);
    return {
        status: true,
        totalCampaigns: normalized.totalCampaigns,
        data: normalized,
    };
}
