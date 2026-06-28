export {
    SKELETON_LAYER,
    PAGE_SKELETON_OWNER,
    isAudienceRoute,
    isAudienceMainTabsRoute,
    isAudienceTargetListCreationRoute,
    isDashboardRoute,
    isDashboardMainRoute,
    getDashboardTabIndex,
    getAudienceTabIndex,
    isAudienceMdmTab,
    isAudienceTargetOrDynamicTab,
    isAudienceMdmRoute,
    isDashboardCommunicationRoute,
    isDashboardCommunicationTab,
} from './pageSkeletonRegistry';

export { SKELETON_KEYS, SKELETON_ROUTE_RULES, resolveSkeletonRouteKey } from './skeletonRouteConfig';
export { getRouteSuspenseFallback } from './resolveRouteSkeleton';
export {
    PAGE_LOADING_LAYER,
    resolvePageLoadingLayer,
    shouldSkipDataLayerSkeleton,
    createPageLoadingScene,
    createTabbedPageLoadingScene,
    MainNavBar,
    pageLayoutSkeletonCriticalCss,
} from '../Components/common/pageLoadingScene';
