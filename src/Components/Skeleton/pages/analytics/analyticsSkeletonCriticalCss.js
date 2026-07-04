import {
    LIVE_PORTLET_MD_BODY_HEIGHT,
    LIVE_PORTLET_MD_HEIGHT,
    PAGE_MAX_WIDTH,
    SKELETON_BG,
    SKELETON_BORDER,
    SKELETON_PAGE_BG,
    SKELETON_SHIMMER_HIGHLIGHT,
    SKELETON_SURFACE,
    SKELETON_TAB_BG,
    BUBBLE_CHART_PLACEHOLDERS,
} from '../dashboard/dashboardSkeletonUtils';
import { gridLoadingSkeletonCriticalCss } from 'Pages/KendoDocs/CommonComponents/ResKendoGrid/gridLoadingSkeletonCriticalCss';
import { resgridListSkeletonCriticalCss } from 'Pages/KendoDocs/CommonComponents/ResGrid/resgridListSkeletonCriticalCss';

const A360_PORTLET_GAP = 21;
const A360_PORTLET_BODY_PADDING = 19;
const A360_ACTIVITY_LEVEL_HEIGHT = 409;
const A360_CHANNELS_PORTLET_BODY_HEIGHT = 211;
const A360_CHANNELS_SLOT_HEIGHT = A360_CHANNELS_PORTLET_BODY_HEIGHT - A360_PORTLET_BODY_PADDING * 2;
/** Path to conversion portlet — matches live `.pathConversion` skeleton height. */
const A360_PATH_CONVERSION_HEIGHT = 555;
/** Flow chart area inside path conversion portlet. */
const A360_PATH_CONVERSION_CHART_HEIGHT = 415;
/** Audience report card block — matches live `.audienceCardBlock` skeleton height. */
const A360_AUDIENCE_CARD_HEIGHT = 364;

const AN_SK_SHIMMER_TARGETS = [
    '.an-sk-block',
    '.an-sk-tab:not(.an-sk-tab--active)',
    '.an-sk-a360-channel__body',
    '.an-sk-a360-path__node',
];

const AN_SK_SHIMMER_SCOPES = ['.an-sk-scope', '.analytics-skeleton-scope'];
const A360_LIVE_SHIMMER_SCOPE = '.audienceAnalytics360PageCSS';

const buildAnalyticsShimmerRulesForScopes = (scopes) => {
    const shimmerTargets = AN_SK_SHIMMER_TARGETS.flatMap((target) =>
        scopes.map((scope) => `${scope} ${target}`),
    ).join(',\n');
    const shimmerAfter = AN_SK_SHIMMER_TARGETS.flatMap((target) =>
        scopes.map((scope) => `${scope} ${target}::after`),
    ).join(',\n');

    return `
${shimmerTargets} {
    position: relative;
    overflow: hidden;
    background-color: ${SKELETON_BG};
}
${shimmerAfter} {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background-image: linear-gradient(90deg, transparent, ${SKELETON_SHIMMER_HIGHLIGHT}, transparent);
    animation: anSkSkeletonShimmer 2s infinite;
    pointer-events: none;
    z-index: 1;
    will-change: left;
}`;
};

const buildAnalyticsSkeletonShimmerCss = () => `
@keyframes anSkSkeletonShimmer {
    0% { left: -100%; }
    100% { left: 100%; }
}
${buildAnalyticsShimmerRulesForScopes(AN_SK_SHIMMER_SCOPES)}
`;

/** Shared audience-detail portlet layout — route skeleton + live A360 page. */
const buildAudienceDetailSkeletonCriticalCss = (scope) => `
${scope} .audience-detail-skeleton .d-flex {
    display: flex;
}
${scope} .audience-detail-skeleton .justify-content-between {
    justify-content: space-between;
}
${scope} .audience-detail-skeleton .justify-content-end {
    justify-content: flex-end;
}
${scope} .audience-detail-skeleton .align-items-center {
    align-items: center;
}
${scope} .audience-detail-skeleton .flex-nowrap {
    flex-wrap: nowrap;
}
${scope} .audience-detail-skeleton .flex-shrink-0 {
    flex-shrink: 0;
}
${scope} .audience-detail-skeleton .flex-grow-1 {
    flex-grow: 1;
}
${scope} .audience-detail-skeleton .min-width-0 {
    min-width: 0;
}
${scope} .audience-detail-skeleton .gap-1 {
    gap: 4px;
}
${scope} .audience-detail-skeleton .gap-2 {
    gap: 8px;
}
${scope} .audience-detail-skeleton .m0 {
    margin: 0;
}
${scope} .audience-detail-skeleton .mb20 {
    margin-bottom: 20px;
}
${scope} .audience-detail-skeleton .mt10 {
    margin-top: 10px;
}
${scope} .audience-detail-skeleton .ml15 {
    margin-left: 15px;
}
${scope} .audience-detail-skeleton .rs-list-group-horizontal {
    display: flex;
    list-style: none;
    padding: 0;
    margin: 0;
    align-items: center;
}
${scope} .audience-detail-skeleton .p0 {
    padding: 0;
}
${scope} .audience-detail-skeleton .p10 {
    padding: 10px;
}
${scope} .audience-detail-portlet-container {
    width: 100%;
    background: ${SKELETON_SURFACE};
    border: 1px solid #e9e9e9;
    border-radius: var(--globalBorderRadius, 5px);
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.08);
    box-sizing: border-box;
    padding: var(--boxDesignBodySpace, ${A360_PORTLET_BODY_PADDING}px);
}
${scope} .audience-detail-skeleton .audienceDetailBlock,
${scope} .audience-detail-skeleton .audienceDetailBlock.row {
    display: flex;
    flex-wrap: nowrap;
    margin: 0;
    width: 100%;
}
${scope} .audience-detail-skeleton .leftProfileBlock,
${scope} .audience-detail-skeleton .col-sm-3.leftProfileBlock {
    flex: 0 0 25%;
    max-width: 25%;
    min-width: 0;
    padding-right: 30px;
    padding-left: 0;
    box-sizing: border-box;
}
${scope} .audience-detail-skeleton .rightTimelineBlock,
${scope} .audience-detail-skeleton .col-sm-9.rightTimelineBlock {
    flex: 1 1 auto;
    min-width: 0;
    max-width: 75%;
    padding: 0;
    position: relative;
    display: flex;
    flex-direction: column;
    background: ${SKELETON_PAGE_BG};
}
${scope} .audience-detail-skeleton .btnTab .d-flex {
    display: flex;
    justify-content: flex-end;
    gap: 4px;
    margin-top: 10px;
    padding-right: 10px;
}
${scope} .audience-profile-skeleton .aps-profile-card,
${scope} .audience-profile-skeleton .aps-stat-card,
${scope} .audience-profile-skeleton .aps-behaviour-card {
    border: 1px solid #e9e9e9;
    background: ${SKELETON_SURFACE};
    box-sizing: border-box;
}
${scope} .audience-profile-skeleton .aps-profile-card {
    padding: 10px;
    overflow: hidden;
}
${scope} .audience-profile-skeleton .aps-user-row {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 14px;
}
${scope} .audience-profile-skeleton .aps-user-meta {
    flex: 1;
    min-width: 0;
}
${scope} .audience-profile-skeleton .aps-highlight-bar,
${scope} .audience-profile-skeleton .aps-card-header {
    display: block;
    height: 34px;
    background-image: linear-gradient(90deg, ${SKELETON_BG}, ${SKELETON_SHIMMER_HIGHLIGHT}, ${SKELETON_BG}) !important;
    position: relative;
    overflow: hidden;
}
${scope} .audience-profile-skeleton .aps-highlight-bar {
    width: calc(100% + 20px);
    height: 42px;
    margin: 14px -10px -10px;
    opacity: 0.5;
}
${scope} .audience-profile-skeleton .aps-card-header::after,
${scope} .audience-profile-skeleton .aps-highlight-bar::after {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background-image: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.6), transparent);
    animation: anSkSkeletonShimmer 1.5s infinite;
    pointer-events: none;
}
${scope} .audience-profile-skeleton .aps-indicators {
    display: flex;
    justify-content: center;
    gap: 8px;
    margin: 10px 0;
}
${scope} .audience-profile-skeleton .aps-dot {
    width: 10px;
    height: 10px;
    border-radius: 50%;
    background: ${SKELETON_BG};
}
${scope} .audience-profile-skeleton .row.m0.mb10 {
    display: flex;
    flex-wrap: wrap;
    margin: 0 0 10px;
    width: 100%;
}
${scope} .audience-profile-skeleton .row.m0.mb10 > .col-sm-6 {
    flex: 0 0 50%;
    max-width: 50%;
    padding-left: 0;
    padding-right: 5px;
    box-sizing: border-box;
}
${scope} .audience-profile-skeleton .aps-stat-card {
    width: 100%;
}
${scope} .audience-profile-skeleton .aps-card-body {
    padding: 10px;
    min-height: 132px;
    box-sizing: border-box;
}
${scope} .audience-profile-skeleton .aps-stat-row {
    position: relative;
    min-height: 46px;
    margin-bottom: 12px;
    display: flex;
    flex-direction: column;
    gap: 5px;
}
${scope} .audience-profile-skeleton .aps-stat-row:last-child {
    margin-bottom: 0;
}
${scope} .audience-profile-skeleton .aps-behaviour-card {
    margin-top: 10px;
}
${scope} .audience-profile-skeleton .aps-behaviour-body {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 14px 10px;
}
${scope} .audience-detail-skeleton .audience-timeline-skeleton {
    position: relative;
    flex: 1;
    min-height: 360px;
}
${scope} .audience-detail-skeleton .audience-timeline-skeleton__nodata-overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 120;
    pointer-events: none;
}
${scope} .audience-detail-skeleton .audience-timeline-skeleton .nodata-bar.nodata-skeleton-con {
    position: relative;
    top: auto;
    left: auto;
    transform: none;
    z-index: 121;
}
${scope} .audience-detail-skeleton .audience-timeline-skeleton .p15 {
    padding: 15px;
}
${scope} .audience-detail-skeleton .audience-timeline-skeleton .border-bottom {
    border-bottom: 1px solid #e9e9e9;
}
${scope} .audience-detail-skeleton .react-loading-skeleton {
    --base-color: ${SKELETON_BG};
    --highlight-color: ${SKELETON_SHIMMER_HIGHLIGHT};
    background-color: ${SKELETON_BG} !important;
}
${scope} .audience-detail-skeleton .no-animation .aps-card-header::after,
${scope} .audience-detail-skeleton .no-animation .skeleton-shimmer::after {
    animation: none !important;
}
@media (max-width: 767.98px) {
    ${scope} .audience-detail-skeleton .audienceDetailBlock {
        flex-direction: column;
    }
    ${scope} .audience-detail-skeleton .leftProfileBlock,
    ${scope} .audience-detail-skeleton .col-sm-3.leftProfileBlock {
        flex: 0 0 100%;
        max-width: 100%;
        padding-right: 0;
        margin-bottom: 16px;
    }
    ${scope} .audience-detail-skeleton .rightTimelineBlock,
    ${scope} .audience-detail-skeleton .col-sm-9.rightTimelineBlock {
        flex: 0 0 100%;
        max-width: 100%;
    }
}`;

/** Audience report portlet — white card grid; route skeleton + live A360 page. */
const buildAudienceReportSkeletonCriticalCss = (scope) => `
${scope} .skeleton-span-con.p0:has(> .audienceCardBlock.portlet-container) {
    min-height: ${A360_AUDIENCE_CARD_HEIGHT}px;
    height: auto;
    display: flex;
    flex-direction: column;
    box-sizing: border-box;
}
${scope} .audienceCardBlock.portlet-container {
    width: 100%;
    background: ${SKELETON_SURFACE};
    padding: var(--boxDesignBodySpace, ${A360_PORTLET_BODY_PADDING}px);
    box-sizing: border-box;
    margin-bottom: ${A360_PORTLET_GAP}px;
    min-height: ${A360_AUDIENCE_CARD_HEIGHT}px;
    height: auto;
    display: flex;
    flex-direction: column;
    border: 1px solid ${SKELETON_BORDER};
    border-radius: var(--globalBorderRadius, 5px);
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.08);
}
${scope} .audienceCardBlock.portlet-container.no-border {
    border: 0;
}
${scope} .audienceCardBlock.portlet-container.no-box-shadow {
    box-shadow: none;
}
${scope} .audienceCardBlock .skeleton-span-con.p0 {
    padding: 0;
    flex: 1 1 auto;
    min-height: 0;
    height: 100%;
    display: flex;
    flex-direction: column;
}
${scope} .audienceCardBlock > .row {
    flex: 0 0 auto;
    align-content: flex-start;
}
${scope} .audienceCardBlock .d-flex {
    display: flex;
}
${scope} .audienceCardBlock .justify-content-between {
    justify-content: space-between;
}
${scope} .audienceCardBlock .mb15 {
    margin-bottom: 15px;
}
${scope} .audienceCardBlock .mb10 {
    margin-bottom: 10px;
}
${scope} .audienceCardBlock .mt-6 {
    margin-top: 6px;
}
${scope} .audienceCardBlock .row {
    display: flex;
    flex-wrap: wrap;
    margin-left: -15px;
    margin-right: -15px;
    width: 100%;
}
${scope} .audienceCardBlock .row > .col-sm-4 {
    flex: 0 0 33.333333%;
    max-width: 33.333333%;
    padding-left: 15px;
    padding-right: 15px;
    box-sizing: border-box;
}
${scope} .audienceCardBlock .row > .col-sm-4:nth-child(-n + 3) {
    margin-bottom: 27px;
}
${scope} .audienceCardBlock .react-loading-skeleton {
    --base-color: ${SKELETON_BG};
    --highlight-color: ${SKELETON_SHIMMER_HIGHLIGHT};
    background-color: ${SKELETON_BG} !important;
}
@media (max-width: 575.98px) {
    ${scope} .audienceCardBlock .row > .col-sm-4 {
        flex: 0 0 100%;
        max-width: 100%;
    }
}`;

/** Audience behavior bubble chart — route skeleton + live A360 page. */
const buildAudienceBehaviorBubbleSkeletonCriticalCss = (scope) => {
    const bubblePositionRules = BUBBLE_CHART_PLACEHOLDERS.map((bubble, index) => {
        const nth = index === 0 ? 'first-child' : `nth-child(${index + 1})`;
        return `
${scope} .bubble-chart-skeleton:not(.bubble-chart-skeleton--connected) > span:${nth},
${scope} .bubble-chart-skeleton:not(.bubble-chart-skeleton--connected) .react-loading-skeleton:${nth} {
    left: ${bubble.left};
    top: ${bubble.top};
    width: ${bubble.width}px !important;
    height: ${bubble.height}px !important;
}`;
    }).join('\n');

    return `
${scope} .pref-a360-skel-behavior.an-sk-portlet,
${scope} .pref-a360-skel-behavior.portlet-container,
${scope} .portlet-container.portlet-md.areaspline-x-axis-labels:has(.bubble-audience-behaviour-del) {
    height: ${LIVE_PORTLET_MD_HEIGHT}px;
    min-height: ${LIVE_PORTLET_MD_HEIGHT}px;
    display: flex;
    flex-direction: column;
}
${scope} .pref-a360-skel-behavior .an-sk-portlet-body,
${scope} .portlet-md.areaspline-x-axis-labels .portlet-body.bubble-audience-behaviour-del {
    flex: 1 1 auto;
    min-height: 0;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
}
${scope} .pref-a360-skel-behavior .bubble-audience-behaviour-del,
${scope} .portlet-md.areaspline-x-axis-labels .portlet-body.bubble-audience-behaviour-del {
    position: relative;
    width: 100%;
    flex: 0 0 auto;
    min-height: 0;
    height: auto;
    box-sizing: border-box;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: visible;
}
${scope} .pref-a360-skel-behavior .bubble-audience-behaviour-del .skeleton-span-con,
${scope} .portlet-md.areaspline-x-axis-labels .bubble-audience-behaviour-del .skeleton-span-con {
    width: 100%;
    min-height: ${LIVE_PORTLET_MD_BODY_HEIGHT}px;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    flex: 1 1 auto;
    box-sizing: border-box;
}
${scope} .bubble-audience-behaviour-del .bubble-chart-custom.bubble-chart-skeleton--connected {
    margin: 0 auto !important;
    margin-top: 0 !important;
}
${scope} .bubble-chart-custom.bubble-chart-skeleton--connected {
    position: relative;
    width: fit-content;
    max-width: 100%;
    margin: 0 auto !important;
    margin-top: 0 !important;
    display: flex;
    justify-content: flex-end;
    box-sizing: border-box;
    flex-shrink: 0;
}
${scope} .bubble-chart-skeleton--connected ul {
    display: flex;
    align-items: center;
    gap: 0;
    list-style: none;
    padding: 0;
    margin: 0;
    transform: none;
}
${scope} .bubble-chart-skeleton--connected .bubble-chart-list {
    position: relative;
    border-radius: 50%;
    margin-left: -30px;
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
    background: transparent !important;
}
${scope} .bubble-chart-skeleton--connected .bubble-chart-list:first-child {
    margin-left: 0;
}
${scope} .bubble-chart-skeleton--connected .bubble-chart-list:nth-child(odd) {
    top: 55px;
    z-index: 0;
}
${scope} .bubble-chart-skeleton--connected .bubble-chart-list:nth-child(even) {
    z-index: 0;
}
${scope} .bubble-audience-behaviour-del .skeleton-span-con > .position-absolute {
    z-index: 20;
}
${scope} .bubble-audience-behaviour-del .skeleton-span-con .nodata-skeleton-con {
    z-index: 21;
}
${scope} .bubble-chart-skeleton--connected .bubble-chart-list .react-loading-skeleton {
    border-radius: 50% !important;
    margin: 0 !important;
}
${scope} .bubble-chart-skeleton:not(.bubble-chart-skeleton--connected) > span,
${scope} .bubble-chart-skeleton:not(.bubble-chart-skeleton--connected) .react-loading-skeleton {
    position: absolute !important;
    display: block;
    transform: translate(-50%, -50%);
    margin: 0 !important;
    border-radius: 50%;
}
${scope} .bubble-chart-skeleton--connected .react-loading-skeleton,
${scope} .bubble-chart-skeleton .react-loading-skeleton {
    --base-color: ${SKELETON_BG};
    --highlight-color: ${SKELETON_SHIMMER_HIGHLIGHT};
    background-color: ${SKELETON_BG} !important;
}
${bubblePositionRules}`;
};

/** Analytics module skeleton — an-sk-* layout only; no bootstrap / app.scss required. */
export const analyticsSkeletonCriticalCss = `
body:has(.page-content-holder.analytics-skeleton-scope[aria-busy='true']) .breadcrumbs:not(.page-breadcrumb-skeleton),
body:has(.analytics-suspense-fallback) .breadcrumbs:not(.page-breadcrumb-skeleton) {
    display: none !important;
}
.an-sk-scope,
.analytics-skeleton-scope {
    width: 100%;
    max-width: 100%;
    box-sizing: border-box;
    background-color: ${SKELETON_PAGE_BG};
}
.analytics-skeleton-scope.page-content-holder,
.analytics-skeleton-scope.analytics-suspense-fallback {
    padding-top: 78px;
    margin: 0;
    width: 100%;
    max-width: 100%;
    box-sizing: border-box;
}
.page-content-holder.analytics-skeleton-scope.an-sk-scope.page-layout-skeleton--inline {
    min-height: 100vh;
    box-sizing: border-box;
}
.page-content-holder.analytics-skeleton-scope.page-layout-skeleton--inline > div {
    width: 100%;
    box-sizing: border-box;
}
.page-content-holder.analytics-skeleton-scope.page-layout-skeleton--inline .analytics-skeleton-scope.an-sk-scope {
    width: 100%;
    max-width: 100%;
    box-sizing: border-box;
}
.an-sk-block {
    display: block;
    flex-shrink: 0;
    box-sizing: border-box;
}
.an-sk-shell {
    width: 100%;
    max-width: ${PAGE_MAX_WIDTH}px;
    margin: 0 auto;
    box-sizing: border-box;
}
.an-sk-header {
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
}
.an-sk-header-left {
    display: flex;
    flex-direction: column;
    gap: 8px;
    min-width: 0;
}
.an-sk-header-right {
    display: flex;
    align-items: center;
    gap: 12px;
    flex-shrink: 0;
}
.an-sk-breadcrumb {
    display: flex;
    justify-content: flex-end;
    width: 100%;
    max-width: ${PAGE_MAX_WIDTH}px;
    margin: 0 auto;
    padding: 8px 0 0;
    box-sizing: border-box;
}
.an-sk-shell-body {
    width: 100%;
    box-sizing: border-box;
    margin-top: 9px;
}
.an-sk-tabs-wrap {
    width: 100%;
    background: ${SKELETON_PAGE_BG};
}
.an-sk-tabs {
    display: flex;
    width: 100%;
    max-width: ${PAGE_MAX_WIDTH}px;
    margin: 0 auto;
    padding: 0;
    list-style: none;
}
.an-sk-tab {
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
.an-sk-tab:first-child {
    border-left: none;
}
.an-sk-tab--active {
    background: ${SKELETON_TAB_BG};
}
.an-sk-tab-panel {
    width: 100%;
    max-width: ${PAGE_MAX_WIDTH}px;
    margin: 0 auto;
    padding: 0;
    box-sizing: border-box;
}
.an-sk-list-tab {
    width: 100%;
    box-sizing: border-box;
}
.an-sk-list-toolbar {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: flex-end;
    width: 100%;
    margin: var(--sp-space-sm) 0;
    box-sizing: border-box;
}
.an-sk-list-toolbar-actions {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: flex-end;
    width: 100%;
    gap: 12px;
}
.an-sk-list-rows-wrap {
    width: 100%;
    padding: 0 3px 0;
    box-sizing: border-box;
}
.an-sk-audit-tab {
    width: 100%;
    box-sizing: border-box;
}
.an-sk-audit-toolbar {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    width: 100%;
    margin-bottom: 21px;
    box-sizing: border-box;
}
.an-sk-audit-grid {
    width: 100%;
    box-sizing: border-box;
}
.an-sk-a360-tab {
    width: 100%;
    box-sizing: border-box;
}
.an-sk-a360-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    margin: var(--sp-space-sm) 0;
    box-sizing: border-box;
}
.an-sk-a360-header-actions {
    display: flex;
    align-items: center;
    gap: 10px;
    list-style: none;
    margin: 0;
    padding: 0;
}
.an-sk-portlet {
    display: flex;
    flex-direction: column;
    width: 100%;
    background: ${SKELETON_SURFACE};
    border: 1px solid ${SKELETON_BORDER};
    border-radius: var(--globalBorderRadius, 5px);
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.08);
    box-sizing: border-box;
    margin-bottom: ${A360_PORTLET_GAP}px;
}
.an-sk-a360-slot {
    position: relative;
    width: 100%;
    flex: 1 1 auto;
    min-height: 0;
    display: flex;
    flex-direction: column;
    box-sizing: border-box;
}
.an-sk-a360-activity-slot {
    flex: 1 1 auto;
    min-height: 0;
    height: 100%;
}
.an-sk-a360-channels-slot {
    flex: 1 1 auto;
    min-height: ${A360_CHANNELS_SLOT_HEIGHT}px;
    height: 100%;
    display: flex;
    flex-direction: column;
}
.an-sk-a360-channels-slot > .an-sk-a360-channels {
    flex: 1 1 auto;
    min-height: ${A360_CHANNELS_SLOT_HEIGHT}px;
}
.an-sk-a360-activity-level {
    flex: 1 1 auto;
    height: 100%;
    min-height: 0;
    width: 100%;
    box-sizing: border-box;
}
.an-sk-static .an-sk-block::after,
.an-sk-static .an-sk-a360-channel__body::after {
    display: none !important;
    animation: none !important;
}
.an-sk-a360-slot .nodata-bar.nodata-skeleton-con {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    z-index: 12;
    height: 35px;
    white-space: nowrap;
}
.an-sk-portlet-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    padding: 12px 16px;
    box-sizing: border-box;
}
.an-sk-portlet-body {
    padding: ${A360_PORTLET_BODY_PADDING}px;
    min-height: ${LIVE_PORTLET_MD_BODY_HEIGHT}px;
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    flex: 1 1 auto;
}
.an-sk-portlet-body--auto {
    min-height: 0;
}
.an-sk-portlet-body:has(.an-sk-a360-activity-slot) {
    overflow: hidden;
}
.pref-a360-skel-channels .an-sk-portlet-body {
    min-height: 211px;
}
.an-sk-a360-channels {
    display: flex;
    flex-wrap: nowrap;
    align-items: stretch;
    flex: 1 1 auto;
    width: 100%;
    min-height: 100%;
    height: 100%;
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}
.an-sk-a360-channel {
    flex: 1 1 20%;
    max-width: 20%;
    min-width: 0;
    min-height: ${A360_CHANNELS_SLOT_HEIGHT}px;
    padding: 20px;
    box-sizing: border-box;
    background: ${SKELETON_BG};
    border-right: 2px solid #fff;
    position: relative;
    display: flex;
    flex-direction: column;
}
.an-sk-a360-channel:last-child {
    border-right: 0;
}
.an-sk-a360-channel:not(:last-child)::before {
    content: '';
    position: absolute;
    top: 50%;
    right: -24px;
    margin-top: -24px;
    border-top: 24px solid transparent;
    border-bottom: 24px solid transparent;
    border-left: 24px solid #fff;
    z-index: 2;
}
.an-sk-a360-channel:not(:last-child)::after {
    content: '';
    position: absolute;
    top: 50%;
    right: -21px;
    margin-top: -24px;
    border-top: 24px solid transparent;
    border-bottom: 24px solid transparent;
    border-left: 24px solid ${SKELETON_BG};
    z-index: 3;
}
.an-sk-a360-channel__body {
    flex: 1 1 auto;
    width: 100%;
    min-height: calc(${A360_CHANNELS_SLOT_HEIGHT}px - 40px);
    height: 100%;
    border-radius: 4px;
}
.an-sk-a360-path {
    position: relative;
    width: 100%;
    flex: 1 1 auto;
    min-height: 0;
    height: 100%;
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
}
.an-sk-portlet.pathConversion {
    height: ${A360_PATH_CONVERSION_HEIGHT}px;
    min-height: ${A360_PATH_CONVERSION_HEIGHT}px;
    display: flex;
    flex-direction: column;
}
.an-sk-portlet.pathConversion .an-sk-portlet-body {
    flex: 1 1 auto;
    min-height: 0;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: stretch;
}
.path-conversion-flow-skeleton {
    position: relative;
    width: 100%;
    height: ${A360_PATH_CONVERSION_CHART_HEIGHT}px;
    min-height: ${A360_PATH_CONVERSION_CHART_HEIGHT}px;
    flex-shrink: 0;
    background: ${SKELETON_SURFACE};
    padding: 0;
    box-sizing: border-box;
}
.an-sk-a360-path__toolbar {
    display: flex;
    justify-content: flex-end;
    gap: 8px;
    margin-bottom: 12px;
    flex-shrink: 0;
}
.an-sk-a360-path__canvas {
    position: relative;
    width: 100%;
    flex: 1 1 auto;
    min-height: 0;
    height: 100%;
}
.an-sk-a360-path__node {
    position: absolute;
    border-radius: 8px;
}
@media (max-width: 767.98px) {
    .an-sk-a360-channel {
        flex: 0 0 100%;
        max-width: 100%;
        border-right: 0;
        margin-bottom: 8px;
    }
    .an-sk-a360-channel::before,
    .an-sk-a360-channel::after {
        display: none;
    }
}
${buildAudienceDetailSkeletonCriticalCss('.an-sk-scope .audienceAnalytics360PageCSS')}
${buildAudienceReportSkeletonCriticalCss('.an-sk-scope .audienceAnalytics360PageCSS')}
${buildAudienceBehaviorBubbleSkeletonCriticalCss('.an-sk-scope .audienceAnalytics360PageCSS')}
@keyframes anSkSkeletonShimmer {
    0% { left: -100%; }
    100% { left: 100%; }
}
${gridLoadingSkeletonCriticalCss}
${resgridListSkeletonCriticalCss}
${buildAnalyticsSkeletonShimmerCss()}
`;

/** Injected on live A360 page so portlet skeletons align before app.scss finishes loading. */
export const audienceAnalytics360LiveSkeletonCriticalCss = `
.audienceAnalytics360PageCSS .portlet-container {
    padding: var(--boxDesignBodySpace, ${A360_PORTLET_BODY_PADDING}px);
    box-sizing: border-box;
}
.audienceAnalytics360PageCSS .an-sk-a360-header,
.audienceAnalytics360PageCSS .audiance-analytics-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
}
.audienceAnalytics360PageCSS .an-sk-a360-channels,
.audienceAnalytics360PageCSS .channelList .portlet-body > .row {
    display: flex;
    flex-wrap: nowrap;
    align-items: stretch;
    flex: 1 1 auto;
    margin: 0;
    width: 100%;
    min-height: 100%;
    height: 100%;
}
.audienceAnalytics360PageCSS .pref-a360-skel-channels .an-sk-portlet-body {
    min-height: 211px;
}
.audienceAnalytics360PageCSS .an-sk-a360-channel,
.audienceAnalytics360PageCSS .channelList .channelListView {
    flex: 1 1 20%;
    max-width: 20%;
    min-width: 0;
    min-height: ${A360_CHANNELS_SLOT_HEIGHT}px;
    padding: 20px;
    box-sizing: border-box;
    background: ${SKELETON_BG};
    border-right: 2px solid #fff;
    position: relative;
    display: flex;
    flex-direction: column;
}
.audienceAnalytics360PageCSS .an-sk-a360-channel__body,
.audienceAnalytics360PageCSS .an-sk-a360-channel .an-sk-block {
    flex: 1 1 auto;
    width: 100%;
    min-height: calc(${A360_CHANNELS_SLOT_HEIGHT}px - 40px);
    height: 100%;
    border-radius: 4px;
}
.audienceAnalytics360PageCSS .an-sk-a360-channel:last-child,
.audienceAnalytics360PageCSS .channelList .channelListView:last-child {
    border-right: 0;
}
.audienceAnalytics360PageCSS .an-sk-a360-channel:not(:last-child)::before,
.audienceAnalytics360PageCSS .channelList .channelListView.noDataAvailable:not(:last-child)::before {
    content: '';
    position: absolute;
    top: 50%;
    right: -24px;
    margin-top: -24px;
    border-top: 24px solid transparent;
    border-bottom: 24px solid transparent;
    border-left: 24px solid #fff;
    z-index: 2;
}
.audienceAnalytics360PageCSS .an-sk-a360-channel:not(:last-child)::after,
.audienceAnalytics360PageCSS .channelList .channelListView.noDataAvailable:not(:last-child)::after {
    content: '';
    position: absolute;
    top: 50%;
    right: -21px;
    margin-top: -24px;
    border-top: 24px solid transparent;
    border-bottom: 24px solid transparent;
    border-left: 24px solid ${SKELETON_BG};
    z-index: 3;
}
.audienceAnalytics360PageCSS .an-sk-a360-portlet-body .an-sk-a360-activity-level,
.audienceAnalytics360PageCSS .an-sk-a360-activity-slot .an-sk-a360-activity-level {
    height: 100%;
    min-height: 0;
    width: 100%;
    box-sizing: border-box;
}
.audienceAnalytics360PageCSS .channelList .portlet-body {
    min-height: 211px;
    display: flex;
    flex-direction: column;
    box-sizing: border-box;
}
.audienceAnalytics360PageCSS .channelList .portlet-body > .an-sk-a360-channels {
    flex: 1 1 auto;
    min-height: ${A360_CHANNELS_SLOT_HEIGHT}px;
    height: 100%;
}
.audienceAnalytics360PageCSS .an-sk-a360-slot {
    position: relative;
    width: 100%;
    box-sizing: border-box;
}
.audienceAnalytics360PageCSS .an-sk-a360-activity-slot {
    min-height: calc(${A360_ACTIVITY_LEVEL_HEIGHT}px - ${A360_PORTLET_BODY_PADDING * 2}px);
    height: calc(${A360_ACTIVITY_LEVEL_HEIGHT}px - ${A360_PORTLET_BODY_PADDING * 2}px);
    flex: 1 1 auto;
}
.audienceAnalytics360PageCSS .an-sk-a360-channels-slot {
    min-height: ${A360_CHANNELS_SLOT_HEIGHT}px;
    height: 100%;
    display: flex;
    flex-direction: column;
}
.audienceAnalytics360PageCSS .an-sk-a360-channels-slot > .an-sk-a360-channels {
    flex: 1 1 auto;
    min-height: ${A360_CHANNELS_SLOT_HEIGHT}px;
}
.audienceAnalytics360PageCSS .an-sk-a360-slot .nodata-bar.nodata-skeleton-con {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    z-index: 12;
    height: 35px;
    white-space: nowrap;
}
.audienceAnalytics360PageCSS .an-sk-static .an-sk-block::after,
.audienceAnalytics360PageCSS .an-sk-static .an-sk-a360-channel__body::after {
    display: none !important;
    animation: none !important;
}
.audienceAnalytics360PageCSS .portlet-md.areaspline-x-axis-labels .portlet-body.an-sk-a360-portlet-body {
    min-height: ${A360_ACTIVITY_LEVEL_HEIGHT}px;
    height: auto;
    max-height: ${A360_ACTIVITY_LEVEL_HEIGHT}px;
    overflow: hidden;
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
}
.audienceAnalytics360PageCSS .channelList .portlet-body.an-sk-a360-portlet-body {
    min-height: 211px;
    height: auto;
    display: flex;
    flex-direction: column;
    box-sizing: border-box;
    overflow: hidden;
}
.audienceAnalytics360PageCSS .portlet-container.portlet-md.areaspline-x-axis-labels:not(:has(.bubble-audience-behaviour-del)) {
    height: auto;
    min-height: 0;
}
.audienceAnalytics360PageCSS .pref-a360-skel-behavior.portlet-container,
.audienceAnalytics360PageCSS .portlet-container.pref-a360-skel-behavior {
    height: ${LIVE_PORTLET_MD_HEIGHT}px;
    min-height: ${LIVE_PORTLET_MD_HEIGHT}px;
    display: flex;
    flex-direction: column;
    box-sizing: border-box;
}
.audienceAnalytics360PageCSS .pref-a360-skel-behavior .portlet-body.bubble-audience-behaviour-del {
    flex: 1 1 auto;
    min-height: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    
    box-sizing: border-box;
}
.audienceAnalytics360PageCSS .portlet-container.portlet-md,
.audienceAnalytics360PageCSS .an-sk-portlet {
    margin-bottom: 21px;
    box-sizing: border-box;
}
.audienceAnalytics360PageCSS .portlet-container.portlet-md .portlet-body .skeleton-shimmer,
.audienceAnalytics360PageCSS .portlet-container.portlet-md .portlet-body [class*='CommonSkeleton'],
.audienceAnalytics360PageCSS .an-sk-block {
    background: ${SKELETON_BG};
    border-radius: 4px;
}
.audienceAnalytics360PageCSS .pathConversion.an-sk-portlet,
.audienceAnalytics360PageCSS .pathConversion.portlet-container {
    height: ${A360_PATH_CONVERSION_HEIGHT}px;
    min-height: ${A360_PATH_CONVERSION_HEIGHT}px;
}
.audienceAnalytics360PageCSS .pathConversion .an-sk-portlet-body,
.audienceAnalytics360PageCSS .pathConversion .portlet-body {
    flex: 1 1 auto;
    min-height: 0;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: stretch;
}
.audienceAnalytics360PageCSS .pathConversion .an-sk-a360-path {
    flex: 0 0 auto;
    min-height: 0;
    height: auto;
    display: flex;
    flex-direction: column;
}
.audienceAnalytics360PageCSS .pathConversion .an-sk-a360-path__canvas {
    flex: 0 0 auto;
    min-height: 0;
    height: auto;
}
.audienceAnalytics360PageCSS .audienceCardBlock.portlet-container:not(.no-border) {
    min-height: ${A360_AUDIENCE_CARD_HEIGHT}px;
    height: auto;
    padding: var(--boxDesignBodySpace, ${A360_PORTLET_BODY_PADDING}px);
    border: 1px solid ${SKELETON_BORDER};
    border-radius: var(--globalBorderRadius, 5px);
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.08);
    display: flex;
    flex-direction: column;
}
.audienceAnalytics360PageCSS .skeleton-span-con.p0:has(> .audienceCardBlock.portlet-container) {
    min-height: ${A360_AUDIENCE_CARD_HEIGHT}px;
    height: auto;
    display: flex;
    flex-direction: column;
}
.audienceAnalytics360PageCSS .audienceCardBlock > .row {
    flex: 0 0 auto;
    align-content: flex-start;
}
.audienceAnalytics360PageCSS .pathConversion .skeleton-span-con .react-loading-skeleton {
    --base-color: ${SKELETON_BG};
    --highlight-color: ${SKELETON_SHIMMER_HIGHLIGHT};
    background-color: ${SKELETON_BG} !important;
}
.audienceAnalytics360PageCSS .pathConversion .skeleton-static .react-loading-skeleton,
.audienceAnalytics360PageCSS .pathConversion .skeleton-static .react-loading-skeleton::after {
    animation: none !important;
}
.audienceAnalytics360PageCSS .pathConversion.portlet-container.h-auto {
    height: ${A360_PATH_CONVERSION_HEIGHT}px;
    min-height: ${A360_PATH_CONVERSION_HEIGHT}px;
    display: flex;
    flex-direction: column;
}
.audienceAnalytics360PageCSS .pathConversion .portlet-body {
    flex: 1 1 auto;
    min-height: 0;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: stretch;
}
.audienceAnalytics360PageCSS .pathConversion .portlet-body > .position-relative,
.audienceAnalytics360PageCSS .pathConversion .portlet-body .path-conversion-flow-skeleton,
.audienceAnalytics360PageCSS .pathConversion .portlet-body .skeleton-span-con.p0,
.audienceAnalytics360PageCSS .pathConversion .portlet-body .barChart {
    flex: 0 0 auto;
    min-height: ${A360_PATH_CONVERSION_CHART_HEIGHT}px;
    height: ${A360_PATH_CONVERSION_CHART_HEIGHT}px !important;
    display: block;
}
.audienceAnalytics360PageCSS .pathConversion .portlet-body .path-conversion-flow-skeleton {
    flex: 0 0 auto;
    min-height: ${A360_PATH_CONVERSION_CHART_HEIGHT}px;
    height: ${A360_PATH_CONVERSION_CHART_HEIGHT}px;
    background: ${SKELETON_SURFACE};
    padding: 0;
    box-sizing: border-box;
}
.audienceAnalytics360PageCSS .pathConversion .portlet-body .barChart {
    flex: 0 0 auto;
    min-height: ${A360_PATH_CONVERSION_CHART_HEIGHT}px;
    height: ${A360_PATH_CONVERSION_CHART_HEIGHT}px;
    display: flex;
    flex-direction: column;
}
.audienceAnalytics360PageCSS .pathConversion .portlet-body .barChart .path-conversion-column-skeleton,
.audienceAnalytics360PageCSS .pathConversion .portlet-body .barChart .skeleton-span-con.p0 {
    flex: 1 1 auto;
    min-height: 0;
    height: 100%;
    padding: 0;
    box-sizing: border-box;
}
.audienceAnalytics360PageCSS .pathConversion .portlet-body .barChart .portlet-chart {
    flex: 1 1 auto;
    min-height: 0;
    height: 100%;
    margin: 0;
}
.audienceAnalytics360PageCSS .pathConversion .portlet-body .barChart .portlet-chart > div {
    height: 100% !important;
}
${buildAudienceDetailSkeletonCriticalCss('.audienceAnalytics360PageCSS')}
${buildAudienceReportSkeletonCriticalCss('.audienceAnalytics360PageCSS')}
${buildAudienceBehaviorBubbleSkeletonCriticalCss('.audienceAnalytics360PageCSS')}
@keyframes anSkSkeletonShimmer {
    0% { left: -100%; }
    100% { left: 100%; }
}
${buildAnalyticsShimmerRulesForScopes([A360_LIVE_SHIMMER_SCOPE])}
`;
