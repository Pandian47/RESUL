/** Audience layout before / after app.scss — mirrors Audience/index.jsx + RSTabberFluid. */
export const audienceSkeletonCriticalCss = `
/* Hide live RSHeader breadcrumbs while audience / MDM skeleton is on screen */
body:has(.page-content-holder.audience-skeleton-scope[aria-busy='true']) .breadcrumbs:not(.page-breadcrumb-skeleton),
body:has(.audience-suspense-fallback) .breadcrumbs:not(.page-breadcrumb-skeleton),
body:has(.mdm-page-skeleton) .breadcrumbs:not(.page-breadcrumb-skeleton) {
    display: none !important;
}
.audience-skeleton-scope {
    width: 100%;
    box-sizing: border-box;
}
.audience-skeleton-scope.page-content-holder {
    padding-top: 78px;
    margin: 0;
    width: 100%;
    max-width: 100%;
    box-sizing: border-box;
}
.audience-skeleton-scope .container-fluid {
    width: 100%;
    max-width: 100%;
    box-sizing: border-box;
}
.audience-skeleton-scope .container-fluid > .page-content,
.audience-skeleton-scope .container-fluid > .page-content.audience-page-shell-skeleton__content {
    width: 100%;
    max-width: 1260px;
    margin-left: auto;
    margin-right: auto;
    padding-left: 0;
    padding-right: 0;
    box-sizing: border-box;
}
/* Live RSTabbarFluid tab body (TL / DL inline load) — same 1260 column as route skeleton */
.audience-skeleton-scope .container-fluid > .page-content > .container.px0:not(.audience-tab-panel-skeleton) {
    max-width: 1260px;
    width: 100%;
    margin-left: auto;
    margin-right: auto;
    padding-left: 0 !important;
    padding-right: 0 !important;
    box-sizing: border-box;
}
.audience-skeleton-scope .main-heading-wrapper.container-fluid {
}
.audience-skeleton-scope .main-heading-wrapper .mhw-container.container {
    max-width: 1260px;
    padding-left: 0;
    padding-right: 0;
}
.audience-skeleton-scope .audience-tabs-skeleton,
.audience-skeleton-scope .fullWhiteBackground.audience-tabs-skeleton {
    width: 100%;
    max-width: 100%;
    margin-left: 0;
    margin-right: 0;
    background: #f5f7fc;
    box-sizing: border-box;
}
.audience-skeleton-scope .audience-tabs-skeleton__container,
.audience-skeleton-scope .fullWhiteBackground.audience-tabs-skeleton > .audience-tabs-skeleton__container.container,
.audience-skeleton-scope .audience-tabs-skeleton .container {
    max-width: 1260px;
    width: 100%;
    margin-left: auto;
    margin-right: auto;
    padding-left: 0 !important;
    padding-right: 0 !important;
    box-sizing: border-box;
}
.audience-skeleton-scope .audience-tabs-skeleton__container > .row {
    margin-left: 0;
    margin-right: 0;
    width: 100%;
}
.audience-skeleton-scope .audience-page-shell-skeleton__content .audience-tabs-skeleton__container,
.audience-skeleton-scope .audience-page-shell-skeleton__content .audience-tab-panel-container.px0,
.audience-skeleton-scope .audience-page-shell-skeleton__content > .container.px0.audience-tab-panel-skeleton {
    max-width: 100%;
    width: 100%;
    margin-left: 0;
    margin-right: 0;
    padding-left: 0 !important;
    padding-right: 0 !important;
    box-sizing: border-box;
}
.audience-skeleton-scope .fullWhiteBackground + .audience-tab-panel-container.px0,
.audience-skeleton-scope .fullWhiteBackground + .container.px0.audience-tab-panel-skeleton {
    margin-top: 0;
}
.audience-skeleton-scope--route-content,
.audience-skeleton-scope .mdm-tab-content-skeleton {
    padding: 0;
    margin: 0;
    width: 100%;
    box-sizing: border-box;
}
/* MDM overview: chart + 2×2 cards — equal column height, match Overview.jsx */
.audience-skeleton-scope .mdm-overview-row,
.audience-skeleton-scope .mdm-overview-bootstrap-row {
    display: flex;
    flex-wrap: wrap;
    align-items: stretch;
    width: 100%;
    margin-left: 0;
    margin-right: 0;
}
.audience-skeleton-scope .mdm-overview-col-chart,
.audience-skeleton-scope .mdm-overview-col-cards {
    box-sizing: border-box;
}
@media (min-width: 576px) {
    .audience-skeleton-scope .mdm-overview-row > .col-sm-6,
    .audience-skeleton-scope .mdm-overview-bootstrap-row > .col-sm-6 {
        flex: 0 0 50%;
        max-width: 50%;
    }
}
.audience-skeleton-scope .mdm-overview-chart-portlet {
    display: flex;
    flex-direction: column;
    min-height: 406px;
    margin-bottom: 0;
    width: 100%;
    background: #fff;
    border: 1px solid #c2cfe3;
    border-radius: var(--globalBorderRadius, 5px);
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.08);
    padding: 19px;
    box-sizing: border-box;
}
.audience-skeleton-scope .mdm-overview-chart-portlet .portlet-body {
    background: #fff;
}
.audience-skeleton-scope .mdm-overview-chart-body {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;
    flex: 1 1 auto;
    min-height: 280px;
    padding-top: 0;
    padding-bottom: 0;
}
.audience-skeleton-scope .mdm-overview-chart-body .bubble-chart-skeleton {
    min-height: 320px;
    height: 320px;
    width: 100%;
    max-width: 100%;
    margin: 0 auto;
}
.audience-skeleton-scope .bubble-chart-skeleton {
    position: relative;
    width: 100%;
}
.audience-skeleton-scope .bubble-chart-skeleton__bubble {
    position: absolute;
    transform: translate(-50%, -50%);
}
.audience-skeleton-scope .mdm-overview-chart-portlet .portlet-body {
    display: flex;
    flex-direction: column;
    flex: 1;
    min-height: 320px;
    position: relative;
}
.audience-skeleton-scope .mdm-overview-chart-content {
    position: relative;
    flex: 1;
    width: 100%;
    min-height: 320px;
}
.audience-skeleton-scope .mdm-overview-chart-skeleton-overlay {
    position: absolute;
    inset: 0;
    z-index: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
}
.audience-skeleton-scope .mdm-overview-chart-skeleton-overlay .mdm-overview-chart-body {
    width: 100%;
    height: 100%;
}
.audience-skeleton-scope .mdm-overview-chart-live--loading {
    visibility: hidden;
    position: absolute;
    inset: 0;
    pointer-events: none;
}
.audience-skeleton-scope .mdm-overview-chart-body--pie .skeleton-span-con {
    height: auto;
    width: 100%;
}
.audience-skeleton-scope .mdm-overview-col-cards .mdm-overview-cards-grid {
    width: 100%;
    margin: 0;
    height: 100%;
    align-content: flex-start;
}
.audience-skeleton-scope .mdm-overview-col-cards .mdm-overview-cards-grid > [class*='col-'] {
    display: flex;
}
.audience-skeleton-scope .mdm-overview-col-cards .mdm-overview-cards-grid > [class*='col-'] > .box-design {
    width: 100%;
    flex: 1 1 auto;
}
.page-layout-skeleton--inline.audience-skeleton-scope .pls-body .page-content-holder {
    padding-top: 0;
}
.audience-skeleton-scope .main-heading-wrapper {
    margin-bottom: 0;
}
.audience-skeleton-scope .page-content {
    padding-top: 0;
    margin-top: 0;
    width: 100%;
    box-sizing: border-box;
}
.audience-skeleton-scope .audience-tabs-skeleton__list,
.audience-skeleton-scope .rs-tabs.row {
    display: flex;
    width: 100%;
    margin: 0;
    padding: 0;
    list-style: none;
    flex-wrap: nowrap;
}
.audience-skeleton-scope .audience-tabs-skeleton__tab,
.audience-skeleton-scope .rs-tabs .tabDefault {
    flex: 1 1 33.333%;
    max-width: 33.333%;
    min-width: 0;
    min-height: 41px;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: #e2e7ee !important;
    border-left: 3px solid #f5f7fc;
    position: relative;
    box-sizing: border-box;
    padding: 0;
}
.audience-skeleton-scope .audience-tabs-skeleton__tab:first-child,
.audience-skeleton-scope .rs-tabs .tabDefault:first-child {
    border-left: none;
}
.audience-skeleton-scope .audience-tabs-skeleton__tab span,
.audience-skeleton-scope .rs-tabs .tabDefault span {
    color: #333;
}
.audience-skeleton-scope .audience-tabs-skeleton__label {
    display: block;
    width: 100%;
    text-align: center;
}
.audience-mdm-suspense-fallback,
.audience-suspense-fallback {
    width: 100%;
    min-height: 200px;
}
.audience-skeleton-scope .audience-tab-panel-skeleton {
    width: 100%;
    max-width: 100%;
    padding-left: 0;
    padding-right: 0;
    box-sizing: border-box;
}
.audience-skeleton-scope .audience-tab-panel-skeleton .mdm-page-skeleton,
.audience-skeleton-scope .audience-mdm-panel-skeleton {
    width: 100%;
}
.audience-skeleton-scope .audience-page-header-skeleton {
    margin-bottom: 0;
    padding-bottom: 0;
}
.audience-skeleton-scope .audience-page-header-skeleton .mhw-container {
    min-height: 45px;
    padding: 10px 0;
    box-sizing: border-box;
}
.audience-skeleton-scope .audience-tabs-skeleton {
    margin-bottom: 0;
}
.audience-skeleton-scope .audience-page-shell-skeleton__content {
    padding-top: 0;
    margin-top: 0;
}
.audience-skeleton-scope .audience-tab-panel-skeleton {
    margin-top: 0;
    padding-top: 10px;
}
/* RSPageHeader skeleton — title + BU/department dropdowns above tabs */
.audience-skeleton-scope .audience-page-header-skeleton {
    margin-bottom: 0;
}
.audience-skeleton-scope .audience-mdm-panel-skeleton .mdm-page-skeleton {
    width: 100%;
}
.audience-skeleton-scope .audience-mdm-tab-skeleton,
.audience-skeleton-scope .audience-mdm-panel-skeleton,
.audience-skeleton-scope .mdm-page-skeleton {
    width: 100%;
    max-width: 100%;
    padding-left: 0;
    padding-right: 0;
    box-sizing: border-box;
}
.audience-skeleton-scope .mdm-page-skeleton .mdm-sk-list-acquisition-skeleton {
    width: 100%;
    max-width: 100%;
    box-sizing: border-box;
}
.audience-skeleton-scope .mdm-overview-col-cards .box-design {
    width: 100%;
    max-width: 100%;
    min-height: 193px;
    height: 193px;
}
.audience-skeleton-scope .master-data-page-skeleton .portlet-container.portlet-md {
    margin-bottom: 0;
}
.audience-skeleton-scope .top-sub-heading {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: space-between;
    width: 100%;
}
.audience-skeleton-scope .top-sub-heading .fr.flex-left {
    flex: 1 1 auto;
}
.audience-skeleton-scope .skeleton-span-con,
.audience-skeleton-scope .skeleton-span-con .width100p {
    width: 100%;
}
.audience-skeleton-scope .mdm-overview-chart-body .portlet-body .bubble-chart-skeleton,
.audience-skeleton-scope .portlet-body .bubble-chart-skeleton {
    position: relative;
    width: 100%;
    min-height: 320px;
    height: 320px;
}
.audience-skeleton-scope .mdm-page-skeleton .mb25 {
    margin-bottom: 25px;
}
.audience-skeleton-scope .bubble-chart-skeleton > span,
.audience-skeleton-scope .bubble-chart-skeleton > .react-loading-skeleton,
.audience-skeleton-scope .bubble-chart-skeleton .react-loading-skeleton {
    position: absolute !important;
    display: block;
    transform: translate(-50%, -50%);
    margin: 0 !important;
}
.audience-skeleton-scope .bubble-chart-skeleton > span:nth-of-type(1),
.audience-skeleton-scope .bubble-chart-skeleton .react-loading-skeleton:nth-of-type(1) {
    left: 17%;
    top: 36%;
}
.audience-skeleton-scope .bubble-chart-skeleton > span:nth-of-type(2),
.audience-skeleton-scope .bubble-chart-skeleton .react-loading-skeleton:nth-of-type(2) {
    left: 28%;
    top: 11%;
}
.audience-skeleton-scope .bubble-chart-skeleton > span:nth-of-type(3),
.audience-skeleton-scope .bubble-chart-skeleton .react-loading-skeleton:nth-of-type(3) {
    left: 72%;
    top: 25%;
}
.audience-skeleton-scope .bubble-chart-skeleton > span:nth-of-type(4),
.audience-skeleton-scope .bubble-chart-skeleton .react-loading-skeleton:nth-of-type(4) {
    left: 35%;
    top: 52%;
}
.audience-skeleton-scope .bubble-chart-skeleton > span:nth-of-type(5),
.audience-skeleton-scope .bubble-chart-skeleton .react-loading-skeleton:nth-of-type(5) {
    left: 55%;
    top: 39%;
}
.audience-skeleton-scope .bubble-chart-skeleton > span:nth-of-type(6),
.audience-skeleton-scope .bubble-chart-skeleton .react-loading-skeleton:nth-of-type(6) {
    left: 41%;
    top: 22%;
}
.audience-skeleton-scope .bubble-chart-skeleton > span:nth-of-type(7),
.audience-skeleton-scope .bubble-chart-skeleton .react-loading-skeleton:nth-of-type(7) {
    left: 56%;
    top: 7%;
}
/* Sync history — mirrors SyncHistory/index.jsx (top-sub-heading + rs-tabs-align-top + grid) */
.sync-history-skeleton-scope.sync-history-inline-page-content-holder {
    padding-top: 0;
}
.sync-history-skeleton-scope .sync-history-page-header-skeleton {
    margin-bottom: 0;
}
.sync-history-skeleton-scope .sync-history-subheading-skeleton {
    margin-top: var(--pageButtonTopSpace, 21px);
    margin-bottom: var(--pageButtonTopSpace, 21px);
    width: 100%;
}
.sync-history-skeleton-scope .sync-history-toolbar-skeleton {
    flex: 0 0 auto;
    gap: 0;
}
.sync-history-skeleton-scope .rs-tabs-align-top.sync-history-tabs-panel-skeleton {
    position: relative;
}
.sync-history-skeleton-scope .rs-tabs-align-top .sync-history-tabs-skeleton__list {
    position: absolute;
    top: -50px;
    right: 0;
    left: auto;
    width: auto;
    justify-content: flex-end;
    flex-wrap: nowrap;
}
.sync-history-skeleton-scope .sync-history-tabs-skeleton__list .sync-history-tabs-skeleton__tab {
    flex: 0 0 auto;
    max-width: none;
    width: 72px;
    min-height: 28px;
    margin-right: 30px;
    background: #e2e7ee !important;
    border: none !important;
    border-left: none !important;
    border-bottom: 1px solid transparent !important;
    box-shadow: none !important;
}
.sync-history-skeleton-scope .sync-history-tabs-skeleton__list .sync-history-tabs-skeleton__tab:last-child {
    margin-right: 0;
}
.sync-history-skeleton-scope .sync-history-tabs-skeleton__list .sync-history-tabs-skeleton__tab:first-child {
    border-left: none !important;
}
.react-loading-skeleton {
    background: #e2e7ee !important;
}
`;
