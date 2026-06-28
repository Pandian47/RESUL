
export const getAccessStatus = (isEditable, permissions) => {
    const { updateAccess, viewAccess } = permissions || {};
    if (isEditable && updateAccess) {
        return true;
    }
    if (!isEditable && viewAccess) {
        return true;
    }
    return false;
};

export const deleteReducer = (state, action) => {
    const { type, payload } = action;
    switch (type) {
        case 'UPDATE_DELETE_CONFIRMATION':
            return {
                ...state,
                securityGroupId: payload.securityGroupId,
                index: payload.index,
                isDelete: payload.isDelete,
            };
        case 'UPDATE_DELETE':
            return {
                ...state,
                isDelete: payload.isDelete,
            };
    }
};

export const ROLE_PERMISSION_PRIVILEGES = [
    {
        title: 'Dashboard',
        id: 1,
        name: 'dashboard',
        values: [
            {
                label: 'Create',
                status: false,
            },
            {
                label: 'Read',
                status: false,
            },
            {
                label: 'Update',
                status: false,
            },
            {
                label: 'Delete',
                status: false,
            },
        ],
    },
    {
        title: 'Audience',
        id: 2,
        name: 'audience',
        values: [
            {
                label: 'Create',
                status: false,
            },
            {
                label: 'Read',
                status: false,
            },
            {
                label: 'Update',
                status: false,
            },
            {
                label: 'Delete',
                status: false,
            },
        ],
    },
    {
        title: 'Reports',
        id: 3,
        name: 'reports',
        values: [
            {
                label: 'Create',
                status: false,
            },
            {
                label: 'Read',
                status: false,
            },
            {
                label: 'Update',
                status: false,
            },
            {
                label: 'Delete',
                status: false,
            },
        ],
    },
    {
        title: 'Communications',
        name: 'communications',
        id: 4,
        values: [
            {
                label: 'Create',
                status: false,
            },
            {
                label: 'Read',
                status: false,
            },
            {
                label: 'Update',
                status: false,
            },
            {
                label: 'Delete',
                status: false,
            },
        ],
    },
    {
        title: 'Analytics',
        id: 5,
        name: 'analytics',
        values: [
            {
                label: 'Create',
                status: false,
            },
            {
                label: 'Read',
                status: false,
            },
            {
                label: 'Update',
                status: false,
            },
            {
                label: 'Delete',
                status: false,
            },
        ],
    },
    {
        title: 'Form generator',
        id: 6,
        name: 'formgenerator',
        values: [
            {
                label: 'Create',
                status: false,
            },
            {
                label: 'Read',
                status: false,
            },
            {
                label: 'Update',
                status: false,
            },
            {
                label: 'Delete',
                status: false,
            },
        ],
    },
];

export const RolesAndPermissionsGrid = [
    {
        securityGroupId: 4,
        securityGroupName: 'Admin',
    },
    {
        securityGroupId: 5,
        securityGroupName: 'Superuser',
    },
    {
        securityGroupId: 6,
        securityGroupName: 'User',
    },
];

export const FORM_INITIAL_STATE = {
    dashboard: {
        create: false,
        read: false,
        update: false,
        delete: false,
    },
    audience: {
        create: false,
        read: false,
        update: false,
        delete: false,
    },
    reports: {
        create: false,
        read: false,
        update: false,
        delete: false,
    },
    communications: {
        create: false,
        read: false,
        update: false,
        delete: false,
    },
    analytics: {
        create: false,
        read: false,
        update: false,
        delete: false,
    },
    formgenerator: {
        create: false,
        read: false,
        update: false,
        delete: false,
    },
};
export const FORM_UPDATED_STATE = {
    dashboard: {
        create: true,
        read: true,
        update: true,
        delete: true,
    },
    audience: {
        create: true,
        read: true,
        update: true,
        delete: true,
    },
    reports: {
        create: true,
        read: true,
        update: true,
        delete: true,
    },
    communications: {
        create: true,
        read: true,
        update: true,
        delete: true,
    },
    analytics: {
        create: true,
        read: true,
        update: true,
        delete: true,
    },
    formgenerator: {
        create: true,
        read: true,
        update: true,
        delete: true,
    },
};
