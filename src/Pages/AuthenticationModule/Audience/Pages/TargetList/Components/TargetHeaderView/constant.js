export const LISTS = [
    'All list',
    'My list',
    'Ad-hoc list',
    'Match input list',
    'Seed list',
    'Suppression input list',
    'Target list',
    // 'Hash match list',
    // 'Hash adhoc list',
    // 'Auto cluster list',
    // 'Auto adhoc match list',
    'ReTarget list',
];

export const SEARCH_CONFIG_AUDIENCE = (userList) => {
    return [
        {
            type: 'mutliselect_api',
            label: 'List name',
            config: {
                name: 'list_name',
            },
            filterKey: 'listName'
        },
        {
            type: 'multiselect',
            label: 'Created by',
            config: {
                name: 'created_by',
                data: userList,
            },
        },
        {
            type: 'multiselect',
            label: 'List type',
            config: {
                name: 'list_type',
                data: LISTS,
            },
        },
        {
            type: 'multiselect',
            label: 'Approval status',
            config: {
                name: 'approval_status',
                data: ['Pending', 'Approved', 'Rejected'],
            },
        },
        {
            type: 'datepicker',
            label: 'From',
            config: {
                name: 'start_date',
            },
        },
        {
            type: 'datepicker',
            label: 'To',
            config: {
                name: 'end_date',
            },
        },
    ];
};

export const SEARCH_FORM_STATE_AUDIENCE = {
    list_name: '',
    created_by: '',
    list_type: '',
    approval_status: '',
    start_date: '',
    end_date: '',
};

export const getListType = (type) => {
    switch (type) {
        case 'All list':
            return 0;
        case 'My list':
            return 0;
        case 'Ad-hoc list':
            return 1;
        case 'Match list':
        case 'Match input list':
            return 2;
        case 'Seed list':
            return 3;
        case 'Suppression list':
        case 'Suppression input list':   
            return 4;
        case 'Target list':
            return 5;
        case 'Hash match list':
            return 6;
        case 'Hash adhoc list':
            return 7;
        case 'Auto clustor list':
            return 8;
        case 'Auto adhoc match list':
            return 9;
        case 'ReTarget list':
            return 10;
        case 'Zero day communication list':
            return 11;
        case 'BQ zero day communication list':
            return 12;
        default:
            return '';
    }
};

export const getApprovalStatus = (type) => {
    switch (type) {
        case 'Pending':
            return 0;
        case 'Approved':
            return 1;
        case 'Rejected':
            return 2;
        default:
            return '';
    }
};

export const getStatus = (type) => {
    switch (type) {
        case 'Archived':
            return 'archived';
        case 'Unarchived':
            return 'unarchived';
        case 'Used':
            return 'used';
        case 'Not used':
            return 'notused';  
        default:
            return '';
    }
};

export const CreateList = [
    {
        name: 'Create segment',
        link: '/audience/create-target-list',
        type: 'target-list',
        queryState: {
            mode: 'add',
        },
        isQuery: false,
    },
    {
        name: 'Create ad-hoc list',
        link: '/audience/add-audience',
        type: 'adhoc-list',
        queryState: {
            type: 'adhoc-list',
            from: 'targetList',
        },
        isQuery: true,
    },
    {
        name: 'Create seed list',
        link: '/audience/add-audience',
        type: 'seed-list',
        queryState: {
            type: 'seed-list',
            from: 'targetList',
        },
        isQuery: true,
    },
    // {
    //     name: 'Create match list',
    //     link: '/audience/add-audience',
    //     type: 'match-list',
    //     queryState: {
    //         type: 'match-list',
    //         from: 'targetList',
    //     },
    //     isQuery: true,
    // },
    // {
    //     name: 'Create suppression list',
    //     link: '/audience/add-audience',
    //     type: 'suppression-list',
    //     queryState: {
    //         type: 'suppression-list',
    //         from: 'targetList',
    //     },
    //     isQuery: true,
    // },
];
