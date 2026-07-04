const MDC_WORKFLOW_PATHS = ['/communication/mdc-workflow', '/communicationTwins/mdc-workflow'];

const AUDIENCE_TARGET_LIST_CREATION_PATHS = ['create-target-list', 'create-target-lists'];
const AUDIENCE_ADD_AUDIENCE_PATH = 'add-audience';
const AUDIENCE_ADD_IMPORT_AUDIENCE_PATH = 'add-import-audience';
const AUDIENCE_SYNC_HISTORY_PATH = 'sync-history';
const AUDIENCE_CREATE_DYNAMIC_LIST_PATH = 'create-dynamic-list';

export const isAudienceAddImportAudiencePath = (pathname = '') =>
    pathname.startsWith('/audience') && pathname.includes(AUDIENCE_ADD_IMPORT_AUDIENCE_PATH);

export const isAudienceSyncHistoryPath = (pathname = '') =>
    pathname.startsWith('/audience') && pathname.includes(AUDIENCE_SYNC_HISTORY_PATH);

export const isAudienceAddAudiencePath = (pathname = '') =>
    pathname.startsWith('/audience') &&
    pathname.includes(AUDIENCE_ADD_AUDIENCE_PATH) &&
    !pathname.includes(AUDIENCE_ADD_IMPORT_AUDIENCE_PATH);

export const isAudienceDynamicListCreationPath = (pathname = '') =>
    pathname.startsWith('/audience') && pathname.includes(AUDIENCE_CREATE_DYNAMIC_LIST_PATH);

/** Execute step — analyze & execute page. */
export const isCommunicationExecutePath = (pathname = '') => {
    const normalized = (pathname || '').replace(/\/+$/, '');
    if (!normalized.startsWith('/communication') && !normalized.startsWith('/communicationTwins')) {
        return false;
    }
    return normalized.endsWith('/execute');
};

/** MDC landing page preferences (`configure-analytics`). */
export const isConfigureAnalyticsPath = (pathname = '') => {
    const normalized = (pathname || '').replace(/\/+$/, '');
    if (!normalized.startsWith('/communication') && !normalized.startsWith('/communicationTwins')) {
        return false;
    }
    return normalized.includes('configure-analytics');
};

/** MDC channel authoring from canvas (`create-mdc-communication`). */
export const isMdcAuthoringPath = (pathname = '') => {
    const normalized = (pathname || '').replace(/\/+$/, '');
    if (!normalized.startsWith('/communication') && !normalized.startsWith('/communicationTwins')) {
        return false;
    }
    return normalized.includes('create-mdc-communication');
};

/** Create authoring — not list gallery tabs, execute, or MDC channel authoring. */
export const isCommunicationAuthoringPath = (pathname = '') => {
    const normalized = (pathname || '').replace(/\/+$/, '');
    if (!normalized.startsWith('/communication') && !normalized.startsWith('/communicationTwins')) {
        return false;
    }
    if (isCommunicationExecutePath(pathname) || isMdcAuthoringPath(pathname)) {
        return false;
    }
    return normalized.includes('create-communication');
};

export const isAudienceTargetListCreationPath = (pathname = '') =>
    pathname.startsWith('/audience') &&
    AUDIENCE_TARGET_LIST_CREATION_PATHS.some((segment) => pathname.includes(segment));

export const isAnalyticsReportPath = (pathname = '') => {
    const normalized = (pathname || '').toLowerCase();
    return (
        (normalized.startsWith('/analytics') || normalized.startsWith('/analyticstwins')) &&
        normalized.includes('analytics-report')
    );
};

export const isAnalyticsDetailPath = (pathname = '') => {
    const normalized = (pathname || '').toLowerCase();
    return (
        (normalized.startsWith('/analytics') || normalized.startsWith('/analyticstwins')) &&
        normalized.includes('detail-analytics')
    );
};

export const getMainSkeletonVariant = (pathname = '') => {
    if (pathname === '/genie' || pathname.startsWith('/genie/')) {
        return 'genie';
    }
    if (MDC_WORKFLOW_PATHS.some((path) => pathname.startsWith(path))) {
        return 'mdcWorkflow';
    }
    if (pathname.includes('communication-creation')) {
        return 'communicationCreation';
    }
    if (isCommunicationExecutePath(pathname)) {
        return 'communicationExecute';
    }
    if (isMdcAuthoringPath(pathname)) {
        return 'mdcAuthoring';
    }
    if (isConfigureAnalyticsPath(pathname)) {
        return 'configureAnalytics';
    }
    if (isCommunicationAuthoringPath(pathname)) {
        return 'communicationAuthoring';
    }
    if (pathname.startsWith('/communication') || pathname.startsWith('/communicationTwins')) {
        return 'communicationList';
    }
    if (pathname.startsWith('/audience')) {
        if (isAudienceTargetListCreationPath(pathname)) {
            return 'audienceTargetListCreation';
        }
        if (isAudienceAddImportAudiencePath(pathname)) {
            return 'audienceAddImportAudience';
        }
        if (isAudienceSyncHistoryPath(pathname)) {
            return 'audienceSyncHistory';
        }
        if (isAudienceAddAudiencePath(pathname)) {
            return 'audienceAddAudience';
        }
        if (isAudienceDynamicListCreationPath(pathname)) {
            return 'audienceDynamicListCreation';
        }
        return 'audience';
    }
    if (isAnalyticsReportPath(pathname)) {
        return 'analyticsReport';
    }
    if (isAnalyticsDetailPath(pathname)) {
        return 'analyticsDetail';
    }
    if (pathname.startsWith('/analytics') || pathname.toLowerCase().startsWith('/analyticstwins')) {
        return 'analytics';
    }
    if (pathname.startsWith('/dashboard')) {
        return 'dashboard';
    }
    const normalized = pathname.replace(/\/+$/, '') || '/';
    if (normalized === '/launch-pad') {
        return 'launchPad';
    }
    if (normalized === '/preferences') {
        return 'preferences';
    }
    if (normalized.startsWith('/preferences/')) {
        return 'preferencesSubPage';
    }
    return 'default';
};

export const getMainNavActiveIndex = (pathname = '') => {
    if (pathname.startsWith('/audience')) return 0;
    if (pathname.startsWith('/communication') || pathname.startsWith('/communicationTwins')) return 1;
    if (pathname.startsWith('/dashboard')) return 2;
    if (pathname.startsWith('/analytics')) return 3;
    if (pathname.startsWith('/preferences') || pathname.startsWith('/launch-pad')) return 4;
    return -1;
};
