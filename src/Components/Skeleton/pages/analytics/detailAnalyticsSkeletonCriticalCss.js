/** Detail analytics overall page — self-contained dask-* skeleton before app.scss. */
import { gridLoadingSkeletonCriticalCss } from 'Pages/KendoDocs/CommonComponents/ResKendoGrid/gridLoadingSkeletonCriticalCss';

const DASK_PAGE_BG = '#f5f7fc';
const DASK_SURFACE = '#ffffff';
const DASK_SKELETON_BG = '#e2e7ee';
const DASK_TAB_BG = '#e9e9e9';
const DASK_BORDER = '#c2cfe3';
const DASK_PAGE_MAX_WIDTH = 1260;
const DASK_BORDER_RADIUS = 5;
const DASK_GUTTER_HALF = 12;
const DASK_ROW_GAP = 15;
const DASK_PORTLET_PADDING = 19;
const DASK_PORTLET_MD_HEIGHT = 411;
const DASK_PORTLET_HEADER_HEIGHT = 30;
const DASK_PORTLET_HEADER_GAP = 15;
const DASK_PORTLET_BOTTOM_GAP = 25;
const DASK_OVERVIEW_CARD_HEIGHT = 158;
const DASK_COMPARISON_BAR_HEIGHT = 36;
const DASK_TAB_MIN_HEIGHT = 43;
const DASK_SPLIT_HEADER_HEIGHT = 55;
const DASK_LINE_CHART_MIN_HEIGHT = 220;
const DASK_PORTLET_BODY_HEIGHT =
    DASK_PORTLET_MD_HEIGHT - DASK_PORTLET_HEADER_HEIGHT - DASK_PORTLET_PADDING * 2 - DASK_PORTLET_HEADER_GAP - 1;

const DASK_SCOPES = [
    '.dask-scope',
    '.analytics-detail-skeleton-scope',
    '.analytics-detail-skeleton',
    '.analytics-detail-inline-skeleton',
];

const scope = (selector) => DASK_SCOPES.map((root) => `${root} ${selector}`).join(',\n');

const buildDaskShimmerCss = () => `
@keyframes daskSkeletonShimmer {
    0% { left: -100%; }
    100% { left: 100%; }
}
${scope('.dask-block')} {
    position: relative;
    overflow: hidden;
    display: block;
    flex-shrink: 0;
    background-color: ${DASK_SKELETON_BG};
    border-radius: 4px;
    box-sizing: border-box;
}
${scope('.dask-block::after')} {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background-image: linear-gradient(90deg, transparent, #eef2f9, transparent);
    animation: daskSkeletonShimmer 2s infinite;
    pointer-events: none;
    z-index: 1;
}
${scope('.dask-block--circle')} {
    border-radius: 50%;
}
${scope('.dask-tab-strip .dask-block::after')} {
    display: none;
    animation: none;
}
${scope('.skeleton-shimmer')},
${scope('.react-loading-skeleton')} {
    background-color: ${DASK_SKELETON_BG} !important;
    border-radius: 4px;
}`;

const buildDaskGridCss = () => `
${scope('.dask-row')} {
    display: flex;
    flex-wrap: wrap;
    width: 100%;
    max-width: 100%;
    padding-left: 0;
    padding-right: 0;;
    box-sizing: border-box;
}
${scope('.dask-row--gap')} {
    gap: ${DASK_ROW_GAP}px;
}
${scope('.dask-col')} {
    box-sizing: border-box;
    min-width: 0;
    padding-left: 0;
    padding-right: 0;
}
${scope('.dask-row--overview-cards .dask-col-4')} {
    flex: 1 1 0;
    max-width: none;
}
${scope('.dask-row--chart-metrics .dask-col-8')} {
    flex: 2 1 0;
    max-width: none;
}
${scope('.dask-row--chart-metrics .dask-col-4')} {
    flex: 1 1 0;
    max-width: none;
}
${scope('.dask-row--split-charts .dask-col-6')},
${scope('.dask-row--pie-charts .dask-col-6')} {
    flex: 1 1 0;
    max-width: none;
}
${scope('.dask-col-4')} {
    flex: 0 0 33.333333%;
    max-width: 33.333333%;
}
${scope('.dask-col-8')} {
    flex: 0 0 66.666667%;
    max-width: 66.666667%;
}
${scope('.dask-col-6')} {
    flex: 0 0 50%;
    max-width: 50%;
}
${scope('.dask-col-12')} {
    flex: 0 0 100%;
    max-width: 100%;
}
${scope('.dask-row--overview-cards')} {
    margin-bottom: 0;
}
${scope('.dask-row--chart-metrics')},
${scope('.dask-row--split-charts')},
${scope('.dask-row--pie-charts')},
${scope('.dask-row--grid-portlets')} {
    margin-top: 0;
    width: 100%;
}
@media (max-width: 767.98px) {
    ${scope('.dask-row--gap .dask-col-4')},
    ${scope('.dask-row--gap .dask-col-8')},
    ${scope('.dask-row--gap .dask-col-6')},
    ${scope('.dask-col-4')},
    ${scope('.dask-col-8')},
    ${scope('.dask-col-6')},
    ${scope('.dask-col-12')} {
        flex: 0 0 100%;
        max-width: 100%;
    }
}`;

const buildDaskTabCss = () => `
${scope('.dask-tab-wrap')} {
    margin-top: 0;
    margin-bottom: 10px;
    width: 100%;
}
${scope('.dask-tab-strip')} {
    min-height: ${DASK_TAB_MIN_HEIGHT}px;
    display: flex;
    align-items: center;
    width: 100%;
    margin: 0;
    padding: 0;
    list-style: none;
    background-color: ${DASK_TAB_BG};
    border-top-left-radius: ${DASK_BORDER_RADIUS}px;
    border-top-right-radius: ${DASK_BORDER_RADIUS}px;
    box-sizing: border-box;
}
${scope('.dask-tab-strip__item')} {
    display: flex;
    align-items: center;
    min-height: 37px;
    padding: 3px 20px;
    box-sizing: border-box;
}`;

const buildDaskSplitHeaderCss = () => `
${scope('.dask-split-header')} {
    min-height: ${DASK_SPLIT_HEADER_HEIGHT}px;
    margin-bottom: 10px;
    padding: 0 16px;
    background-color: ${DASK_SKELETON_BG};
    border-radius: 6px;
    display: flex;
    align-items: center;
    justify-content: flex-end;
    box-sizing: border-box;
}
${scope('.dask-split-header__inner')} {
    display: flex;
    align-items: center;
    gap: 10px;
}`;

const buildDaskOverviewCss = () => `
${scope('.dask-overview-header')} {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin: 10px 0;
    width: 100%;
    box-sizing: border-box;
}
${scope('.dask-overview-header__left')},
${scope('.dask-overview-header__right')} {
    display: flex;
    align-items: center;
    gap: 10px;
}
${scope('.d-flex')} {
    display: flex;
}
${scope('.align-items-center')} {
    align-items: center;
}
${scope('.mr10')} {
    margin-right: 10px;
}
${scope('.mr7')} {
    margin-right: 7px;
}
${scope('.pl0')} {
    padding-left: 0;
}
${scope('.mb0')} {
    margin-bottom: 0;
}
${scope('.csr-reach-portlet.skeleton-overview-card')} {
    width: 100%;
    max-width: 100%;
    height: ${DASK_OVERVIEW_CARD_HEIGHT}px;
    margin-bottom: 0;
    background: ${DASK_SURFACE};
    border: 1px solid ${DASK_BORDER};
    border-radius: ${DASK_BORDER_RADIUS}px;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.08);
    overflow: hidden;
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
}
${scope('.csr-reach-portlet.skeleton-overview-card .portlet-count-top')} {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 10px 15px;
    box-sizing: border-box;
}
${scope('.csr-reach-portlet.skeleton-overview-card .campaignimage')} {
    display: flex;
    align-items: center;
    margin-right: 25px;
}
${scope('.csr-reach-portlet.skeleton-overview-card .campaign-portlet-data')} {
    display: flex;
    align-items: center;
    flex-shrink: 0;
}
${scope('.csr-reach-portlet.skeleton-overview-card .portlet-count-middle')} {
    display: flex;
    align-items: center;
    margin: 0;
    padding: 0 15px 8px;
    box-sizing: border-box;
}
${scope('.csr-reach-portlet.skeleton-overview-card .portlet-count-middle ul')} {
    display: flex;
    align-items: center;
    flex-wrap: nowrap;
    list-style: none;
    margin: 0;
    padding: 0;
    width: 100%;
    box-sizing: border-box;
}
${scope('.csr-reach-portlet.skeleton-overview-card .portlet-count-middle li')} {
    display: inline-flex;
    align-items: center;
    position: relative;
    padding: 0 19px 0 0;
    margin-bottom: 0;
    box-sizing: border-box;
}
${scope('.csr-reach-portlet.skeleton-overview-card .portlet-count-middle li:last-child')} {
    padding-right: 0;
}
${scope('.csr-reach-portlet.skeleton-overview-card .portlet-count-middle li:not(:first-child)::before')} {
    content: '';
    position: absolute;
    left: -9px;
    top: 50%;
    margin-top: -9px;
    height: 18px;
    border-left: 1px solid #e9e9e9;
}
${scope('.csr-reach-portlet.skeleton-overview-card .skeleton-comparison-bar')} {
    margin-top: auto;
    height: ${DASK_COMPARISON_BAR_HEIGHT}px;
    margin-left: 2px;
    margin-right: 2px;
    margin-bottom: 2px;
    border-radius: 0 0 6px 6px;
    background-color: ${DASK_SKELETON_BG};
}
${scope('.dask-row--overview-cards .csr-reach-portlet.skeleton-overview-card')} {
    margin-bottom: 0;
}`;

const buildDaskPortletCss = () => `
${scope('.dask-section-heading')} {
    display: block;
    margin-top: 21px;
    margin-bottom: 21px;
}
${scope('.dask-section-heading--lg')} {
    margin-top: 15px;
    margin-bottom: 15px;
}
${scope('.dask-portlet')} {
    background: ${DASK_SURFACE};
    border: 1px solid ${DASK_BORDER};
    border-radius: ${DASK_BORDER_RADIUS}px;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.08);
    margin-bottom: ${DASK_PORTLET_BOTTOM_GAP}px;
    padding: ${DASK_PORTLET_PADDING}px;
    position: relative;
    overflow: hidden;
    box-sizing: border-box;
}
${scope('.dask-portlet--md')} {
    height: ${DASK_PORTLET_MD_HEIGHT}px;
    display: flex;
    flex-direction: column;
}
${scope('.dask-portlet-header')} {
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex: 0 0 ${DASK_PORTLET_HEADER_HEIGHT}px;
    height: ${DASK_PORTLET_HEADER_HEIGHT}px;
    margin-bottom: ${DASK_PORTLET_HEADER_GAP}px;
    position: relative;
    top: -5px;
    box-sizing: border-box;
}
${scope('.dask-portlet-header--single')} {
    justify-content: flex-start;
}
${scope('.dask-portlet-header__tabs')} {
    display: flex;
    align-items: center;
    gap: 0;
}
${scope('.dask-portlet-header__pipe')} {
    margin: 0 10px;
    color: ${DASK_BORDER};
    font-weight: bold;
    line-height: 1;
}
${scope('.dask-portlet-chart')},
${scope('.dask-portlet-body')} {
    flex: 1 1 auto;
    min-height: 0;
    height: ${DASK_PORTLET_BODY_HEIGHT}px;
    box-sizing: border-box;
}
${scope('.dask-portlet-chart')} {
    display: flex;
    flex-direction: column;
    margin: 0 -5px;
}
${scope('.dask-portlet-body')} {
    overflow: hidden;
}
${scope('.dask-portlet-chart--column')} {
    padding: 0 5px;
    overflow: hidden;
}
${scope('.dask-portlet-chart--pie')} {
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
}`;

const buildDaskColumnChartCss = () => `
${scope('.dask-column-chart')} {
    width: 100%;
    height: 100%;
    padding: 0 15px 20px;
    box-sizing: border-box;
}
${scope('.dask-column-chart__plot')} {
    width: 100%;
    height: 100%;
    min-height: 280px;
    border-left: 1px solid ${DASK_TAB_BG};
    border-bottom: 1px solid ${DASK_TAB_BG};
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    gap: 4px;
    padding: 0 12px 20px 12px;
    box-sizing: border-box;
}
${scope('.dask-column-chart__bar')} {
    flex: 0 0 33px;
    width: 33px;
    min-width: 33px;
    border-radius: 4px;
}`;

const buildDaskPieChartCss = () => `
${scope('.dask-pie-chart')} {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 20px 15px 15px;
    box-sizing: border-box;
}
${scope('.dask-pie-chart__circle')} {
    flex-shrink: 0;
}
${scope('.dask-pie-chart__legend')} {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: center;
    gap: 8px 12px;
    margin-top: 15px;
    width: 100%;
    max-width: 320px;
}`;

const DASK_GRID_PORTLET_MARGIN = 30;

const buildDaskGridPortletCss = () => `
${scope('.dask-grid-portlet')} {
    background: ${DASK_SURFACE};
    border: 1px solid ${DASK_BORDER};
    border-radius: ${DASK_BORDER_RADIUS}px;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.08);
    margin-bottom: ${DASK_GRID_PORTLET_MARGIN}px;
    padding: ${DASK_PORTLET_PADDING}px;
    overflow: hidden;
    width: 100%;
    max-width: 100%;
    box-sizing: border-box;
}
${scope('.dask-grid-portlet:last-child')} {
    margin-bottom: ${DASK_PORTLET_BOTTOM_GAP}px;
}
${scope('.dask-grid-portlet__header')} {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 6px;
    min-height: 25px;
    box-sizing: border-box;
}
${scope('.dask-grid-portlet__header-left')},
${scope('.dask-grid-portlet__header-right')} {
    display: flex;
    align-items: center;
    gap: 10px;
}
${scope('.dask-grid-portlet__body')} {
    margin-top: 15px;
    overflow: hidden;
    width: 100%;
    box-sizing: border-box;
}
${scope('.dask-grid-portlet__grid-wrap')} {
    overflow: hidden;
    width: 100%;
    max-width: 100%;
    box-sizing: border-box;
}
${scope('.dask-grid-portlet__grid-wrap .rs-grid-loading-skeleton')} {
    width: 100%;
    max-width: 100%;
    margin: 0;
    box-sizing: border-box;
}
${scope('.dask-grid-portlet__grid-wrap .rs-grid-loading-skeleton table.k-grid-table')} {
    width: 100% !important;
    max-width: 100% !important;
}`;

const buildDaskKeyMetricsCss = () => `
${scope('.dask-key-metrics')} {
    width: 100%;
    box-sizing: border-box;
}
${scope('.dask-key-metrics__row')} {
    display: flex;
    width: 100%;
    margin-bottom: 12px;
    box-sizing: border-box;
}
${scope('.dask-key-metrics__row:last-child')} {
    margin-bottom: 0;
}
${scope('.dask-key-metrics__row--pair')} {
    gap: ${DASK_GUTTER_HALF}px;
}
${scope('.dask-key-metrics__row--pair .dask-key-metrics__cell')} {
    flex: 1 1 0;
    min-width: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
}
${scope('.dask-key-metrics__row--center')} {
    justify-content: center;
}
${scope('.dask-key-metrics__row--triple')} {
    gap: 0;
}
${scope('.dask-key-metrics__row--triple .dask-key-metrics__cell')} {
    flex: 1 1 0;
    min-width: 0;
    padding-right: 0;
    display: flex;
    flex-direction: column;
    gap: 4px;
}
${scope('.dask-key-metrics__row--triple .dask-key-metrics__cell:not(:last-child)')} {
    padding-right: ${DASK_GUTTER_HALF}px;
}`;

const buildDaskChartCss = () => `
${scope('.dask-portlet-chart .skeleton-line-chart-con')} {
    height: 100%;
    min-height: ${DASK_LINE_CHART_MIN_HEIGHT}px;
    display: flex;
    flex-direction: column;
    width: 100%;
    box-sizing: border-box;
}
${scope('.dask-portlet-chart .list-acquisition-chart-skeleton-wrap')} {
    height: 100%;
    min-height: ${DASK_LINE_CHART_MIN_HEIGHT}px;
    display: flex;
    flex-direction: column;
    flex: 1;
    width: 100%;
    box-sizing: border-box;
}
${scope('.dask-portlet-chart .list-acquisition-chart-skeleton-wrap .list-acquisition-chart-skeleton-inner')} {
    flex: 1;
    min-height: 180px;
}
${scope('.dask-portlet-chart .skeleton-span-con')} {
    width: 100%;
    height: 100%;
    box-sizing: border-box;
}`;

const buildDaskHeaderCss = () => `
.page-content-holder:has(.dask-body) .rs-page-header-csr-page-header,
${scope('.rs-page-header-csr-page-header')} {
    padding-top: 0;
    padding-bottom: 0;
    margin-bottom: 0;
    box-sizing: border-box;
    cursor: not-allowed;
    padding-left:0;
    padding-right:0;
}
.page-content-holder:has(.dask-body) .rs-page-header-skeleton .mhw-container,
${scope('.rs-page-header-skeleton .mhw-container')} {
    max-width: ${DASK_PAGE_MAX_WIDTH}px;
    margin-left: auto;
    margin-right: auto;
    padding-left: 0;
    padding-right: 0;
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    min-height: 45px;
    padding-top: 10px;
    padding-bottom: 10px;
    box-sizing: border-box;
}
${scope('.rs-page-header-skeleton .mhwc-left')},
${scope('.rs-page-header-skeleton .mhwc-right')} {
    display: flex;
    align-items: center;
}
${scope('.rs-page-header-csr-page-header .mhwc-right')} {
    align-items: flex-end;
}
${scope('.rs-page-header-skeleton .repo-title')} {
    margin: 0;
    padding: 0;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
}
${scope('.rs-page-header-skeleton .repo-title .mh-wrapper')} {
    display: flex;
    align-items: center;
    gap: 8px;
}
${scope('.rs-page-header-csr-page-header .repo-title .mh-text .skeleton-shimmer')} {
    display: inline-block;
    vertical-align: middle;
}
${scope('.skeleton-page-header-bar')} {
    display: inline-block;
    vertical-align: middle;
    background-color: ${DASK_SKELETON_BG};
    border-radius: 4px;
    box-sizing: border-box;
    flex-shrink: 0;
}`;

export const detailAnalyticsSkeletonCriticalCss = `
body:has(.analytics-detail-skeleton[aria-busy='true']) .breadcrumbs:not(.page-breadcrumb-skeleton),
body:has(.dask-body) .breadcrumbs:not(.page-breadcrumb-skeleton),
body:has(.analytics-detail-inline-skeleton) .breadcrumbs:not(.page-breadcrumb-skeleton) {
    display: none !important;
}
${buildDaskShimmerCss()}
${buildDaskGridCss()}
${buildDaskTabCss()}
${buildDaskSplitHeaderCss()}
${buildDaskOverviewCss()}
${buildDaskPortletCss()}
${buildDaskColumnChartCss()}
${buildDaskPieChartCss()}
${buildDaskGridPortletCss()}
${buildDaskKeyMetricsCss()}
${buildDaskChartCss()}
${buildDaskHeaderCss()}

.analytics-detail-page-content-holder,
.analytics-detail-skeleton .page-content,
.page-content-holder:has(.dask-body),
.page-content-holder:has(.analytics-detail-inline-skeleton) {
    background-color: ${DASK_PAGE_BG};
    box-sizing: border-box;
}
.analytics-detail-page-content-holder,
.page-content-holder:has(.analytics-detail-skeleton[aria-busy='true']),
.page-content-holder:has(.dask-body) {
    padding-top: 78px;
    width: 100%;
}
.page-layout-skeleton--inline.analytics-skeleton-scope:has(.analytics-detail-skeleton),
.page-layout-skeleton--inline.analytics-skeleton-scope:has(.dask-body) {
    background-color: ${DASK_PAGE_BG};
    min-height: 100vh;
    box-sizing: border-box;
}
.page-layout-skeleton--inline.analytics-skeleton-scope:has(.analytics-detail-skeleton) .analytics-detail-page-content-holder {
    padding-top: 0;
    min-height: 0;
    background-color: ${DASK_PAGE_BG};
}
.page-layout-skeleton--inline.analytics-skeleton-scope:has(.analytics-detail-skeleton) > div:last-child {
    padding-top: 78px;
    box-sizing: border-box;
    width: 100%;
}
.analytics-detail-skeleton .container-fluid,
.page-content-holder:has(.dask-body) .container-fluid {
    width: 100%;
    max-width: 100%;
    --bs-gutter-x: 0;
    padding-left: 0 !important;
    padding-right: 0 !important;
    box-sizing: border-box;
}
.analytics-detail-skeleton .page-content.pc-analytics,
.page-content-holder:has(.dask-body) .page-content.pc-analytics {
    margin-top: 0;
    width: 100%;
    background-color: ${DASK_PAGE_BG};
    box-sizing: border-box;
}
.analytics-detail-skeleton .page-content > .container.px0,
.page-content-holder:has(.dask-body) .page-content > .container.px0,
.page-content.pc-analytics:has(.dask-body) > .container.px0,
.page-content:has(.dask-body) > .container.px0,
.page-content:has(.analytics-detail-inline-skeleton) > .container.px0,
${scope('.dask-body')},
.dask-body.analytics-detail-inline-skeleton {
    max-width: ${DASK_PAGE_MAX_WIDTH}px;
    width: 100%;
    margin-left: auto;
    margin-right: auto;
    --bs-gutter-x: 0;
    padding-left: 0 !important;
    padding-right: 0 !important;
    margin-top: 0;
    padding-top: 0;
    box-sizing: border-box;
}
.analytics-detail-skeleton .main-heading-wrapper.container-fluid,
.page-content-holder:has(.dask-body) .main-heading-wrapper.container-fluid {
    margin-bottom: 0;
    background-color: ${DASK_PAGE_BG};
    box-sizing: border-box;
}
.page-content-holder:has(.dask-body) .page-content > .container.px0 > .main-heading-wrapper .mhw-container,
${scope('.page-content > .container.px0 > .main-heading-wrapper .mhw-container')} {
    max-width: 100%;
    width: 100%;
    margin: 0;
    padding-left: 0 !important;
    padding-right: 0 !important;
}
.analytics-report-pdf-skeleton-overlay .container-fluid,
.analytics-report-pdf-skeleton-overlay:has(.dask-body) .container-fluid {
    width: 100%;
    max-width: 100%;
    --bs-gutter-x: 0;
    padding-left: 0 !important;
    padding-right: 0 !important;
    box-sizing: border-box;
}
.analytics-report-pdf-skeleton-overlay .page-content.pc-analytics,
.analytics-report-pdf-skeleton-overlay:has(.dask-body) .page-content.pc-analytics {
    margin-top: 0;
    width: 100%;
    background-color: ${DASK_PAGE_BG};
    box-sizing: border-box;
}
.analytics-report-pdf-skeleton-overlay .page-content > .container.px0,
.analytics-report-pdf-skeleton-overlay:has(.dask-body) .page-content > .container.px0,
.analytics-report-pdf-skeleton-overlay .page-content:has(.dask-body) > .container.px0 {
    max-width: ${DASK_PAGE_MAX_WIDTH}px;
    width: 100%;
    margin-left: auto;
    margin-right: auto;
    --bs-gutter-x: 0;
    padding-left: 0 !important;
    padding-right: 0 !important;
    margin-top: 0;
    padding-top: 0;
    box-sizing: border-box;
}
${gridLoadingSkeletonCriticalCss}
`;
