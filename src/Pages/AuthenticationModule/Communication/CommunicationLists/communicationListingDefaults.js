import { safeParseJSON } from 'Utils/modules/stringUtils';
/** Default list API payload shape — avoids undefined access on `data`. */
export const EMPTY_COMMUNICATION_LISTING_DATA = {
    communicationsList: [],
    totalCampaigns: 0,
    totalRows: 0,
};

/** Safe defaults for a single grid row. */
export const EMPTY_COMMUNICATION_LIST_ITEM = {
    campaignId: null,
    campaignName: '',
    encodeCampaignId: '',
    campaignGroupingId: '',
    statusId: 0,
    campaignTypeValue: 'Single dimension',
    channelsDetails: [],
    expanded: false,
    isFailure: false,
    extendedCampaignId: null,
    createdById: null,
    endDate: null,
    startDate: null,
    tags: '',
};

/** Safe defaults for advance-search filter option buckets. */
export const EMPTY_LISTING_FILTER_OPTIONS = {
    productType: [],
    communicationType: [],
    tags: [],
    users: [],
};

export function normalizeChannelDetail(item) {
    if (item == null || typeof item !== 'object') {
        return null;
    }
    const channeldetailId = Number(item.channeldetailId ?? item.channelDetailId) || 0;
    const channelId = Number(item.channelId) || 0;
    if (channeldetailId === 0 && channelId === 0) {
        return null;
    }
    return {
        ...item,
        channelId,
        channeldetailId,
    };
}

export function getCampaignTypeValue(type) {
    switch (type) {
        case 'S':
            return 'Single dimension';
        case 'M':
            return 'Multi dimension';
        case 'T':
            return 'Event trigger';
        case 'Single dimension':
        case 'Multi dimension':
        case 'Event trigger':
            return type;
        default:
            return 'Single dimension';
    }
}

export function normalizeCommunicationListItem(item) {
    if (item == null || typeof item !== 'object') {
        return { ...EMPTY_COMMUNICATION_LIST_ITEM };
    }
    const channels = Array.isArray(item.channelsDetails)
        ? item.channelsDetails.map(normalizeChannelDetail).filter(Boolean)
        : [];
    return {
        ...EMPTY_COMMUNICATION_LIST_ITEM,
        ...item,
        campaignTypeValue: getCampaignTypeValue(item.campaignTypeValue),
        channelsDetails: channels,
        campaignName: item.campaignName ?? '',
        encodeCampaignId: item.encodeCampaignId ?? '',
    };
}

/**
 * Normalizes listing API `data` so missing keys never break the grid.
 */
export function normalizeCommunicationListingData(raw) {
    if (raw == null || typeof raw !== 'object') {
        return { ...EMPTY_COMMUNICATION_LISTING_DATA };
    }
    const list = Array.isArray(raw.communicationsList) ? raw.communicationsList : [];
    const normalizedList = list.map(normalizeCommunicationListItem);
    return {
        ...EMPTY_COMMUNICATION_LISTING_DATA,
        ...raw,
        communicationsList: normalizedList,
        totalCampaigns: Number(raw.totalCampaigns) || normalizedList.length || 0,
        totalRows: Number(raw.totalRows) || 0,
    };
}

export function normalizeListingFilterOptions(mapped = {}) {
    return {
        productType: Array.isArray(mapped.productType) ? mapped.productType : [],
        communicationType: Array.isArray(mapped.communicationType) ? mapped.communicationType : [],
        tags: Array.isArray(mapped.tags) ? mapped.tags : [],
        users: Array.isArray(mapped.users) ? mapped.users : [],
    };
}

/** Parse API string fields (tags, name search) to array; never throws. */
export function parseListingJsonArray(value, fallback = []) {
    const parsed = safeParseJSON(value, fallback);
    return Array.isArray(parsed) ? parsed : fallback;
}

export function coerceApiListingPayload(apiWrapper) {
    if (apiWrapper == null) {
        return { status: false, data: { ...EMPTY_COMMUNICATION_LISTING_DATA } };
    }
    if (typeof apiWrapper === 'object' && 'status' in apiWrapper) {
        const inner = apiWrapper.data;
        return {
            ...apiWrapper,
            data: normalizeCommunicationListingData(
                inner != null && typeof inner === 'object' ? inner : {},
            ),
        };
    }
    return {
        status: true,
        data: normalizeCommunicationListingData(apiWrapper),
    };
}
