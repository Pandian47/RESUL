export const SKELETON_BG = '#e2e7ee';
export const SKELETON_BORDER = '#c2cfe3';
export const SKELETON_SURFACE = '#ffffff';
export const SKELETON_PAGE_BG = '#f5f7fc';
export const SKELETON_TAB_BG = '#e2e7ee';
export const SKELETON_TAB_ACTIVE_BG = '#ffffff';
/** Matches `.skeleton-shimmer` / react-loading-skeleton highlight in dashboard scope. */
export const SKELETON_SHIMMER_HIGHLIGHT = '#eef2f9';
export const PAGE_MAX_WIDTH = 1260;
/** Vertical gap between dashboard skeleton portlets — matches live dashboard grid spacing. */
export const PORTLET_BOTTOM_GAP = 26;
/** Matches `$portlet-sizing` sm in `_analytics.scss`. */
export const LIVE_PORTLET_SM_HEIGHT = 310;
/** Matches `.keymetrics-list li span` margin-top in `_analytics.scss`. */
export const LIVE_KEYMETRICS_INNER_LABEL_GAP = 4;
/** Matches `.keymetrics-portlet.keymetrics-sm` in `_analytics.scss`. */
export const LIVE_KEYMETRICS_SM_HEIGHT = 210;
/** Bubble chart placeholder positions — percentage coords inside plot-inner box (320px md body). */
export const BUBBLE_CHART_PLOT_INNER_HEIGHT = 320;
export const BUBBLE_CHART_PLACEHOLDERS = [
    { left: '24%', top: '55%', width: 115, height: 115 },
    { left: '35%', top: '30%', width: 80, height: 80 },
    { left: '79%', top: '44%', width: 70, height: 70 },
    { left: '42%', top: '71%', width: 120, height: 120 },
    { left: '62%', top: '58%', width: 120, height: 120 },
    { left: '48%', top: '41%', width: 95, height: 95 },
    { left: '63%', top: '26%', width: 98, height: 98 },
];
/** Matches `.portlet-container .portlet-header` in `_analytics.scss`. */
export const LIVE_PORTLET_HEADER_HEIGHT = 30;
/** Matches `.portlet-container .portlet-header` margin-bottom in `_analytics.scss`. */
export const LIVE_PORTLET_HEADER_GAP = 15;
/** Matches `.portlet-container` padding in `_analytics.scss`. */
export const LIVE_PORTLET_PADDING = 19;
/** Path analyser filter placeholders — web live dashboard default level count. */
export const LIVE_PATH_ANALYSER_FILTER_COUNT_WEB = 6;
/** Path analyser filter placeholders — mobile live dashboard default level count. */
export const LIVE_PATH_ANALYSER_FILTER_COUNT_MOBILE = 5;
/** Matches `.portlet-sm .portlet-body` height in `_analytics.scss`. */
export const LIVE_PORTLET_SM_BODY_HEIGHT = 219;
/** Matches `.user-product .v-center-inner` grid-gap in `_analytics.scss`. */
export const LIVE_USER_STATUS_INNER_GAP = 15;
/** Matches mobile `.v-center-inner.mt20` offset in live dashboards. */
export const LIVE_USER_STATUS_MOBILE_TOP_OFFSET = 20;
/** Matches `ListAqusitionSekelton` height when `isCommunicationSent` in live traffic portlets. */
export const LIVE_TRAFFIC_CHART_HEIGHT = 180;
/** Matches `$portlet-sizing` md in `_analytics.scss`. */
export const LIVE_PORTLET_MD_HEIGHT = 411;
/** Matches `.portlet-md .portlet-body` height in `_analytics.scss`. */
export const LIVE_PORTLET_MD_BODY_HEIGHT = 320;
/** Matches `.geo_loc .portlet-container.portlet-md` in `_dashboard.scss`. */
export const LIVE_PORTLET_GEO_HEIGHT = 465;
/** Geographic portlet body — same chrome overhead as md (411 − 320). */
export const LIVE_PORTLET_GEO_BODY_HEIGHT =
    LIVE_PORTLET_GEO_HEIGHT - (LIVE_PORTLET_MD_HEIGHT - LIVE_PORTLET_MD_BODY_HEIGHT);
/** Matches `$portlet-sizing` lg in `_analytics.scss`. */
export const LIVE_PORTLET_LG_HEIGHT = 470;
/** Path analyser portlet body — same chrome overhead as md (411 − 320). */
export const LIVE_PORTLET_LG_BODY_HEIGHT =
    LIVE_PORTLET_LG_HEIGHT - (LIVE_PORTLET_MD_HEIGHT - LIVE_PORTLET_MD_BODY_HEIGHT);
/** Retention grid — 1 header row + 5 body rows (`RETENTION_ROW_COUNT` in skeleton). */
export const LIVE_RETENTION_BODY_ROW_COUNT = 5;
export const LIVE_RETENTION_HEADER_HEIGHT = 24;
export const LIVE_RETENTION_BOX_TOP_PADDING = 5;
/** Body cell height only — header stays at `LIVE_RETENTION_HEADER_HEIGHT`. */
export const LIVE_RETENTION_BODY_CELL_HEIGHT = 53;
/** ResKendoGrid retention table — matches $secondary_blue / $tertiary-blue / grid borders */
export const GRID_BLUE_HEADER = '#0043ff';
export const GRID_ROW_ALT = '#f0f8ff';
export const GRID_ROW_BASE = '#ffffff';
export const GRID_CELL_BORDER = '#c2cfe3';

export const skeletonBlockStyle = ({ width, height, circle = false, radius = 4, flex }) => ({
    width,
    height,
    flex,
    backgroundColor: SKELETON_BG,
    borderRadius: circle ? '50%' : radius,
});
