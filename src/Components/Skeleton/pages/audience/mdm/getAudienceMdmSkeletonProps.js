import { getRouteTabIndex } from '../../../Components/getRouteTabIndex';
/** Shared props for AudienceMdmPanelSkeleton from the current URL. */
export const getAudienceMdmSkeletonProps = ({
    pathname = typeof window !== 'undefined' ? window.location.pathname : '/audience',
    search = typeof window !== 'undefined' ? window.location.search : '',
    hideListActivity = false,
    showTabs = true,
    showOverviewHeader = true,
} = {}) => ({
    activeTabIndex: getRouteTabIndex(pathname, search),
    hideListActivity,
    showTabs,
    showOverviewHeader,
});
