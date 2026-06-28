import { memo } from 'react';
import PropTypes from 'prop-types';

import { createPageLoadingScene } from '../../Components/common';
import { CommunicationTabSkeleton } from './comm';
import { MobileLiveTabSkeleton } from './mobile';
import { WebLiveTabSkeleton } from './web';
import { dashboardSkeletonCriticalCss } from './dashboardSkeletonCriticalCss';
import { markDashboardRouteSkeleton } from './dashboardRouteSkeletonPhase';
import {
    DashboardHeaderSkeleton,
    DashboardPageShellSkeleton,
    DashboardTabsSkeleton,
} from './_shared/dashboardShellSkeleton';

export const DashboardPageHeaderSkeleton = () => <DashboardHeaderSkeleton />;

export const DashboardTabBodySkeleton = ({ tabIndex = 0, includeGauges = true }) => {
    if (tabIndex === 0) return <CommunicationTabSkeleton includeGauges={includeGauges} />;
    if (tabIndex === 1) return <MobileLiveTabSkeleton />;
    return <WebLiveTabSkeleton />;
};

DashboardTabBodySkeleton.propTypes = {
    tabIndex: PropTypes.number,
    includeGauges: PropTypes.bool,
};

const dashboardLoadingScene = createPageLoadingScene({
    scopeClass: 'dashboard-skeleton-scope',
    suspenseFallbackClass: 'dashboard-suspense-fallback',
    ariaLabel: 'Loading dashboard',
    pageCriticalCss: dashboardSkeletonCriticalCss,
    markRouteSkeleton: markDashboardRouteSkeleton,
    TabBodySkeleton: DashboardTabBodySkeleton,
    PageShellSkeleton: DashboardPageShellSkeleton,
    skipSharedCriticalCss: true,
});

export const DashboardPageContentSkeleton = dashboardLoadingScene.PageContentSkeleton;
export const DashboardRouteSkeleton = dashboardLoadingScene.RouteSkeleton;
export const DashboardSuspenseFallback = dashboardLoadingScene.SuspenseFallback;

export { DashboardPageShellSkeleton, DashboardTabsSkeleton };
export default memo(DashboardPageContentSkeleton);

DashboardRouteSkeleton.propTypes = {
    activeTabIndex: PropTypes.number,
    withAppShell: PropTypes.bool,
    activeNavIndex: PropTypes.number,
    contentOnly: PropTypes.bool,
    layer: PropTypes.string,
};
