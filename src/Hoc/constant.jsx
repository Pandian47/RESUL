export const userRolePermissions = (permissions) => {
    const path = location.pathname;
    const pathname = path.split('/').filter(Boolean);
    const pageName = pathname[pathname?.length - 1];
    if (Object.keys(permissions)?.length) {
        const getPermission = (index) => permissions?.[index] ?? null;
        switch (pageName) {
            case 'dashboard':
                return getPermission(1);
            case 'audience':
                return getPermission(49);
            case 'create-target-list':
                return getPermission(49);
            case 'create-dynamic-list':
                return getPermission(50);
            case 'add-audience':
                return getPermission(47);
            case 'communication':
            case 'communication-creation':
            case 'create-communication':
            case 'create-mdc-communication':
            case 'execute':
                return getPermission(3);
            case 'analytics':
                return getPermission(4);
            case 'analytics360':
                return getPermission(29);
            case 'auditlog':
                return getPermission(26);
            case 'preferences':
                return getPermission(7); //check
            case 'my-profile':
                return getPermission(8);
            case 'account-settings':
                //return getPermission(12);
                return getPermission(9);
            case 'users':
            case 'add-user':
                return getPermission(12);
            case 'roles-and-permissions':
            case 'add-permissions':
                return getPermission(10);
            case 'company-list':
            case 'add-companies':
                return getPermission(11);
            case 'alerts-and-notifications':
                return getPermission(19);
            case 'communication-settings':
                return getPermission(15);
            case 'goals-and-benchmark':
                return getPermission(13);
            case 'audience-score':
                return getPermission(52);
            case 'data-catalogue':
                return getPermission(53);
            case 'form-generator':
            case 'advanced-form':
            case 'add-form-generator':
            case 'email-builder-gallery':
            case 'landingpage-gallery':
            case 'ads':
            case 'create_ads':
                return getPermission(16);
            case 'data-exchange':
                return getPermission(44);
            case 'consumptions':
                return getPermission(33);
            case 'invoice-list':
            case 'license-info':
                return getPermission(54); //check
            case 'unsubscribe':
                return getPermission(17); //check
            default:
                return null;
        }
    }
    return null;
};
