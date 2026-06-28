export const DYNAMIC_LIST_TYPE_OPTIONS = ['All list', 'My list'];

export const SEARCH_CONFIG_AUDIENCE = (userList) => {
    return [
        {
            type: 'mutliselect_api',
            label: 'List name',
            config: {
                name: 'list_name',
            },
            filterKey: 'listName',
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
                data: ['All list', 'My list'],
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
