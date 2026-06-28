export const buildPayload = ({ formState, payloadData }) => {
    const { mode, securityId } = payloadData;
    const { roleName } = formState;
    const tempRoles = { ...formState };
    delete tempRoles.roleName;
    delete tempRoles.statusAll;

    return {
        securityGroupID: mode === 'new' ? 0 : securityId,
        securityGroupName: roleName.trim(),
        SGroupFeature: formState.permissions.map((permission) => {
            const [create, read, update, deleteAccess] = permission.values;
            return {
                viewAccess: read.status,
                addAccess: create.status,
                updateAccess: update.status,
                deleteAccess: deleteAccess.status,
                featureID: permission.featureID,
            };
        }),
    };
};

export const permissions = [
    {
        featureId: 1,
        featureName: 'Dashboard',
        viewAccess: true,
        addAccess: false,
        updateAccess: false,
        deleteAccess: false,
    },
    {
        featureId: 3,
        featureName: 'Communications',
        viewAccess: true,
        addAccess: true,
        updateAccess: true,
        deleteAccess: true,
    },
    {
        featureId: 4,
        featureName: 'Analytics',
        viewAccess: true,
        addAccess: false,
        updateAccess: false,
        deleteAccess: false,
    },
    {
        featureId: 8,
        featureName: 'My profile',
        viewAccess: true,
        addAccess: false,
        updateAccess: true,
        deleteAccess: false,
    },
    {
        featureId: 9,
        featureName: 'Account settings',
        viewAccess: true,
        addAccess: false,
        updateAccess: true,
        deleteAccess: false,
    },
    {
        featureId: 10,
        featureName: 'Roles & permissions',
        viewAccess: true,
        addAccess: true,
        updateAccess: true,
        deleteAccess: true,
    },
    {
        featureId: 11,
        featureName: 'Companies/Clients',
        viewAccess: true,
        addAccess: true,
        updateAccess: true,
        deleteAccess: false,
    },
    {
        featureId: 12,
        featureName: 'Users',
        viewAccess: true,
        addAccess: true,
        updateAccess: true,
        deleteAccess: true,
    },
    {
        featureId: 13,
        featureName: 'Goals & benchmark',
        viewAccess: true,
        addAccess: true,
        updateAccess: true,
        deleteAccess: false,
    },
    {
        featureId: 15,
        featureName: 'Communication settings',
        viewAccess: true,
        addAccess: true,
        updateAccess: true,
        deleteAccess: false,
    },
    {
        featureId: 16,
        featureName: 'Form generator',
        viewAccess: true,
        addAccess: true,
        updateAccess: true,
        deleteAccess: false,
    },
    {
        featureId: 19,
        featureName: 'Alerts & notifications',
        viewAccess: true,
        addAccess: false,
        updateAccess: false,
        deleteAccess: false,
    },
    {
        featureId: 26,
        featureName: 'Audit log report',
        viewAccess: true,
        addAccess: false,
        updateAccess: false,
        deleteAccess: false,
    },
    {
        featureId: 29,
        featureName: 'Audience analytics 360',
        viewAccess: true,
        addAccess: false,
        updateAccess: false,
        deleteAccess: false,
    },
    {
        featureId: 33,
        featureName: 'Consumptions',
        viewAccess: true,
        addAccess: false,
        updateAccess: true,
        deleteAccess: false,
    },
    {
        featureId: 44,
        featureName: 'Data exchange',
        viewAccess: true,
        addAccess: true,
        updateAccess: true,
        deleteAccess: false,
    },
    {
        featureId: 45,
        featureName: 'Audience score',
        viewAccess: true,
        addAccess: true,
        updateAccess: true,
        deleteAccess: false,
    },
    {   featureId: 46,
        featureName: "Data attributes log",
        addAccess: false,
        deleteAccess: false, 
        updateAccess: true,
        viewAccess: true,
    },
    {
        featureId: 47,
        featureName: 'Add Audience Via Manual upload, CSV, XML',
        viewAccess: true,
        addAccess: true,
        updateAccess: true,
        deleteAccess: false,
    },
    {
        featureId: 48,
        featureName: 'Add Audience Via remote data source or SFTP-FTP',
        viewAccess: true,
        addAccess: true,
        updateAccess: true,
        deleteAccess: false,
    },
    {
        featureId: 49,
        featureName: 'Audience - Target Lists',
        viewAccess: true,
        addAccess: true,
        updateAccess: true,
        deleteAccess: false,
    },
    {
        featureId: 50,
        featureName: 'Audience - Dynamic Lists',
        viewAccess: true,
        addAccess: true,
        updateAccess: true,
        deleteAccess: false,
    },
    {
        featureId: 51,
        featureName: 'Offer Management',
        viewAccess: true,
        addAccess: true,
        updateAccess: true,
        deleteAccess: false,
    },
    {
        featureId: 52,
        featureName: 'Lead Score',
        viewAccess: true,
        addAccess: true,
        updateAccess: true,
        deleteAccess: false,
    },
    {
        featureId: 53,
        featureName: 'Data Attributes',
        viewAccess: true,
        addAccess: true,
        updateAccess: true,
        deleteAccess: false,
    },
    {
        featureId: 54,
        featureName: 'Budget & Planning',
        viewAccess: true,
        addAccess: true,
        updateAccess: true,
        deleteAccess: false,
    },
    {   featureId: 55,
        featureName: "SFTP-FTP",
        addAccess: false,
        deleteAccess: false,
        updateAccess: true,
        viewAccess: true
    }
];

export const getTitle = (name) => {
    switch (name) {
        case 1:
            return {
                title: 'Dashboard',
                // name: 1,
            };
        case 47:
            return {
                title: 'Manual Upload/CSV/XML',
                // name: 47,
            };
        case 48:
            return {
                title: 'RDS/SFTO-FTP',
            };
        case 49:
            return {
                title: 'Target list',
            };
        case 50:
            return {
                title: 'Dynamic list',
            };
        case 3:
            return {
                title: 'Communication',
            };
        case 2:
            return {
                title: 'Audience',
            };
        case 4:
            return {
                title: 'Analytics',
            };
        case 29:
            return {
                title: 'Analytics 360',
            };
        case 26:
            return {
                title: 'Audit log report',
            };
        case 8:
            return {
                title: 'My profile',
            };
        case 9:
            return {
                title: 'Account settings',
            };
        case 12:
            return {
                title: 'Users',
            };
        case 10:
            return {
                title: 'Roles and permissions',
            };
        case 19:
            return {
                title: 'Alerts and notification',
            };
        case 15:
            return {
                title: 'Communication settings',
            };
        case 13:
            return {
                title: 'Goals and benchmark',
            };
        case 51:
            return {
                title: 'Offer management',
            };
        case 52:
            return {
                title: 'Lead score',
            };
        case 53:
            return {
                title: 'Data attributes',
            };
        case 16:
            return {
                title: 'Form generator',
            };
        case 44:
            return {
                title: 'Data exchange',
            };
        case 54:
            return {
                title: 'Budget and planning',
            };
        case 33:
            return {
                title: 'Consumptions',
            };
        case 11:
            return {
                title: 'Companies/Clients',
            };
        case 24:
            return {
                title: 'Invoices',
            };
        case 25:
            return {
                title: 'License info',
            };
        case 43:
            return {
                title: 'Data catalog',
            };
        case 45:
            return {
                title: 'Audience score',
            };
    }
};
