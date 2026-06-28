/**
 * Audience listing advance-search defaults — no AdvanceSearch / Placeholders barrel imports.
 * Mirrors Constants/AdvanceSearch audience-specific exports for the audience production chunk.
 */

export const AUDIENCE_SORT_TYPE_OPTIONS = [
    { id: 1, name: 'Created: Newest first' },
    { id: 2, name: 'Created: Oldest first' },
    { id: 3, name: 'A-Z' },
    { id: 4, name: 'Z-A' },
];

export const AUDIENCE_DEFAULT_SORT_TYPE_VALUE = {
    displayValue: 'Created: Newest first',
    rawValue: AUDIENCE_SORT_TYPE_OPTIONS[0],
};

export const COMMUNICATION_ADVANCE_SEARCH_EXCLUDE_NAME_CHIP_KEYS = ['communication_name'];

export const AUDIENCE_APPROVAL_STATUS_OPTIONS = ['Pending', 'Approved', 'Rejected'];
export const AUDIENCE_STATUS_OPTIONS = ['All', 'Archived', 'Unarchived', 'Used', 'Not used'];

export const AUDIENCE_DEFAULT_INITIAL_ACTIVE_FILTERS = {
    sort_type: AUDIENCE_DEFAULT_SORT_TYPE_VALUE,
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
            data: AUDIENCE_SORT_TYPE_OPTIONS,
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
