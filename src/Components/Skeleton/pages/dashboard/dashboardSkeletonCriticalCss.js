import {
    GRID_BLUE_HEADER,
    GRID_CELL_BORDER,
    GRID_ROW_ALT,
    GRID_ROW_BASE,
    LIVE_KEYMETRICS_INNER_LABEL_GAP,
    LIVE_KEYMETRICS_SM_HEIGHT,
    LIVE_PORTLET_HEADER_GAP,
    LIVE_PORTLET_HEADER_HEIGHT,
    LIVE_PORTLET_GEO_BODY_HEIGHT,
    LIVE_PORTLET_GEO_HEIGHT,
    LIVE_PORTLET_LG_BODY_HEIGHT,
    LIVE_PORTLET_LG_HEIGHT,
    LIVE_PORTLET_MD_BODY_HEIGHT,
    LIVE_PORTLET_MD_HEIGHT,
    LIVE_PORTLET_PADDING,
    LIVE_PORTLET_SM_BODY_HEIGHT,
    LIVE_PORTLET_SM_HEIGHT,
    LIVE_RETENTION_BODY_CELL_HEIGHT,
    LIVE_RETENTION_HEADER_HEIGHT,
    LIVE_TRAFFIC_CHART_HEIGHT,
    LIVE_USER_STATUS_INNER_GAP,
    LIVE_USER_STATUS_MOBILE_TOP_OFFSET,
    PAGE_MAX_WIDTH,
    PORTLET_BOTTOM_GAP,
    SKELETON_BG,
    SKELETON_BORDER,
    SKELETON_PAGE_BG,
    SKELETON_SHIMMER_HIGHLIGHT,
    SKELETON_SURFACE,
    SKELETON_TAB_BG,
} from './dashboardSkeletonUtils';
import { mdmListAcquisitionSkeletonCriticalCss } from '../audience/mdm/mdmSkeletonCriticalCss';

const DB_SK_SHIMMER_BLOCK = '.db-sk-block:not(.db-sk-bubble-chart__bubble):not(.db-sk-gauge-chart__center)';

const DB_SK_SHIMMER_TARGETS = [
    DB_SK_SHIMMER_BLOCK,
    '.db-sk-tab:not(.db-sk-tab--active)',
    '.db-sk-user-status__avatar',
    '.db-sk-user-status__line',
    '.db-sk-keymetrics__value',
    '.db-sk-keymetrics__label',
    '.db-sk-horizontal-bars__bar',
    '.db-sk-sankey__bar',
    '.db-sk-path-analyser__title',
    '.db-sk-path-analyser__levels',
    '.db-sk-path-analyser__icon',
    '.db-sk-path-analyser__filter-label',
    '.db-sk-path-analyser__filter-field',
    '.db-sk-pie-chart__circle',
    '.db-sk-pie-chart__legend-dot',
    '.db-sk-pie-chart__legend-text',
    '.db-sk-column-chart__bar',
    '.db-sk-gauge-chart__ring',
    '.db-sk-gauge-chart__footer',
    '.db-sk-gauge-card__title',
    '.db-sk-gauge-card__line',
    '.db-sk-gauge-card__arc',
    '.db-sk-gauge-card__date',
];

const DB_SK_SHIMMER_SCOPES = [
    '.db-sk-scope',
    '.dashboard-skeleton-scope',
    '.portlet-container',
    '.keymetrics-portlet.live-dashboard',
];

const scopeSelector = (target) => DB_SK_SHIMMER_SCOPES.map((scope) => `${scope} ${target}`).join(',\n');

const buildDashboardSkeletonShimmerCss = () => {
    const shimmerTargets = DB_SK_SHIMMER_TARGETS.map(scopeSelector).join(',\n');
    const shimmerAfter = DB_SK_SHIMMER_TARGETS.flatMap((target) =>
        DB_SK_SHIMMER_SCOPES.map((scope) => `${scope} ${target}::after`),
    ).join(',\n');
    const shimmerPause = DB_SK_SHIMMER_TARGETS.flatMap((target) =>
        DB_SK_SHIMMER_SCOPES.map(
            (scope) => `${scope} *:has(> .nodata-bar.nodata-skeleton-con) ${target}::after`,
        ),
    ).join(',\n');

    return `
@keyframes dbSkSkeletonShimmer {
    0% { left: -100%; }
    100% { left: 100%; }
}
${shimmerTargets} {
    position: relative;
    overflow: hidden;
}
${shimmerAfter} {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background-image: linear-gradient(90deg, transparent, ${SKELETON_SHIMMER_HIGHLIGHT}, transparent);
    animation: dbSkSkeletonShimmer 2s infinite;
    pointer-events: none;
    z-index: 1;
    will-change: left;
}
${shimmerPause} {
    display: none;
    animation: none;
}
${DB_SK_SHIMMER_SCOPES.map((scope) => `${scope} .db-sk-bubble-chart__plot-inner .db-sk-bubble-chart__bubble`).join(',\n')} {
    position: absolute;
    overflow: hidden;
}
${DB_SK_SHIMMER_SCOPES.map((scope) => `${scope} .db-sk-bubble-chart__plot-inner .db-sk-bubble-chart__bubble::after`).join(',\n')} {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background-image: linear-gradient(90deg, transparent, ${SKELETON_SHIMMER_HIGHLIGHT}, transparent);
    animation: dbSkSkeletonShimmer 2s infinite;
    pointer-events: none;
    z-index: 1;
    will-change: left;
}
${DB_SK_SHIMMER_SCOPES.flatMap((scope) =>
        [`${scope} .db-sk-bubble-chart:has(> .db-sk-bubble-chart__nodata) .db-sk-bubble-chart__bubble::after`,
        `${scope} .db-sk-bubble-chart:has(.nodata-bar.nodata-skeleton-con) .db-sk-bubble-chart__bubble::after`],
    ).join(',\n')} {
    display: none;
    animation: none;
}
${DB_SK_SHIMMER_SCOPES.map((scope) => `${scope} .db-sk-gauge-chart__plot .db-sk-gauge-chart__center`).join(',\n')} {
    position: absolute;
    overflow: hidden;
}
${DB_SK_SHIMMER_SCOPES.map((scope) => `${scope} .db-sk-gauge-chart__plot .db-sk-gauge-chart__center::after`).join(',\n')} {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background-image: linear-gradient(90deg, transparent, ${SKELETON_SHIMMER_HIGHLIGHT}, transparent);
    animation: dbSkSkeletonShimmer 2s infinite;
    pointer-events: none;
    z-index: 2;
    will-change: left;
}
${DB_SK_SHIMMER_SCOPES.map((scope) => `${scope} .db-sk-gauge-chart__ring::after`).join(',\n')},
${DB_SK_SHIMMER_SCOPES.map((scope) => `${scope} .db-sk-gauge-card__arc::after`).join(',\n')} {
    z-index: 0;
}
${DB_SK_SHIMMER_SCOPES.flatMap((scope) =>
        [`${scope} .db-sk-gauge-chart:has(.nodata-bar.nodata-skeleton-con) .db-sk-gauge-chart__ring::after`,
        `${scope} .db-sk-gauge-chart:has(.nodata-bar.nodata-skeleton-con) .db-sk-gauge-chart__center::after`,
        `${scope} .db-sk-gauge-card:has(.nodata-bar.nodata-skeleton-con) .db-sk-gauge-card__arc::after`,
        `${scope} .db-sk-gauge-card:has(.nodata-bar.nodata-skeleton-con) .db-sk-gauge-card__line::after`,
        `${scope} .db-sk-gauge-card:has(.nodata-bar.nodata-skeleton-con) .db-sk-gauge-card__title::after`,
        `${scope} .db-sk-gauge-card:has(.nodata-bar.nodata-skeleton-con) .db-sk-gauge-card__date::after`],
    ).join(',\n')} {
    display: none;
    animation: none;
}
`;
};

/** Dashboard skeleton — db-sk-* layout only; no app portlet / bootstrap utility classes required. */
export const dashboardSkeletonCriticalCss = `
::root {
    --sp-space-sm: 10px;
    --sp-space-md: 21px;
}
.db-sk-scope,
.dashboard-skeleton-scope {
    width: 100%;
    max-width: 100%;
    box-sizing: border-box;
    background-color: ${SKELETON_PAGE_BG};
}
.dashboard-skeleton-scope.page-content-holder,
.dashboard-skeleton-scope.dashboard-suspense-fallback {
    padding-top: 78px;
    margin: 0;
    width: 100%;
    max-width: 100%;
    box-sizing: border-box;
}
.db-sk-block {
    display: block;
    flex-shrink: 0;
    box-sizing: border-box;
}
.db-sk-shell {
    width: 100%;
    max-width: ${PAGE_MAX_WIDTH}px;
    margin: 0 auto;
    box-sizing: border-box;
}
.db-sk-header {
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    gap: 16px;
    width: 100%;
    max-width: ${PAGE_MAX_WIDTH}px;
    margin: 0 auto;
    padding: 12px 0 0;
    min-height: 24px;
    box-sizing: border-box;
    margin-top :6px;
}
.db-sk-header-left {
    display: flex;
    flex-direction: column;
    gap: 8px;
    min-width: 0;
}
.db-sk-header-right {
    display: flex;
    align-items: center;
    gap: 12px;
    flex-shrink: 0;
}
.db-sk-breadcrumb {
    display: flex;
    justify-content: flex-end;
    width: 100%;
    max-width: ${PAGE_MAX_WIDTH}px;
    margin: 0 auto;
    padding: 8px 0 0;
    box-sizing: border-box;
}
.db-sk-shell-body {
    width: 100%;
    box-sizing: border-box;
    margin-top :9px;
}
.db-sk-tabs-wrap {
    width: 100%;
    background: ${SKELETON_PAGE_BG};
    margin-bottom: var(--sp-space-sm);
}
.db-sk-tabs {
    display: flex;
    width: 100%;
    max-width: ${PAGE_MAX_WIDTH}px;
    margin: 0 auto;
    padding: 0;
    list-style: none;
}
.db-sk-tab {
    flex: 1 1 33.333%;
    max-width: 33.333%;
    min-width: 0;
    min-height: 41px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: ${SKELETON_TAB_BG};
    border-left: 3px solid ${SKELETON_PAGE_BG};
    box-sizing: border-box;
    padding: 0 6px;
}
.db-sk-tab:first-child {
    border-left: none;
}
.db-sk-tab--active {
    background: ${SKELETON_TAB_BG};
}
.db-sk-tab--active .db-sk-block {
    background-color: #c5ced8 !important;
}
.db-sk-tab-panel {
    width: 100%;
    max-width: ${PAGE_MAX_WIDTH}px;
    margin: 0 auto;
    padding: 0;
    box-sizing: border-box;
}
.db-sk-portlet {
    display: flex;
    flex-direction: column;
    width: 100%;
    background: ${SKELETON_SURFACE};
    border: 1px solid ${SKELETON_BORDER};
    border-radius: var(--globalBorderRadius, 5px);
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.08);
    box-sizing: border-box;
    margin-bottom: ${PORTLET_BOTTOM_GAP}px;
    height: 100%;
}
.db-sk-portlet-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    padding: 12px 16px;
}
.db-sk-portlet-body {
    padding: 16px;
    min-height: 280px;
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    flex: 1 1 auto;
}
.db-sk-portlet-body > .db-sk-column-chart,
.db-sk-portlet-body > .db-sk-pie-chart,
.db-sk-portlet-body > .db-sk-gauge-chart,
.db-sk-portlet-body > .db-sk-horizontal-bars,
.db-sk-portlet-body > .db-sk-sankey,
.db-sk-portlet-body > .db-sk-bubble-chart,
.db-sk-portlet-body > .db-sk-line-chart,
.db-sk-portlet-body > .db-sk-user-status,
.db-sk-portlet-body > .db-sk-live-traffic,
.db-sk-portlet-body > .db-sk-path-analyser__content {
    flex: 1 1 auto;
    min-height: 0;
}
.db-sk-portlet-body > .db-sk-retention-grid,
.db-sk-portlet-body > .portlet-box-theme {
    flex: 0 0 auto;
    height: auto;
    min-height: 0;
    align-self: flex-start;
    width: 100%;
    max-width: 100%;
}
.db-sk-portlet--sm .db-sk-portlet-body {
    min-height: 200px;
}
.db-sk-portlet--lg .db-sk-portlet-body {
    min-height: 310px;
}
.db-sk-row {
    display: flex;
    flex-wrap: wrap;
    width: 100%;
    margin: 0;
    box-sizing: border-box;
}
.db-sk-row--pair {
    gap: 24px;
    margin-bottom: 0;
}
.db-sk-row--gauges {
    margin-bottom: 30px;
}
.db-sk-row--top {
    gap: 24px;
    margin-bottom: 0;
}
.db-sk-row--metrics {
    gap: 24px;
    margin-bottom: 0;
}
.db-sk-row--path {
    margin-bottom: 0;
}
.db-sk-row--geo {
    margin-bottom: 0;
}
.db-sk-row--audience {
    gap: 24px;
    margin-bottom: 0;
}
.db-sk-row--pair + .db-sk-row--pair {
    margin-top: 0;
}
.db-sk-col {
    display: flex;
    flex-direction: column;
    min-width: 0;
    box-sizing: border-box;
}
.db-sk-col--half {
    flex: 1 1 0;
    width: auto;
    max-width: none;
}
.db-sk-col--third {
    flex: 1 1 0;
    width: auto;
    max-width: none;
}
.db-sk-col--full {
    flex: 0 0 100%;
    width: 100%;
    max-width: 100%;
}
.db-sk-col--4 {
    flex: 0 0 calc(33.333% - 16px);
    max-width: calc(33.333% - 16px);
}
.db-sk-col--8 {
    flex: 0 0 calc(66.666% - 8px);
    max-width: calc(66.666% - 8px);
}
@media (max-width: 767.98px) {
    .db-sk-col--half,
    .db-sk-col--third,
    .db-sk-col--4,
    .db-sk-col--8 {
        flex: 0 0 100%;
        width: 100%;
        max-width: 100%;
    }
}
.db-sk-comm-tab,
.db-sk-live-tab {
    width: 100%;
    max-width: 100%;
    box-sizing: border-box;
}
.db-sk-comm-tab .db-sk-row--pair {
    align-items: stretch;
}
.db-sk-comm-tab .db-sk-row--pair .db-sk-portlet--md {
    height: ${LIVE_PORTLET_MD_HEIGHT}px;
    min-height: ${LIVE_PORTLET_MD_HEIGHT}px;
    max-height: ${LIVE_PORTLET_MD_HEIGHT}px;
    padding: ${LIVE_PORTLET_PADDING}px;
    overflow: hidden;
    box-sizing: border-box;
}
.db-sk-comm-tab .db-sk-row--pair .db-sk-portlet--md .db-sk-portlet-header {
    height: ${LIVE_PORTLET_HEADER_HEIGHT}px;
    min-height: ${LIVE_PORTLET_HEADER_HEIGHT}px;
    margin-bottom: ${LIVE_PORTLET_HEADER_GAP}px;
    padding: 0;
    position: relative;
    top: -5px;
    align-items: center;
}
.db-sk-comm-tab .db-sk-row--pair .db-sk-portlet--md .db-sk-portlet-body {
    flex: 0 0 ${LIVE_PORTLET_MD_BODY_HEIGHT}px;
    height: ${LIVE_PORTLET_MD_BODY_HEIGHT}px;
    min-height: ${LIVE_PORTLET_MD_BODY_HEIGHT}px;
    max-height: ${LIVE_PORTLET_MD_BODY_HEIGHT}px;
    padding: 0;
    overflow: hidden;
    display: flex;
    flex-direction: column;
}
.db-sk-comm-tab .db-sk-row--pair .db-sk-portlet--md .db-sk-portlet-body:has(> .db-sk-bubble-chart),
.db-sk-live-tab .db-sk-row--pair .db-sk-portlet--md .db-sk-portlet-body:has(> .db-sk-bubble-chart) {
    overflow: visible;
}
.db-sk-comm-tab .db-sk-row--pair .db-sk-portlet--md .db-sk-portlet-body > .db-sk-bubble-chart,
.db-sk-comm-tab .db-sk-row--pair .db-sk-portlet--md .db-sk-portlet-body > .db-sk-line-chart,
.db-sk-comm-tab .db-sk-row--pair .db-sk-portlet--md .db-sk-portlet-body > .db-sk-pie-chart,
.db-sk-comm-tab .db-sk-row--pair .db-sk-portlet--md .db-sk-portlet-body > .db-sk-column-chart,
.db-sk-comm-tab .db-sk-row--pair .db-sk-portlet--md .db-sk-portlet-body > .db-sk-horizontal-bars,
.db-sk-comm-tab .db-sk-row--pair .db-sk-portlet--md .db-sk-portlet-body > .db-sk-gauge-chart,
.db-sk-live-tab .db-sk-row--pair .db-sk-portlet--md .db-sk-portlet-body > .db-sk-bubble-chart,
.db-sk-live-tab .db-sk-row--pair .db-sk-portlet--md .db-sk-portlet-body > .db-sk-line-chart,
.db-sk-live-tab .db-sk-row--pair .db-sk-portlet--md .db-sk-portlet-body > .db-sk-pie-chart,
.db-sk-live-tab .db-sk-row--pair .db-sk-portlet--md .db-sk-portlet-body > .db-sk-column-chart,
.db-sk-live-tab .db-sk-row--pair .db-sk-portlet--md .db-sk-portlet-body > .db-sk-horizontal-bars,
.db-sk-live-tab .db-sk-row--pair .db-sk-portlet--md .db-sk-portlet-body > .db-sk-gauge-chart,
.db-sk-live-tab .db-sk-row--audience .db-sk-portlet--md .db-sk-portlet-body > .db-sk-column-chart,
.db-sk-live-tab .db-sk-row--audience .db-sk-portlet--md .db-sk-portlet-body > .db-sk-pie-chart,
.db-sk-live-tab .db-sk-row--audience .db-sk-portlet--md .db-sk-portlet-body > .db-sk-gauge-chart {
    flex: 1 1 auto;
    min-height: 0;
    height: 100%;
    width: 100%;
    position: relative;
}
/* 7 bars × 34px + gaps must fit md portlet body (320px) */
.db-sk-comm-tab .db-sk-row--pair .db-sk-portlet--md .db-sk-portlet-body > .db-sk-horizontal-bars,
.db-sk-live-tab .db-sk-row--pair .db-sk-portlet--md .db-sk-portlet-body > .db-sk-horizontal-bars {
    gap: 12px;
    padding-top: 8px;
    padding-bottom: 0;
    box-sizing: border-box;
}
.db-sk-comm-tab .db-sk-row--pair .db-sk-portlet--md .db-sk-portlet-body > .db-sk-horizontal-bars .db-sk-horizontal-bars__bar,
.db-sk-live-tab .db-sk-row--pair .db-sk-portlet--md .db-sk-portlet-body > .db-sk-horizontal-bars .db-sk-horizontal-bars__bar {
    flex: 1 1 0;
    min-height: 0;
    height: auto !important;
}
.db-sk-comm-tab .db-sk-bubble-chart__plot,
.db-sk-live-tab .db-sk-bubble-chart__plot {
    flex: 1 1 auto;
    min-height: 0;
    height: 100%;
    position: relative;
    box-sizing: border-box;
    overflow: visible;
}
.db-sk-comm-tab .db-sk-column-chart__plot,
.db-sk-live-tab .db-sk-column-chart__plot {
    min-height: 0;
    flex: 1 1 auto;
}
.db-sk-comm-gauges,
.db-sk-recent-comm {
    width: 100%;
}
.db-sk-comm-gauges {
    margin-bottom: 0;
}
.db-sk-recent-comm {
    margin-top: 21px;
    margin-bottom: 30px;
}
/* Inline gauge cards sit inside white box-design — scope must not paint page grey */
.db-sk-recent-comm.db-sk-scope,
.db-sk-recent-comm.dashboard-skeleton-scope,
.box-design.gauge-slider-box > .db-sk-scope,
.box-design.gauge-slider-box > .dashboard-skeleton-scope,
.db-sk-gauge-inline.db-sk-scope,
.db-sk-gauge-inline.dashboard-skeleton-scope {
    background: transparent;
}
/* Inline portlet skeletons — white portlet shell, not page-grey scope */
.db-sk-portlet-inline.db-sk-scope,
.db-sk-portlet-inline.dashboard-skeleton-scope,
.portlet-container .portlet-body > .db-sk-scope,
.portlet-container .portlet-body > .dashboard-skeleton-scope,
.portlet-container .portlet-header .db-sk-scope,
.portlet-container .portlet-header .dashboard-skeleton-scope,
.keymetrics-portlet.live-dashboard > .db-sk-scope,
.keymetrics-portlet.live-dashboard > .dashboard-skeleton-scope {
    background: transparent;
    flex: 1 1 auto;
    min-height: 0;
    width: 100%;
    display: flex;
    flex-direction: column;
}
.keymetrics-portlet.keymetrics-sm.live-dashboard:has(> .db-sk-scope),
.keymetrics-portlet.keymetrics-sm.live-dashboard:has(> .dashboard-skeleton-scope) {
    justify-content: flex-start;
}
.keymetrics-portlet.live-dashboard > .db-sk-scope .skeleton-span-con,
.keymetrics-portlet.live-dashboard > .dashboard-skeleton-scope .skeleton-span-con {
    flex: 1 1 auto;
    min-height: 0;
    width: 100%;
}
.box-design.gauge-slider-box > .db-sk-scope,
.box-design.gauge-slider-box > .dashboard-skeleton-scope {
    width: 100%;
    flex: 1 1 auto;
    display: flex;
    flex-direction: column;
}
.db-sk-gauges-toolbar {
    display: flex;
    justify-content: flex-end;
    margin-bottom: var(--sp-space-sm);
}
.db-sk-gauges-row {
    display: flex;
    gap: 35px;
    width: 100%;
    align-items: stretch;
}
.db-sk-gauge-slot {
    flex: 1 1 0;
    min-width: 0;
    height: 237px;
    padding: 23px;
    background: ${SKELETON_SURFACE};
    border: 1px solid ${SKELETON_BORDER};
    border-radius: var(--globalBorderRadius, 5px);
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.08);
    box-sizing: border-box;
}
.db-sk-gauge-card {
    display: flex;
    flex-direction: column;
    position: relative;
    height: 100%;
    min-height: 190px;
    width: 100%;
    box-sizing: border-box;
}
.db-sk-gauge-card__title {
    display: block;
    width: 72%;
    max-width: 280px;
    height: 16px;
    margin-bottom: 16px;
    border-radius: 4px;
    background: ${SKELETON_BG};
}
.db-sk-gauge-card__body {
    display: flex;
    align-items: center;
    position: relative;
    flex: 1 1 auto;
    width: 100%;
    min-height: 110px;
    gap: 12px;
    box-sizing: border-box;
}
.db-sk-gauge-card__body .nodata-bar,
.db-sk-gauge-card__body .nodata-bar.nodata-skeleton-con {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    z-index: 12;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: #fdfdfd;
    border: 1px solid #e9e9e9;
    color: #585858;
    padding: 3px 10px;
    box-sizing: border-box;
    white-space: nowrap;
}
.db-sk-gauge-card__body .nodata-bar p {
    display: flex;
    align-items: center;
    font-size: 17px;
    position: relative;
    margin: 0;
    white-space: pre;
}
.db-sk-gauge-card__left {
    flex: 0 0 41.666667%;
    max-width: 41.666667%;
    display: flex;
    flex-direction: column;
    justify-content: center;
    gap: 10px;
    padding-top: 12px;
    padding-right: 8px;
    box-sizing: border-box;
}
.db-sk-gauge-card__line {
    display: block;
    width: 78%;
    height: 14px;
    border-radius: 4px;
    background: ${SKELETON_BG};
}
.db-sk-gauge-card__line--short {
    width: 52%;
    height: 18px;
}
.db-sk-gauge-card__gauge {
    flex: 0 0 58.333333%;
    max-width: 58.333333%;
    display: flex;
    align-items: flex-end;
    justify-content: flex-end;
    padding-bottom: 4px;
    padding-right: 14px;
    box-sizing: border-box;
}
.db-sk-gauge-card__arc {
    width: 200px;
    max-width: calc(100% - 4px);
    height: 100px;
    border-radius: 200px 200px 0 0;
    position: relative;
    overflow: hidden;
    background-color: #e2e7ee;
    flex-shrink: 0;
}
.db-sk-gauge-card__arc::before {
    content: '';
    position: absolute;
    left: 22px;
    right: 22px;
    top: 22px;
    bottom: 0;
    background: #fff;
    border-radius: 180px 180px 0 0;
    z-index: 1;
}
.db-sk-gauge-card__footer {
    display: flex;
    justify-content: flex-end;
    align-items: center;
    margin-top: 12px;
    padding-top: 4px;
    padding-right: 14px;
    box-sizing: border-box;
}
.db-sk-gauge-card__date {
    display: block;
    width: 58%;
    max-width: 200px;
    height: 13px;
    border-radius: 4px;
    background: ${SKELETON_BG};
}
.db-sk-keymetrics {
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    width: 100%;
    background: ${SKELETON_SURFACE};
    border: 1px solid ${SKELETON_BORDER};
    border-radius: var(--globalBorderRadius, 5px);
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.08);
    padding: 12px 16px 16px;
    margin-bottom: ${PORTLET_BOTTOM_GAP}px;
    box-sizing: border-box;
    height: 100%;
}
.db-sk-keymetrics__title {
    margin: 0;
    flex-shrink: 0;
}
.db-sk-live-traffic {
    min-height: 0;
    height: 100%;
    display: flex;
    flex-direction: column;
}
/* Retention grid skeleton — ResKendoGrid loading state (embedded + in-page) */
.db-sk-scope .db-sk-retention-grid,
.dashboard-skeleton-scope .db-sk-retention-grid,
.retention-table .db-sk-retention-grid {
    width: 100%;
    max-width: 100%;
    height: auto;
    box-sizing: border-box;
    display: block;
}
.db-sk-scope .db-sk-retention-grid .reskendogrid,
.dashboard-skeleton-scope .db-sk-retention-grid .reskendogrid,
.retention-table .db-sk-retention-grid .reskendogrid,
.db-sk-scope .db-sk-retention-grid .reskendogrid-table,
.dashboard-skeleton-scope .db-sk-retention-grid .reskendogrid-table,
.retention-table .db-sk-retention-grid .reskendogrid-table,
.db-sk-scope .db-sk-retention-grid .k-grid.rs-kendo-scrollable-grid,
.dashboard-skeleton-scope .db-sk-retention-grid .k-grid.rs-kendo-scrollable-grid,
.retention-table .db-sk-retention-grid .k-grid.rs-kendo-scrollable-grid,
.db-sk-scope .db-sk-retention-grid .k-grid-norecords,
.dashboard-skeleton-scope .db-sk-retention-grid .k-grid-norecords,
.retention-table .db-sk-retention-grid .k-grid-norecords,
.db-sk-scope .db-sk-retention-grid .rs-grid-loading-skeleton,
.dashboard-skeleton-scope .db-sk-retention-grid .rs-grid-loading-skeleton,
.retention-table .db-sk-retention-grid .rs-grid-loading-skeleton {
    width: 100%;
    max-width: 100%;
    height: auto;
    margin: 0;
    padding: 0;
    box-sizing: border-box;
    display: block;
}
.db-sk-scope .db-sk-retention-grid .k-grid.rs-kendo-scrollable-grid,
.dashboard-skeleton-scope .db-sk-retention-grid .k-grid.rs-kendo-scrollable-grid,
.retention-table .db-sk-retention-grid .k-grid.rs-kendo-scrollable-grid {
    box-shadow: none;
    border: none;
    background: transparent;
}
.db-sk-scope .db-sk-retention-grid .rs-grid-loading-skeleton table,
.dashboard-skeleton-scope .db-sk-retention-grid .rs-grid-loading-skeleton table,
.retention-table .db-sk-retention-grid .rs-grid-loading-skeleton table {
    width: 100% !important;
    max-width: 100% !important;
    height: auto !important;
    box-sizing: border-box !important;
    padding: 0 !important;
    border: 1px solid ${GRID_CELL_BORDER};
    border-radius: var(--globalBorderRadius, 5px);
    overflow: hidden;
    border-collapse: separate;
    border-spacing: 0;
    table-layout: fixed;
}
.db-sk-scope .db-sk-retention-grid .skeleton-blue-row,
.dashboard-skeleton-scope .db-sk-retention-grid .skeleton-blue-row,
.retention-table .db-sk-retention-grid .skeleton-blue-row,
.db-sk-scope .db-sk-retention-grid .skeleton-blue-cell,
.dashboard-skeleton-scope .db-sk-retention-grid .skeleton-blue-cell,
.retention-table .db-sk-retention-grid .skeleton-blue-cell,
.db-sk-scope .db-sk-retention-grid .skeleton-blue-row td,
.dashboard-skeleton-scope .db-sk-retention-grid .skeleton-blue-row td,
.retention-table .db-sk-retention-grid .skeleton-blue-row td {
    background-color: ${GRID_BLUE_HEADER} !important;
}
.db-sk-scope .db-sk-retention-grid .skeleton-blue-row td:first-child,
.dashboard-skeleton-scope .db-sk-retention-grid .skeleton-blue-row td:first-child,
.retention-table .db-sk-retention-grid .skeleton-blue-row td:first-child {
    border-top-left-radius: var(--globalBorderRadius, 5px);
}
.db-sk-scope .db-sk-retention-grid .skeleton-blue-row td:last-child,
.dashboard-skeleton-scope .db-sk-retention-grid .skeleton-blue-row td:last-child,
.retention-table .db-sk-retention-grid .skeleton-blue-row td:last-child {
    border-top-right-radius: var(--globalBorderRadius, 5px);
}
.db-sk-scope .db-sk-retention-grid .skeleton-blue-row::before,
.dashboard-skeleton-scope .db-sk-retention-grid .skeleton-blue-row::before,
.retention-table .db-sk-retention-grid .skeleton-blue-row::before,
.db-sk-scope .db-sk-retention-grid .skeleton-header-row::before,
.dashboard-skeleton-scope .db-sk-retention-grid .skeleton-header-row::before,
.retention-table .db-sk-retention-grid .skeleton-header-row::before {
    display: none !important;
    animation: none !important;
}
.db-sk-scope .db-sk-retention-grid .skeleton-row:not(.k-table-alt-row) td,
.dashboard-skeleton-scope .db-sk-retention-grid .skeleton-row:not(.k-table-alt-row) td,
.retention-table .db-sk-retention-grid .skeleton-row:not(.k-table-alt-row) td {
    background-color: ${GRID_ROW_BASE} !important;
}
.db-sk-scope .db-sk-retention-grid .skeleton-row.k-table-alt-row,
.dashboard-skeleton-scope .db-sk-retention-grid .skeleton-row.k-table-alt-row,
.retention-table .db-sk-retention-grid .skeleton-row.k-table-alt-row,
.db-sk-scope .db-sk-retention-grid .skeleton-row.k-table-alt-row td,
.dashboard-skeleton-scope .db-sk-retention-grid .skeleton-row.k-table-alt-row td,
.retention-table .db-sk-retention-grid .skeleton-row.k-table-alt-row td {
    background-color: ${GRID_ROW_ALT} !important;
}
.db-sk-scope .db-sk-retention-grid .skeleton-blue-row,
.dashboard-skeleton-scope .db-sk-retention-grid .skeleton-blue-row,
.retention-table .db-sk-retention-grid .skeleton-blue-row {
    height: ${LIVE_RETENTION_HEADER_HEIGHT}px !important;
}
.db-sk-scope .db-sk-retention-grid .skeleton-blue-row td,
.dashboard-skeleton-scope .db-sk-retention-grid .skeleton-blue-row td,
.retention-table .db-sk-retention-grid .skeleton-blue-row td,
.db-sk-scope .db-sk-retention-grid .skeleton-blue-cell,
.dashboard-skeleton-scope .db-sk-retention-grid .skeleton-blue-cell,
.retention-table .db-sk-retention-grid .skeleton-blue-cell {
    height: ${LIVE_RETENTION_HEADER_HEIGHT}px !important;
    padding: 0;
    border-top: 0;
    border-bottom: 0;
    border-left: 0;
    box-sizing: border-box;
}
.db-sk-scope .db-sk-retention-grid .skeleton-row,
.dashboard-skeleton-scope .db-sk-retention-grid .skeleton-row,
.retention-table .db-sk-retention-grid .skeleton-row {
    height: ${LIVE_RETENTION_BODY_CELL_HEIGHT}px !important;
}
.db-sk-scope .db-sk-retention-grid .skeleton-row .skeleton-cell,
.dashboard-skeleton-scope .db-sk-retention-grid .skeleton-row .skeleton-cell,
.retention-table .db-sk-retention-grid .skeleton-row .skeleton-cell,
.db-sk-scope .db-sk-retention-grid .skeleton-row td,
.dashboard-skeleton-scope .db-sk-retention-grid .skeleton-row td,
.retention-table .db-sk-retention-grid .skeleton-row td {
    height: ${LIVE_RETENTION_BODY_CELL_HEIGHT}px !important;
    padding: 0;
    border-top: 0;
    border-bottom: 0;
    border-left: 0;
    box-sizing: border-box;
}
.db-sk-scope .db-sk-retention-grid .skeleton-cell:not(:last-child),
.dashboard-skeleton-scope .db-sk-retention-grid .skeleton-cell:not(:last-child),
.retention-table .db-sk-retention-grid .skeleton-cell:not(:last-child) {
    border-right: 1px solid ${GRID_CELL_BORDER};
}
.db-sk-scope .db-sk-retention-grid .skeleton-blue-cell:not(:last-child),
.dashboard-skeleton-scope .db-sk-retention-grid .skeleton-blue-cell:not(:last-child),
.retention-table .db-sk-retention-grid .skeleton-blue-cell:not(:last-child) {
    border-right: 1px solid rgba(255, 255, 255, 0.25);
}
.db-sk-scope .db-sk-portlet-body .db-sk-retention-grid,
.dashboard-skeleton-scope .db-sk-portlet-body .db-sk-retention-grid {
    margin: 0;
    padding: 0;
}
.db-sk-scope .db-sk-portlet-body .portlet-box-theme,
.dashboard-skeleton-scope .db-sk-portlet-body .portlet-box-theme,
.retention-table .portlet-box-theme,
.db-sk-portlet-body > .portlet-box-theme {
    padding: 5px;
    width: 100%;
    max-width: 100%;
    height: auto;
    min-height: 0;
    box-sizing: border-box;
    overflow: hidden;
    border-radius:10px;
    display: block;
}
.db-sk-scope .db-sk-portlet-body .portlet-box-theme .rs-table-wrapper,
.dashboard-skeleton-scope .db-sk-portlet-body .portlet-box-theme .rs-table-wrapper,
.retention-table .portlet-box-theme .rs-table-wrapper {
    width: 100%;
    max-width: 100%;
    height: auto;
    padding: 0 !important;
    margin: 0 !important;
    box-sizing: border-box;
    display: block;
}
.react-loading-skeleton {
    background: #e2e7ee !important;
}
/* Chart / gauge placeholders inside dashboard skeleton */
.db-sk-scope .react-loading-skeleton,
.dashboard-skeleton-scope .react-loading-skeleton {
    background-color: ${SKELETON_BG} !important;
    --base-color: ${SKELETON_BG};
    --highlight-color: ${SKELETON_SHIMMER_HIGHLIGHT};
    line-height: 1;
}
.db-sk-scope .react-loading-skeleton::after,
.dashboard-skeleton-scope .react-loading-skeleton::after {
    background-image: linear-gradient(90deg, ${SKELETON_BG}, ${SKELETON_SHIMMER_HIGHLIGHT}, ${SKELETON_BG}) !important;
}
.db-sk-scope .semi-pie-gauge-skeleton__body,
.dashboard-skeleton-scope .semi-pie-gauge-skeleton__body,
.db-sk-scope .gaugeslider_skeleton.semi-pie-gauge-skeleton__body,
.dashboard-skeleton-scope .gaugeslider_skeleton.semi-pie-gauge-skeleton__body {
    display: flex;
    flex-direction: row;
    align-items: flex-end;
    justify-content: space-between;
    min-height: 110px;
    position: relative;
    width: 100%;
    margin: 0;
}
.db-sk-scope .bubble-chart-skeleton,
.dashboard-skeleton-scope .bubble-chart-skeleton {
    position: relative;
    height: 320px;
    width: 100%;
    margin: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    box-sizing: border-box;
}
.db-sk-scope .bubble-chart-skeleton > span,
.dashboard-skeleton-scope .bubble-chart-skeleton > span {
    position: absolute;
}
.db-sk-scope .bubble-chart-skeleton > span:first-child,
.dashboard-skeleton-scope .bubble-chart-skeleton > span:first-child { left: 24%; top: 55%; }
.db-sk-scope .bubble-chart-skeleton > span:nth-child(2),
.dashboard-skeleton-scope .bubble-chart-skeleton > span:nth-child(2) { left: 35%; top: 30%; }
.db-sk-scope .bubble-chart-skeleton > span:nth-child(3),
.dashboard-skeleton-scope .bubble-chart-skeleton > span:nth-child(3) { left: 79%; top: 44%; }
.db-sk-scope .bubble-chart-skeleton > span:nth-child(4),
.dashboard-skeleton-scope .bubble-chart-skeleton > span:nth-child(4) { left: 42%; top: 71%; }
.db-sk-scope .bubble-chart-skeleton > span:nth-child(5),
.dashboard-skeleton-scope .bubble-chart-skeleton > span:nth-child(5) { left: 62%; top: 58%; }
.db-sk-scope .bubble-chart-skeleton > span:nth-child(6),
.dashboard-skeleton-scope .bubble-chart-skeleton > span:nth-child(6) { left: 48%; top: 41%; }
.db-sk-scope .bubble-chart-skeleton > span:nth-child(7),
.dashboard-skeleton-scope .bubble-chart-skeleton > span:nth-child(7) { left: 63%; top: 26%; }
/* Column chart skeleton — flex bar layout before content-scss loads */
.db-sk-scope .skeleton-span-con,
.dashboard-skeleton-scope .skeleton-span-con {
    position: relative;
    height: 100%;
}
.db-sk-scope .skeleton-span-con span,
.dashboard-skeleton-scope .skeleton-span-con span {
    border-radius: 5px;
}
.db-sk-scope .skeleton-span-con .skeleton-span,
.dashboard-skeleton-scope .skeleton-span-con .skeleton-span {
    display: flex;
    flex: 1;
    flex-direction: column;
    width: 100%;
    position: relative;
}
.db-sk-scope .skeleton-span-con .skeleton-span.flex-row,
.dashboard-skeleton-scope .skeleton-span-con .skeleton-span.flex-row {
    flex-direction: row;
}
.db-sk-scope .skeleton-span-con .skeleton-span.align-items-end,
.dashboard-skeleton-scope .skeleton-span-con .skeleton-span.align-items-end {
    align-items: flex-end;
}
.db-sk-scope .skeleton-span-con hr,
.dashboard-skeleton-scope .skeleton-span-con hr {
    width: 100%;
    float: left;
    border: none;
    margin: 0 !important;
    background: none;
}
.db-sk-scope .skeleton-bottom-align,
.dashboard-skeleton-scope .skeleton-bottom-align {
    display: flex;
    justify-content: space-between;
    width: 100%;
    align-items: flex-end;
}
.db-sk-scope .skeleton-bottom-align .react-loading-skeleton,
.dashboard-skeleton-scope .skeleton-bottom-align .react-loading-skeleton {
    flex-shrink: 0;
}
/* Live dashboard top portlets — match real portlet-sm (310px) and keymetrics-sm (210px) */
.db-sk-scope .dflex,
.dashboard-skeleton-scope .dflex {
    display: flex;
}
.db-sk-scope .flex-column,
.dashboard-skeleton-scope .flex-column {
    flex-direction: column;
}
.db-sk-scope .width100p,
.dashboard-skeleton-scope .width100p {
    width: 100%;
}
.db-sk-live-tab .db-sk-row--top,
.db-sk-live-tab .db-sk-row--metrics {
    align-items: stretch;
    margin-top: 0;
}
.db-sk-live-tab .db-sk-row--top .db-sk-portlet--sm {
    height: ${LIVE_PORTLET_SM_HEIGHT}px;
    min-height: ${LIVE_PORTLET_SM_HEIGHT}px;
    max-height: ${LIVE_PORTLET_SM_HEIGHT}px;
    padding: ${LIVE_PORTLET_PADDING}px;
    overflow: hidden;
}
.db-sk-live-tab .db-sk-row--top .db-sk-portlet--sm .db-sk-portlet-header {
    height: ${LIVE_PORTLET_HEADER_HEIGHT}px;
    min-height: ${LIVE_PORTLET_HEADER_HEIGHT}px;
    margin-bottom: ${LIVE_PORTLET_HEADER_GAP}px;
    padding: 0;
    position: relative;
    top: -5px;
    align-items: center;
}
.db-sk-live-tab .db-sk-row--top .db-sk-portlet--sm .db-sk-portlet-body {
    flex: 0 0 ${LIVE_PORTLET_SM_BODY_HEIGHT}px;
    height: ${LIVE_PORTLET_SM_BODY_HEIGHT}px;
    min-height: ${LIVE_PORTLET_SM_BODY_HEIGHT}px;
    max-height: ${LIVE_PORTLET_SM_BODY_HEIGHT}px;
    padding: 0;
    overflow: hidden;
    display: flex;
    flex-direction: column;
}
.db-sk-live-tab .db-sk-row--top .db-sk-portlet--sm .db-sk-portlet-body > .db-sk-user-status,
.db-sk-live-tab .db-sk-row--top .db-sk-portlet--sm .db-sk-portlet-body > .db-sk-live-traffic {
    height: 100%;
    min-height: 0;
    flex: 1 1 auto;
}
.db-sk-live-tab .db-sk-row--top .db-sk-portlet--sm .db-sk-portlet-body > .db-sk-live-traffic {
    display: flex;
    flex-direction: column;
}
.db-sk-live-tab .db-sk-live-traffic .mdm-sk-list-acquisition-skeleton--chart-only {
    min-height: 0;
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
}
.db-sk-live-tab .db-sk-live-traffic .mdm-sk-list-acquisition-skeleton--chart-only .mdm-sk-list-acquisition-chart {
    flex: 0 0 ${LIVE_TRAFFIC_CHART_HEIGHT}px;
    height: ${LIVE_TRAFFIC_CHART_HEIGHT}px !important;
    min-height: ${LIVE_TRAFFIC_CHART_HEIGHT}px;
    max-height: ${LIVE_TRAFFIC_CHART_HEIGHT}px;
}
.db-sk-live-tab .db-sk-row--metrics .db-sk-keymetrics {
    height: ${LIVE_KEYMETRICS_SM_HEIGHT}px;
    min-height: ${LIVE_KEYMETRICS_SM_HEIGHT}px;
    max-height: ${LIVE_KEYMETRICS_SM_HEIGHT}px;
    padding: 0 ${LIVE_PORTLET_PADDING}px ${LIVE_PORTLET_PADDING}px;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    box-sizing: border-box;
}
.db-sk-live-tab .db-sk-row--metrics .db-sk-keymetrics__title {
    padding: ${LIVE_PORTLET_PADDING}px 0 0;
    margin: 0;
    flex: 0 0 auto;
}
.db-sk-live-tab .db-sk-row--metrics .db-sk-keymetrics .db-sk-keymetrics-body {
    flex: 1 1 auto;
    min-height: 0;
    width: 100%;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    position: relative;
}
.db-sk-live-tab .db-sk-row--pair .db-sk-portlet--md,
.db-sk-live-tab .db-sk-row--audience .db-sk-portlet--md {
    height: ${LIVE_PORTLET_MD_HEIGHT}px;
    min-height: ${LIVE_PORTLET_MD_HEIGHT}px;
    max-height: ${LIVE_PORTLET_MD_HEIGHT}px;
    padding: ${LIVE_PORTLET_PADDING}px;
    overflow: hidden;
    box-sizing: border-box;
}
.db-sk-live-tab .db-sk-row--pair .db-sk-portlet--md .db-sk-portlet-header,
.db-sk-live-tab .db-sk-row--audience .db-sk-portlet--md .db-sk-portlet-header {
    height: ${LIVE_PORTLET_HEADER_HEIGHT}px;
    min-height: ${LIVE_PORTLET_HEADER_HEIGHT}px;
    margin-bottom: ${LIVE_PORTLET_HEADER_GAP}px;
    padding: 0;
    position: relative;
    top: -5px;
    align-items: center;
}
.db-sk-live-tab .db-sk-row--pair .db-sk-portlet--md .db-sk-portlet-body,
.db-sk-live-tab .db-sk-row--audience .db-sk-portlet--md .db-sk-portlet-body {
    flex: 0 0 ${LIVE_PORTLET_MD_BODY_HEIGHT}px;
    height: ${LIVE_PORTLET_MD_BODY_HEIGHT}px;
    min-height: ${LIVE_PORTLET_MD_BODY_HEIGHT}px;
    max-height: ${LIVE_PORTLET_MD_BODY_HEIGHT}px;
    padding: 0;
    overflow: hidden;
    display: flex;
    flex-direction: column;
}
.db-sk-live-tab .db-sk-row--pair .db-sk-portlet--md .db-sk-portlet-body:has(> .portlet-box-theme),
.db-sk-comm-tab .db-sk-row--pair .db-sk-portlet--md .db-sk-portlet-body:has(> .portlet-box-theme) {
    justify-content: flex-start;
}
.db-sk-live-tab .db-sk-row--geo .db-sk-portlet--geo {
    height: ${LIVE_PORTLET_GEO_HEIGHT}px;
    min-height: ${LIVE_PORTLET_GEO_HEIGHT}px;
    max-height: ${LIVE_PORTLET_GEO_HEIGHT}px;
    padding: ${LIVE_PORTLET_PADDING}px;
    overflow: hidden;
    box-sizing: border-box;
}
.db-sk-live-tab .db-sk-row--geo .db-sk-portlet--geo .db-sk-portlet-header {
    height: ${LIVE_PORTLET_HEADER_HEIGHT}px;
    min-height: ${LIVE_PORTLET_HEADER_HEIGHT}px;
    margin-bottom: ${LIVE_PORTLET_HEADER_GAP}px;
    padding: 0;
    position: relative;
    top: -5px;
    align-items: center;
}
.db-sk-live-tab .db-sk-row--geo .db-sk-portlet--geo .db-sk-portlet-body {
    flex: 0 0 ${LIVE_PORTLET_GEO_BODY_HEIGHT}px;
    height: ${LIVE_PORTLET_GEO_BODY_HEIGHT}px;
    min-height: ${LIVE_PORTLET_GEO_BODY_HEIGHT}px;
    max-height: ${LIVE_PORTLET_GEO_BODY_HEIGHT}px;
    padding: 0;
    overflow: hidden;
    display: flex;
    flex-direction: column;
}
.db-sk-live-tab .db-sk-row--geo .db-sk-portlet--geo .db-sk-portlet-body > .db-sk-pie-chart {
    flex: 1 1 auto;
    min-height: 0;
    height: 100%;
    width: 100%;
    position: relative;
}
/* Dashboard content skeletons — div + db-sk-* (MDM-style, no bootstrap grid) */
.db-sk-user-status {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: ${LIVE_USER_STATUS_INNER_GAP}px;
    width: 100%;
    height: 100%;
    box-sizing: border-box;
}
.db-sk-live-tab--mobile .db-sk-user-status {
    justify-content: flex-start;
    padding-top: ${LIVE_USER_STATUS_MOBILE_TOP_OFFSET}px;
}
.db-sk-user-status__avatar {
    width: 105px;
    height: 105px;
    border-radius: 50%;
    background: ${SKELETON_BG};
    flex-shrink: 0;
}
.db-sk-user-status__metrics {
    display: flex;
    gap: ${LIVE_USER_STATUS_INNER_GAP}px;
    width: 100%;
    box-sizing: border-box;
}
.db-sk-user-status__metric {
    flex: 1 1 0;
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 8px;
}
.db-sk-user-status__line {
    border-radius: 5px;
    background: ${SKELETON_BG};
}
.db-sk-user-status__line--sm { height: 30px; }
.db-sk-user-status__line--lg { height: 55px; }
.db-sk-keymetrics-body {
    flex: 1 1 auto;
    min-height: 0;
    width: 100%;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    position: relative;
    box-sizing: border-box;
}
.db-sk-keymetrics-section {
    display: flex;
    flex-direction: column;
    gap: ${LIVE_KEYMETRICS_INNER_LABEL_GAP}px;
}
.db-sk-keymetrics-row {
    display: flex;
    gap: 24px;
    width: 100%;
}
.db-sk-keymetrics-body--3col .db-sk-keymetrics-row { gap: 16px; }
.db-sk-keymetrics__value {
    flex: 1 1 0;
    min-width: 0;
    height: 35px;
    border-radius: 5px;
    background: ${SKELETON_BG};
}
.db-sk-keymetrics__label {
    flex: 1 1 0;
    min-width: 0;
    height: 15px;
    border-radius: 5px;
    background: ${SKELETON_BG};
}
.db-sk-horizontal-bars {
    display: flex;
    flex-direction: column;
    gap: 15px;
    width: 100%;
    height: 100%;
    min-height: 0;
    flex: 1 1 auto;
    position: relative;
    box-sizing: border-box;
    justify-content: flex-start;
    padding-top: 8px;
}
.db-sk-horizontal-bars__bar {
    width: 100%;
    border-radius: 5px;
    background: ${SKELETON_BG};
}
.db-sk-sankey {
    display: flex;
    flex-direction: column;
    gap: 8px;
    width: 100%;
    position: relative;
    box-sizing: border-box;
}
.db-sk-sankey__bar {
    width: 100%;
    height: 34px;
    border-radius: 5px;
    background: ${SKELETON_BG};
}
.db-sk-sankey__bar:nth-child(even) { height: 33px; }
.db-sk-path-analyser {
    display: flex;
    flex-direction: column;
    width: 100%;
    box-sizing: border-box;
}
.db-sk-path-analyser--inline {
    width: 100%;
}
.db-sk-path-analyser--inline.db-sk-path-analyser--sankey-only .db-sk-path-analyser__content {
    min-height: 310px;
}
.db-sk-path-analyser--inline.db-sk-path-analyser--sankey-only .db-sk-sankey-area {
    flex: 1 1 auto;
    min-height: 310px;
}
.db-sk-path-analyser--inline.db-sk-path-analyser--sankey-only .db-sk-sankey-area > .db-sk-sankey {
    flex: 1 1 auto;
    min-height: 310px;
    justify-content: space-between;
}
.db-sk-path-analyser--inline.db-sk-path-analyser--sankey-only .db-sk-sankey__bar {
    flex: 1 1 0;
    min-height: 28px;
    height: auto;
}
/* Path analyser refresh — single skeleton in chart slot (filters stay real above) */
.db-sk-path-analyser-chart-slot {
    position: relative;
    display: flex;
    flex-direction: column;
    width: 100%;
    flex: 1 1 0;
    min-height: 0;
    box-sizing: border-box;
    overflow: hidden;
}
.db-sk-path-analyser-chart-slot--expanded {
    flex: 1 1 0;
    min-height: 0;
}
.db-sk-path-analyser-chart-slot__chart {
    position: relative;
    flex: 1 1 0;
    min-height: 0;
    width: 100%;
    overflow: hidden;
}
.db-sk-path-analyser-chart-slot__mount {
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    width: 100%;
    overflow: hidden;
}
.db-sk-path-analyser-chart-slot__overlay.db-sk-portlet-inline,
.db-sk-path-analyser-chart-slot__overlay.dashboard-skeleton-scope {
    position: absolute;
    top: 0;
    right: 0;
    left: 0;
    bottom: 0;
    width: 100%;
    height: 100% !important;
    min-height: 0 !important;
    display: flex;
    flex-direction: column;
}
.db-sk-path-analyser-chart-slot__overlay.dashboard-skeleton-scope > .db-sk-path-analyser-chart-slot__inner {
    flex: 1 1 0;
    min-height: 0;
}
.db-sk-path-analyser-chart-slot__inner {
    display: flex;
    flex-direction: column;
    width: 100%;
    height: 100%;
    flex: 1 1 0;
    min-height: 0;
    box-sizing: border-box;
}
.db-sk-path-analyser-chart-slot__footer {
    flex: 0 0 19px;
    height: 19px;
    width: 100%;
    flex-shrink: 0;
}
.db-sk-path-analyser-chart-slot__inner > .db-sk-sankey-area {
    flex: 1 1 0;
    min-height: 0;
}
.db-sk-path-analyser-chart-slot .db-sk-sankey-area {
    position: relative;
    flex: 1 1 0;
    min-height: 0;
    width: 100%;
    display: flex;
    flex-direction: column;
}
.db-sk-path-analyser-chart-slot .db-sk-sankey-area > .db-sk-sankey {
    display: flex;
    flex-direction: column;
    gap: 8px;
    flex: 1 1 0;
    min-height: 0;
    height: 100%;
    width: 100%;
    box-sizing: border-box;
}
.db-sk-path-analyser-chart-slot .db-sk-sankey-area > .db-sk-sankey .db-sk-sankey__bar {
    flex: 1 1 0;
    width: 100%;
    min-height: 28px;
    height: auto !important;
}
.db-sk-path-analyser-chart-slot .db-sk-sankey-area > .db-sk-sankey .db-sk-sankey__bar:nth-child(even) {
    height: auto !important;
}
.portlet-container.portlet-lg .db-sk-path-analyser--inline:not(.db-sk-path-analyser--sankey-only) {
    min-height: ${LIVE_PORTLET_LG_BODY_HEIGHT}px;
    display: flex;
    flex-direction: column;
}
.portlet-container.portlet-lg .db-sk-path-analyser--inline:not(.db-sk-path-analyser--sankey-only) .db-sk-path-analyser__content {
    flex: 1 1 auto;
    min-height: ${LIVE_PORTLET_LG_BODY_HEIGHT}px;
    display: flex;
    flex-direction: column;
}
.portlet-container.portlet-lg .db-sk-path-analyser--inline:not(.db-sk-path-analyser--sankey-only) .db-sk-path-analyser__content > .db-sk-sankey-area {
    flex: 1 1 auto;
    min-height: 280px;
}
.db-sk-path-analyser__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    box-sizing: border-box;
}
.db-sk-path-analyser--inline .db-sk-path-analyser__header {
    height: ${LIVE_PORTLET_HEADER_HEIGHT}px;
    margin-bottom: ${LIVE_PORTLET_HEADER_GAP}px;
    position: relative;
    top: -5px;
}
.db-sk-path-analyser__title {
    width: 140px;
    height: 20px;
    border-radius: 4px;
    background: ${SKELETON_BG};
    flex-shrink: 0;
}
.db-sk-path-analyser__actions {
    display: flex;
    align-items: center;
    gap: 15px;
    flex-shrink: 0;
}
.db-sk-path-analyser__levels {
    width: 96px;
    height: 24px;
    border-radius: 4px;
    background: ${SKELETON_BG};
}
.db-sk-path-analyser__icon {
    width: 24px;
    height: 24px;
    border-radius: 50%;
    background: ${SKELETON_BG};
}
.db-sk-path-analyser__content {
    display: flex;
    flex-direction: column;
    flex: 1 1 auto;
    min-height: 0;
    box-sizing: border-box;
    position: relative;
}
.db-sk-path-analyser__filters {
    display: flex;
    flex-wrap: wrap;
    gap: 15px;
    width: 100%;
    margin-bottom: 10px;
    box-sizing: border-box;
}
.db-sk-path-analyser__filter {
    flex: 1 1 0;
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 4px;
}
.db-sk-path-analyser__filter-label {
    width: 72px;
    height: 12px;
    border-radius: 4px;
    background: ${SKELETON_BG};
}
.db-sk-path-analyser__filter-field {
    width: 100%;
    height: 34px;
    border-radius: 5px;
    background: ${SKELETON_BG};
}
.db-sk-path-analyser__content > .db-sk-sankey-area {
    flex: 1 1 auto;
    min-height: 0;
    position: relative;
    display: flex;
    flex-direction: column;
}
.db-sk-path-analyser__content > .db-sk-sankey-area > .db-sk-sankey {
    flex: 1 1 auto;
    min-height: 0;
    height: 100%;
    justify-content: space-between;
}
.db-sk-path-analyser__content > .db-sk-sankey-area > .db-sk-sankey .db-sk-sankey__bar {
    flex: 1 1 0;
    min-height: 28px;
    height: auto;
}
.db-sk-path-analyser__content > .db-sk-sankey-area > .db-sk-sankey .db-sk-sankey__bar:nth-child(even) {
    height: auto;
}
.db-sk-live-tab .db-sk-row--path .db-sk-path-analyser.db-sk-portlet--lg {
    height: ${LIVE_PORTLET_LG_HEIGHT}px;
    min-height: ${LIVE_PORTLET_LG_HEIGHT}px;
    max-height: ${LIVE_PORTLET_LG_HEIGHT}px;
    padding: ${LIVE_PORTLET_PADDING}px;
    overflow: hidden;
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
}
.db-sk-live-tab .db-sk-row--path .db-sk-path-analyser.db-sk-portlet--lg .db-sk-path-analyser__header {
    height: ${LIVE_PORTLET_HEADER_HEIGHT}px;
    min-height: ${LIVE_PORTLET_HEADER_HEIGHT}px;
    margin-bottom: ${LIVE_PORTLET_HEADER_GAP}px;
    padding: 0;
    position: relative;
    top: -5px;
    align-items: center;
    flex-shrink: 0;
}
.db-sk-live-tab .db-sk-row--path .db-sk-path-analyser.db-sk-portlet--lg .db-sk-path-analyser__content {
    flex: 0 0 ${LIVE_PORTLET_LG_BODY_HEIGHT}px;
    height: ${LIVE_PORTLET_LG_BODY_HEIGHT}px;
    min-height: ${LIVE_PORTLET_LG_BODY_HEIGHT}px;
    max-height: ${LIVE_PORTLET_LG_BODY_HEIGHT}px;
    padding: 0;
    overflow: hidden;
    display: flex;
    flex-direction: column;
}
.db-sk-pie-chart {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;
    min-height: 0;
    position: relative;
    box-sizing: border-box;
}
.db-sk-pie-chart--offset-top { padding-top: 20px; }
.db-sk-pie-chart__circle {
    border-radius: 50%;
    background: ${SKELETON_BG};
    flex-shrink: 0;
}
.db-sk-pie-chart__legend {
    display: flex;
    align-items: center;
    justify-content: center;
    flex-wrap: wrap;
    gap: 8px 16px;
    margin-top: 15px;
    width: 100%;
}
.db-sk-pie-chart__legend-dot {
    width: 15px;
    height: 15px;
    border-radius: 5px;
    background: ${SKELETON_BG};
}
.db-sk-pie-chart__legend-text {
    width: 40px;
    height: 15px;
    border-radius: 5px;
    background: ${SKELETON_BG};
}
.db-sk-column-chart {
    width: 100%;
    height: 100%;
    min-height: 0;
    padding: 0 20px;
    box-sizing: border-box;
    position: relative;
    display: flex;
    flex-direction: column;
    flex: 1 1 auto;
}
.db-sk-column-chart--offset-top .db-sk-column-chart__plot {
    padding-top: 30px;
}
.db-sk-column-chart__plot {
    width: 100%;
    flex: 1 1 auto;
    min-height: 280px;
    border-left: 1px solid #e9e9e9;
    border-bottom: 1px solid #e9e9e9;
    box-sizing: border-box;
    padding-bottom: 20px;
    display: flex;
    align-items: flex-end;
}
.db-sk-column-chart__bars {
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
    width: 100%;
    height: 100%;
    gap: 4px;
    padding-left: 12px;
    padding-right: 8px;
    box-sizing: border-box;
}
.db-sk-gauge-chart {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;
    min-height: 0;
    padding-top: 20px;
    box-sizing: border-box;
    position: relative;
}
.db-sk-gauge-chart__plot {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    flex: 1 1 auto;
    width: 100%;
    min-height: 220px;
}
.db-sk-gauge-chart__ring {
    position: relative;
    border-radius: 50%;
    background: ${SKELETON_BG};
    box-sizing: border-box;
    flex-shrink: 0;
}
.db-sk-gauge-chart__ring::before {
    content: '';
    position: absolute;
    inset: 18%;
    border-radius: 50%;
    background: #ffffff;
    box-sizing: border-box;
    z-index: 1;
}
.db-sk-gauge-chart__center {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 28px;
    height: 20px;
    border-radius: 4px;
    background: ${SKELETON_BG};
    z-index: 1;
}
.db-sk-gauge-chart__footer {
    align-self: flex-start;
    width: 96px;
    height: 12px;
    margin-top: 8px;
    margin-left: 4px;
    border-radius: 4px;
    background: ${SKELETON_BG};
    flex-shrink: 0;
}
.db-sk-column-chart__bar {
    width: 33px;
    min-width: 33px;
    border-radius: 5px;
    background: ${SKELETON_BG};
    flex-shrink: 0;
}
.db-sk-bubble-chart {
    position: relative;
    width: 100%;
    height: 100%;
    min-height: 0;
    flex: 1 1 auto;
    display: flex;
    flex-direction: column;
    box-sizing: border-box;
    overflow: visible;
}
.db-sk-bubble-chart__plot {
    position: relative;
    width: 100%;
    flex: 1 1 auto;
    min-height: 0;
    height: 100%;
    box-sizing: border-box;
    overflow: visible;
}
.db-sk-bubble-chart__plot-inner {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    box-sizing: border-box;
    overflow: visible;
}
.db-sk-bubble-chart__bubble {
    position: absolute;
    transform: translate(-50%, -50%);
    background: ${SKELETON_BG};
}
.db-sk-line-chart {
    width: 100%;
    height: 100%;
    min-height: 275px;
    position: relative;
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    flex: 1 1 auto;
}
.db-sk-line-chart .mdm-sk-list-acquisition-skeleton--chart-only {
    flex: 1 1 auto;
    min-height: 0;
    height: 100%;
}
.db-sk-scope .db-sk-keymetrics-body .nodata-bar,
.dashboard-skeleton-scope .db-sk-keymetrics-body .nodata-bar,
.keymetrics-portlet.live-dashboard .db-sk-keymetrics-body .nodata-bar,
.db-sk-scope .db-sk-pie-chart .nodata-bar,
.dashboard-skeleton-scope .db-sk-pie-chart .nodata-bar,
.portlet-container.portlet-md .db-sk-pie-chart .nodata-bar,
.db-sk-scope .db-sk-column-chart .nodata-bar,
.dashboard-skeleton-scope .db-sk-column-chart .nodata-bar,
.portlet-container.portlet-md .db-sk-column-chart .nodata-bar,
.db-sk-scope .db-sk-line-chart .nodata-bar,
.dashboard-skeleton-scope .db-sk-line-chart .nodata-bar,
.portlet-container.portlet-md .db-sk-line-chart .nodata-bar,
.db-sk-scope .db-sk-gauge-chart .nodata-bar,
.dashboard-skeleton-scope .db-sk-gauge-chart .nodata-bar,
.portlet-container.portlet-md .db-sk-gauge-chart .nodata-bar,
.db-sk-scope .db-sk-horizontal-bars .nodata-bar,
.dashboard-skeleton-scope .db-sk-horizontal-bars .nodata-bar,
.portlet-container.portlet-md .db-sk-horizontal-bars .nodata-bar,
.db-sk-scope .db-sk-bubble-chart .nodata-bar,
.dashboard-skeleton-scope .db-sk-bubble-chart .nodata-bar,
.portlet-container.portlet-md .db-sk-bubble-chart .nodata-bar,
.db-sk-scope .db-sk-sankey-area .nodata-bar,
.dashboard-skeleton-scope .db-sk-sankey-area .nodata-bar,
.portlet-container.portlet-lg .db-sk-sankey-area .nodata-bar,
.portlet-container.portlet-lg .db-sk-path-analyser--inline .db-sk-sankey-area .nodata-bar,
.db-sk-scope .db-sk-sankey .nodata-bar,
.dashboard-skeleton-scope .db-sk-sankey .nodata-bar,
.portlet-container.portlet-lg .db-sk-sankey .nodata-bar,
.portlet-container.portlet-lg .db-sk-path-analyser--inline .db-sk-sankey .nodata-bar,
.db-sk-gauge-card__body .nodata-bar {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    z-index: 12;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: #fdfdfd;
    border: 1px solid #e9e9e9;
    color: #585858;
    padding: 3px 10px;
    box-sizing: border-box;
    white-space: nowrap;
}
.db-sk-scope .db-sk-keymetrics-body .nodata-bar p,
.dashboard-skeleton-scope .db-sk-keymetrics-body .nodata-bar p,
.keymetrics-portlet.live-dashboard .db-sk-keymetrics-body .nodata-bar p,
.db-sk-scope .db-sk-pie-chart .nodata-bar p,
.dashboard-skeleton-scope .db-sk-pie-chart .nodata-bar p,
.portlet-container.portlet-md .db-sk-pie-chart .nodata-bar p,
.db-sk-scope .db-sk-column-chart .nodata-bar p,
.dashboard-skeleton-scope .db-sk-column-chart .nodata-bar p,
.portlet-container.portlet-md .db-sk-column-chart .nodata-bar p,
.db-sk-scope .db-sk-line-chart .nodata-bar p,
.dashboard-skeleton-scope .db-sk-line-chart .nodata-bar p,
.portlet-container.portlet-md .db-sk-line-chart .nodata-bar p,
.db-sk-scope .db-sk-gauge-chart .nodata-bar p,
.dashboard-skeleton-scope .db-sk-gauge-chart .nodata-bar p,
.portlet-container.portlet-md .db-sk-gauge-chart .nodata-bar p,
.db-sk-scope .db-sk-horizontal-bars .nodata-bar p,
.dashboard-skeleton-scope .db-sk-horizontal-bars .nodata-bar p,
.portlet-container.portlet-md .db-sk-horizontal-bars .nodata-bar p,
.db-sk-scope .db-sk-bubble-chart .nodata-bar p,
.dashboard-skeleton-scope .db-sk-bubble-chart .nodata-bar p,
.portlet-container.portlet-md .db-sk-bubble-chart .nodata-bar p,
.db-sk-scope .db-sk-sankey-area .nodata-bar p,
.dashboard-skeleton-scope .db-sk-sankey-area .nodata-bar p,
.portlet-container.portlet-lg .db-sk-sankey-area .nodata-bar p,
.portlet-container.portlet-lg .db-sk-path-analyser--inline .db-sk-sankey-area .nodata-bar p,
.db-sk-scope .db-sk-sankey .nodata-bar p,
.dashboard-skeleton-scope .db-sk-sankey .nodata-bar p,
.portlet-container.portlet-lg .db-sk-sankey .nodata-bar p,
.portlet-container.portlet-lg .db-sk-path-analyser--inline .db-sk-sankey .nodata-bar p,
.db-sk-gauge-card__body .nodata-bar p {
    display: flex;
    align-items: center;
    font-size: 17px;
    margin: 0;
    white-space: pre;
}
${mdmListAcquisitionSkeletonCriticalCss}
${buildDashboardSkeletonShimmerCss()}
`;
