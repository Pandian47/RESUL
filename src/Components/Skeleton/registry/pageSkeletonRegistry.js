import { getMainSkeletonVariant } from '../Components/mainSkeletonVariants';
import { getRouteTabIndex } from '../Components/getRouteTabIndex';
export const SKELETON_LAYER = {
    APP_SHELL: 'appShell',
    ROUTE_SHELL: 'routeShell',
    ROUTE_CONTENT: 'routeContent',
    PAGE: 'page',
};

export const PAGE_SKELETON_OWNER = {
    audienceMdm: 'masterData',
    dashboardCommunication: 'communicationDashboard',
};

export const isAudienceRoute = (pathname = '') => {
    const variant = getMainSkeletonVariant(pathname);
    return (
        variant === 'audience' ||
        variant === 'audienceTargetListCreation' ||
        variant === 'audienceAddAudience' ||
        variant === 'audienceAddImportAudience' ||
        variant === 'audienceSyncHistory' ||
        variant === 'audienceDynamicListCreation'
    );
};

export const isAudienceAddAudienceRoute = (pathname = '') =>
    getMainSkeletonVariant(pathname) === 'audienceAddAudience';

/** Only /audience index — MDM / Target / Dynamic tabs skeleton. */
export const isAudienceMainTabsRoute = (pathname = '') => {
    const normalized = (pathname || '').replace(/\/+$/, '') || '/audience';
    return normalized === '/audience';
};

export const isAudienceTargetListCreationRoute = (pathname = '') =>
    getMainSkeletonVariant(pathname) === 'audienceTargetListCreation';

export const isAudienceDynamicListCreationRoute = (pathname = '') =>
    getMainSkeletonVariant(pathname) === 'audienceDynamicListCreation';

export const isDashboardRoute = (pathname = '') => getMainSkeletonVariant(pathname) === 'dashboard';

export const getAudienceTabIndex = (pathname = '', search = '') => getRouteTabIndex(pathname, search);

export const isAudienceMdmTab = (pathname = '', search = '') => getAudienceTabIndex(pathname, search) === 0;

export const isAudienceTargetOrDynamicTab = (pathname = '', search = '') => {
    const tab = getAudienceTabIndex(pathname, search);
    return tab === 1 || tab === 2;
};

/**
 * MDM skeleton only for Master data tab (index 0) or standalone /audience/masterdata.
 * Target Lists / Dynamic Lists must NOT use MDM skeleton.
 */
export const isAudienceMdmRoute = (pathname = '', search = '') => {
    if (!isAudienceRoute(pathname)) {
        return false;
    }
    const normalized = pathname.replace(/\/+$/, '') || '/audience';
    if (normalized.endsWith('/masterdata')) {
        return true;
    }
    if (normalized === '/audience') {
        return isAudienceMdmTab(pathname, search);
    }
    return isAudienceMdmTab(pathname, search);
};

export const getDashboardTabIndex = (pathname = '', search = '') => getRouteTabIndex(pathname, search);

export const isDashboardMainRoute = (pathname = '') => {
    if (!isDashboardRoute(pathname)) {
        return false;
    }
    const normalized = (pathname || '').replace(/\/+$/, '') || '/dashboard';
    return normalized === '/dashboard';
};

export const isDashboardCommunicationTab = (pathname = '', search = '') =>
    getDashboardTabIndex(pathname, search) === 0;

/** Communication tab panel skeleton only (tab index 0 on /dashboard). */
export const isDashboardCommunicationRoute = (pathname = '', search = '') => {
    if (!isDashboardMainRoute(pathname)) {
        return false;
    }
    return isDashboardCommunicationTab(pathname, search);
};
