import { STATUS_LIST } from 'Utils/modules/communicationChannels';
import { CHANNELSSOCIAL_LIST } from 'Constants/GlobalConstant/channelSocialList';
import { uniqBy } from 'Utils/modules/lodashReplacements';
import { DEFAULT_SORT_TYPE_ADVANCE_FILTER_VALUE } from 'Constants/AdvanceSearch';
import { isEntireMultiSelectChosen, buildAdvanceSearchPersistStorageKey } from 'Components/AdvanceSearchNew';
import {
    SORT_TYPE_DATA,
    resolveSortByFromAdvanceFilters,
    multiSelectPayloadValue,
    statusAdvanceSearchPayloadValue,
    extractMultiValues,
    uniqCommaSeparatedIds,
} from '../Listings/constant';

export const communicationGalleryInfoDetails = {
    data: {
        noOfRecipientsCount: 0,
        reachCount: 0,
        interactionCount: 0,
        conversionCount: 0,
        campaignType: 'S',
        campaignAttribute: 'Acquisition',
    },
};


export const advanceSearchAvailableChannels = (channels) => {
    let notAvailableChannels = [4, 13, 15, 26, 30, 34];
    return channels.filter(channel => !notAvailableChannels.includes(channel.id));
};

export const advanceSearchStatusList = (statusList) => {
    /** Gallery: keep Archived (70); still omit Deleted, Draft, Multi status, Paused, Stopped. */
    const notAvailableStatus = [3, 6, 20, 27, 26];
    return statusList.filter((status) => !notAvailableStatus.includes(status.id));
};

export const SEARCH_CONFIG = ({ userId = 0, productType, communicationType, tags, users }) => [
    {
        type: 'input',
        label: 'Communication name',
        config: {
            name: 'communication_name',
            maxLength: 200,
        },
    },
    {
        type: 'dropdown',
        label: 'Delivery type',
        className: 'searchType',
        fieldKey: 'name',
        config: {
            name: 'delivery_type',
            data: [
                { id: '', name: 'All' },
                { id: 'S', name: 'Single dimension' },
                { id: 'M', name: 'Multi dimension' },
                { id: 'T', name: 'Event trigger' },
            ],
            textField: 'name',
            dataItemKey: 'id',
        },
    },
    {
        type: 'dropdown',
        label: 'Communication type',
        fieldKey: 'attributename',
        config: {
            name: 'communication_type',
            data: communicationType,
            textField: 'attributename',
            dataItemKey: 'campaignAttributeId',
        },
    },
    {
        type: 'dropdown',
        label: 'Product type',
        fieldKey: 'categoryname',
        config: {
            name: 'product_type',
            data: productType,
            textField: 'categoryname',
            dataItemKey: 'categoryId',
        },
    },
    {
        type: 'multiselect',
        label: 'Status',
        fieldKey: 'label',
        config: {
            name: 'status',
            data: advanceSearchStatusList(STATUS_LIST)?.map((list) => list?.label),
            // data: ['In progress', 'Paused', 'Scheduled', 'Completed', 'Alert', 'Multi status', 'Draft', 'Archived'],
        },
    },
    {
        type: 'dropdown',
        label: 'Channel type',
        fieldKey: 'lable',
        isMandatory: true,
        config: {
            name: 'channel_type',
            //data: ['Email', 'Messaging', 'Notification', 'QR code', 'SMS', 'Voice'],
            data: uniqBy(CHANNELSSOCIAL_LIST, 'lable'),
            textField: 'lable',
            dataItemKey: 'id',
        },
    },
    // {
    //     type: 'input',
    //     label: 'Created by',
    //     config: {
    //         name: 'created_by',
    //         maxlength: '50',
    //     },
    // },
    {
        type: 'dropdown',
        label: 'Created by',
        fieldKey: 'firstName',
        config: {
            name: 'created_by',
            data: users,
            textField: 'firstName',
            dataItemKey: 'userId',
        },
    },
    //
    {
        type: 'dropdown',
        label: 'Tags',
        fieldKey: 'tags',
        config: {
            name: 'tags',
            data: tags,
            textField: 'tags',
            dataItemKey: 'id',
        },
        // config: {
        //     name: 'listname',
        //     data: ['Mutual funds', 'Stocks', 'Flipkart Best Buying Days', 'Gold bon'],
        // },
    },
    // {
    //     type: 'datepicker',
    //     label: 'Start Date',
    //     config: {
    //         name: 'start_date',
    //     },
    // },
    // {
    //     type: 'datepicker',
    //     label: 'End Date',
    //     config: {
    //         name: 'end_date',
    //     },
    // },
];

export const SEARCH_FORM_STATE = {
    communication_name: '',
    delivery_type: '',
    communication_type: '',
    product_type: '',
    status: '',
    channel_type: { lable: 'Email', id: 1, subChannelId: 1, sno: 1 },
    tags: '',
    start_date: '',
    end_date: '',
};

export const GALLERY_DELIVERY_TYPE_DATA = [
    { id: 'S', name: 'Single dimension' },
    { id: 'M', name: 'Multi dimension' },
    { id: 'T', name: 'Event trigger' },
];

/** Stable reference so the channel dropdown is not reset on every config rebuild (fixes empty / wrong menu with Email default). */
export const GALLERY_CHANNEL_FILTER_DATA = advanceSearchAvailableChannels(uniqBy(CHANNELSSOCIAL_LIST, 'lable'));

/** Prefer Email (id 1) so default matches product expectation regardless of filter order. */
const GALLERY_DEFAULT_CHANNEL_ROW =
    GALLERY_CHANNEL_FILTER_DATA.find((c) => Number(c.id) === 1) ||
    CHANNELSSOCIAL_LIST.find((c) => Number(c.id) === 1) ||
    GALLERY_CHANNEL_FILTER_DATA[0] ||
    CHANNELSSOCIAL_LIST[0];

export const GALLERY_DEFAULT_EMAIL_CHANNEL_ROW = GALLERY_DEFAULT_CHANNEL_ROW;

/** Seed advance search: sort + channel. Default sort is not shown as a chip (non-default sort shows when selected). */
export const GALLERY_DEFAULT_CHANNEL_ACTIVE_FILTER = {
    sort_type: DEFAULT_SORT_TYPE_ADVANCE_FILTER_VALUE,
    channel_type: {
        displayValue: (GALLERY_DEFAULT_CHANNEL_ROW?.lable || 'Email').trim(),
        rawValue: GALLERY_DEFAULT_CHANNEL_ROW,
    },
};

const GALLERY_CHANNEL_IDS_USING_SUBCHANNEL = [7, 10];

function galleryPayloadSubChannelIdFromRow(channelRow) {
    if (!channelRow) return 0;
    const id = Number(channelRow.id);
    if (GALLERY_CHANNEL_IDS_USING_SUBCHANNEL.includes(id)) {
        return channelRow.subChannelId ?? 0;
    }
    return 0;
}

/**
 * `GetCampaignGalleryList` top-level `channelId` / `subChannelId` from advance-search `activeFilters`.
 * When `channel_type` is absent (chip removed) but other keys remain (e.g. sort), returns default Email (id 1).
 */
export function resolveGalleryChannelIdsFromAdvanceFilters(filters) {
    const defCh = GALLERY_DEFAULT_CHANNEL_ACTIVE_FILTER.channel_type?.rawValue;
    const defaultChannelId = defCh?.id ?? 1;
    const defaultSubChannelId = galleryPayloadSubChannelIdFromRow(defCh);
    if (!filters || typeof filters !== 'object' || Object.keys(filters).length === 0) {
        return { channelId: defaultChannelId, subChannelId: defaultSubChannelId };
    }
    if (!Object.prototype.hasOwnProperty.call(filters, 'channel_type')) {
        return { channelId: defaultChannelId, subChannelId: defaultSubChannelId };
    }
    const entry = filters.channel_type;
    const ch = entry?.rawValue;

    let row = null;
    if (Array.isArray(ch) && ch.length) {
        row = ch[ch.length - 1];
    } else if (ch && typeof ch === 'object' && !Array.isArray(ch)) {
        row = ch;
    }
    if (!row || row.id == null) {
        const disp = String(entry?.displayValue ?? '').trim();
        if (disp) {
            const parts = disp
                .split(',')
                .map((s) => s.trim())
                .filter(Boolean);
            const lastLabel = parts.length ? parts[parts.length - 1] : disp;
            row =
                GALLERY_CHANNEL_FILTER_DATA.find(
                    (c) => String(c?.lable ?? '').trim().toLowerCase() === lastLabel.toLowerCase(),
                ) || null;
        }
    }
    if (row && row.id != null) {
        return {
            channelId: Number(row.id),
            subChannelId: galleryPayloadSubChannelIdFromRow(row),
        };
    }
    return { channelId: defaultChannelId, subChannelId: defaultSubChannelId };
}

/** Align with `RSAdvanceSearchNew` v1 persist shape `{ v: 1, filters, nameChipSource }`. */
export function parseGalleryPersistedActiveFiltersBlob(parsed) {
    if (!parsed || typeof parsed !== 'object') {
        return null;
    }
    if (parsed.v === 1 && parsed.filters && typeof parsed.filters === 'object') {
        return Object.keys(parsed.filters).length > 0 ? parsed.filters : null;
    }
    const legacyKeys = Object.keys(parsed).filter((k) => k !== 'v' && k !== 'nameChipSource' && k !== 'filters');
    if (legacyKeys.length > 0) {
        return parsed;
    }
    return null;
}

export function mergeGalleryActiveFiltersFromPersistedStorage(
    clientId,
    userId,
    departmentId,
    persistScreenId = 'comm-gallery',
) {
    try {
        const key = buildAdvanceSearchPersistStorageKey(persistScreenId, clientId, userId, departmentId);
        const raw = localStorage.getItem(key);
        if (raw) {
            const parsed = JSON.parse(raw);
            const filters = parseGalleryPersistedActiveFiltersBlob(parsed);
            if (filters && Object.keys(filters).length > 0) {
                const cleanFilters = { ...filters };
                delete cleanFilters.channel_type;
                delete cleanFilters.communication_type;
                return { ...GALLERY_DEFAULT_CHANNEL_ACTIVE_FILTER, ...cleanFilters };
            }
        }
    } catch {
        /* ignore */
    }
    return GALLERY_DEFAULT_CHANNEL_ACTIVE_FILTER;
}

/** Matches initial `options` state in Gallery before async load — use when seeding `filteration` so it equals post–advance-search sync. */
export const GALLERY_INITIAL_OPTIONS_FOR_PAYLOAD = {
    productType: [],
    communicationType: [],
    tags: [],
    users: [],
};

/**
 * Same shape as Communication List `buildAdvanceFilterConfig` for Created by (multi; no synthetic select-all row).
 * `userId` reserved for parity with listing; options.users drives the menu.
 */
export const buildGalleryAdvanceFilterConfig = (options, _userId) => [
    {
        key: 'communication_name',
        label: 'Communication name',
        type: 'input',
        data: [],
    },
    {
        key: 'sort_type',
        label: 'Sort type',
        data: SORT_TYPE_DATA,
        isObject: true,
        fieldKey: 'name',
        idKey: 'id',
    },
    /** Same order as Communication List `buildAdvanceFilterConfig` so the advanced grid matches List / Analytics. */
    {
        key: 'delivery_type',
        label: 'Delivery type',
        data: GALLERY_DELIVERY_TYPE_DATA,
        isObject: true,
        fieldKey: 'name',
        isMulti: true,
    },
    {
        key: 'communication_type',
        label: 'Communication type',
        data: options.communicationType,
        isObject: true,
        fieldKey: 'attributename',
        isMulti: true,
    },
    {
        key: 'product_type',
        label: 'Product type',
        data: options.productType,
        isObject: true,
        fieldKey: 'categoryname',
        isMulti: true,
    },
    {
        key: 'status',
        label: 'Status',
        data: ['All', ...advanceSearchStatusList(STATUS_LIST).map((list) => list.label)],
        isObject: false,
        isMulti: true,
    },
    {
        key: 'channel_type',
        label: 'Channel type',
        data: GALLERY_CHANNEL_FILTER_DATA,
        isObject: true,
        fieldKey: 'lable',
        idKey: 'sno',
        isMandatory: true,
    },
    {
        key: 'created_by',
        label: 'Created by',
        data: options.users,
        isObject: true,
        fieldKey: 'firstName',
        itemKey: 'userId',
        isMulti: true,
        hideSelectAllRow: true,
        selectAllTagLabel: 'All communications',
    },
    {
        key: 'tags',
        label: 'Tags',
        data: options.tags,
        isObject: true,
        fieldKey: 'tags',
        isMulti: true,
    },
];

const galleryFilterEntry = (advanceFilterConfig, key) =>
    Array.isArray(advanceFilterConfig) ? advanceFilterConfig.find((f) => f.key === key) : null;

export const buildGalleryFiltersPayload = (
    filters = {},
    previousSortBy,
    advanceFilterConfig = null,
    scopeOptions = {},
) => {
    const f = (k) => galleryFilterEntry(advanceFilterConfig, k);
    const statusItems = filters.status?.rawValue;
    const { myCommunicationsOnly = true, userId } = scopeOptions;

    const createdByFilterEntry = galleryFilterEntry(advanceFilterConfig, 'created_by');
    const createdByRaw = filters.created_by?.rawValue;
    const createdBySelectAllLabel = createdByFilterEntry?.selectAllTagLabel ?? 'All communications';
    const createdByAllSelectedByDisplay =
        createdByFilterEntry && filters?.created_by?.displayValue === createdBySelectAllLabel;
    const createdByAllSelected =
        createdByAllSelectedByDisplay ||
        (createdByFilterEntry &&
            Array.isArray(createdByRaw) &&
            createdByRaw.length &&
            isEntireMultiSelectChosen(createdByFilterEntry, createdByRaw));
    const createdByFromFilter = extractMultiValues(createdByRaw, 'userId');

    let createdBy;
    if (createdByAllSelected) {
        createdBy = '';
    } else if (myCommunicationsOnly) {
        const uidStr = userId != null ? String(userId) : '';
        const selectedOthers = uniqCommaSeparatedIds(createdByFromFilter)
            .split(',')
            .filter(Boolean)
            .filter((id) => id !== uidStr);
        createdBy = uidStr ? [uidStr, ...selectedOthers].join(',') : uniqCommaSeparatedIds(createdByFromFilter);
    } else {
        createdBy = uniqCommaSeparatedIds(createdByFromFilter);
    }

    return {
        sortBy: resolveSortByFromAdvanceFilters(filters, previousSortBy),
        deliveryMethod: multiSelectPayloadValue(f('delivery_type'), filters.delivery_type?.rawValue, 'id'),
        communicationType: multiSelectPayloadValue(
            f('communication_type'),
            filters.communication_type?.rawValue,
            'attributename',
        ),
        createdBy,
        tags: (multiSelectPayloadValue(f('tags'), filters.tags?.rawValue, 'tags') || '').trim(),
        productCategoryId: multiSelectPayloadValue(
            f('product_type'),
            filters.product_type?.rawValue,
            'categoryname',
        ),
        statusId: statusAdvanceSearchPayloadValue(f('status'), statusItems),
    };
};