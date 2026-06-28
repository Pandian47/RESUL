/** Split A/B scheduler modal — layout before app.scss loads */
export const splitABSchedulerModalSkeletonCriticalCss = `
.split-ab-scheduler-modal-skeleton .split-header-box {
    border: 1px solid #c2cfe3;
    border-radius: 5px;
    list-style: none;
    margin: 0 9px 30px;
    padding: 0;
    box-sizing: border-box;
}
.split-ab-scheduler-modal-skeleton .split-header-box > li {
    width: 50%;
    display: flex;
    align-items: center;
    position: relative;
    padding: 10px 21px;
    margin: 0;
    box-sizing: border-box;
}
.split-ab-scheduler-modal-skeleton .split-header-box > li.left {
    flex-direction: column;
    align-items: flex-start;
    justify-content: center;
}
.split-ab-scheduler-modal-skeleton .split-header-box > li::before {
    content: "";
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    border-left: 1px solid #c2cfe3;
}
.split-ab-scheduler-modal-skeleton .split-header-box > li:last-child {
    width: auto;
    flex: 1 1 auto;
    flex-direction: column;
    align-items: flex-start;
}
.split-ab-scheduler-modal-skeleton .split-header-box > li:last-child::before {
    content: none;
}
.split-ab-scheduler-modal-skeleton .splitAB-wrapper {
    margin-left: 0;
    margin-right: 0;
    align-items: stretch;
}
.split-ab-scheduler-modal-skeleton .splitAB-wrapper > [class*="col"] {
    display: flex;
    padding-left: 12px;
    padding-right: 12px;
    box-sizing: border-box;
}
.split-ab-scheduler-modal-skeleton .split-card-box {
    border: 1px solid #c2cfe3;
    border-radius: 5px;
    position: relative;
    text-align: left;
    background-color: transparent;
    min-height: 320px;
    box-sizing: border-box;
}
.split-ab-scheduler-modal-skeleton .split-card-radio {
    position: absolute;
    top: -5px;
    left: -5px;
    z-index: 2;
    width: 20px;
    height: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #fff;
    border-radius: 50%;
}
.split-ab-scheduler-modal-skeleton .split-card-inner {
    border-radius: inherit;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    flex: 1 1 auto;
    min-height: 0;
    width: 100%;
}
.split-ab-scheduler-modal-skeleton .scb-header {
    flex-shrink: 0;
    box-sizing: border-box;
}
.split-ab-scheduler-modal-skeleton .scb-header.bg-tertiary-blue {
    background-color: #f0f8ff;
}
.split-ab-scheduler-modal-skeleton .split-card-dimmed-body {
    flex: 1 1 auto;
    min-height: 0;
    display: flex;
    flex-direction: column;
}
.split-ab-scheduler-modal-skeleton .scb-size {
    display: flex;
    align-items: baseline;
    gap: 10px;
    padding: 19px;
    flex-shrink: 0;
    box-sizing: border-box;
}
.split-ab-scheduler-modal-skeleton .scb-preview {
    width: 100%;
    flex: 1 1 auto;
    min-height: 140px;
    box-sizing: border-box;
    background-color: #f5f7fc;
    align-items: flex-start;
    justify-content: flex-start;
}
.split-ab-scheduler-modal-skeleton .scb-preview .skeleton-shimmer,
.split-ab-scheduler-modal-skeleton .split-card-box .skeleton-shimmer {
    background: #e2e7ee;
    border-radius: 4px;
}
`;

/** Critical layout for Communication list / gallery / planner route skeleton */
export const communicationSkeletonCriticalCss = `
.communication-skeleton-scope {
    width: 100%;
    box-sizing: border-box;
}
.react-loading-skeleton {
    background: #e2e7ee !important;
}
.communication-skeleton-scope.page-content-holder,
.communication-skeleton-scope.communication-suspense-fallback {
    padding-top: 78px;
    margin: 0;
    width: 100%;
    max-width: 100%;
    box-sizing: border-box;
}
.communication-skeleton-scope .communication-planner-skeleton .skeleton-shimmer,
.communication-skeleton-scope .communication-planner-skeleton .skeleton-shimmer::after,
.communication-skeleton-scope .rs-planner-skeleton-overlay .skeleton-shimmer,
.communication-skeleton-scope .rs-planner-skeleton-overlay .skeleton-shimmer::after {
    animation: none !important;
}
.communication-skeleton-scope .communication-planner-skeleton .react-loading-skeleton,
.communication-skeleton-scope .rs-planner-skeleton-overlay .react-loading-skeleton {
    --pseudo-element-display: none !important;
}
.communication-skeleton-scope .communication-page-header-skeleton .heading-title-text h1 {
    margin: 0;
}
.communication-skeleton-scope .main-heading-wrapper.container-fluid {
    margin-bottom: 0;
    box-sizing: border-box;
    background-color: #f5f7fc;
}
.communication-skeleton-scope .main-heading-wrapper .mhw-container.container {
    max-width: 1260px;
    padding-left: 0;
    padding-right: 0;
}
.communication-skeleton-scope .communication-page-header-skeleton {
    margin-bottom: 0;
    padding-bottom: 0;
}
.communication-skeleton-scope .communication-page-header-skeleton .mhw-container {
    padding-top: 5px;
    padding-bottom: 5px;
    min-height: 40px;
}
.communication-skeleton-scope .pc-tabs-wrapper {
    margin-top: 0;
}
.communication-skeleton-scope .pc-tabs-wrapper .page-content {
    padding-top: 0;
    margin-top: 0;
}
.communication-skeleton-scope .pc-tabs-wrapper .page-content .page-content {
    padding-top: 0;
    margin-top: 0;
}
.communication-skeleton-scope .fullWhiteBackground {
    margin: 0;
    padding: 0;
    background: #f5f7fc;
    width: 100%;
    box-sizing: border-box;
}
.communication-skeleton-scope .pc-tabs-wrapper .page-content .fullWhiteBackground {
    width: 100%;
    max-width: 100%;
}
.communication-skeleton-scope .fullWhiteBackground + .container.px0 {
    margin-top: 0;
    padding-top: 0;
    max-width: 1260px;
    margin-left: auto;
    margin-right: auto;
}
.communication-skeleton-scope .pc-tabs-wrapper .page-content.pc-communication-plan {
    padding-bottom: 0;
}
.communication-skeleton-scope .pc-tabs-wrapper .page-content.pc-communication-plan > .container-fluid {
    max-width: 1260px;
    margin-left: auto;
    margin-right: auto;
}
.communication-skeleton-scope .pc-tabs-wrapper .page-content .page-content {
    padding-left: 0;
    padding-right: 0;
}
/* Tab strip — match RSTabbarFluid (body bg, no white side gaps, $font-sm labels) */
.communication-skeleton-scope .communication-tabs-skeleton {
    width: 100%;
    background: #f5f7fc;
    box-sizing: border-box;
}
.communication-skeleton-scope .communication-tabs-skeleton__container {
    max-width: 1260px;
    width: 100%;
    margin-left: auto;
    margin-right: auto;
    box-sizing: border-box;
}
.communication-skeleton-scope .communication-tabs-skeleton__list {
    display: flex;
    flex-wrap: nowrap;
    width: 100%;
    margin: 0;
    padding: 0;
    list-style: none;
    box-sizing: border-box;
}
.communication-skeleton-scope .communication-tabs-skeleton__list .tabDefault {
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
    padding: 2px 6px;
    border-top-left-radius: var(--globalBorderRadius, 5px);
    border-top-right-radius: var(--globalBorderRadius, 5px);
    box-sizing: border-box;
    text-align: center;
    cursor: default;
}
.communication-skeleton-scope .communication-tabs-skeleton__list .tabDefault:first-child {
    border-left: none;
}
.communication-skeleton-scope .communication-tabs-skeleton__list .tabDefault span {
    font-size: 19px;
    line-height: 37px;
    color: #333;
}
.communication-skeleton-scope .communication-planner-tab-skeleton .bg-pink {
    background-color: #fde8e8 !important;
}
.communication-skeleton-scope .communication-planner-tab-skeleton .bg-blue {
    background-color: #e8f0fd !important;
}
.communication-skeleton-scope .rs-planner-calendar-wrapper.position-relative {
    min-height: 520px;
}
.communication-skeleton-scope .rs-planner-skeleton-overlay .communication-planner-skeleton .box-design {
    border: none;
    box-shadow: none;
}
.communication-skeleton-scope .pc-tabs-wrapper .container.px0 {
    max-width: 1260px;
    margin-left: auto;
    margin-right: auto;
    width: 100%;
    box-sizing: border-box;
}
.communication-skeleton-scope .skeleton-communication-list {
    width: 100%;
    max-width: 100%;
    margin: 0;
    padding: 4px 3px;
    box-sizing: border-box;
    overflow: visible;
}
.communication-skeleton-scope .skeleton-communication-list .mb22.ml0 {
    margin-left: 0 !important;
    width: 100%;
    max-width: 100%;
}
.communication-skeleton-scope .communication-list-tab-skeleton .top-sub-heading.advanceSearchContainer {
    margin-top: var(--pageButtonTopSpace, 21px);
    margin-bottom: 0;
    width: 100%;
    padding-left: 0;
    padding-right: 0;
}
.communication-skeleton-scope .communication-list-tab-skeleton .rs-grid-listing,
.communication-skeleton-scope .communication-list-tab-skeleton__rows {
    width: 100%;
    max-width: 100%;
    margin-left: 0;
    margin-right: 0;
    padding: 0;
    box-sizing: border-box;
    overflow: visible;
}
.communication-skeleton-scope .communication-list-tab-skeleton__rows.mt15 {
    margin-top: var(--pageButtonTopSpace, 21px);
}
.communication-skeleton-scope .skeleton-shimmer::after {
    display: none !important;
    animation: none !important;
}
${splitABSchedulerModalSkeletonCriticalCss}
`;
