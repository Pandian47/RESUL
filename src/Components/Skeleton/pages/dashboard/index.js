/**
 * Dashboard skeletons — shell in DashboardPageSkeleton; tab bodies in comm / mobile / web.
 * @example import { DashboardSuspenseFallback, DashboardTabBodySkeleton } from 'Components/Skeleton/pages/dashboard';
 */
export {
    DashboardPageContentSkeleton,
    DashboardPageHeaderSkeleton,
    DashboardPageShellSkeleton,
    DashboardTabsSkeleton,
    DashboardSuspenseFallback,
    DashboardRouteSkeleton,
    DashboardTabBodySkeleton,
    default,
} from './DashboardPageSkeleton';

export { CommunicationTabSkeleton, DashboardCommunicationTabSkeleton } from './comm';
export { MobileLiveTabSkeleton } from './mobile';
export { WebLiveTabSkeleton } from './web';
/** @deprecated use MobileLiveTabSkeleton or WebLiveTabSkeleton */
export { MobileLiveTabSkeleton as DashboardLiveTabSkeleton } from './mobile';

export {
    DbSkActiveUsersBodySkeleton,
    DbSkBubbleChartSkeleton,
    DbSkColumnChartSkeleton,
    DbSkGaugeChartSkeleton,
    DbSkHorizontalBarsSkeleton,
    DbSkKeyMetricsBodySkeleton,
    DbSkLineChartSkeleton,
    DbSkPathAnalyserActionsSkeleton,
    DbSkPathAnalyserChartSlot,
    DbSkPathAnalyserSankeySkeleton,
    DbSkPathAnalyserSkeleton,
    DbSkPieChartSkeleton,
    DbSkPortletInlineSkeleton,
    DbSkRetentionTableSkeleton,
    DbSkSankeySkeleton,
    DbSkTrafficChartSkeleton,
    DbSkUserStatusSkeleton,
} from './_shared/dashboardContentSkeletons';
export { dashboardSkeletonCriticalCss } from './dashboardSkeletonCriticalCss';
export { skeletonBlockStyle, PAGE_MAX_WIDTH, SKELETON_BG, SKELETON_BORDER, LIVE_PATH_ANALYSER_FILTER_COUNT_MOBILE, LIVE_PATH_ANALYSER_FILTER_COUNT_WEB } from './dashboardSkeletonUtils';
export { default as DashboardSkeletonScope } from './DashboardSkeletonScope';
export { markDashboardRouteSkeleton, consumeDashboardRouteSkeleton } from './dashboardRouteSkeletonPhase';
