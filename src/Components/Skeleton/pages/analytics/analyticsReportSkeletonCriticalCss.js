import {
    LIVE_PORTLET_MD_BODY_HEIGHT,
    LIVE_PORTLET_MD_HEIGHT,
    LIVE_PORTLET_PADDING,
    LIVE_PORTLET_SM_BODY_HEIGHT,
    LIVE_PORTLET_SM_HEIGHT,
    PAGE_MAX_WIDTH,
    SKELETON_BG,
    SKELETON_BORDER,
    SKELETON_PAGE_BG,
    SKELETON_SHIMMER_HIGHLIGHT,
    SKELETON_SURFACE,
} from '../dashboard/dashboardSkeletonUtils';

const ARSK_BORDER_RADIUS = 5;
const ARSK_SUMMARY_CARD_HEIGHT = 403;
const ARSK_GRID_ROW_GAP = 30;
const ARSK_GRID_COL_GAP = 15;
const ARSK_GUTTER_HALF = 12;
const ARSK_ROW_GAP_15 = 15;
const ARSK_PORTLET_GAP = 25;
const ARSK_EXPAND_COL_GAP = 15;
const ARSK_HEADER_BAR_HEIGHT = 24;
const ARSK_ICON_SIZE = 24;
const ARSK_PORTLET_PADDING = LIVE_PORTLET_PADDING;
const ARSK_PORTLET_HEADER_BODY_GAP = 15;
const ARSK_GRID_CARD_HEADER_BODY_GAP = 5;
const ARSK_CHANNEL_ANALYTICS_COL_GAP = 30;
const ARSK_OVERVIEW_COL_GAP = 8;
const ARSK_METRICS_ROW_HEIGHT = 33;
const ARSK_GRID_CELL_HEIGHT = Math.floor((ARSK_SUMMARY_CARD_HEIGHT - ARSK_GRID_ROW_GAP) / 2);
const ARSK_GRID_DEVICE_COL_GAP = 8;
const ARSK_GRID_DEVICE_STACK_GAP = 4;
const ARSK_GRID_DEVICE_STACK_TOP_FLEX = 80;
const ARSK_GRID_DEVICE_STACK_BOTTOM_FLEX = 45;

export const COMM_ANALYSIS_LINE_CHART_HEIGHT = 301;
const COMM_ANALYSIS_LINE_CHART_LEGEND_OFFSET = 40;
const COMM_ANALYSIS_LINE_CHART_BODY_HEIGHT =
    COMM_ANALYSIS_LINE_CHART_HEIGHT + COMM_ANALYSIS_LINE_CHART_LEGEND_OFFSET;
const CHANNEL_ANALYTICS_PREVIEW_HEIGHT = 330;
const CHANNEL_ANALYTICS_PREVIEW_BG = '#e2e7ee';
const CHANNEL_ANALYTICS_STRIPE_BG = '#f0f8ff';
const CHANNEL_ANALYTICS_ACTIVE_TAB_BG = '#0000ff';
const INSIGHTS_BAR_HEIGHT = 33.5;
const INSIGHTS_BAR_GAP = 15;

const ARSK_SCOPES = [
    '.arsk-scope',
    '.analytics-report-skeleton-scope',
    '.analytics-report-skeleton',
    '.analytics-report-inline-skeleton',
];

const scope = (selector) => ARSK_SCOPES.map((root) => `${root} ${selector}`).join(',\n');

const buildArskShimmerCss = () => {
    const blockTargets = ARSK_SCOPES.map((root) => `${root} .arsk-block`).join(',\n');
    const blockAfter = ARSK_SCOPES.map((root) => `${root} .arsk-block::after`).join(',\n');
    const skeletonTargets = ARSK_SCOPES.map(
        (root) => `${root} .react-loading-skeleton, ${root} .skeleton-shimmer`,
    ).join(',\n');

    return `
@keyframes arskSkeletonShimmer {
    0% { left: -100%; }
    100% { left: 100%; }
}
${blockTargets} {
    position: relative;
    overflow: hidden;
    display: block;
    background-color: ${SKELETON_BG};
    border-radius: 4px;
    box-sizing: border-box;
}
${blockAfter} {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background-image: linear-gradient(90deg, transparent, ${SKELETON_SHIMMER_HIGHLIGHT}, transparent);
    animation: arskSkeletonShimmer 2s infinite;
    pointer-events: none;
    z-index: 1;
    will-change: left;
}
${skeletonTargets} {
    background-color: ${SKELETON_BG} !important;
    border-radius: 4px;
}`;
};

const buildArskGridCss = () => `
${scope('.arsk-row')} {
    display: flex;
    flex-wrap: wrap;
    width: 100%;
    margin-left: 0;
    margin-right: 0;
    box-sizing: border-box;
}
${scope('.arsk-col')} {
    padding-left: ${ARSK_GUTTER_HALF}px;
    padding-right: ${ARSK_GUTTER_HALF}px;
    box-sizing: border-box;
    min-width: 0;
}
${scope('.arsk-col-7')} {
    flex: 0 0 58.333333%;
    max-width: 58.333333%;
}
${scope('.arsk-col-5')} {
    flex: 0 0 41.666667%;
    max-width: 41.666667%;
}
${scope('.arsk-col-6')} {
    flex: 0 0 50%;
    max-width: 50%;
}
${scope('.arsk-col-12')} {
    flex: 0 0 100%;
    max-width: 100%;
}
@media (max-width: 767.98px) {
    ${scope('.arsk-col-7')},
    ${scope('.arsk-col-5')},
    ${scope('.arsk-col-6')},
    ${scope('.arsk-col-12')} {
        flex: 0 0 100%;
        max-width: 100%;
    }
}
${scope('.arsk-summary-card .row')} {
    display: flex;
    flex-wrap: wrap;
    width: 100%;
    margin-left: calc(${ARSK_GUTTER_HALF}px * -1);
    margin-right: calc(${ARSK_GUTTER_HALF}px * -1);
    box-sizing: border-box;
}
${scope('.arsk-summary-card [class*="col-md-4"]')} {
    flex: 0 0 33.333333%;
    max-width: 33.333333%;
    padding-left: ${ARSK_GUTTER_HALF}px;
    padding-right: ${ARSK_GUTTER_HALF}px;
    box-sizing: border-box;
}`;

const ARSK_PERF_SNAP_BG = '#f0f8ff';

const perfSnapScope = (selector) => scope(`.arsk-portlet--perf-snap ${selector}`);

const buildArskPerformanceSnapshotCss = () => `
${scope('.arsk-portlet--perf-snap')} {
    position: relative;
    overflow: hidden;
}
${perfSnapScope('.arsk-portlet-body')} {
    flex: 1 1 auto;
    height: 100%;
    min-height: 0;
    max-height: none;
    overflow: hidden;
}
${perfSnapScope('.arsk-portlet-body > div')} {
    position: static;
    display: flex;
    flex-direction: column;
    flex: 1 1 auto;
    width: 100%;
    height: 100%;
    min-height: 100%;
    overflow: hidden;
    box-sizing: border-box;
}
${perfSnapScope('.arsk-portlet-body > div > .row')} {
    position: static;
    display: flex;
    flex-wrap: nowrap;
    align-items: stretch;
    flex: 1 1 auto;
    width: 100%;
    height: 100%;
    min-height: 100%;
    margin: 0;
    box-sizing: border-box;
}
${perfSnapScope('.arsk-portlet-body > div > .row > [class*="col-md-7"]')} {
    flex: 1 1 58.333333%;
    max-width: 58.333333%;
    min-width: 0;
    height: 100%;
    padding-left: 0;
    padding-right: 0;
    position: relative;
    display: flex;
    flex-direction: column;
    min-height: 0;
    box-sizing: border-box;
}
${perfSnapScope('.arsk-portlet-body > div > .row > [class*="col-md-5"]')} {
    flex: 1 1 41.666667%;
    max-width: 41.666667%;
    min-width: 0;
    height: 100%;
    padding: 0;
    position: static;
    display: block;
    min-height: 0;
    box-sizing: border-box;
}
${perfSnapScope('.arsk-portlet-body > div > .row > [class*="col-md-7"] > .portlet-header')} {
    flex: 0 0 ${ARSK_HEADER_BAR_HEIGHT}px;
}
${perfSnapScope('.arsk-portlet-body > div > .row > [class*="col-md-7"] > .portlet-chart')} {
    flex: 1 1 auto;
    min-height: 0;
    height: auto;
    width: 100%;
    box-sizing: border-box;
}
${perfSnapScope('.arsk-portlet-body .portlet-chart')} {
    position: relative;
    width: 100%;
    min-height: 0;
    box-sizing: border-box;
}
${perfSnapScope('.arsk-portlet-body .portlet-chart .position-relative')} {
    position: relative;
    width: 100%;
    height: 100%;
    min-height: 0;
    box-sizing: border-box;
}
${perfSnapScope('.arsk-portlet-body .performance-snap-chart')} {
    position: absolute;
    top: 30px;
    left: 30px;
    z-index: 1;
    box-sizing: border-box;
}
${perfSnapScope('.arsk-portlet-body .meter-ch-label')} {
    position: absolute;
    top: 180px;
    left: 45%;
    transform: translateX(-50%);
    width: 80%;
    text-align: center;
    box-sizing: border-box;
}
${perfSnapScope('.arsk-portlet-body .skeleton-gaugecircle')} {
    display: block;
    width: 200px;
    height: 100px;
    background-color: ${SKELETON_BG};
    border-bottom: 0;
    position: relative;
    overflow: hidden;
    border-radius: 100px 100px 0 0;
    box-sizing: border-box;
}
${perfSnapScope('.arsk-portlet-body .skeleton-gaugecircle::before')} {
    content: '';
    position: absolute;
    background-color: ${SKELETON_SURFACE};
    left: 20px;
    right: 20px;
    top: 20px;
    bottom: 0;
    border-radius: 100px 100px 0 0;
    z-index: 1;
}
${perfSnapScope('.arsk-portlet-body .p-snap')} {
    position: absolute;
    right: 3px;
    top: 3px;
    bottom: 3px;
    width: 45%;
    border-radius: ${ARSK_BORDER_RADIUS}px;
    padding: 1px;
    text-align: center;
    box-sizing: border-box;
    z-index: 2;
    overflow: hidden;
}
${perfSnapScope('.arsk-portlet-body .p-snap ul')} {
    height: 100%;
    display: flex;
    flex-direction: column;
    align-items: stretch;
    justify-content: flex-start;
    margin: 0;
    padding: 0;
    list-style: none;
    box-sizing: border-box;
}
${perfSnapScope('.arsk-portlet-body .p-snap ul li')} {
    width: 100%;
    flex: 1 1 0;
    min-height: 0;
    margin-bottom: 5px;
    display: flex;
    align-items: stretch;
    justify-content: flex-start;
    background-color: ${ARSK_PERF_SNAP_BG} !important;
    opacity: 1 !important;
    box-sizing: border-box;
}
${perfSnapScope('.arsk-portlet-body .p-snap ul li:last-child')} {
    margin-bottom: 0;
}
${perfSnapScope('.arsk-portlet-body .p-snap ul li .custom-slide')} {
    flex: 1 1 auto;
    width: 100%;
    min-height: 0;
    display: flex;
    flex-direction: column;
    box-sizing: border-box;
}
${perfSnapScope('.arsk-portlet-body .p-snap-list')} {
    flex: 1 1 auto;
    width: 100%;
    min-height: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    box-sizing: border-box;
}
${perfSnapScope('.arsk-portlet-body .p-count')} {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 4px;
    box-sizing: border-box;
}
${perfSnapScope('.arsk-portlet-body .position-relative')} {
    position: relative;
}`;

/** Right overview 2×2 grid — device bar layout + Demography pie (self-contained arsk markup). */
const buildArskOverviewGridCardCss = () => `
${scope('.arsk-grid-card')} {
    display: flex;
    flex-direction: column;
    width: 100%;
    height: 100%;
    min-height: ${ARSK_GRID_CELL_HEIGHT}px;
    background: ${SKELETON_SURFACE};
    border: 1px solid ${SKELETON_BORDER};
    border-radius: ${ARSK_BORDER_RADIUS}px;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.08);
    padding: ${ARSK_PORTLET_PADDING}px;
    position: relative;
    box-sizing: border-box;
    overflow: hidden;
}
${scope('.arsk-grid-card > .arsk-block')} {
    flex: 0 0 ${ARSK_HEADER_BAR_HEIGHT}px;
    height: ${ARSK_HEADER_BAR_HEIGHT}px;
    min-height: ${ARSK_HEADER_BAR_HEIGHT}px;
    width: 100%;
    margin: 0 0 ${ARSK_GRID_CARD_HEADER_BODY_GAP}px;
}
${scope('.arsk-grid-card > .arsk-grid-device-body')},
${scope('.arsk-grid-card > .arsk-grid-pie-body')} {
    flex: 1 1 0%;
    align-self: stretch;
    min-height: 0;
    width: 100%;
}
${scope('.arsk-grid-device-body')} {
    display: flex;
    flex-direction: row;
    flex-wrap: nowrap;
    align-items: stretch;
    align-self: stretch;
    column-gap: ${ARSK_GRID_DEVICE_COL_GAP}px;
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}
${scope('.arsk-grid-device-body__left')} {
    flex: 1 1 0;
    min-width: 0;
    height: 100%;
    align-self: stretch;
    margin: 0;
    border-radius: 4px;
    box-sizing: border-box;
}
${scope('.arsk-grid-device-body__right')} {
    flex: 1 1 0;
    min-width: 0;
    height: 100%;
    display: flex;
    flex-direction: column;
    gap: ${ARSK_GRID_DEVICE_STACK_GAP}px;
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}
${scope('.arsk-grid-device-body__stack-top')} {
    flex: ${ARSK_GRID_DEVICE_STACK_TOP_FLEX} 1 0;
    min-height: 0;
    width: 100%;
    margin: 0;
    border-radius: 4px;
    box-sizing: border-box;
}
${scope('.arsk-grid-device-body__stack-bottom')} {
    flex: ${ARSK_GRID_DEVICE_STACK_BOTTOM_FLEX} 1 0;
    min-height: 0;
    width: 100%;
    margin: 0;
    border-radius: 4px;
    box-sizing: border-box;
}
${scope('.arsk-grid-pie-body')} {
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}
${scope('.arsk-grid-pie-body__circle')} {
    flex: 0 1 auto;
    width: auto;
    height: 100%;
    max-width: 100%;
    max-height: 100%;
    aspect-ratio: 1;
    margin: 0;
    border-radius: 50%;
    box-sizing: border-box;
}`;

const buildArskPortletContentFillCss = () => `
${scope('.arsk-summary-card')} {
    position: relative;
    display: flex;
    flex-direction: column;
    padding: ${ARSK_PORTLET_PADDING}px;
    background-color: ${SKELETON_SURFACE};
    border: 1px solid ${SKELETON_BORDER};
    border-radius: ${ARSK_BORDER_RADIUS}px;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.08);
    height: ${ARSK_SUMMARY_CARD_HEIGHT}px;
    overflow: hidden;
    box-sizing: border-box;
}
${scope('.arsk-summary-card-header')} {
    position: relative;
    left: auto;
    top: auto;
    width: 100%;
    flex: 0 0 ${ARSK_HEADER_BAR_HEIGHT}px;
    min-height: ${ARSK_HEADER_BAR_HEIGHT}px;
    z-index: 1;
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin: 0 0 ${ARSK_PORTLET_HEADER_BODY_GAP}px;
    padding: 0;
    box-sizing: border-box;
}
${scope('.arsk-summary-card-label')} {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 0;
    margin: 0;
    box-sizing: border-box;
}
${scope('.arsk-summary-card-actions')} {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: 8px;
    padding: 0;
    margin: 0;
    box-sizing: border-box;
}
${scope('.arsk-summary-card .skeleton-span-con')} {
    flex: 1 1 0%;
    min-height: 0;
    width: 100%;
    max-width: 100%;
    margin: 0;
    padding: 0;
    display: flex;
    flex-direction: column;
    align-self: stretch;
    box-sizing: border-box;
}
${scope('.arsk-summary-card .skeleton-span-con > div:first-child')} {
    flex: 0 0 auto;
    margin: 0;
    padding: 0;
}
${scope('.arsk-summary-card .skeleton-span-con > .row')} {
    flex: 1 1 auto;
    display: flex;
    align-items: stretch;
    align-self: stretch;
    width: 100%;
    max-width: 100%;
    min-height: 0;
    height: 100%;
    margin: 0 !important;
    gap: ${ARSK_OVERVIEW_COL_GAP}px;
    box-sizing: border-box;
}
${scope('.arsk-summary-card .skeleton-span-con > .row > [class*="col-md-4"]')} {
    flex: 1 1 0%;
    min-width: 0;
    max-width: none;
    width: auto;
    height: 100%;
    align-self: stretch;
    padding: 0 !important;
    margin: 0;
    display: flex;
    flex-direction: column;
    gap: ${ARSK_OVERVIEW_COL_GAP}px;
    box-sizing: border-box;
}
${scope('.arsk-summary-card .skeleton-span-con > .row > [class*="col-md-4"] > div')} {
    width: 100%;
    max-width: 100%;
    margin: 0 !important;
    box-sizing: border-box;
}
${scope('.arsk-summary-card .skeleton-span-con > .row > [class*="col-md-4"] > div:first-child')} {
    flex: 1 1 auto;
    min-height: 0;
    display: flex;
    flex-direction: column;
}
${scope('.arsk-summary-card .skeleton-span-con > .row > [class*="col-md-4"] > div:first-child > *')} {
    flex: 1 1 auto;
    min-height: 0;
    width: 100%;
    display: flex;
    flex-direction: column;
}
${scope('.arsk-summary-card .skeleton-span-con > .row > [class*="col-md-4"] > div:not(:first-child)')} {
    flex: 0 0 ${ARSK_METRICS_ROW_HEIGHT}px;
}
${scope('.arsk-summary-card .skeleton-span-con .react-loading-skeleton')} {
    width: 100% !important;
    max-width: 100% !important;
    box-sizing: border-box;
}
${scope('.arsk-summary-card .skeleton-span-con > .row > [class*="col-md-4"] > div:first-child .react-loading-skeleton')} {
    height: 100% !important;
    min-height: 0;
    flex: 1 1 auto;
}
${scope('.arsk-summary-card .skeleton-span-con > .row > [class*="col-md-4"] > div:not(:first-child) .react-loading-skeleton')} {
    height: ${ARSK_METRICS_ROW_HEIGHT}px !important;
}

${scope('.arsk-portlet-body .skeleton-span-con')} {
    flex: 1 1 auto;
    width: 100%;
    min-height: 0;
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}
${scope('.arsk-portlet-body--insights .arsk-insights-bars')} {
    flex: 1 1 auto;
    width: 100%;
    min-height: 0;
}
${scope('.arsk-portlet-body--auto')} {
    display: flex;
    flex-direction: column;
}
${scope('.arsk-comm-line-chart-wrap')} {
    flex: 1 1 auto;
    width: 100%;
    min-height: 0;
}
${scope('.arsk-channel-analytics-body')} {
    flex: 1 1 auto;
    width: 100%;
    min-height: 0;
    align-content: stretch;
    column-gap: ${ARSK_CHANNEL_ANALYTICS_COL_GAP}px;
}
${scope('.arsk-channel-analytics-preview')} {
    display: flex;
    flex-direction: column;
    min-height: 0;
}
${scope('.arsk-channel-preview-panel')} {
    flex: 1 1 auto;
    min-height: 0;
    height: auto;
}
`;

/** Analytics report (CSR) — self-contained skeleton chrome before app.scss. */
export const analyticsReportSkeletonCriticalCss = `
${buildArskShimmerCss()}
${buildArskGridCss()}
${buildArskPerformanceSnapshotCss()}
${buildArskOverviewGridCardCss()}
${buildArskPortletContentFillCss()}

.analytics-report-skeleton.page-content-holder,
.analytics-report-skeleton .page-content,
.analytics-report-inline-skeleton,
.arsk-page.page-content-holder,
.arsk-page .page-content {
    background-color: ${SKELETON_PAGE_BG};
    box-sizing: border-box;
}
.analytics-report-skeleton.page-content-holder,
.arsk-page.page-content-holder {
    padding-top: 78px;
    width: 100%;
}
.rs-page-content-wrapper .page-content-holder.analytics-report-page-loading,
.rs-page-content-wrapper .page-content-holder.analytics-report-suspense-fallback {
    padding-top: 78px !important;
    background-color: ${SKELETON_PAGE_BG};
    box-sizing: border-box;
}
.page-layout-skeleton--inline.analytics-report-skeleton-scope.page-content-holder {
    padding-top: 0 !important;
}
.page-layout-skeleton--inline.analytics-report-skeleton-scope.page-content-holder > div:last-child {
    padding-top: 78px;
    box-sizing: border-box;
    width: 100%;
}
.rs-page-content-wrapper .page-content-holder.analytics-report-page-loading .page-content:has(.analytics-report-skeleton-body),
.rs-page-content-wrapper .page-content-holder.analytics-report-suspense-fallback .page-content:has(.analytics-report-skeleton-body) {
    padding-top: 0;
    margin-top: 0;
}
.page-layout-skeleton--inline.analytics-report-skeleton-scope,
.page-layout-skeleton--inline.analytics-skeleton-scope:has(.arsk-body) {
    background-color: ${SKELETON_PAGE_BG};
}
.page-layout-skeleton--inline.analytics-report-skeleton-scope .page-content-holder,
.page-layout-skeleton--inline.analytics-skeleton-scope:has(.arsk-body) .page-content-holder {
    padding-top: 0;
    min-height: 0;
    background-color: ${SKELETON_PAGE_BG};
}
.page-layout-skeleton--inline.analytics-report-skeleton-scope .page-content {
    padding-top: 0;
    margin-top: 0;
}
.page-layout-skeleton--inline.analytics-skeleton-scope:has(.arsk-body) .page-content {
}
.page-content:has(.arsk-body),
.page-content:has(.analytics-report-skeleton-body),
${scope('.page-content')} {
    width: 100%;
    max-width: 100%;
    margin-top: 0;
    padding-left: 0;
    padding-right: 0;
    box-sizing: border-box;
}
.rs-page-content-wrapper .page-content-holder.analytics-report-page-loading .page-content,
.rs-page-content-wrapper .page-content-holder.analytics-report-suspense-fallback .page-content {
    padding-top: 0;
    margin-top: 0;
}
${scope('.clear-both.mt10')} {
    margin-top: 0 !important;
}
${scope('.arsk-body')},
${scope('.analytics-report-skeleton-body')} {
    margin-top: 0;
    padding-top: 0;
    width: 100%;
    max-width: 100%;
    background-color: transparent;
    box-sizing: border-box;
}
${scope('.arsk-overview-header')},
${scope('.arsk-overview-header-inner')} {
    width: 100%;
    max-width: 100%;
    box-sizing: border-box;
}
.page-content-holder:has(.arsk-body) .main-heading-wrapper.container-fluid,
.page-content-holder:has(.analytics-report-skeleton-body) .main-heading-wrapper.container-fluid,
${scope('.main-heading-wrapper.container-fluid')} {
    margin-bottom: 0;
    box-sizing: border-box;
    background-color: ${SKELETON_PAGE_BG};
}
.page-content-holder:has(.arsk-body) .main-heading-wrapper .mhw-container,
.page-content-holder:has(.analytics-report-skeleton-body) .main-heading-wrapper .mhw-container,
${scope('.main-heading-wrapper .mhw-container')} {
    max-width: ${PAGE_MAX_WIDTH}px;
    margin-left: auto;
    margin-right: auto;
    padding-left: 0;
    padding-right: 0;
    display: flex;
    align-items: center;
    justify-content: space-between;
    min-height: 45px;
    margin-top: -2px;
    padding-top: 10px;
    padding-bottom: 10px;
    box-sizing: border-box;
}
${scope('.page-content > .container.px0 > .main-heading-wrapper.rs-page-header-skeleton')} {
    width: 100%;
    max-width: 100%;
    margin: 0;
    padding: 0;
    --bs-gutter-x: 0;
    box-sizing: border-box;
    background-color: transparent;
}
${scope('.page-content > .container.px0 > .main-heading-wrapper .mhw-container')} {
    max-width: 100%;
    width: 100%;
    margin: 0;
    --bs-gutter-x: 0;
    padding-left: 0 !important;
    padding-right: 0 !important;
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    min-height: 45px;
    padding-top: 10px;
    padding-bottom: 10px;
    box-sizing: border-box;
}
${scope('.rs-page-header-skeleton.csr-page-header .mhw-container')} {
    align-items: flex-end;
}
${scope('.rs-page-header-skeleton.csr-page-header .mhwc-right')},
.page-content-holder:has(.analytics-report-skeleton-body) .rs-page-header-skeleton.csr-page-header .mhwc-right,
.page-content-holder.analytics-report-page-loading .rs-page-header-skeleton.csr-page-header .mhwc-right,
.page-content-holder.analytics-report-suspense-fallback .rs-page-header-skeleton.csr-page-header .mhwc-right,
.page-layout-skeleton--inline.analytics-report-skeleton-scope .rs-page-header-skeleton.csr-page-header .mhwc-right {
    align-items: flex-end;
}
.analytics-report-skeleton.page-content-holder > .container-fluid:not(.main-heading-wrapper),
.arsk-page.page-content-holder > .container-fluid:not(.main-heading-wrapper),
.page-content-holder.analytics-report-page-loading > .container-fluid,
.page-content-holder.analytics-report-suspense-fallback > .container-fluid,
.page-layout-skeleton--inline.analytics-report-skeleton-scope .container-fluid {
    width: 100%;
    max-width: 100%;
    --bs-gutter-x: 0;
    padding-left: 0 !important;
    padding-right: 0 !important;
    box-sizing: border-box;
}
.analytics-report-skeleton .page-content > .container.px0,
.page-content:has(.arsk-body) > .container.px0,
.page-content:has(.analytics-report-skeleton-body) > .container.px0,
.analytics-report-inline-skeleton .arsk-body,
.analytics-report-inline-skeleton .analytics-report-skeleton-body {
    max-width: ${PAGE_MAX_WIDTH}px;
    margin-left: auto;
    margin-right: auto;
    width: 100%;
    --bs-gutter-x: 0;
    padding-left: 0 !important;
    padding-right: 0 !important;
    box-sizing: border-box;
}
${scope('.page-content > .container.px0')} {
    max-width: ${PAGE_MAX_WIDTH}px;
    width: 100%;
    margin-left: auto;
    margin-right: auto;
    --bs-gutter-x: 0;
    padding-left: 0 !important;
    padding-right: 0 !important;
    box-sizing: border-box;
}
.analytics-report-skeleton .rs-page-header-skeleton.csr-page-header .repo-title .skeleton-shimmer:first-child,
.arsk-page .rs-page-header-skeleton.csr-page-header .repo-title .skeleton-shimmer:first-child {
    display: inline-block;
    margin-bottom: 6px;
}
.analytics-report-inline-skeleton {
    width: 100%;
    box-sizing: border-box;
    background-color: ${SKELETON_PAGE_BG};
}
body:has(.analytics-report-skeleton-body) .breadcrumbs:not(.page-breadcrumb-skeleton),
body:has(.analytics-report-page-loading) .breadcrumbs:not(.page-breadcrumb-skeleton),
body:has(.analytics-report-suspense-fallback) .breadcrumbs:not(.page-breadcrumb-skeleton) {
    display: none !important;
}
.page-content-holder.analytics-report-page-loading .page-breadcrumb-skeleton.breadcrumbs,
.page-content-holder.analytics-report-suspense-fallback .page-breadcrumb-skeleton.breadcrumbs,
.page-layout-skeleton--inline.analytics-report-skeleton-scope .page-breadcrumb-skeleton.breadcrumbs {
    position: fixed;
    top: 60px;
    left: 0;
    right: 0;
    z-index: 1001;
    height: 19px;
}
.rs-page-content-wrapper .page-content-holder.analytics-report-page-loading .main-heading-wrapper.csr-page-header,
.rs-page-content-wrapper .page-content-holder.analytics-report-suspense-fallback .main-heading-wrapper.csr-page-header {
    margin-top: 0;
    position: relative;
    z-index: 2;
    box-sizing: border-box;
}
.page-layout-skeleton--inline.analytics-report-skeleton-scope .main-heading-wrapper.csr-page-header {
    margin-top: 0;
    position: relative;
    z-index: 2;
    box-sizing: border-box;
}
.page-content-holder.analytics-report-page-loading .rs-page-header-skeleton.csr-page-header,
.page-content-holder.analytics-report-suspense-fallback .rs-page-header-skeleton.csr-page-header,
.page-layout-skeleton--inline.analytics-report-skeleton-scope .rs-page-header-skeleton.csr-page-header {
    min-height: 65px;
    box-sizing: border-box;
}
.page-content-holder:has(.analytics-report-skeleton-body) .rs-page-header-skeleton.csr-page-header .repo-title,
.page-content-holder.analytics-report-page-loading .rs-page-header-skeleton.csr-page-header .repo-title {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    box-sizing: border-box;
}
.page-content-holder:has(.analytics-report-skeleton-body) .rs-page-header-skeleton.csr-page-header .mh-wrapper,
.page-content-holder.analytics-report-page-loading .rs-page-header-skeleton.csr-page-header .mh-wrapper {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 8px;
    margin-top: 5px;
    box-sizing: border-box;
}
.page-content-holder:has(.analytics-report-skeleton-body) .rs-page-header-skeleton .skeleton-page-header-bar,
.page-content-holder.analytics-report-page-loading .rs-page-header-skeleton .skeleton-page-header-bar,
.page-content-holder.analytics-report-suspense-fallback .rs-page-header-skeleton .skeleton-page-header-bar,
.page-layout-skeleton--inline.analytics-report-skeleton-scope .rs-page-header-skeleton .skeleton-page-header-bar {
    display: inline-block;
    vertical-align: middle;
    background-color: ${SKELETON_BG} !important;
    border-radius: 4px;
    box-sizing: border-box;
    flex-shrink: 0;
    min-height: 24px;
}

${scope('.arsk-overview-header')} {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin: 0 0 15px;
    position: relative;
    z-index: 1;
    clear: both;
    box-sizing: border-box;
}
${scope('.arsk-overview-header-inner')} {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    min-height: 37px;
    box-sizing: border-box;
}
${scope('.arsk-overview-header-left')},
${scope('.arsk-overview-header-right')} {
    display: flex;
    align-items: center;
    gap: 10px;
    box-sizing: border-box;
}
${scope('.arsk-overview-header .d-flex')} {
    display: flex;
    align-items: center;
}
${scope('.arsk-overview-header .justify-content-between')} {
    justify-content: space-between;
}

${scope('.arsk-row--overview')},
${scope('.arsk-row--expand')},
${scope('.arsk-row--perf-insights')},
${scope('.arsk-row--section')} {
    margin-bottom: ${ARSK_PORTLET_GAP}px;
    box-sizing: border-box;
}
${scope('.arsk-row--overview')} {
    align-items: stretch;
    width: 100%;
}
${scope('.arsk-row--perf-insights')},
${scope('.arsk-row--section')} {
    width: 100%;
}
${scope('.arsk-row--overview > .arsk-col-7')},
${scope('.arsk-row--overview > .arsk-col-5')} {
    display: flex;
    flex-direction: column;
    min-width: 0;
    padding-left: ${ARSK_GUTTER_HALF}px;
    padding-right: ${ARSK_GUTTER_HALF}px;
}
${scope('.arsk-row--overview > .arsk-col-7')} {
    padding-left: 0;
}
${scope('.arsk-row--overview > .arsk-col-5')} {
    padding-right: 0;
}
${scope('.arsk-row--perf-insights > .arsk-col-6')} {
    padding-left: ${ARSK_GUTTER_HALF}px;
    padding-right: ${ARSK_GUTTER_HALF}px;
}
${scope('.arsk-row--perf-insights > .arsk-col-6:first-child')} {
    padding-left: 0;
}
${scope('.arsk-row--perf-insights > .arsk-col-6:last-child')} {
    padding-right: 0;
}
${scope('.arsk-row--section > .arsk-col-12')} {
    padding-left: 0;
    padding-right: 0;
}
${scope('.arsk-row--overview > .arsk-col-7 > .arsk-summary-card')} {
    flex: 1 1 auto;
    width: 100%;
    height: ${ARSK_SUMMARY_CARD_HEIGHT}px;
}
${scope('.arsk-row--overview > .arsk-col-5 > .arsk-row--grid')} {
    flex: 1 1 auto;
    width: 100%;
    max-width: 100%;
    height: ${ARSK_SUMMARY_CARD_HEIGHT}px;
    min-height: ${ARSK_SUMMARY_CARD_HEIGHT}px;
    align-self: stretch;
}
${scope('.arsk-row--section:last-child')} {
    margin-bottom: 0;
}
${scope('.arsk-row--perf-insights > .arsk-col')} {
    display: flex;
    flex-direction: column;
    align-items: stretch;
    min-width: 0;
}
${scope('.arsk-row--perf-insights > .arsk-col > .arsk-portlet')} {
    flex: 1 1 auto;
    display: flex;
    flex-direction: column;
    width: 100%;
    max-width: 100%;
    min-height: ${LIVE_PORTLET_MD_HEIGHT}px;
}
${scope('.arsk-row--section > .arsk-col-12 > .arsk-portlet')} {
    width: 100%;
    max-width: 100%;
}
${scope('.arsk-grid-item')} {
    margin-bottom: 0;
    box-sizing: border-box;
}
${scope('.arsk-row--grid')} {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    grid-template-rows: repeat(2, minmax(0, 1fr));
    column-gap: ${ARSK_GRID_COL_GAP}px;
    row-gap: ${ARSK_GRID_ROW_GAP}px;
    width: 100%;
    max-width: 100%;
    margin: 0;
    margin-left: 0;
    margin-right: 0;
    box-sizing: border-box;
}
${scope('.arsk-row--grid > .arsk-col-6')} {
    display: flex;
    flex-direction: column;
    flex: unset;
    max-width: none;
    width: 100%;
    min-width: 0;
    min-height: 0;
    padding: 0;
    box-sizing: border-box;
}
${scope('.arsk-row--grid > .arsk-col-6 > .arsk-grid-card')} {
    flex: 1 1 auto;
    width: 100%;
    max-width: 100%;
}
${scope('.arsk-expand-item')} {
    margin-bottom: ${ARSK_EXPAND_COL_GAP}px;
    box-sizing: border-box;
}

${scope('.arsk-portlet')} {
    display: flex;
    flex-direction: column;
    width: 100%;
    background: ${SKELETON_SURFACE};
    border: 1px solid ${SKELETON_BORDER};
    border-radius: ${ARSK_BORDER_RADIUS}px;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.08);
    padding: ${ARSK_PORTLET_PADDING}px;
    margin-bottom: ${ARSK_PORTLET_GAP}px;
    overflow: hidden;
    box-sizing: border-box;
}
${scope('.arsk-row--expand .arsk-portlet')},
${scope('.arsk-row--perf-insights .arsk-portlet')},
${scope('.arsk-row--section .arsk-portlet')} {
    margin-bottom: 0;
}
${scope('.arsk-portlet--sm')} {
    height: ${LIVE_PORTLET_SM_HEIGHT}px;
    min-height: ${LIVE_PORTLET_SM_HEIGHT}px;
    max-height: ${LIVE_PORTLET_SM_HEIGHT}px;
}
${scope('.arsk-portlet--md')} {
    height: ${LIVE_PORTLET_MD_HEIGHT}px;
    min-height: ${LIVE_PORTLET_MD_HEIGHT}px;
    max-height: ${LIVE_PORTLET_MD_HEIGHT}px;
}
${scope('.arsk-portlet-header')} {
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex: 0 0 ${ARSK_HEADER_BAR_HEIGHT}px;
    height: ${ARSK_HEADER_BAR_HEIGHT}px;
    min-height: ${ARSK_HEADER_BAR_HEIGHT}px;
    margin: 0 0 ${ARSK_PORTLET_HEADER_BODY_GAP}px;
    padding: 0;
    position: relative;
    top: 0;
    box-sizing: border-box;
}
${scope('.arsk-portlet-header .arsk-block:not(.arsk-portlet-header-icon)')} {
    height: ${ARSK_HEADER_BAR_HEIGHT}px;
    min-height: ${ARSK_HEADER_BAR_HEIGHT}px;
    flex-shrink: 0;
    box-sizing: border-box;
}
${scope('.arsk-portlet-header-icon')} {
    width: ${ARSK_ICON_SIZE}px;
    height: ${ARSK_ICON_SIZE}px;
    min-width: ${ARSK_ICON_SIZE}px;
    min-height: ${ARSK_ICON_SIZE}px;
    flex-shrink: 0;
    box-sizing: border-box;
}
${scope('.arsk-portlet-header-actions .arsk-block')} {
    height: ${ARSK_HEADER_BAR_HEIGHT}px;
    min-height: ${ARSK_HEADER_BAR_HEIGHT}px;
    flex-shrink: 0;
    box-sizing: border-box;
}
${scope('.arsk-portlet-body')} {
    display: flex;
    flex-direction: column;
    flex: 1 1 auto;
    min-height: 0;
    box-sizing: border-box;
}
${scope('.arsk-portlet--sm .arsk-portlet-body')} {
    flex: 0 0 ${LIVE_PORTLET_SM_BODY_HEIGHT}px;
    height: ${LIVE_PORTLET_SM_BODY_HEIGHT}px;
    min-height: ${LIVE_PORTLET_SM_BODY_HEIGHT}px;
    max-height: ${LIVE_PORTLET_SM_BODY_HEIGHT}px;
}
${scope('.arsk-portlet--md .arsk-portlet-body')} {
    flex: 0 0 ${LIVE_PORTLET_MD_BODY_HEIGHT}px;
    height: ${LIVE_PORTLET_MD_BODY_HEIGHT}px;
    min-height: ${LIVE_PORTLET_MD_BODY_HEIGHT}px;
    max-height: ${LIVE_PORTLET_MD_BODY_HEIGHT}px;
}
${scope('.arsk-portlet--perf-snap .arsk-portlet-body')} {
    flex: 1 1 auto;
    height: auto;
    min-height: 0;
    max-height: none;
    display: flex;
    flex-direction: column;
}
${scope('.arsk-portlet--insights .arsk-portlet-body')} {
    flex: 1 1 auto;
    height: auto;
    min-height: 0;
    max-height: none;
}
${scope('.arsk-portlet-chart')} {
    width: 100%;
    height: 100%;
    flex: 1 1 auto;
    min-height: 0;
}
${scope('.arsk-portlet-body--insights')} {
    flex: 1 1 auto;
    min-height: 0;
    padding: 0;
    overflow: hidden;
    box-sizing: border-box;
}
${scope('.arsk-portlet-body--insights .arsk-insights-bars')} {
    flex: 1 1 auto;
    min-height: 0;
    height: 100%;
    justify-content: space-between;
}
${scope('.arsk-insights-bars')} {
    display: flex;
    flex-direction: column;
    width: 100%;
    gap: ${INSIGHTS_BAR_GAP}px;
    box-sizing: border-box;
}
${scope('.arsk-insights-bar')} {
    display: block;
    width: 100%;
    height: ${INSIGHTS_BAR_HEIGHT}px;
    min-height: ${INSIGHTS_BAR_HEIGHT}px;
    border-radius: 999px;
    flex-shrink: 0;
    box-sizing: border-box;
}
${scope('.arsk-portlet--auto')} {
    height: auto;
    min-height: 0;
    max-height: none;
}
${scope('.arsk-portlet-body--auto')} {
    flex: 1 1 auto;
    width: 100%;
    height: auto;
    min-height: 0;
    max-height: none;
    padding: 0;
    box-sizing: border-box;
}
${scope('.arsk-portlet--comm-chart')} {
    display: flex;
    flex-direction: column;
}
${scope('.arsk-portlet--comm-chart .arsk-portlet-body--auto')} {
    flex: 1 1 auto;
    display: flex;
    flex-direction: column;
    min-height: ${COMM_ANALYSIS_LINE_CHART_BODY_HEIGHT}px;
}
${scope('.arsk-portlet--comm-chart .arsk-comm-line-chart-wrap')} {
    flex: 1 1 0%;
    width: 100%;
    min-height: ${COMM_ANALYSIS_LINE_CHART_BODY_HEIGHT}px;
    height: 100%;
    margin-top: 0;
    display: flex;
    flex-direction: column;
    box-sizing: border-box;
}
${scope('.arsk-portlet--comm-chart .arsk-comm-bar-chart-wrap')} {
    flex: 1 1 0%;
    width: 100%;
    min-height: ${COMM_ANALYSIS_LINE_CHART_BODY_HEIGHT}px;
    height: 100%;
    margin-top: 0;
    display: flex;
    flex-direction: column;
    box-sizing: border-box;
}
${scope('.arsk-portlet--comm-chart .arsk-comm-bar-chart-wrap .skeleton-span-con')} {
    flex: 1 1 auto;
    width: 100%;
    min-height: ${COMM_ANALYSIS_LINE_CHART_BODY_HEIGHT}px;
    height: 100%;
    position: relative;
    box-sizing: border-box;
}
${scope('.arsk-comm-bar-chart-wrap .nodata-bar')} {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    z-index: 3;
    pointer-events: none;
    box-sizing: border-box;
}
${scope('.arsk-portlet--comm-chart .arsk-comm-line-chart-wrap .skeleton-line-chart-con')} {
    flex: 1 1 auto;
    width: 100%;
    height: 100%;
    min-height: 0;
    display: flex;
    flex-direction: column;
    box-sizing: border-box;
}
${scope('.arsk-portlet--comm-chart .arsk-comm-line-chart-wrap .mdm-sk-list-acquisition-skeleton')} {
    flex: 1 1 auto;
    width: 100%;
    height: 100%;
    min-height: ${COMM_ANALYSIS_LINE_CHART_BODY_HEIGHT}px;
    display: flex;
    flex-direction: column;
    box-sizing: border-box;
}
${scope('.arsk-comm-line-chart-wrap .skeleton-line-chart-con')} {
    position: relative;
    box-sizing: border-box;
}
${scope('.arsk-comm-line-chart-wrap .nodata-skeleton-con')},
${scope('.arsk-comm-line-chart-wrap .nodata-bar')} {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    z-index: 3;
    pointer-events: none;
    box-sizing: border-box;
}
${scope('.arsk-portlet--comm-chart .arsk-comm-line-chart-wrap .mdm-sk-list-acquisition-chart')} {
    flex: 1 1 auto;
    width: 100%;
    height: auto !important;
    min-height: ${COMM_ANALYSIS_LINE_CHART_HEIGHT}px !important;
    position: relative;
    box-sizing: border-box;
}
${scope('.arsk-portlet--comm-chart .arsk-comm-line-chart-wrap .mdm-sk-list-acquisition-axes')} {
    position: absolute;
    left: 50px;
    top: 0;
    width: calc(100% - 65px);
    height: 100%;
    border-left: 1px solid #e9e9e9;
    border-bottom: 1px solid #e9e9e9;
    box-sizing: border-box;
}
${scope('.arsk-portlet--comm-chart .arsk-comm-line-chart-wrap .mdm-sk-list-acquisition-chart-svg')} {
    position: absolute;
    left: 50px;
    top: 0;
    width: calc(100% - 65px);
    height: 100%;
}
${scope('.arsk-portlet--comm-chart .arsk-comm-line-chart-wrap .mdm-sk-list-acquisition-legend')} {
    flex: 0 0 auto;
    margin-top: 21px;
}
${scope('.arsk-comm-line-chart-wrap')} {
    flex: 1 1 auto;
    width: 100%;
    min-height: 0;
    margin-top: 0;
    box-sizing: border-box;
}
${scope('.arsk-comm-line-chart-wrap .skeleton-line-chart-con')} {
    width: 100%;
    height: 100%;
    min-height: 0;
    box-sizing: border-box;
}
${scope('.arsk-comm-line-chart-wrap .list-acquisition-chart-skeleton-wrap')} {
    width: 100%;
    max-width: 100%;
    box-sizing: border-box;
}
${scope('.arsk-portlet--comm-table .arsk-portlet-body--auto')} {
    min-height: 420px;
}
${scope('.arsk-portlet--roi .arsk-portlet-body--auto')} {
    min-height: 360px;
}
${scope('.arsk-portlet--benchmark .arsk-portlet-body--auto')} {
    min-height: 380px;
}
${scope('.arsk-portlet-header--actions')} {
    flex-wrap: nowrap;
    gap: 12px;
}
${scope('.arsk-portlet-header-actions')} {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: 10px;
    margin-left: auto;
    flex-shrink: 0;
}
${scope('.arsk-tab-strip')} {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: 8px;
    width: 100%;
    padding: 0 0 12px;
    box-sizing: border-box;
}
${scope('.arsk-portlet-header--channel')} {
    justify-content: flex-start;
    gap: 8px;
}
${scope('.arsk-detail-tabs-wrap')} {
    width: 100%;
    margin-bottom: 10px;
    box-sizing: border-box;
}
${scope('.arsk-detail-tabs')} {
    display: flex;
    align-items: center;
    flex-wrap: nowrap;
    width: 100%;
    min-height: 43px;
    margin: 0;
    padding: 0;
    list-style: none;
    background-color: #e9e9e9;
    border-top-left-radius: ${ARSK_BORDER_RADIUS}px;
    border-top-right-radius: ${ARSK_BORDER_RADIUS}px;
    box-sizing: border-box;
    overflow-x: auto;
}
${scope('.arsk-detail-tabs__item')} {
    display: flex;
    align-items: center;
    min-height: 37px;
    padding: 3px 20px;
    box-sizing: border-box;
    flex-shrink: 0;
}
${scope('.arsk-channel-analytics-body')} {
    display: flex;
    flex-wrap: nowrap;
    align-items: stretch;
    column-gap: ${ARSK_CHANNEL_ANALYTICS_COL_GAP}px;
    width: 100%;
    margin: 0;
    box-sizing: border-box;
}
${scope('.arsk-channel-analytics-main')} {
    flex: 2 1 0;
    min-width: 0;
    max-width: none;
    min-height: 150px;
    box-sizing: border-box;
}
${scope('.arsk-channel-analytics-preview')} {
    flex: 1 1 0;
    min-width: 0;
    max-width: none;
    display: flex;
    flex-direction: column;
    min-height: 0;
    box-sizing: border-box;
}
${scope('.arsk-channel-analytics-metrics')} {
    display: flex;
    width: 100%;
    box-sizing: border-box;
}
${scope('.arsk-channel-metrics-col')} {
    flex: 0 0 50%;
    max-width: 50%;
    min-width: 0;
    box-sizing: border-box;
}
${scope('.arsk-channel-metrics-row')} {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
    min-height: 38px;
    padding: 8px 10px;
    box-sizing: border-box;
}
${scope('.arsk-channel-metrics-row--stripe')} {
    background-color: ${CHANNEL_ANALYTICS_STRIPE_BG};
}
${scope('.arsk-channel-analytics-details')} {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    margin-top: 4px;
    padding-right: 4px;
    box-sizing: border-box;
}
${scope('.arsk-channel-preview-panel')} {
    width: 100%;
    flex: 1 1 auto;
    min-height: 0;
    height: 100%;
    margin: 0;
    padding: 0;
    border: 1px solid ${CHANNEL_ANALYTICS_PREVIEW_BG};
    border-radius: 8px;
    background-color: ${CHANNEL_ANALYTICS_PREVIEW_BG};
    box-sizing: border-box;
    overflow: hidden;
}
${scope('.arsk-channel-preview-panel__fill')} {
    display: block;
    width: 100%;
    height: 100%;
    border-radius: 8px;
}
@media (max-width: 767.98px) {
    ${scope('.arsk-channel-analytics-main')},
    ${scope('.arsk-channel-analytics-preview')} {
        flex: 0 0 100%;
        max-width: 100%;
    }
}
${scope('.arsk-portlet--benchmark .skeleton-span-con')} {
    width: 100%;
    box-sizing: border-box;
}

${scope('.arsk-portlet-body .portlet-header')} {
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex: 0 0 ${ARSK_HEADER_BAR_HEIGHT}px;
    height: ${ARSK_HEADER_BAR_HEIGHT}px;
    min-height: ${ARSK_HEADER_BAR_HEIGHT}px;
    margin: 0 0 ${ARSK_PORTLET_HEADER_BODY_GAP}px;
    padding: 0;
    position: relative;
    top: 0;
    box-sizing: border-box;
}
${scope('.arsk-portlet-body .portlet-header .react-loading-skeleton')} {
    height: ${ARSK_HEADER_BAR_HEIGHT}px !important;
    min-height: ${ARSK_HEADER_BAR_HEIGHT}px !important;
    line-height: ${ARSK_HEADER_BAR_HEIGHT}px !important;
}
`;

const ANALYTICS_REPORT_LIVE_SCOPE = '.analytics-report-skeleton-scope';
const liveScope = (selector) => `${ANALYTICS_REPORT_LIVE_SCOPE} ${selector}`;

const buildAnalyticsReportLiveSummaryCardCss = () => `
${liveScope('.analytic-summary-card.arsk-summary-card')} {
    display: flex !important;
    flex-direction: column !important;
    height: ${ARSK_SUMMARY_CARD_HEIGHT}px !important;
    min-height: ${ARSK_SUMMARY_CARD_HEIGHT}px !important;
    padding: ${ARSK_PORTLET_PADDING}px !important;
    background-color: ${SKELETON_SURFACE} !important;
    border: 1px solid ${SKELETON_BORDER} !important;
    border-radius: ${ARSK_BORDER_RADIUS}px !important;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.08) !important;
    overflow: hidden !important;
    box-sizing: border-box;
}
${liveScope('.analytic-summary-card.arsk-summary-card > .a-card-header')} {
    flex: 0 0 ${ARSK_HEADER_BAR_HEIGHT}px;
    min-height: ${ARSK_HEADER_BAR_HEIGHT}px;
    margin: 0 0 ${ARSK_PORTLET_HEADER_BODY_GAP}px !important;
    padding: 0 !important;
    display: flex;
    align-items: center;
    justify-content: space-between;
    box-sizing: border-box;
}
${liveScope('.analytic-summary-card.arsk-summary-card .a-card-label')} {
    display: flex;
    align-items: center;
    gap: 8px;
    box-sizing: border-box;
}
${liveScope('.analytic-summary-card.arsk-summary-card .a-card-dropdown-icon .analytics-icon-group')} {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: 8px;
    box-sizing: border-box;
}
${liveScope('.analytic-summary-card.arsk-summary-card .a-card-list-wrapper')} {
    flex: 1 1 0%;
    min-height: 0;
    display: flex;
    flex-direction: column;
    margin: 0 !important;
    padding: 0 !important;
    box-sizing: border-box;
}
${liveScope('.analytic-summary-card.arsk-summary-card .a-card-list-wrapper > .width100p')} {
    flex: 1 1 auto;
    min-height: 0;
    display: flex;
    flex-direction: column;
    margin: 0 !important;
    padding: 0 !important;
    box-sizing: border-box;
}
${liveScope('.analytic-summary-card.arsk-summary-card .skeleton-span-con > div:first-child .nodata-bar')} {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    z-index: 3;
    pointer-events: none;
    box-sizing: border-box;
}
${liveScope('.analytic-summary-card.arsk-summary-card .skeleton-span-con')} {
    flex: 1 1 0%;
    min-height: 0;
    position: relative;
    box-sizing: border-box;
}`;

const buildAnalyticsReportLiveCommAnalysisCss = () => `
${liveScope('.portlet-container.Commuanalysis.arsk-portlet--comm-chart')} {
    display: flex;
    flex-direction: column;
    box-sizing: border-box;
}
${liveScope('.portlet-container.arsk-portlet--comm-chart .arsk-portlet-body--auto')} {
    flex: 1 1 auto;
    min-height: ${COMM_ANALYSIS_LINE_CHART_BODY_HEIGHT}px;
    display: flex;
    flex-direction: column;
    box-sizing: border-box;
}
${liveScope('.portlet-container.arsk-portlet--comm-chart .arsk-comm-line-chart-wrap')} {
    flex: 1 1 0%;
    width: 100%;
    min-height: ${COMM_ANALYSIS_LINE_CHART_BODY_HEIGHT}px;
    height: 100%;
    display: flex;
    flex-direction: column;
    box-sizing: border-box;
}
${liveScope('.portlet-container.arsk-portlet--comm-chart .arsk-comm-line-chart-wrap .skeleton-line-chart-con')} {
    flex: 1 1 auto;
    width: 100%;
    height: 100%;
    min-height: ${COMM_ANALYSIS_LINE_CHART_BODY_HEIGHT}px;
    display: flex;
    flex-direction: column;
    box-sizing: border-box;
}
${liveScope('.portlet-container.arsk-portlet--comm-chart .arsk-comm-bar-chart-wrap')} {
    flex: 1 1 0%;
    width: 100%;
    min-height: ${COMM_ANALYSIS_LINE_CHART_BODY_HEIGHT}px;
    height: 100%;
    display: flex;
    flex-direction: column;
    box-sizing: border-box;
}
${liveScope('.portlet-container.arsk-portlet--comm-chart .arsk-comm-bar-chart-wrap .skeleton-span-con')} {
    flex: 1 1 auto;
    width: 100%;
    min-height: ${COMM_ANALYSIS_LINE_CHART_BODY_HEIGHT}px;
    height: 100%;
    position: relative;
    box-sizing: border-box;
}
${liveScope('.arsk-comm-bar-chart-wrap .nodata-bar')} {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    z-index: 3;
    pointer-events: none;
    box-sizing: border-box;
}
${liveScope('.portlet-container.arsk-portlet--comm-chart .arsk-comm-line-chart-wrap .mdm-sk-list-acquisition-skeleton')} {
    flex: 1 1 auto;
    width: 100%;
    height: 100%;
    min-height: ${COMM_ANALYSIS_LINE_CHART_BODY_HEIGHT}px;
    display: flex;
    flex-direction: column;
    box-sizing: border-box;
}
${liveScope('.arsk-comm-line-chart-wrap .skeleton-line-chart-con')} {
    position: relative;
    box-sizing: border-box;
}
${liveScope('.arsk-comm-line-chart-wrap .nodata-skeleton-con')},
${liveScope('.arsk-comm-line-chart-wrap .nodata-bar')} {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    z-index: 3;
    pointer-events: none;
    box-sizing: border-box;
}
${liveScope('.portlet-container.Commuanalysis .portlet-chart.mt30 .mdm-sk-list-acquisition-skeleton')} {
    position: relative;
    min-height: ${COMM_ANALYSIS_LINE_CHART_BODY_HEIGHT}px;
    display: flex;
    flex-direction: column;
    box-sizing: border-box;
}
${liveScope('.portlet-container.Commuanalysis .portlet-chart.mt30 .mdm-sk-list-acquisition-chart')} {
    min-height: ${COMM_ANALYSIS_LINE_CHART_HEIGHT}px !important;
    flex: 1 1 auto;
    box-sizing: border-box;
}
${liveScope('.portlet-container.Commuanalysis .portlet-chart.mt30 .mdm-sk-list-acquisition-error')} {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    z-index: 3;
    pointer-events: none;
    box-sizing: border-box;
}
${liveScope('.portlet-container.arsk-portlet--comm-chart .arsk-comm-line-chart-wrap .mdm-sk-list-acquisition-chart')} {
    flex: 1 1 auto;
    width: 100%;
    height: auto !important;
    min-height: ${COMM_ANALYSIS_LINE_CHART_HEIGHT}px !important;
    position: relative;
    box-sizing: border-box;
}
${liveScope('.portlet-container.arsk-portlet--comm-chart .arsk-comm-line-chart-wrap .mdm-sk-list-acquisition-axes')} {
    position: absolute;
    left: 50px;
    top: 0;
    width: calc(100% - 65px);
    height: 100%;
    border-left: 1px solid #e9e9e9;
    border-bottom: 1px solid #e9e9e9;
    box-sizing: border-box;
}
${liveScope('.portlet-container.arsk-portlet--comm-chart .arsk-comm-line-chart-wrap .mdm-sk-list-acquisition-chart-svg')} {
    position: absolute;
    left: 50px;
    top: 0;
    width: calc(100% - 65px);
    height: 100%;
}
${liveScope('.portlet-container.arsk-portlet--comm-chart .arsk-comm-line-chart-wrap .mdm-sk-list-acquisition-legend')} {
    flex: 0 0 auto;
    margin-top: 21px;
}`;

const buildAnalyticsReportLiveChannelAnalyticsCss = () => `
${liveScope('.portlet-container.arsk-portlet--comm-table .portlet-fluid-tab')} {
    display: flex;
    flex-direction: column;
    min-height: 420px;
    box-sizing: border-box;
}
${liveScope('.arsk-channel-analytics-slot')} {
    display: flex;
    flex-direction: column;
    flex: 1 1 auto;
    width: 100%;
    min-height: 420px;
    position: relative;
    box-sizing: border-box;
}
${liveScope('.arsk-channel-analytics-slot > .arsk-portlet-body--auto')} {
    flex: 1 1 auto;
    min-height: 0;
    display: flex;
    flex-direction: column;
    box-sizing: border-box;
}
${liveScope('.arsk-channel-analytics-slot .arsk-channel-preview-panel')} {
    min-height: ${CHANNEL_ANALYTICS_PREVIEW_HEIGHT}px;
}
${liveScope('.arsk-channel-analytics-slot--nodata .arsk-block::after')} {
    animation: none;
}
${liveScope('.arsk-channel-analytics-slot > .nodata-bar')} {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    z-index: 3;
    pointer-events: none;
    box-sizing: border-box;
}
${liveScope('.portlet-container.arsk-portlet--comm-table .arsk-channel-analytics-body-slot')} {
    display: flex;
    flex: 1 1 auto;
    width: 100%;
    min-height: 330px;
    margin-top: 10px;
    position: relative;
    box-sizing: border-box;
}
${liveScope('.portlet-container.arsk-portlet--comm-table .arsk-channel-analytics-body-slot .arsk-channel-analytics-body')} {
    flex: 1 1 auto;
    width: 100%;
    min-height: 330px;
    box-sizing: border-box;
}
${liveScope('.portlet-container.arsk-portlet--comm-table .arsk-channel-analytics-body-slot .arsk-channel-preview-panel')} {
    min-height: ${CHANNEL_ANALYTICS_PREVIEW_HEIGHT}px;
}`;

/** Injected on live CSR page so portlet skeletons match route critical CSS before app.scss loads. */
export const analyticsReportLiveSkeletonCriticalCss = `
${buildAnalyticsReportLiveSummaryCardCss()}
${buildAnalyticsReportLiveCommAnalysisCss()}
${buildAnalyticsReportLiveChannelAnalyticsCss()}
`;
