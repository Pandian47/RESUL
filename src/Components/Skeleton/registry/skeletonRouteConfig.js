/**
 * Route → skeleton key (edit here when adding routes — mirror `appRouteConfig.jsx` areas).
 *
 * @example
 * // Communication list only:
 * { key: SKELETON_KEYS.communicationList, match: (p) => p.startsWith('/communication') }
 *
 * Components are mapped in `resolveRouteSkeleton.jsx`.
 * Communication tab UI: `pages/communication/list|gallery|planner/`.
 */
export const SKELETON_KEYS = {
    audienceMainTabs: 'audienceMainTabs',
    audienceTargetListCreation: 'audienceTargetListCreation',
    audienceAddAudience: 'audienceAddAudience',
    audienceAddImportAudience: 'audienceAddImportAudience',
    audienceSyncHistory: 'audienceSyncHistory',
    audienceDynamicListCreation: 'audienceDynamicListCreation',
    audienceMdm: 'audienceMdm',
    dashboard: 'dashboard',
    communicationList: 'communicationList',
    communicationCreation: 'communicationCreation',
    communicationAuthoring: 'communicationAuthoring',
    mdcAuthoring: 'mdcAuthoring',
    configureAnalytics: 'configureAnalytics',
    communicationExecute: 'communicationExecute',
    mdcWorkflow: 'mdcWorkflow',
    analytics: 'analytics',
    analyticsReport: 'analyticsReport',
    analyticsDetail: 'analyticsDetail',
    preferences: 'preferences',
    preferencesSubPage: 'preferencesSubPage',
    login: 'login',
    accountSetup: 'accountSetup',
    setupComplete: 'setupComplete',
    genie: 'genie',
    launchPad: 'launchPad',
    default: 'default',
};

const normalizePath = (pathname = '') => (pathname || '').replace(/\/+$/, '') || '/';

/** First matching rule wins (most specific rules first). */
export const SKELETON_ROUTE_RULES = [
    {
        key: SKELETON_KEYS.setupComplete,
        label: 'Setup complete',
        match: (pathname) => normalizePath(pathname) === '/setup-complete',
    },
    {
        key: SKELETON_KEYS.accountSetup,
        label: 'Account setup',
        match: (pathname) => normalizePath(pathname) === '/account-setup',
    },
    {
        key: SKELETON_KEYS.login,
        label: 'Login',
        match: (pathname) => {
            const normalized = normalizePath(pathname);
            return normalized === '/' || pathname.includes('ChannelAccessADToken');
        },
    },
    {
        key: SKELETON_KEYS.genie,
        label: 'Genie',
        match: (pathname) => pathname === '/genie' || pathname.startsWith('/genie/'),
    },
    {
        key: SKELETON_KEYS.audienceTargetListCreation,
        label: 'Audience › Create target list',
        match: (pathname) =>
            pathname.startsWith('/audience') &&
            (pathname.includes('create-target-list') || pathname.includes('create-target-lists')),
    },
    {
        key: SKELETON_KEYS.audienceAddImportAudience,
        label: 'Audience › Add import audience',
        match: (pathname) =>
            pathname.startsWith('/audience') && pathname.includes('add-import-audience'),
    },
    {
        key: SKELETON_KEYS.audienceSyncHistory,
        label: 'Audience › Sync history',
        match: (pathname) =>
            pathname.startsWith('/audience') && pathname.includes('sync-history'),
    },
    {
        key: SKELETON_KEYS.audienceAddAudience,
        label: 'Audience › Add audience',
        match: (pathname) =>
            pathname.startsWith('/audience') &&
            pathname.includes('add-audience') &&
            !pathname.includes('add-import-audience'),
    },
    {
        key: SKELETON_KEYS.audienceDynamicListCreation,
        label: 'Audience › Create dynamic list',
        match: (pathname) =>
            pathname.startsWith('/audience') && pathname.includes('create-dynamic-list'),
    },
    {
        key: SKELETON_KEYS.audienceMainTabs,
        label: 'Audience › Master data / Target / Dynamic tabs',
        match: (pathname) => normalizePath(pathname) === '/audience',
    },
    {
        key: SKELETON_KEYS.audienceMdm,
        label: 'Audience › Master data (standalone)',
        match: (pathname) => normalizePath(pathname) === '/audience/masterdata',
    },
    {
        key: SKELETON_KEYS.dashboard,
        label: 'Dashboard › Communication / Mobile / Web tabs',
        match: (pathname) => normalizePath(pathname) === '/dashboard',
    },
    {
        key: SKELETON_KEYS.mdcWorkflow,
        label: 'Communication › MDC workflow',
        match: (pathname) =>
            (pathname.startsWith('/communication') || pathname.startsWith('/communicationTwins')) &&
            pathname.includes('mdc-workflow'),
    },
    {
        key: SKELETON_KEYS.communicationCreation,
        label: 'Communication › Creation flow',
        match: (pathname) => pathname.includes('communication-creation'),
    },
    {
        key: SKELETON_KEYS.communicationExecute,
        label: 'Communication › Execute (analyze)',
        match: (pathname) => {
            const normalized = (pathname || '').replace(/\/+$/, '');
            if (!normalized.startsWith('/communication') && !normalized.startsWith('/communicationTwins')) {
                return false;
            }
            return normalized.endsWith('/execute');
        },
    },
    {
        key: SKELETON_KEYS.mdcAuthoring,
        label: 'Communication › MDC channel authoring',
        match: (pathname) => {
            const normalized = (pathname || '').replace(/\/+$/, '');
            if (!normalized.startsWith('/communication') && !normalized.startsWith('/communicationTwins')) {
                return false;
            }
            return normalized.includes('create-mdc-communication');
        },
    },
    {
        key: SKELETON_KEYS.communicationAuthoring,
        label: 'Communication › Create authoring',
        match: (pathname) => {
            const normalized = (pathname || '').replace(/\/+$/, '');
            if (!normalized.startsWith('/communication') && !normalized.startsWith('/communicationTwins')) {
                return false;
            }
            return normalized.includes('create-communication');
        },
    },
    {
        key: SKELETON_KEYS.configureAnalytics,
        label: 'Communication › Configure analytics (MDC landing)',
        match: (pathname) => {
            const normalized = (pathname || '').replace(/\/+$/, '');
            if (!normalized.startsWith('/communication') && !normalized.startsWith('/communicationTwins')) {
                return false;
            }
            return normalized.includes('configure-analytics');
        },
    },
    {
        key: SKELETON_KEYS.communicationList,
        label: 'Communication › List / Gallery / Planner tabs',
        match: (pathname) =>
            (pathname.startsWith('/communication') || pathname.startsWith('/communicationTwins')) &&
            !pathname.includes('mdc-workflow') &&
            !pathname.includes('communication-creation') &&
            !pathname.includes('configure-analytics'),
    },
    {
        key: SKELETON_KEYS.analyticsReport,
        label: 'Analytics › Analytics report (CSR)',
        match: (pathname) => {
            const normalized = (pathname || '').toLowerCase();
            return (
                (normalized.startsWith('/analytics') || normalized.startsWith('/analyticstwins')) &&
                normalized.includes('analytics-report')
            );
        },
    },
    {
        key: SKELETON_KEYS.analyticsDetail,
        label: 'Analytics › Detail analytics',
        match: (pathname) => {
            const normalized = (pathname || '').toLowerCase();
            return (
                (normalized.startsWith('/analytics') || normalized.startsWith('/analyticstwins')) &&
                normalized.includes('detail-analytics')
            );
        },
    },
    {
        key: SKELETON_KEYS.analytics,
        label: 'Analytics module',
        match: (pathname) => {
            const normalized = (pathname || '').toLowerCase();
            return normalized.startsWith('/analytics') || normalized.startsWith('/analyticstwins');
        },
    },
    {
        key: SKELETON_KEYS.launchPad,
        label: 'Launch pad',
        match: (pathname) => normalizePath(pathname) === '/launch-pad',
    },
    {
        key: SKELETON_KEYS.preferences,
        label: 'Preferences landing',
        match: (pathname) => normalizePath(pathname) === '/preferences',
    },
    {
        key: SKELETON_KEYS.preferencesSubPage,
        label: 'Preferences sub-pages',
        match: (pathname) => {
            const normalized = normalizePath(pathname);
            return normalized.startsWith('/preferences/');
        },
    },
];

export const resolveSkeletonRouteKey = (pathname = '') => {
    const rule = SKELETON_ROUTE_RULES.find((entry) => entry.match(pathname));
    return rule?.key ?? SKELETON_KEYS.default;
};
