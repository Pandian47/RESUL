export const SORT_TYPE_ADVANCE_FILTER_OPTIONS = [
    { id: 1, name: 'Created: Newest first' },
    { id: 2, name: 'Created: Oldest first' },
    { id: 3, name: 'A-Z' },
    { id: 4, name: 'Z-A' },
];

/** API / advance-search default: "Created: Newest first". */
export const DEFAULT_ADVANCE_SEARCH_SORT_BY_ID = 1;

/** Single-select sort chip + `rawValue` for RSAdvanceSearchNew (shared by listing, analytics, audience). */
export const DEFAULT_SORT_TYPE_ADVANCE_FILTER_VALUE = {
    displayValue: 'Created: Newest first',
    rawValue: SORT_TYPE_ADVANCE_FILTER_OPTIONS[0],
};

/** Communication List tab: default sort in advance search when nothing is persisted (default sort is not shown as a chip). */
export const COMMUNICATION_LISTING_DEFAULT_INITIAL_ACTIVE_FILTERS = {
    sort_type: DEFAULT_SORT_TYPE_ADVANCE_FILTER_VALUE,
};

/**
 * `RSAdvanceSearchNew` `excludeActiveFilterTagKeys`: main-bar name search stays plain text
 * (no “Communication name: …” / “List name: …” chip). `activeFilters.communication_name` still syncs for API.
 */
export const COMMUNICATION_ADVANCE_SEARCH_EXCLUDE_NAME_CHIP_KEYS = ['communication_name'];

export const AUDIENCE_APPROVAL_STATUS_OPTIONS = ['Pending', 'Approved', 'Rejected'];
export const AUDIENCE_STATUS_OPTIONS = ['All', 'Archived', 'Unarchived', 'Used', 'Not used'];

/** Default sort only — no default “List type: My list” chip; scope is chosen in the advanced panel when needed. */
export const AUDIENCE_DEFAULT_INITIAL_ACTIVE_FILTERS = {
    sort_type: DEFAULT_SORT_TYPE_ADVANCE_FILTER_VALUE,
};

export function buildAudienceListAdvanceFilterConfig({ listTypeOptions = [], createdByFirstNames = [] }) {
    return [
        {
            key: 'communication_name',
            label: 'List name',
            type: 'input',
            data: [],
        },
        {
            key: 'sort_type',
            label: 'Sort type',
            data: SORT_TYPE_ADVANCE_FILTER_OPTIONS,
            isObject: true,
            fieldKey: 'name',
            idKey: 'id',
        },
        {
            key: 'list_type',
            label: 'List type',
            data: listTypeOptions,
            isObject: false,
            fieldKey: 'name',
            isMulti: true,
            selectAllTagLabel: 'All list',
        },
        {
            key: 'approval_status',
            label: 'Approval status',
            data: [...AUDIENCE_APPROVAL_STATUS_OPTIONS],
            isObject: false,
            fieldKey: 'name',
            isMulti: true,
        },
        {
            key: 'status',
            label: 'Status',
            data: [...AUDIENCE_STATUS_OPTIONS],
            isObject: false,
            fieldKey: 'name',
            isMulti: true,
        },
        {
            key: 'created_by',
            label: 'Created by',
            data: createdByFirstNames,
            isObject: false,
            fieldKey: 'name',
            isMulti: true,
            hideSelectAllRow: true,
        },
    ];
}

export const ANALYTICS_DELIVERY_TYPE_FILTER_DATA = [
    { id: '', name: 'All', isAll: true },
    { id: 'S', name: 'Single dimension' },
    { id: 'M', name: 'Multi dimension' },
    { id: 'T', name: 'Event trigger' },
];

