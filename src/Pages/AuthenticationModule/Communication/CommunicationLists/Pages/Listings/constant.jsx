import { CHANNELS_LIST, STATUS_LIST } from 'Utils/modules/communicationChannels';
import { getCommunicationType } from 'Utils/modules/communicationStatus';
import { getDateFormat, getDateWithDaynoFormat, getYYMMDD } from 'Utils/modules/dateTime';
import { numberWithCommas } from 'Utils/modules/formatters';
import CommunicationListRowCell from './Components/CommunicationListRowCell';
import CommunicationListDetail from './Components/CommunicationListDetail';

import _get from 'lodash/get';
import uniqBy from 'lodash/uniqBy';
import { isEntireMultiSelectChosen } from 'Components/AdvanceSearchNew';
import { LAST30DAYS_DATEFILTER } from 'Constants/GlobalConstant/Regex';
import { updateQREnableTab, updateTab } from 'Reducers/communication/createCommunication/Create/reducer';

/** QR (3), Web analytics (6), App analytics (16), Paid media (10), Direct mail (33) — not eligible for Sent by channel. */
export const SENT_BY_CHANNEL_NOT_ELIGIBLE_CHANNEL_IDS = [3, 6, 16, 10, 33,7];

export const getSentByChannelDisplay = (channelId, sentCount) => {
    if (SENT_BY_CHANNEL_NOT_ELIGIBLE_CHANNEL_IDS.includes(Number(channelId))) {
        return '';
    }
    if (sentCount == null || sentCount === '') {
        return 'N/A';
    }
    return numberWithCommas(sentCount);
};

export const CommunicationListRowComponent = (props, requestPayload, setRequestPayload, setCampaignData) => {
    return <CommunicationListRowCell {...props} requestPayload = {requestPayload} setCampaignData={setCampaignData} />;
};

export const GridDetailComponent = (props, disabled, onCollapse) => {
    // console.log('Data item :::: ', props);
    return <CommunicationListDetail {...props} disabled={disabled} onCollapse={onCollapse} />;
};

export const advanceSearchAvailableChannels = (channels) => {
    let notAvailableChannels = [4,5,13,15,26,30,34];
    return channels.filter(channel => !notAvailableChannels.includes(channel.id));
};

export const advanceSearchStatusList = (statusList) => {
    let notAvailableStatus = [3];
    return statusList.filter(status => !notAvailableStatus.includes(status.id));
};

/** Communication analytics Status filter only — listing keeps full `advanceSearchStatusList`. Order: Completed, In progress, Archived. */
export const ANALYTICS_ADVANCE_SEARCH_STATUS_IDS_IN_ORDER = [9, 5, 70];

export const SEARCH_CONFIG = ({ userId = 0, productType, communicationType, tags, users }) => [
    {
        type: 'input',
        label: 'Communication name',
        config: {
            name: 'communication_name',
            maxlength: '50',
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
            data: advanceSearchStatusList(STATUS_LIST)?.map((list)=>list?.label),
            // data: ['In progress', 'Paused', 'Scheduled', 'Completed', 'Alert', 'Multi status', 'Draft', 'Archived'],
        },
    },
    {
        type: 'dropdown',
        label: 'Channel type',
        fieldKey: 'lable',
        config: {
            name: 'channel_type',
            //data: ['Email', 'Messaging', 'Notification', 'QR code', 'SMS', 'Voice'],
            data: advanceSearchAvailableChannels(uniqBy(CHANNELS_LIST, 'lable')),
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
    channel_type: '',
    tags: '',
    start_date: '',
    end_date: '',
};

export const initialDataState = {
    skip: 0,
    take: 5,
};

export const pagerSettings = {
    info: true,
    pageSizes: [5, 10, 20],
    previousNext: true,
    buttonCount: 4,
    className: 'rs-kendo-pager',
};

/** API expects integer sortBy; default / no selection = 0 (shared by listing + communication analytics). */
export const normalizeListingSortBy = (sortBy) => {
    if (sortBy === undefined || sortBy === null || sortBy === '') return 0;
    const n = Number(sortBy);
    return Number.isFinite(n) ? n : 0;
};

/**
 * Reads sort from advance-search filters when `sort_type` is present; otherwise keeps `previousSortBy`
 * (avoids resetting to 0 when `onFiltersChange` omits `sort_type` while other filters update).
 */
export const resolveSortByFromAdvanceFilters = (filters = {}, previousSortBy) => {
    const hasSortKey =
        filters &&
        typeof filters === 'object' &&
        Object.prototype.hasOwnProperty.call(filters, 'sort_type') &&
        filters.sort_type != null;
    if (hasSortKey) {
        const raw = filters.sort_type.rawValue;
        let n;
        if (raw != null && typeof raw === 'object') {
            const candidate = raw.id ?? raw;
            n = Number(candidate);
        } else {
            n = Number(raw);
        }
        if (Number.isFinite(n)) {
            return normalizeListingSortBy(n);
        }
    }
    const fallbackSort =
        previousSortBy === undefined || previousSortBy === null || previousSortBy === ''
            ? DEFAULT_COMMUNICATION_LIST_SORT_BY
            : previousSortBy;
    return normalizeListingSortBy(fallbackSort);
};

const defaultCommunicationListTimeZoneId = () => getDateFormat().timeZoneId ?? 0;

export const buildPayload = (payload = {}, dup, options = {}) => {
    const date = new Date();
    const start = getDateWithDaynoFormat(LAST30DAYS_DATEFILTER);
    const {
        clientId,
        userId,
        departmentId = 0,
        startDate = getYYMMDD(start),
        endDate = getYYMMDD(new Date()),
        pageSize = 5,
        index = 1,
        createdBy = '',
        name = '',
        deliveryMethod = '',
        communicationType = '',
        totalRows,
        statusId,
        channelType,
        tags,
        productCategoryId,
        /** Analytics summary API: comma-separated category ids (listing uses `productCategoryId` / names). */
        productType,
        sortBy,
        timezoneId: timezoneIdFromPayload,
        timezoneid: timezoneidFromPayload,
    } = payload;
    const timezoneResolved =
        timezoneidFromPayload ?? timezoneIdFromPayload ?? defaultCommunicationListTimeZoneId();
    const base = {
        userId,
        departmentId,
        clientId,
        startDate: startDate || getYYMMDD(start),
        endDate: endDate || getYYMMDD(new Date()),
        pageSize: totalRows ? totalRows : pageSize,
        index,
        createdBy,
        name: dup ? name : '',
        deliveryMethod: deliveryMethod ? getDeliveryMethod(deliveryMethod) : '',
        communicationType: communicationType ?? '',
        statusId: statusId ?? '',
        channelType:
            channelType === undefined || channelType === null || channelType === 0 ? '' : channelType,
        tags: tags ?? '',
        productCategoryId: productCategoryId ?? '',
        sortBy: normalizeListingSortBy(sortBy),
        timezoneid: timezoneResolved,
    };
    if (productType !== undefined) {
        base.productType = productType == null || productType === 0 ? '' : String(productType);
    }
    return base;
};

export const getDeliveryMethod = (text = '') => {
    if (!text) return '';
    return text
        .split(',')
        .map((part) => {
            const trimmed = part.trim();
            const lower = trimmed.toLowerCase();
            if (lower === 's' || lower.includes('single')) return 'S';
            if (lower === 'm' || lower.includes('multi')) return 'M';
            if (lower === 't' || lower === 'e' || lower.includes('trigger') || lower.includes('event')) return 'T';
            return trimmed;
        })
        .filter(Boolean)
        .join(',');
};

export const buildPayloadListingApi = (initalPayload, updatePayload) => {
    return {
        userId: updatePayload?.userId ?? initalPayload?.userId,
        departmentId: updatePayload?.departmentId ?? initalPayload?.departmentId,
        clientId: updatePayload?.clientId ?? initalPayload?.clientId,
        startDate: updatePayload?.startDate ?? initalPayload?.startDate,
        endDate: updatePayload?.endDate ?? initalPayload?.endDate,
        pageSize: updatePayload?.pageSize ?? initalPayload?.pageSize,
        index: updatePayload?.index ?? initalPayload?.index,
        createdBy: updatePayload?.createdBy ?? initalPayload?.createdBy,
        name:
            Object.keys(updatePayload)?.length === 0 && !updatePayload?.name
                ? ''
                : updatePayload?.name ?? initalPayload?.name,
        deliveryMethod:
            updatePayload?.deliveryMethod ?? initalPayload?.deliveryMethod
                ? getDeliveryMethod(updatePayload?.deliveryMethod ?? initalPayload?.deliveryMethod)
                : '',
        communicationType:
            updatePayload?.communicationType ?? initalPayload?.communicationType 
                ?? '',
        statusId: (updatePayload?.statusId || initalPayload?.statusId) ?? 0,
        channelType: (() => {
            const c = updatePayload?.channelType ?? initalPayload?.channelType;
            return c === undefined || c === null || c === 0 ? '' : c;
        })(),
        tags: updatePayload?.tags ?? initalPayload?.tags ?? '',
        productCategoryId: updatePayload?.productCategoryId ?? initalPayload?.productCategoryId ?? '',
        sortBy: normalizeListingSortBy(updatePayload?.sortBy ?? initalPayload?.sortBy),
        timezoneid:
            updatePayload?.timezoneid ??
            updatePayload?.timezoneId ??
            initalPayload?.timezoneid ??
            initalPayload?.timezoneId ??
            defaultCommunicationListTimeZoneId(),
    };
};

export const handleQrTypeTab = (qrContent,dispatch) => {
    if (qrContent) {
        const getQrTypeName = (type) => {
            const urlType = {
                name: 'url',
                currentIndex: 0,
            };
            switch (type) {
                case 'W':
                    return urlType;
                case 'S':
                    return {
                        name: 'sms',
                        currentIndex: 4,
                    };
                default:
                    return urlType;
            }
        };
        dispatch(
            updateTab({
                field: 'qr',
                data: {
                    tabName: getQrTypeName(qrContent.qRType)?.name,
                    currentIndex: getQrTypeName(qrContent.qRType)?.currentIndex,
                },
            }),
        );
        dispatch(
            updateQREnableTab({
                tabName: getQrTypeName(qrContent.qRType)?.name,
                refreshStatus: true,
            }),
        );
    }
};


export const handleFinalStatusPayload = (statusList) => {
    if (!statusList) return '';
    const list = Array.isArray(statusList) ? statusList : [statusList];
    return STATUS_LIST?.filter((status) => list.includes(status?.label)).map((item) => item?.id)?.join(',') ?? '';
};

export const SORT_TYPE_DATA = [
    { id: 1, name: 'Created: Newest first' },
    { id: 2, name: 'Created: Oldest first' },
    { id: 3, name: 'A-Z' },
    { id: 4, name: 'Z-A' },
];

/** Default API sort — "Created: Newest first" (must match SORT_TYPE_DATA[0].id). */
export const DEFAULT_COMMUNICATION_LIST_SORT_BY = 1;

export const DELIVERY_TYPE_DATA = [
    { id: 'S', name: 'Single dimension' },
    { id: 'M', name: 'Multi dimension' },
    { id: 'T', name: 'Event trigger' },
];

export const extractMultiValues = (items, key) => {
    if (!Array.isArray(items) || !items.length) return '';
    const parts = items
        .filter((item) => item != null && !item?.isAll)
        .map((item) => {
            if (typeof item === 'object') {
                return _get(item, key, '');
            }
            return item;
        })
        .filter((v) => v !== '' && v !== null && v !== undefined)
        .map(String);
    return [...new Set(parts)].join(',');
};

/** Dedupe comma-separated ids (preserves order, first occurrence wins). */
export const uniqCommaSeparatedIds = (value) => {
    if (value == null || value === '') return '';
    const seen = new Set();
    const out = [];
    for (const part of String(value).split(',')) {
        const id = part.trim();
        if (!id || seen.has(id)) continue;
        seen.add(id);
        out.push(id);
    }
    return out.join(',');
};

export const extractProductCategoryIdsForAnalyticsApi = (filterEntry, rawValue) => {
    if (!filterEntry) {
        return extractMultiValues(rawValue, 'categoryId');
    }
    const direct = multiSelectPayloadValue(filterEntry, rawValue, 'categoryId');
    if (direct) {
        return direct;
    }
    if (!Array.isArray(rawValue) || !rawValue.length) {
        return '';
    }
    if (isEntireMultiSelectChosen(filterEntry, rawValue)) {
        return '';
    }
    const data = filterEntry.data || [];
    const idKeys = ['categoryId', 'categoryID', 'CategoryId', 'typeId', 'productTypeId'];
    const nameOf = (row) => {
        if (row != null && typeof row !== 'object') {
            return String(row).trim().toLowerCase();
        }
        return String(_get(row, 'categoryname', '') || _get(row, 'categoryName', ''))
            .trim()
            .toLowerCase();
    };
    const idOfRow = (row) => {
        if (!row || typeof row !== 'object') return '';
        for (const k of idKeys) {
            const v = _get(row, k);
            if (v !== undefined && v !== null && v !== '') {
                return String(v);
            }
        }
        return '';
    };
    const parts = [];
    for (const item of rawValue) {
        if (item == null || item?.isAll) continue;
        let id = idOfRow(item);
        if (!id) {
            const nm = nameOf(item);
            if (!nm) continue;
            const row = find((r) => nameOf(r) === nm);
            if (row) {
                id = idOfRow(row);
            }
        }
        if (id) {
            parts.push(id);
        } else if (item != null && typeof item !== 'object') {
            parts.push(String(item));
        }
    }
    return [...new Set(parts)].join(',');
};

const isNumericAttributeId = (v) => {
    if (v === undefined || v === null || v === '') return false;
    const s = String(v).trim();
    return /^-?\d+$/.test(s) && s !== '0';
};

/**
 * Analytics summary: comma-separated communication attribute ids.
 * Some APIs put the **display name** in `campaignAttributeId`; only treat **numeric** values as ids, else resolve by `attributename` against `filterEntry.data`.
 */
export const extractCommunicationAttributeIdsForAnalyticsApi = (filterEntry, rawValue) => {
    if (!filterEntry || !Array.isArray(rawValue) || !rawValue.length) {
        return '';
    }
    if (isEntireMultiSelectChosen(filterEntry, rawValue)) {
        return '';
    }
    const data = filterEntry.data || [];
    const idKeys = [
        'campaignAttributeId',
        'CampaignAttributeId',
        'CampaignAttributeID',
        'campaign_attribute_id',
        'communicationTypeId',
        'CommunicationTypeId',
        'attributeId',
        'AttributeId',
        'id',
        'ID',
    ];
    const nameOf = (row) => {
        if (row != null && typeof row !== 'object') {
            return String(row).trim().toLowerCase();
        }
        return String(
            _get(row, 'attributename', '') ||
                _get(row, 'attributeName', '') ||
                _get(row, 'AttributeName', '') ||
                _get(row, 'name', '') ||
                _get(row, 'Name', ''),
        )
            .trim()
            .toLowerCase();
    };
    const numericIdOfRow = (row) => {
        if (!row || typeof row !== 'object') return '';
        for (const k of idKeys) {
            const v = _get(row, k);
            if (isNumericAttributeId(v)) {
                return String(v).trim();
            }
        }
        return '';
    };
    const parts = [];
    for (const item of rawValue) {
        if (item == null || item?.isAll) continue;
        let id = numericIdOfRow(item);
        if (!id) {
            const nm = nameOf(item);
            if (!nm || nm === 'all') continue;
            const row = find((r) => nameOf(r) === nm);
            if (row) {
                id = numericIdOfRow(row);
            }
        }
        if (!id) {
            const nm = nameOf(item);
            if (nm && nm !== 'all') {
                const fromCatalog = getCommunicationType(nm, { communicationType: data });
                if (isNumericAttributeId(fromCatalog)) {
                    id = String(fromCatalog).trim();
                } else {
                    /** Prefix map in `getCommunicationType` when catalog rows omit numeric ids. */
                    const legacy = getCommunicationType(nm, { communicationType: [] });
                    if (legacy != null && legacy !== 0 && isNumericAttributeId(legacy)) {
                        id = String(legacy).trim();
                    }
                }
            }
        }
        if (id) {
            parts.push(id);
        } else if (item != null && typeof item !== 'object') {
            parts.push(String(item));
        }
    }
    return [...new Set(parts)].join(',');
};

/** When every option in a multi-select is chosen, API expects `''` (no narrowing). */
export const multiSelectPayloadValue = (filterEntry, rawValue, extractKey) => {
    if (!Array.isArray(rawValue) || !rawValue.length) {
        return extractMultiValues(rawValue, extractKey);
    }
    if (filterEntry && isEntireMultiSelectChosen(filterEntry, rawValue)) {
        return '';
    }
    return extractMultiValues(rawValue, extractKey);
};

/** Status multi-select: same “all selected → empty string” rule as `multiSelectPayloadValue`. */
export const statusAdvanceSearchPayloadValue = (statusFilterEntry, rawLabels) => {
    const raw = Array.isArray(rawLabels) && rawLabels.length ? rawLabels : [];
    if (!raw.length) {
        return handleFinalStatusPayload([]);
    }
    if (statusFilterEntry && isEntireMultiSelectChosen(statusFilterEntry, raw)) {
        return '';
    }
    return handleFinalStatusPayload(raw);
};

export const buildSearchPayload = ({
    filters = {},
    restPayload = {},
    name = '',
    departmentId,
    clientId,
    userId,
    pageSize,
    overrides = {},
    /** When true, list is scoped to the current user (communication listing; replaces removed “Show” filter). */
    myCommunicationsOnly = true,
    /** Full array from `buildAdvanceFilterConfig` — used to detect “All” for multi-selects (empty string in API). */
    advanceFilterConfig = null,
    /**
     * **Analytics only**: send `productType` as comma-separated `categoryId` values.
     * Omit on listing — listing keeps `productCategoryId` from `categoryname`.
     */
    productFilterUsesTypeIds = false,
    /**
     * **Analytics only** (e.g. communication analytics page): send `communicationType` as comma-separated attribute ids.
     * Omit on communication **listing** — listing APIs keep `attributename` (display names).
     */
    communicationTypeUsesAttributeIds = false,
}) => {
    const advanceFilters = Array.isArray(advanceFilterConfig) ? advanceFilterConfig : [];
    const createdByFilterEntry = advanceFilters.find((f) => f.key === 'created_by');
    const communicationTypeFilterEntry = advanceFilters.find((f) => f.key === 'communication_type');
    const channelTypeFilterEntry = advanceFilters.find((f) => f.key === 'channel_type');
    const deliveryTypeFilterEntry = advanceFilters.find((f) => f.key === 'delivery_type');
    const productTypeFilterEntry = advanceFilters.find((f) => f.key === 'product_type');
    const tagsFilterEntry = advanceFilters.find((f) => f.key === 'tags');
    const statusFilterEntry = advanceFilters.find((f) => f.key === 'status');
    const createdByFromFilter = extractMultiValues(filters.created_by?.rawValue, 'userId');
    const createdBySelectAllLabel = createdByFilterEntry?.selectAllTagLabel ?? 'All communications';
    /** Chip text matches “select all” label — API must get `''`, same as full multiselect match. */
    const createdByAllSelectedByDisplay =
        createdByFilterEntry && filters?.created_by?.displayValue === createdBySelectAllLabel;
    const createdByAllSelected =
        createdByAllSelectedByDisplay ||
        (createdByFilterEntry &&
            Array.isArray(filters?.created_by?.rawValue) &&
            filters.created_by.rawValue.length &&
            isEntireMultiSelectChosen(createdByFilterEntry, filters.created_by.rawValue));
    const hasShowKey = filters && Object.prototype.hasOwnProperty.call(filters, 'show');
    const showRaw = hasShowKey ? filters.show?.rawValue : undefined;
    let showUserId;
    if (hasShowKey && showRaw != null) {
        showUserId = showRaw.id;
    } else if (createdByAllSelected) {
        showUserId = 0;
    } else {
        showUserId = myCommunicationsOnly ? userId : 0;
    }

    let createdByForApi;
    if (createdByAllSelected) {
        createdByForApi = '';
    } else if (!hasShowKey && myCommunicationsOnly) {
        const selectedOthers = uniqCommaSeparatedIds(createdByFromFilter)
            .split(',')
            .filter(Boolean)
            .filter((id) => id !== String(userId));
        createdByForApi = [String(userId), ...selectedOthers].join(',');
    } else if (!hasShowKey && !myCommunicationsOnly) {
        createdByForApi = uniqCommaSeparatedIds(createdByFromFilter);
    } else {
        createdByForApi = uniqCommaSeparatedIds(createdByFromFilter);
    }

    const communicationTypeAllSelected =
        communicationTypeFilterEntry &&
        Array.isArray(filters?.communication_type?.rawValue) &&
        filters.communication_type.rawValue.length &&
        isEntireMultiSelectChosen(communicationTypeFilterEntry, filters.communication_type.rawValue);
    const communicationTypeForApi = communicationTypeUsesAttributeIds
        ? extractCommunicationAttributeIdsForAnalyticsApi(
              communicationTypeFilterEntry,
              filters.communication_type?.rawValue,
          )
        : communicationTypeAllSelected
          ? ''
          : extractMultiValues(filters.communication_type?.rawValue, 'attributename');

    const channelTypeFromFilter = extractMultiValues(filters.channel_type?.rawValue, 'id');
    const channelTypeAllSelected =
        channelTypeFilterEntry &&
        Array.isArray(filters?.channel_type?.rawValue) &&
        filters.channel_type.rawValue.length &&
        isEntireMultiSelectChosen(channelTypeFilterEntry, filters.channel_type.rawValue);
    const channelTypeForApi = channelTypeAllSelected ? '' : channelTypeFromFilter;

    const productCategoryIdForApi = productFilterUsesTypeIds
        ? ''
        : multiSelectPayloadValue(
              productTypeFilterEntry,
              filters.product_type?.rawValue,
              'categoryname',
          );
    const productTypeIdsForApi = productFilterUsesTypeIds
        ? extractProductCategoryIdsForAnalyticsApi(
              productTypeFilterEntry,
              filters.product_type?.rawValue,
          )
        : undefined;

    /** Analytics only: drop stale `communicationType` names from `restPayload` before merging computed ids. */
    const restPayloadForBuild = communicationTypeUsesAttributeIds
        ? (() => {
              const { communicationType: _staleCommunicationType, ...r } = restPayload || {};
              return r;
          })()
        : restPayload;

    const nameFromAdvanceFilter = String(
        filters?.communication_name?.rawValue ?? filters?.communication_name?.displayValue ?? '',
    ).trim();
    const effectiveName = nameFromAdvanceFilter || String(name ?? '').trim();

    return buildPayload(
        {
            ...restPayloadForBuild,
            name: effectiveName,
            sortBy: resolveSortByFromAdvanceFilters(filters, restPayload.sortBy),
            deliveryMethod: multiSelectPayloadValue(
                deliveryTypeFilterEntry,
                filters.delivery_type?.rawValue,
                'id',
            ),
            communicationType: communicationTypeForApi,
            productCategoryId: productCategoryIdForApi,
            ...(productFilterUsesTypeIds ? { productType: productTypeIdsForApi ?? '' } : {}),
            statusId: statusAdvanceSearchPayloadValue(statusFilterEntry, filters.status?.rawValue),
            channelType: channelTypeForApi,
            createdBy: createdByForApi,
            tags: multiSelectPayloadValue(tagsFilterEntry, filters.tags?.rawValue, 'tags'),
            departmentId,
            clientId,
            userId: showUserId,
            index: 1,
            pageSize,
            ...overrides,
        },
        true,
    );
};

export const buildClearPayload = ({
    departmentId,
    clientId,
    userId,
    pageSize,
    startDate,
    endDate,
    /** Communication listing: default “My communications” sends current user id in createdBy. */
    listingDefaultScopeCreatedBy = false,
}) => ({
    name: '',
    sortBy: normalizeListingSortBy(DEFAULT_COMMUNICATION_LIST_SORT_BY),
    deliveryMethod: '',
    startDate,
    endDate,
    createdBy: listingDefaultScopeCreatedBy ? String(userId) : '',
    communicationType: '',
    departmentId,
    clientId,
    userId,
    index: 1,
    pageSize: pageSize ?? 5,
    channelType: '',
    tags: '',
    statusId: '',
    productCategoryId: '',
    timezoneid: defaultCommunicationListTimeZoneId(),
});

export const buildAdvanceFilterConfig = (
    options,
    userId,
    { restrictStatusToAnalytics = false, myCommunicationsOnly = false } = {},
) => {
    const listingStatusList = advanceSearchStatusList(STATUS_LIST);
    const statusListForFilter = restrictStatusToAnalytics
        ? ANALYTICS_ADVANCE_SEARCH_STATUS_IDS_IN_ORDER.map((id) =>
              listingStatusList.find((s) => s.id === id),
          ).filter(Boolean)
        : listingStatusList;

    const usersList = myCommunicationsOnly
        ? (options.users || []).filter((u) => Number(u.userId) === Number(userId))
        : (options.users || []);

    return [
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
    {
        key: 'delivery_type',
        label: 'Delivery type',
        data: DELIVERY_TYPE_DATA,
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
        data: statusListForFilter.map((list) => list.label),
        isObject: false,
        isMulti: true,
    },
    {
        key: 'channel_type',
        label: 'Channel type',
        data: advanceSearchAvailableChannels(uniqBy(CHANNELS_LIST, 'lable')),
        isObject: true,
        fieldKey: 'lable',
        isMulti: true,
    },
    {
        key: 'created_by',
        label: 'Created by',
        data: usersList,
        isObject: true,
        fieldKey: 'firstName',
        /** Identity for selection + payload; avoids duplicate names collapsing into one row. */
        itemKey: 'userId',
        isMulti: true,
        hideSelectAllRow: true,
        /** Chip / payload when every user is selected (manual select-all). */
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
};