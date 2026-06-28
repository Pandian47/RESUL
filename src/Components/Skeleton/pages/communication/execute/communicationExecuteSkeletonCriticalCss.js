/** Communication execute — matches Execute/index.jsx + portlets (List, Content, Predictive, Approval). */
export const communicationExecuteSkeletonCriticalCss = `
.communication-execute-skeleton-scope {
    width: 100%;
    box-sizing: border-box;
}
.communication-execute-skeleton-scope.communication-execute-inline-skeleton {
    padding-top: 0;
    min-height: 0;
    background: transparent;
}
.communication-execute-skeleton-scope.page-content-holder,
.communication-execute-skeleton-scope.communication-execute-suspense-fallback {
    padding-top: 78px;
    margin: 0;
    width: 100%;
    max-width: 100%;
    min-height: 100vh;
    box-sizing: border-box;
    background-color: #f5f7fc;
}
.communication-execute-skeleton-scope .execute-page-body {
    max-width: 1260px;
    margin-left: auto;
    margin-right: auto;
    width: 100%;
    min-height: calc(100vh - 200px);
    padding-bottom: 24px;
    box-sizing: border-box;
}
.communication-execute-skeleton-scope .main-heading-wrapper.container-fluid {
    margin-bottom: 0;
    background-color: #f5f7fc;
    box-sizing: border-box;
}
.communication-execute-skeleton-scope .pc-tabs-wrapper .page-content.pc-communication-plan {
    padding-bottom: 0;
}
.communication-execute-skeleton-scope .pc-tabs-wrapper .page-content.pc-communication-plan > .container-fluid {
    max-width: 1260px;
    margin-left: auto;
    margin-right: auto;
}
.communication-execute-skeleton-scope .cc-plan-steps-skeleton .skeleton-shimmer,
.communication-execute-skeleton-scope .plan-progress-steps-skeleton .skeleton-shimmer {
    background-color: #e2e7ee;
    border-radius: 4px;
}
/* Plan / Create / Calculate ROI / Execute stepper — same as creation planning page */
.communication-execute-skeleton-scope .cc-plan-steps-skeleton__list,
.communication-execute-skeleton-scope .plan-progress-steps-skeleton__list {
    display: table;
    table-layout: fixed;
    width: 100%;
    max-width: 800px;
    position: relative;
    padding-top: 0;
    padding-bottom: 0;
    padding-left: 0;
    padding-right: 0;
    margin-top: 1px;
    margin-bottom: 30px;
    margin-left: auto;
    margin-right: auto;
    list-style: none;
    box-sizing: border-box;
}
.communication-execute-skeleton-scope .cc-plan-steps-skeleton__item,
.communication-execute-skeleton-scope .plan-progress-steps-skeleton__list .plan-progress-steps-skeleton__item {
    display: table-cell;
    vertical-align: top;
    text-align: center;
    width: 1%;
    padding-top: 0;
    padding-bottom: 0;
    padding-left: 0;
    padding-right: 0;
    margin-top: 0;
    margin-bottom: 0;
    margin-left: 0;
    margin-right: 0;
    border: none;
    background: transparent;
    list-style: none;
    box-sizing: border-box;
}
.communication-execute-skeleton-scope .cc-plan-steps-skeleton__item::before,
.communication-execute-skeleton-scope .plan-progress-steps-skeleton__list .plan-progress-steps-skeleton__item::before {
    display: block;
    overflow: hidden;
    position: relative;
    top: 19px;
    z-index: 1;
    left: 50%;
    width: 100%;
    height: 0;
    font-size: 0;
    border: none;
    border-top: 1px solid #e2e7ee;
    content: '';
    box-sizing: border-box;
    padding: 0 10px;
}
.communication-execute-skeleton-scope .cc-plan-steps-skeleton__item:last-child::before,
.communication-execute-skeleton-scope .plan-progress-steps-skeleton__list .plan-progress-steps-skeleton__item:last-child::before {
    content: inherit;
}
.communication-execute-skeleton-scope .cc-plan-steps-skeleton__step,
.communication-execute-skeleton-scope .plan-progress-steps-skeleton__step {
    display: inline-block;
    position: relative;
    z-index: 2;
    margin-top: 0;
    margin-bottom: 5px;
    margin-left: auto;
    margin-right: auto;
    box-sizing: border-box;
}
.communication-execute-skeleton-scope .cc-plan-steps-skeleton__title,
.communication-execute-skeleton-scope .plan-progress-steps-skeleton__title {
    display: block;
    position: relative;
    top: 0;
    z-index: 4;
    margin-top: 0;
    margin-bottom: 0;
    margin-left: auto;
    margin-right: auto;
    padding: 0;
    box-sizing: border-box;
}
.communication-execute-skeleton-scope .cc-campaign-info-skeleton .skeleton-shimmer,
.communication-execute-skeleton-scope .authoring-campaign-info-skeleton .skeleton-shimmer {
    background-color: #e2e7ee;
    border-radius: 4px;
}
.communication-execute-skeleton-scope .cc-campaign-info-skeleton__label,
.communication-execute-skeleton-scope .authoring-campaign-info-skeleton__label,
.communication-execute-skeleton-scope .cc-campaign-info-skeleton__value,
.communication-execute-skeleton-scope .authoring-campaign-info-skeleton__value {
    height: 24px;
    min-height: 24px;
    max-height: 24px;
}
.communication-execute-skeleton-scope .cc-campaign-info-skeleton,
.communication-execute-skeleton-scope .authoring-campaign-info-skeleton {
    display: flex;
    margin-top: 0;
    margin-bottom: 21px;
    margin-left: 0;
    margin-right: 0;
    padding-top: 14px;
    padding-bottom: 14px;
    padding-left: 16px;
    padding-right: 16px;
    background: #fff;
    border: 1px solid #c2cfe3;
    border-radius: var(--globalBorderRadius, 5px);
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.08);
    box-sizing: border-box;
    width: 100%;
}
.communication-execute-skeleton-scope .cc-campaign-info-skeleton__label,
.communication-execute-skeleton-scope .authoring-campaign-info-skeleton__label {
    width: 48px;
    margin-top: 0;
    margin-bottom: 6px;
    margin-left: 0;
    margin-right: 0;
}
.communication-execute-skeleton-scope .cc-campaign-info-skeleton__value,
.communication-execute-skeleton-scope .authoring-campaign-info-skeleton__value {
    width: 85%;
    margin-top: 0;
    margin-bottom: 0;
    margin-left: 0;
    margin-right: 0;
}
.communication-execute-skeleton-scope .cc-campaign-info-skeleton__action,
.communication-execute-skeleton-scope .authoring-campaign-info-skeleton__action {
    width: 36px;
    height: 36px;
    margin-top: 0;
    margin-bottom: 0;
    margin-left: 0;
    margin-right: 0;
    border-radius: 50% !important;
}
.communication-execute-skeleton-scope .cc-campaign-info-skeleton__row,
.communication-execute-skeleton-scope .authoring-campaign-info-skeleton__row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    gap: 12px;
}
.communication-execute-skeleton-scope .cc-campaign-info-skeleton__cols,
.communication-execute-skeleton-scope .authoring-campaign-info-skeleton__cols {
    display: flex;
    flex: 1;
    gap: 16px;
    min-width: 0;
}
.communication-execute-skeleton-scope .cc-campaign-info-skeleton__col,
.communication-execute-skeleton-scope .authoring-campaign-info-skeleton__col {
    flex: 1;
    min-width: 0;
}
.communication-execute-skeleton-scope .cc-campaign-info-skeleton__actions,
.communication-execute-skeleton-scope .authoring-campaign-info-skeleton__actions {
    display: flex;
    gap: 8px;
    flex-shrink: 0;
}
.communication-execute-skeleton-scope .rsv-tabs-content {
    width: 100%;
    float: none;
    box-sizing: border-box;
}
.communication-execute-skeleton-scope .execute-main-panel-box-design {
    padding: 22px 22px 28px;
    background: #fff;
    border: 1px solid #c2cfe3;
    border-radius: var(--globalBorderRadius, 5px);
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.08);
    box-sizing: border-box;
    width: 100%;
}
.communication-execute-skeleton-scope .execute-channel-tabs-skeleton__list {
    display: flex;
    flex-wrap: nowrap;
    justify-content: center;
    align-items: stretch;
    width: 100%;
    margin: 0;
    padding: 0;
    list-style: none;
    float: none;
}
.communication-execute-skeleton-scope .execute-channel-tabs-skeleton__list .tabDefault {
    background: transparent !important;
    border: none !important;
    border-bottom: none !important;
    box-shadow: none !important;
    flex: 0 0 auto;
    width: auto;
    max-width: none;
    min-height: 40px;
    margin: 0;
    padding: 8px 14px;
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
    box-sizing: border-box;
}
.communication-execute-skeleton-scope .execute-channel-tabs-skeleton__item:not(:last-child) {
    border-right: 1px solid #c2cfe3;
}
.communication-execute-skeleton-scope .execute-channel-tabs-skeleton__item--active.tabDefault {
    border-bottom: 2px solid #0000ff !important;
}
.communication-execute-skeleton-scope .execute-channel-tabs-skeleton__pill {
    border-radius: 4px;
    margin: 0 auto;
}
.communication-execute-skeleton-scope .execute-analysis-progress-skeleton .plan-progress-steps-skeleton__list,
.communication-execute-skeleton-scope .execute-analysis-progress-skeleton .cc-plan-steps-skeleton__list {
    margin-bottom: 0;
}
.communication-execute-skeleton-scope .execute-analysis-progress-skeleton .plan-progress-steps-skeleton__title,
.communication-execute-skeleton-scope .execute-analysis-progress-skeleton .cc-plan-steps-skeleton__title {
    height: 24px;
    min-height: 24px;
    max-height: 24px;
}
/* Portlet shell — match live .portlet-container before app.scss loads */
.communication-execute-skeleton-scope .portlet-container {
    position: relative;
    width: 100%;
    height: auto;
    overflow: hidden;
    padding: 19px;
    margin-bottom: 20px;
    background-color: #fff;
    border: 1px solid #c2cfe3;
    border-radius: var(--globalBorderRadius, 5px);
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.08);
    box-sizing: border-box;
}
.communication-execute-skeleton-scope .portlet-container.portlet-md {
    overflow: visible;
}
.communication-execute-skeleton-scope .portlet-container.p0 {
    padding: 0;
}
.communication-execute-skeleton-scope .portlet-container.mb20 {
    margin-bottom: 20px;
}
.communication-execute-skeleton-scope .portlet-container .portlet-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    clear: both;
    position: relative;
    top: -5px;
    margin-bottom: 15px;
    min-height: 38px;
    line-height: 33px;
    box-sizing: border-box;
}
.communication-execute-skeleton-scope .portlet-container .portlet-header.p19 {
    padding: 19px;
    top: 0;
    margin-bottom: 0;
    min-height: 0;
    height: auto;
}
.communication-execute-skeleton-scope .portlet-container .portlet-header.mb0 {
    margin-bottom: 0;
}
.communication-execute-skeleton-scope .portlet-container .portlet-header h4,
.communication-execute-skeleton-scope .portlet-container .portlet-header .execute-portlet-skeleton-title {
    margin: 0;
    padding: 0;
    display: inline-block;
    font-size: 19px;
    font-family: MuktaRegular, sans-serif;
    font-weight: 400;
    line-height: 33px;
    color: #111111;
}
.communication-execute-skeleton-scope .portlet-container .portlet-body {
    clear: both;
    box-sizing: border-box;
}
.communication-execute-skeleton-scope .execute-skeleton-portlet.portlet-md {
    min-height: 420px;
    height: auto;
    box-sizing: border-box;
}
.communication-execute-skeleton-scope .execute-skeleton-portlet__body {
    min-height: 280px;
    padding-top: 0;
    box-sizing: border-box;
}
.communication-execute-skeleton-scope .execute-skeleton-portlet__row {
    width: 100%;
    height: 33.5px;
    margin-bottom: 15px;
    border-radius: 4px;
}
.communication-execute-skeleton-scope .execute-skeleton-portlet__row:last-child {
    margin-bottom: 0;
}
.communication-execute-skeleton-scope .execute-skeleton-portlet.portlet-md .portlet-body,
.communication-execute-skeleton-scope .execute-predictive-analysis-portlet-body,
.communication-execute-skeleton-scope .execute-approval-status-portlet-body {
    min-height: 280px;
    height: auto;
    box-sizing: border-box;
}
/* Pre-communication analytics — div shimmers (no Kendo Skeleton) */
.communication-execute-skeleton-scope .execute-predictive-analysis-skeleton {
    display: flex;
    flex-direction: column;
    justify-content: space-around;
    margin-top: 30px;
    padding: 0 8px 8px;
    box-sizing: border-box;
}
.communication-execute-skeleton-scope .execute-predictive-analysis-skeleton__row {
    display: flex;
    align-items: center;
    margin-bottom: 20px;
    width: 100%;
    box-sizing: border-box;
}
.communication-execute-skeleton-scope .execute-predictive-analysis-skeleton__label-col {
    flex: 0 0 25%;
    max-width: 25%;
    padding-right: 15px;
    box-sizing: border-box;
}
.communication-execute-skeleton-scope .execute-predictive-analysis-skeleton__label {
    width: 80px;
    height: 18px;
    margin-left: auto;
    border-radius: 4px;
}
.communication-execute-skeleton-scope .execute-predictive-analysis-skeleton__bar-col {
    flex: 1 1 auto;
    min-width: 0;
    box-sizing: border-box;
}
.communication-execute-skeleton-scope .execute-predictive-analysis-skeleton__bar {
    width: 100%;
    height: 30px;
    border-radius: 4px;
}
.communication-execute-skeleton-scope .execute-predictive-analysis-skeleton__insights-title {
    width: 100px;
    height: 24px;
    margin-top: 1px;
    margin-bottom: 10px;
    margin-left: 6px;
    border-radius: 4px;
}
.communication-execute-skeleton-scope .execute-predictive-analysis-skeleton__insight {
    margin-bottom: 15px;
    padding: 0 6px;
    box-sizing: border-box;
}
.communication-execute-skeleton-scope .execute-predictive-analysis-skeleton__insight-line {
    border-radius: 4px;
}
.communication-execute-skeleton-scope .execute-predictive-analysis-skeleton__insight-line--primary {
    width: 90%;
    height: 16px;
    margin-bottom: 8px;
}
.communication-execute-skeleton-scope .execute-predictive-analysis-skeleton__insight-line--secondary {
    width: 30%;
    height: 16px;
}
/* Approval status body — div shimmers */
.communication-execute-skeleton-scope .execute-approval-status-skeleton {
    padding: 0 8px 8px;
    box-sizing: border-box;
}
.communication-execute-skeleton-scope .execute-approval-status-skeleton__row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    padding: 12px 11px 43px 11px;
    box-sizing: border-box;
}
.communication-execute-skeleton-scope .execute-approval-status-skeleton__main {
    flex: 1 1 auto;
    min-width: 0;
}
.communication-execute-skeleton-scope .execute-approval-status-skeleton__side {
    flex: 0 0 auto;
    text-align: right;
}
.communication-execute-skeleton-scope .execute-approval-status-skeleton__line {
    border-radius: 4px;
}
.communication-execute-skeleton-scope .execute-approval-status-skeleton__line--sm {
    width: 140px;
    height: 12px;
    margin-bottom: 6px;
}
.communication-execute-skeleton-scope .execute-approval-status-skeleton__line--md {
    width: 180px;
    height: 19px;
    margin-bottom: 6px;
}
.communication-execute-skeleton-scope .execute-approval-status-skeleton__line--lg {
    width: 220px;
    height: 15px;
}
.communication-execute-skeleton-scope .execute-approval-status-skeleton__line--status {
    width: 120px;
    height: 20px;
    margin-left: auto;
}
.communication-execute-skeleton-scope .execute-page-loading-skeleton .plan-progress-steps-skeleton {
    margin-bottom: 21px;
}
.communication-execute-skeleton-scope .execute-page-loading-skeleton .authoring-campaign-info-skeleton {
    margin-bottom: 21px;
}
.communication-execute-skeleton-scope .execute-content-skeleton {
    width: 100%;
    box-sizing: border-box;
}
.communication-execute-skeleton-scope .execute-content-skeleton__row-top,
.communication-execute-skeleton-scope .execute-content-skeleton__row-bottom {
    margin-left: 0;
    margin-right: 0;
}
.communication-execute-skeleton-scope .execute-content-skeleton__row-bottom {
    align-items: stretch;
}
.communication-execute-skeleton-scope .execute-content-skeleton__row-bottom > [class*='col-'] {
    display: flex;
    flex-direction: column;
}
.communication-execute-skeleton-scope .execute-skeleton-portlet.portlet-md.p0 .portlet-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 12px;
}
.communication-execute-skeleton-scope .execute-approval-portlet-skeleton__tabs {
    display: flex;
    flex-wrap: nowrap;
    justify-content: flex-end;
    gap: 24px;
    margin: 0;
    padding: 0;
    width: auto;
    float: none;
}
.communication-execute-skeleton-scope .execute-approval-portlet-skeleton__tabs .tabDefault {
    background: transparent !important;
    border: none !important;
    border-bottom: none !important;
    padding: 0 !important;
    margin: 0 !important;
    width: auto;
    flex: none;
    display: flex;
    align-items: center;
}
.communication-execute-skeleton-scope .execute-approval-portlet-skeleton__tab-pill {
    border-radius: 4px;
}
.communication-execute-skeleton-scope .execute-footer-buttons-holder {
    display: flex;
    justify-content: flex-end;
    gap: 15px;
    margin-top: 26px;
    padding-bottom: 8px;
}
.communication-execute-skeleton-scope .execute-footer-skeleton__next.skeleton-shimmer {
    background-color: #d4dce8 !important;
}
.communication-execute-skeleton-scope .skeleton-shimmer {
    background-color: #e2e7ee;
    border-radius: 4px;
}
.communication-execute-skeleton-scope .execute-approval-portlet-skeleton__tabs .tabDefault::before,
.communication-execute-skeleton-scope .execute-approval-portlet-skeleton__tabs .tabDefault::after,
.communication-execute-skeleton-scope .execute-approval-portlet-skeleton__tabs .tabDefault.active::before,
.communication-execute-skeleton-scope .execute-channel-tabs-skeleton__list .tabDefault::before,
.communication-execute-skeleton-scope .execute-channel-tabs-skeleton__list .tabDefault::after,
.communication-execute-skeleton-scope .execute-channel-tabs-skeleton__list .tabDefault.active::before {
    display: none !important;
    content: none !important;
    border: none !important;
}
.communication-execute-skeleton-scope .nodata-bar,
.communication-execute-skeleton-scope .no-data-container,
.communication-execute-skeleton-scope .rs-nodata-wrapper {
    display: none !important;
}
.communication-execute-skeleton-scope--roi .execute-roi-flow-skeleton .authoring-campaign-info-skeleton,
.communication-execute-skeleton-scope .execute-roi-page-loading .authoring-campaign-info-skeleton {
    margin-bottom: 21px;
}
.communication-execute-skeleton-scope--roi .execute-roi-flow-skeleton .execute-roi-calculation-skeleton {
    margin-top: 0;
}
.communication-execute-skeleton-scope .execute-roi-calculation-portlet-container.calculateROI {
    min-height: auto;
    background: #fff;
    border: 1px solid #c2cfe3;
    border-radius: var(--globalBorderRadius, 5px);
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.08);
    box-sizing: border-box;
    width: 100%;
    padding: 0;
    overflow: hidden;
}
.communication-execute-skeleton-scope .execute-roi-calculation-skeleton .portlet-header {
    padding: 19px 22px;
    border-bottom: 1px solid #e8ecf2;
    box-sizing: border-box;
    top: 0;
    margin-bottom: 0;
    min-height: 0;
}
.communication-execute-skeleton-scope .execute-roi-calculation-skeleton .portlet-body {
    padding: 15px 22px 22px;
    box-sizing: border-box;
}
.communication-execute-skeleton-scope .execute-roi-calculation-skeleton .form-group {
    margin-bottom: 41px;
}
.communication-execute-skeleton-scope .execute-roi-calculation-skeleton .form-group.mb0 {
    margin-bottom: 0;
}
.communication-execute-skeleton-scope .execute-roi-calculation-skeleton .execute-roi-label-col,
.communication-execute-skeleton-scope .execute-roi-calculation-skeleton .execute-roi-field-col {
    display: flex;
    flex-direction: column;
    justify-content: center;
    min-height: 24px;
}
.communication-execute-skeleton-scope .execute-roi-calculation-skeleton .execute-roi-label-col .skeleton-shimmer,
.communication-execute-skeleton-scope .execute-roi-calculation-skeleton .execute-roi-field-col > .skeleton-shimmer:first-child {
    height: 24px !important;
    min-height: 24px;
}
.communication-execute-skeleton-scope .execute-roi-footer-buttons-holder {
    display: flex;
    justify-content: flex-end;
    gap: 15px;
    margin-top: 21px;
    padding: 0;
    border-top: none;
    box-sizing: border-box;
}
.communication-execute-skeleton-scope .execute-roi-footer-skeleton .skeleton-shimmer:last-child {
    background-color: #d4dce8 !important;
}
`;
