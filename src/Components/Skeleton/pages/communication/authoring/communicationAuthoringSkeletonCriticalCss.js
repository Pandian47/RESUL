/** Communication authoring (Create / Email channel) — matches Create + Mail layout. */
export const communicationAuthoringSkeletonCriticalCss = `
.communication-authoring-skeleton-scope {
    width: 100%;
    box-sizing: border-box;
}
.authoring-channel-edit-skeleton-host {
    width: 100%;
    position: relative;
    display: block;
    box-sizing: border-box;
    margin: 0;
    padding: 0;
    float: none;
    clear: none;
}
.communication-authoring-skeleton-scope.communication-authoring-channel-edit-skeleton {
    width: 100%;
    min-height: 0;
    margin: 0;
    padding: 0;
    background: transparent;
}
.communication-authoring-skeleton-scope.communication-authoring-channel-edit-skeleton .authoring-form-skeleton.box-design {
    width: 100%;
    float: none;
    clear: both;
    margin-top: 0;
    min-height: 0;
}
.communication-authoring-skeleton-scope.communication-authoring-channel-edit-skeleton .authoring-form-skeleton-shell--compact {
    min-height: 0;
    display: block;
}
.communication-authoring-skeleton-scope.communication-authoring-channel-edit-skeleton .authoring-form-skeleton-shell--compact .authoring-footer-skeleton.buttons-holder {
    margin-top: 24px;
    padding-top: 0;
}
.communication-authoring-skeleton-scope.communication-authoring-channel-edit-skeleton .authoring-form-skeleton-shell--mdc-inner .form-group {
    margin-bottom: 41px;
}
.communication-authoring-skeleton-scope.communication-authoring-channel-edit-skeleton .authoring-form-skeleton-shell--email-compact .authoring-footer-skeleton.buttons-holder,
.communication-authoring-skeleton-scope.communication-authoring-channel-edit-skeleton .authoring-form-skeleton-shell--mdc-inner .authoring-footer-skeleton.buttons-holder {
    justify-content: flex-start;
    margin-top: 24px;
    padding-top: 0;
}
.communication-authoring-skeleton-scope.communication-authoring-channel-edit-skeleton .authoring-form-skeleton-shell--email-compact .form-group,
.communication-authoring-skeleton-scope.communication-authoring-channel-edit-skeleton .authoring-form-skeleton-shell--form-basic .form-group {
    margin-bottom: 41px;
}
.communication-authoring-skeleton-scope.communication-authoring-channel-edit-skeleton .authoring-form-skeleton__preview-row {
    display: flex;
    gap: 20px;
    margin-top: 8px;
    margin-bottom: 24px;
}
.communication-authoring-skeleton-scope.communication-authoring-channel-edit-skeleton .authoring-form-skeleton__editor {
    flex: 1;
    min-width: 0;
    min-height: 280px;
}
.communication-authoring-skeleton-scope.communication-authoring-channel-edit-skeleton .authoring-form-skeleton__phone,
.communication-authoring-skeleton-scope.communication-authoring-channel-edit-skeleton .authoring-form-skeleton__preview--phone {
    width: 220px;
    flex-shrink: 0;
    min-height: 380px;
    border-radius: 24px;
}
.communication-authoring-skeleton-scope.communication-authoring-channel-edit-skeleton .authoring-form-skeleton__preview--browser {
    width: 260px;
    flex-shrink: 0;
    min-height: 300px;
    border-radius: 8px;
}
.communication-authoring-skeleton-scope.communication-authoring-channel-edit-skeleton .authoring-form-skeleton__preview--social {
    width: 300px;
    flex-shrink: 0;
    min-height: 340px;
    border-radius: 8px;
}
.communication-authoring-skeleton-scope.communication-authoring-channel-edit-skeleton .authoring-form-skeleton__tab-strip {
    display: flex;
    gap: 12px;
    margin-bottom: 20px;
    flex-wrap: wrap;
}
.communication-authoring-skeleton-scope.communication-authoring-channel-edit-skeleton .authoring-form-skeleton__tab-strip--icon .authoring-form-skeleton__tab-strip-item {
    width: 44px;
    height: 44px;
    border-radius: 6px;
}
.communication-authoring-skeleton-scope.communication-authoring-channel-edit-skeleton .authoring-form-skeleton__tab-strip--sm .authoring-form-skeleton__tab-strip-item {
    width: 72px;
    height: 28px;
    border-radius: 4px;
}
.communication-authoring-skeleton-scope.communication-authoring-channel-edit-skeleton .authoring-form-skeleton__tab-strip--lg .authoring-form-skeleton__tab-strip-item,
.communication-authoring-skeleton-scope.communication-authoring-channel-edit-skeleton .authoring-form-skeleton__tab-strip--md .authoring-form-skeleton__tab-strip-item {
    flex: 1;
    min-width: 80px;
    height: 32px;
    border-radius: 4px;
    max-width: 140px;
}
.communication-authoring-skeleton-scope.communication-authoring-channel-edit-skeleton .authoring-form-skeleton__card-row {
    display: flex;
    gap: 16px;
    margin-bottom: 20px;
}
.communication-authoring-skeleton-scope.communication-authoring-channel-edit-skeleton .authoring-form-skeleton__choice-card {
    flex: 1;
    min-height: 72px;
    border-radius: 6px;
    max-width: 200px;
}
.communication-authoring-skeleton-scope.communication-authoring-channel-edit-skeleton .authoring-form-skeleton__smartlink-box {
    margin-top: 8px;
    margin-bottom: 24px;
    padding: 16px 20px;
    background: #eef5fc;
    border: 1px solid #d4e4f4;
    border-radius: 6px;
    box-sizing: border-box;
}
.communication-authoring-skeleton-scope.communication-authoring-channel-edit-skeleton .authoring-form-skeleton__smartlink-row {
    width: 100%;
    height: 40px;
    border-radius: 4px;
}
.communication-authoring-skeleton-scope.communication-authoring-channel-edit-skeleton .authoring-form-skeleton-shell--ads-compact .form-group {
    margin-bottom: 12px;
}
.communication-authoring-skeleton-scope.communication-authoring-channel-edit-skeleton .authoring-form-skeleton-shell--ads-compact .form-group.mt20 {
    margin-top: 20px;
}
.communication-authoring-skeleton-scope.communication-authoring-channel-edit-skeleton .authoring-form-skeleton__ads-name-icons {
    align-items: center;
    gap: 8px;
    min-height: 28px;
}
.communication-authoring-skeleton-scope.communication-authoring-channel-edit-skeleton .authoring-form-skeleton__ads-smartlink-wrap {
    margin-top: 8px;
    margin-bottom: 24px;
}
.communication-authoring-skeleton-scope.communication-authoring-channel-edit-skeleton .authoring-form-skeleton__ads-smartlink-heading {
    text-align: center;
    margin-bottom: 4px;
}
.communication-authoring-skeleton-scope.communication-authoring-channel-edit-skeleton .authoring-form-skeleton__ads-smartlink-heading .skeleton-shimmer {
    display: block;
}
.communication-authoring-skeleton-scope.communication-authoring-channel-edit-skeleton .authoring-form-skeleton__ads-smartlink-link-row {
    margin-top: 4px;
    padding: 10px 12px;
    background: #fff;
    border-radius: 4px;
}
.communication-authoring-skeleton-scope.communication-authoring-channel-edit-skeleton .authoring-form-skeleton-shell--ads-compact .authoring-footer-skeleton.buttons-holder {
    justify-content: flex-end;
    margin-top: 24px;
    padding-top: 0;
}
.communication-authoring-skeleton-scope.communication-authoring-channel-edit-skeleton .authoring-form-skeleton__schedule-strip {
    margin-top: 8px;
    margin-bottom: 8px;
    padding: 16px 12px 4px;
    border-radius: 4px;
    box-sizing: border-box;
}
.communication-authoring-skeleton-scope.communication-authoring-channel-edit-skeleton .authoring-form-skeleton-shell--footer-start .authoring-footer-skeleton.buttons-holder {
    justify-content: flex-start;
}
.communication-authoring-skeleton-scope.communication-authoring-channel-edit-skeleton .authoring-form-skeleton-shell--messaging-preview .form-group,
.communication-authoring-skeleton-scope.communication-authoring-channel-edit-skeleton .authoring-form-skeleton-shell--messaging-preview .authoring-form-skeleton__messaging-subfield {
    margin-bottom: 12px;
}
.communication-authoring-skeleton-scope.communication-authoring-channel-edit-skeleton .authoring-form-skeleton-shell--messaging-preview .form-group.mt20 {
    margin-top: 20px;
}
.communication-authoring-skeleton-scope.communication-authoring-channel-edit-skeleton .authoring-form-skeleton__messaging-editor-group {
    margin-bottom: 24px;
}
.communication-authoring-skeleton-scope.communication-authoring-channel-edit-skeleton .authoring-form-skeleton__messaging-editor-group .authoring-form-skeleton__editor {
    width: 100%;
    min-height: 280px;
    border-radius: 4px;
}
.communication-authoring-skeleton-scope.communication-authoring-channel-edit-skeleton .authoring-form-skeleton__messaging-editor-group .authoring-form-skeleton__preview--phone {
    width: 100%;
    min-height: 380px;
    border-radius: 24px;
}
.communication-authoring-skeleton-scope.communication-authoring-channel-edit-skeleton .authoring-form-skeleton-shell--messaging-preview .authoring-footer-skeleton.buttons-holder {
    justify-content: flex-end;
}
.communication-authoring-skeleton-scope.communication-authoring-channel-edit-skeleton .authoring-form-skeleton-shell--rcs-preview .form-group,
.communication-authoring-skeleton-scope.communication-authoring-channel-edit-skeleton .authoring-form-skeleton-shell--notification-preview .form-group,
.communication-authoring-skeleton-scope.communication-authoring-channel-edit-skeleton .authoring-form-skeleton-shell--vms-tabs .form-group,
.communication-authoring-skeleton-scope.communication-authoring-channel-edit-skeleton .authoring-form-skeleton-shell--voice-basic .form-group,
.communication-authoring-skeleton-scope.communication-authoring-channel-edit-skeleton .authoring-form-skeleton-shell--social-preview .form-group {
    margin-bottom: 41px;
}
.communication-authoring-skeleton-scope.communication-authoring-channel-edit-skeleton .authoring-form-skeleton__preview-row--notification {
    justify-content: flex-end;
}
.communication-authoring-skeleton-scope.communication-authoring-channel-edit-skeleton .authoring-form-skeleton__notification-preview {
    width: 280px;
    min-height: 320px;
    flex-shrink: 0;
    border-radius: 8px;
}
.communication-authoring-skeleton-scope.communication-authoring-channel-edit-skeleton .authoring-footer-skeleton.buttons-holder {
    margin-top: 24px;
}
.communication-authoring-skeleton-scope.communication-authoring-channel-edit-skeleton .authoring-form-skeleton-shell--full {
    min-height: 360px;
    display: block;
}
.communication-authoring-skeleton-scope.communication-authoring-channel-edit-skeleton .authoring-form-skeleton-shell--full .authoring-footer-skeleton.buttons-holder {
    margin-top: 24px;
}
.communication-authoring-skeleton-scope.communication-authoring-inline-channel-skeleton {
    width: 100%;
    min-width: 0;
    padding-top: 0;
    min-height: 0;
    background: transparent;
}
.communication-authoring-skeleton-scope.page-content-holder,
.communication-authoring-skeleton-scope.communication-authoring-suspense-fallback {
    padding-top: 78px;
    margin: 0;
    width: 100%;
    max-width: 100%;
    min-height: 100vh;
    box-sizing: border-box;
    background-color: #f5f7fc;
}
.communication-authoring-skeleton-scope .ca-page-skeleton__inner,
.communication-authoring-skeleton-scope .authoring-page-body {
    display: block;
    width: 100%;
    max-width: 1260px;
    min-height: calc(100vh - 200px);
    margin-top: 0;
    margin-bottom: 0;
    margin-left: auto;
    margin-right: auto;
    padding-top: 0;
    padding-bottom: 24px;
    padding-left: 0;
    padding-right: 0;
    box-sizing: border-box;
}
.communication-authoring-skeleton-scope .main-heading-wrapper.container-fluid {
    margin-bottom: 0;
    background-color: #f5f7fc;
    box-sizing: border-box;
}
.communication-authoring-skeleton-scope .ca-page-skeleton__tabs-wrapper {
    width: 100%;
    margin-top: 0;
    margin-bottom: 0;
    margin-left: 0;
    margin-right: 0;
    padding: 0;
    box-sizing: border-box;
}
.communication-authoring-skeleton-scope .ca-page-skeleton__plan,
.communication-authoring-skeleton-scope .ca-page-skeleton__plan--channel-tabs {
    width: 100%;
    margin-top: 0;
    margin-bottom: 0;
    margin-left: 0;
    margin-right: 0;
    padding-top: 0;
    padding-bottom: 0;
    padding-left: 0;
    padding-right: 0;
    box-sizing: border-box;
}
.communication-authoring-skeleton-scope .ca-page-skeleton__fluid {
    width: 100%;
    max-width: 1260px;
    margin-top: 0;
    margin-bottom: 0;
    margin-left: auto;
    margin-right: auto;
    padding-left: 12px;
    padding-right: 12px;
    box-sizing: border-box;
}
.communication-authoring-skeleton-scope .ca-page-skeleton__content {
    width: 100%;
    margin-top: 0;
    margin-bottom: 0;
    margin-left: 0;
    margin-right: 0;
    padding-top: 0;
    padding-bottom: 0;
    padding-left: 0;
    padding-right: 0;
    box-sizing: border-box;
}
.communication-authoring-skeleton-scope .ca-page-skeleton__route-body {
    width: 100%;
    margin-top: 0;
    margin-bottom: 0;
    margin-left: 0;
    margin-right: 0;
    padding: 0;
    box-sizing: border-box;
}
.communication-authoring-skeleton-scope .ca-skeleton-shimmer--block {
    display: block;
    box-sizing: border-box;
}
.communication-authoring-skeleton-scope .authoring-campaign-info-skeleton .skeleton-shimmer,
.communication-authoring-skeleton-scope .authoring-vertical-tabs-skeleton .skeleton-shimmer,
.communication-authoring-skeleton-scope .cc-plan-steps-skeleton .skeleton-shimmer,
.communication-authoring-skeleton-scope .plan-progress-steps-skeleton .skeleton-shimmer {
    background-color: #e2e7ee;
    border-radius: 4px;
}
/* Plan / Create / Execute stepper — same as communication creation planning page */
.communication-authoring-skeleton-scope .cc-plan-steps-skeleton__list,
.communication-authoring-skeleton-scope .plan-progress-steps-skeleton__list {
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
.communication-authoring-skeleton-scope .cc-plan-steps-skeleton__item,
.communication-authoring-skeleton-scope .plan-progress-steps-skeleton__list .plan-progress-steps-skeleton__item {
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
.communication-authoring-skeleton-scope .cc-plan-steps-skeleton__item::before,
.communication-authoring-skeleton-scope .plan-progress-steps-skeleton__list .plan-progress-steps-skeleton__item::before {
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
.communication-authoring-skeleton-scope .cc-plan-steps-skeleton__item:last-child::before,
.communication-authoring-skeleton-scope .plan-progress-steps-skeleton__list .plan-progress-steps-skeleton__item:last-child::before {
    content: inherit;
}
.communication-authoring-skeleton-scope .cc-plan-steps-skeleton__step,
.communication-authoring-skeleton-scope .plan-progress-steps-skeleton__step {
    display: inline-block;
    position: relative;
    z-index: 2;
    margin-top: 0;
    margin-bottom: 5px;
    margin-left: auto;
    margin-right: auto;
    box-sizing: border-box;
}
.communication-authoring-skeleton-scope .cc-plan-steps-skeleton__title,
.communication-authoring-skeleton-scope .plan-progress-steps-skeleton__title {
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
.communication-authoring-skeleton-scope .ca-skeleton-shimmer--text,
.communication-authoring-skeleton-scope .authoring-campaign-info-skeleton__label,
.communication-authoring-skeleton-scope .authoring-campaign-info-skeleton__value,
.communication-authoring-skeleton-scope .authoring-vertical-tabs-skeleton__label {
    height: 15px;
    min-height: 15px;
    max-height: 15px;
}
.communication-authoring-skeleton-scope .authoring-campaign-info-skeleton {
    display: flex;
    margin-top: 0;
    margin-bottom: 21px;
    margin-left: 0;
    margin-right: 0;
    padding-top: 10px;
    padding-bottom: 10px;
    padding-left: 10px;
    padding-right: 10px;
    background: #fff;
    border: 1px solid #c2cfe3;
    border-radius: var(--globalBorderRadius, 5px);
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.08);
    box-sizing: border-box;
}
.communication-authoring-skeleton-scope .authoring-campaign-info-skeleton__label {
    width: 48px;
    margin-top: 0;
    margin-bottom: 5px;
    margin-left: 0;
    margin-right: 0;
}
.communication-authoring-skeleton-scope .authoring-campaign-info-skeleton__value {
    width: 85%;
    margin-top: 0;
    margin-bottom: 0;
    margin-left: 0;
    margin-right: 0;
}
.communication-authoring-skeleton-scope .authoring-campaign-info-skeleton__action {
    width: 36px;
    height: 36px;
    margin-top: 0;
    margin-bottom: 0;
    margin-left: 0;
    margin-right: 0;
    border-radius: 50% !important;
}
.communication-authoring-skeleton-scope .authoring-campaign-info-skeleton__row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    gap: 12px;
}
.communication-authoring-skeleton-scope .authoring-campaign-info-skeleton__cols {
    display: flex;
    flex: 1;
    gap: 16px;
    min-width: 0;
}
.communication-authoring-skeleton-scope .authoring-campaign-info-skeleton__col {
    flex: 1;
    min-width: 0;
}
.communication-authoring-skeleton-scope .authoring-campaign-info-skeleton__actions {
    display: flex;
    gap: 8px;
    flex-shrink: 0;
}
.communication-authoring-skeleton-scope .authoring-vertical-tabs-skeleton {
    display: flex;
    flex-direction: row;
    align-items: flex-start;
    position: relative;
    width: 100%;
    min-width: 0;
    margin-top: 0;
    margin-bottom: 0;
    margin-left: 0;
    margin-right: 0;
    padding: 0;
    box-sizing: border-box;
}
.communication-authoring-skeleton-scope .authoring-vertical-tabs-skeleton__list {
    flex: 0 0 150px;
    width: 150px;
    display: flex;
    flex-direction: column;
    float: none;
    margin-bottom: 0;
    margin-top:80px;
    margin-left: 0;
    margin-right: 10px;
    padding-top: 5px;
    padding-bottom: 5px;
    padding-left: 5px;
    padding-right: 5px;
    list-style: none;
    background: #fff;
    border: 1px solid #c2cfe3;
    border-radius: var(--globalBorderRadius, 5px);
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.08);
    box-sizing: border-box;
}
.communication-authoring-skeleton-scope .authoring-vertical-tabs-skeleton__tab {
    height: 115px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 10px 8px;
    border-bottom: 1px solid #e9e9e9;
    background: #fff !important;
    box-sizing: border-box;
    position: relative;
}
.communication-authoring-skeleton-scope .authoring-vertical-tabs-skeleton__tab:last-child {
    border-bottom: none;
}
.communication-authoring-skeleton-scope .authoring-vertical-tabs-skeleton__icon {
    width: 32px;
    height: 32px;
    margin-top: 0;
    margin-bottom: 8px;
    margin-left: auto;
    margin-right: auto;
    border-radius: 50% !important;
}
.communication-authoring-skeleton-scope .authoring-vertical-tabs-skeleton__label {
    width:70px;
    margin-top: 0;
    margin-bottom: 0;
    margin-left: auto;
    margin-right: auto;
    padding: 0;
}
.communication-authoring-skeleton-scope .authoring-channel-fields-skeleton {
    flex: 1 1 auto;
    min-width: 0;
    width: auto;
    float: none;
    box-sizing: border-box;
}
/* Horizontal icon sub-tabs — compact height, vertical dividers between tabs */
.communication-authoring-skeleton-scope .authoring-form-skeleton__mail-sub-tabs {
    display: flex;
    flex-wrap: nowrap;
    width: 100%;
    margin: 0;
    padding: 0;
    list-style: none;
    float: left;
    clear: both;
    box-sizing: border-box;
    gap:5px;
}
.communication-authoring-skeleton-scope .authoring-form-skeleton__mail-sub-tab-item {
    height:78px !important;
    flex: 0 0 auto;
    min-width: 96px;
    height: 68px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 6px 12px;
    margin: 0;
    border-bottom: 0 !important;
    border: 1px solid #e9e9e9;
    background: #fff !important;
    box-sizing: border-box;
    border-top-left-radius: 10px;
    border-top-right-radius: 10px;
}
.communication-authoring-skeleton-scope .authoring-form-skeleton__mail-sub-tab-item:last-child {
    border-right: none;
}
.communication-authoring-skeleton-scope .authoring-form-skeleton__mail-sub-tab-item--active {
    background-color: #eef2f7 !important;
}
.communication-authoring-skeleton-scope .authoring-form-skeleton__mail-sub-tab-icon {
    width: 32px;
    height: 32px;
    margin-bottom: 4px;
    border-radius: 50% !important;
}
.communication-authoring-skeleton-scope .authoring-form-skeleton__mail-sub-tab-label {
    width: 70px;
    height: 24px;
    margin: 0 auto;
}
.communication-authoring-skeleton-scope .authoring-form-skeleton__mail-sub-tabs + .authoring-form-skeleton-shell {
    clear: both;
    width: 100%;
}
.communication-authoring-skeleton-scope .authoring-form-skeleton__mail-sub-tab-item::after {
    display: none !important;
    content: none !important;
}
/* Form shell — portlet + footer outside (matches live Create tabs) */
.communication-authoring-skeleton-scope .authoring-form-skeleton-shell {
    width: 100%;
    box-sizing: border-box;
}
.communication-authoring-skeleton-scope .authoring-form-skeleton-shell .authoring-footer-skeleton.buttons-holder {
    margin-top: 24px;
    padding-top: 0;
}
.communication-authoring-skeleton-scope .authoring-form-skeleton-shell--footer-start .authoring-footer-skeleton.buttons-holder {
    justify-content: flex-start;
}
/* Form rows — label left / field right (always on; before app.scss) */
.communication-authoring-skeleton-scope .authoring-form-skeleton .form-group > .row,
.communication-authoring-skeleton-scope .authoring-form-row-skeleton > .row {
    display: flex;
    flex-wrap: nowrap;
    align-items: center;
    margin-right: -12px;
    margin-left: -12px;
    box-sizing: border-box;
}
.communication-authoring-skeleton-scope .authoring-form-skeleton .form-group > .row.align-items-start,
.communication-authoring-skeleton-scope .authoring-form-row-skeleton > .row.align-items-start {
    align-items: flex-start;
}
.communication-authoring-skeleton-scope .authoring-form-skeleton .row > [class*='col-'] {
    position: relative;
    flex: 0 0 auto;
    padding-right: 12px;
    padding-left: 12px;
    box-sizing: border-box;
}
.communication-authoring-skeleton-scope .authoring-form-skeleton .col-sm-1 { width: 8.33333333%; }
.communication-authoring-skeleton-scope .authoring-form-skeleton .col-sm-2 { width: 16.66666667%; }
.communication-authoring-skeleton-scope .authoring-form-skeleton .col-sm-3 { width: 25%; }
.communication-authoring-skeleton-scope .authoring-form-skeleton .col-sm-4 { width: 33.33333333%; }
.communication-authoring-skeleton-scope .authoring-form-skeleton .col-sm-5 { width: 41.66666667%; }
.communication-authoring-skeleton-scope .authoring-form-skeleton .col-sm-6 { width: 50%; }
.communication-authoring-skeleton-scope .authoring-form-skeleton .col-sm-7 { width: 58.33333333%; }
.communication-authoring-skeleton-scope .authoring-form-skeleton .col-sm-8 { width: 66.66666667%; }
.communication-authoring-skeleton-scope .authoring-form-skeleton .col-sm-9 { width: 75%; }
.communication-authoring-skeleton-scope .authoring-form-skeleton .col-sm-10 { width: 83.33333333%; }
.communication-authoring-skeleton-scope .authoring-form-skeleton .offset-sm-1 { margin-left: 8.33333333%; }
.communication-authoring-skeleton-scope .authoring-form-skeleton .offset-sm-3 { margin-left: 25%; }
.communication-authoring-skeleton-scope .authoring-form-skeleton .col-md-6 { width: 50%; }
.communication-authoring-skeleton-scope .authoring-form-skeleton .text-right {
    text-align: right;
}
.communication-authoring-skeleton-scope .authoring-form-skeleton .g-0 {
    margin-left: 0;
    margin-right: 0;
    flex-wrap: nowrap;
}
.communication-authoring-skeleton-scope .authoring-form-skeleton .g-0 > [class*='col-'] {
    padding-left: 0;
    padding-right: 0;
}
.communication-authoring-skeleton-scope .authoring-form-row-skeleton__label {
    display: block;
    height: 24px;
    border-radius: 4px;
}
.communication-authoring-skeleton-scope .authoring-form-row-skeleton__field {
    display: block;
    height: 24px;
    border-radius: 4px;
}
.communication-authoring-skeleton-scope .authoring-form-row-skeleton__field-hint {
    display: block;
    height: 14px;
    border-radius: 4px;
}
.communication-authoring-skeleton-scope--full .authoring-channel-fields-skeleton {
    min-height: calc(100vh - 320px);
}
.communication-authoring-skeleton-scope .authoring-channel-fields-skeleton .authoring-form-skeleton.box-design {
    width: 100%;
    float: none;
    clear: both;
    margin-top: 0;
    padding: 22px 22px 28px;
    background: #fff;
    border: 1px solid #c2cfe3;
    border-top: 2px solid #c2cfe3 !important;
    border-top-left-radius: 0;
    border-top-right-radius: var(--globalBorderRadius, 5px);
    border-bottom-right-radius: var(--globalBorderRadius, 5px);
    border-bottom-left-radius: var(--globalBorderRadius, 5px);
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.08);
    box-sizing: border-box;
}
.communication-authoring-skeleton-scope .authoring-vertical-tabs-skeleton__tab::after,
.communication-authoring-skeleton-scope .vertical-tabs li.active::after,
.communication-authoring-skeleton-scope .authoring-vertical-tabs-skeleton__list.vertical-tabs li,
.communication-authoring-skeleton-scope .authoring-vertical-tabs-skeleton__list .authoring-vertical-tabs-skeleton__tab.active {
    display: none !important;
    content: none !important;
    border: none !important;
    background-color: #fff !important;
    color: inherit !important;
}
.communication-authoring-skeleton-scope .authoring-form-skeleton.bd-top-border {
    border-top-color: #c2cfe3 !important;
}
.communication-authoring-skeleton-scope .authoring-form-skeleton-shell--full {
    min-height: calc(100vh - 420px);
}
.communication-authoring-skeleton-scope .authoring-form-skeleton .form-group {
    margin-bottom: 41px;
}
.communication-authoring-skeleton-scope .authoring-form-skeleton .skeleton-shimmer {
    background-color: #e2e7ee;
    border-radius: 4px;
}
.communication-authoring-skeleton-scope .authoring-form-skeleton__content-area {
    flex: 1;
    min-height: 220px;
    width: 100%;
    margin-top: 8px;
    background-color: #e2e7ee;
    border-radius: 4px;
}
.communication-authoring-skeleton-scope.communication-authoring-channel-edit-skeleton .authoring-form-skeleton-shell--email-full .form-group {
    margin-bottom: 41px;
}
.communication-authoring-skeleton-scope.communication-authoring-channel-edit-skeleton .authoring-form-skeleton__email-editor-group {
    margin-bottom: 24px;
}
.communication-authoring-skeleton-scope.communication-authoring-channel-edit-skeleton .authoring-form-skeleton__editor--email {
    width: 100%;
    min-height: 300px;
    border-radius: 4px;
}
.communication-authoring-skeleton-scope.communication-authoring-channel-edit-skeleton .authoring-form-skeleton__preview--email-panel {
    width: 100%;
    min-height: 360px;
    border-radius: 12px;
}
.communication-authoring-skeleton-scope.communication-authoring-channel-edit-skeleton .authoring-form-skeleton-shell--email-full .authoring-form-skeleton__schedule-strip {
    margin-bottom: 16px;
}
.communication-authoring-skeleton-scope .authoring-footer-skeleton {
    display: flex;
    flex-wrap: nowrap;
    justify-content: flex-end;
    align-items: center;
    gap: 15px;
    margin-top: 0;
    margin-bottom: 0;
    margin-left: 0;
    margin-right: 0;
    padding-top: 0;
    padding-bottom: 0;
    padding-left: 0;
    padding-right: 0;
    box-sizing: border-box;
}
.communication-authoring-skeleton-scope .authoring-footer-skeleton__btn {
    display: block;
    width: 72px;
    height: 36px;
    min-height: 36px;
    max-height: 36px;
    margin-top: 0;
    margin-bottom: 0;
    margin-left: 0;
    margin-right: 0;
    border-radius: 4px;
    flex-shrink: 0;
    box-sizing: border-box;
}
.communication-authoring-skeleton-scope .authoring-footer-skeleton__btn:first-child {
    width: 88px;
}
.communication-authoring-skeleton-scope .authoring-footer-skeleton__btn--primary {
    width: 80px;
}
.communication-authoring-skeleton-scope .authoring-footer-skeleton__btn--primary.skeleton-shimmer {
    background-color: #d4dce8 !important;
}
.communication-authoring-skeleton-scope--basic .authoring-form-skeleton.box-design {
    min-height: 360px;
}
.communication-authoring-skeleton-scope.communication-authoring-channel-edit-skeleton .authoring-form-skeleton-shell--web-analytics-preview .form-group,
.communication-authoring-skeleton-scope.communication-authoring-channel-edit-skeleton .authoring-form-skeleton-shell--app-analytics-preview .form-group {
    margin-bottom: 12px;
}
.communication-authoring-skeleton-scope.communication-authoring-channel-edit-skeleton .authoring-form-skeleton-shell--web-analytics-preview .form-group.mt20,
.communication-authoring-skeleton-scope.communication-authoring-channel-edit-skeleton .authoring-form-skeleton-shell--app-analytics-preview .form-group.mt20 {
    margin-top: 20px;
}
.communication-authoring-skeleton-scope.communication-authoring-channel-edit-skeleton .authoring-form-skeleton__web-analytics-domain {
    margin-top: 0;
    margin-bottom: 12px;
}
.communication-authoring-skeleton-scope.communication-authoring-channel-edit-skeleton .authoring-form-skeleton__analytics-goal {
    margin-top: 8px;
    margin-bottom: 8px;
}
.communication-authoring-skeleton-scope.communication-authoring-channel-edit-skeleton .authoring-form-skeleton__analytics-goal-option {
    min-height: 22px;
}
.communication-authoring-skeleton-scope.communication-authoring-channel-edit-skeleton .authoring-form-skeleton-shell--web-analytics-preview .authoring-footer-skeleton.buttons-holder,
.communication-authoring-skeleton-scope.communication-authoring-channel-edit-skeleton .authoring-form-skeleton-shell--app-analytics-preview .authoring-footer-skeleton.buttons-holder {
    justify-content: flex-end;
    margin-top: 24px;
    padding-top: 0;
}
.communication-authoring-skeleton-scope.communication-authoring-channel-edit-skeleton .authoring-form-skeleton-shell--qr-preview .form-group {
    margin-bottom: 28px;
}
.communication-authoring-skeleton-scope.communication-authoring-channel-edit-skeleton .authoring-form-skeleton__qr-preview-panel {
    padding: 20px 16px;
    background: #eef5fc;
    border: 1px solid #d4e4f4;
    border-radius: 6px;
    min-height: 360px;
    box-sizing: border-box;
}
.communication-authoring-skeleton-scope.communication-authoring-channel-edit-skeleton .authoring-form-skeleton__qr-code {
    width: 100%;
    aspect-ratio: 1;
    max-width: 220px;
    margin: 0 auto;
    border-radius: 4px;
}
.communication-authoring-skeleton-scope.communication-authoring-channel-edit-skeleton .authoring-form-skeleton__qr-generate-row {
    display: flex;
    justify-content: flex-end;
    margin-top: 8px;
    margin-bottom: 8px;
}
.communication-authoring-skeleton-scope.communication-authoring-channel-edit-skeleton .authoring-form-skeleton__qr-textarea-row .skeleton-shimmer:last-child {
    min-height: 80px;
}
.communication-authoring-skeleton-scope.communication-authoring-channel-edit-skeleton .authoring-form-skeleton__email-content-strip {
    margin-top: 8px;
    padding: 16px 12px;
    border-radius: 4px;
}
.communication-authoring-skeleton-scope.communication-authoring-channel-edit-skeleton .authoring-form-skeleton-shell--social-preview .form-group {
    margin-bottom: 12px;
}
.communication-authoring-skeleton-scope.communication-authoring-channel-edit-skeleton .authoring-form-skeleton-shell--social-preview .form-group.pt20 {
    padding-top: 20px;
}
.communication-authoring-skeleton-scope.communication-authoring-channel-edit-skeleton .authoring-form-skeleton__social-post-type-row {
    display: flex;
    align-items: flex-start;
    gap: 12px;
}
.communication-authoring-skeleton-scope.communication-authoring-channel-edit-skeleton .authoring-form-skeleton__social-post-type-row .authoring-form-skeleton__card-row {
    flex: 1;
    margin-bottom: 0;
    min-width: 0;
}
.communication-authoring-skeleton-scope.communication-authoring-channel-edit-skeleton .authoring-form-skeleton-shell--social-preview .authoring-form-skeleton__choice-card {
    min-height: 100px;
    max-width: none;
    border-radius: 6px;
}
.communication-authoring-skeleton-scope.communication-authoring-channel-edit-skeleton .authoring-form-skeleton__social-post-type-reset {
    margin-top: 36px;
}
.communication-authoring-skeleton-scope.communication-authoring-channel-edit-skeleton .authoring-form-skeleton__social-post-editor-row {
    align-items: flex-start;
}
.communication-authoring-skeleton-scope.communication-authoring-channel-edit-skeleton .authoring-form-skeleton__social-post-editor-row > [class*='col-']:first-child {
    padding-right: 15px;
}
.communication-authoring-skeleton-scope.communication-authoring-channel-edit-skeleton .authoring-form-skeleton__social-post-editor-toolbar {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 10px;
}
.communication-authoring-skeleton-scope.communication-authoring-channel-edit-skeleton .authoring-form-skeleton__social-post-toolbar-icon {
    width: 28px;
    height: 28px;
    border-radius: 4px;
    flex-shrink: 0;
}
.communication-authoring-skeleton-scope.communication-authoring-channel-edit-skeleton .authoring-form-skeleton__editor--social-post {
    width: 100%;
    min-height: 260px;
    border-radius: 4px;
}
.communication-authoring-skeleton-scope.communication-authoring-channel-edit-skeleton .authoring-form-skeleton__social-post-editor-row .authoring-form-skeleton__preview--social {
    width: 100%;
    min-height: 340px;
    border-radius: 8px;
    margin-top: 0;
}
.communication-authoring-skeleton-scope.communication-authoring-channel-edit-skeleton .authoring-form-skeleton__social-post-schedule {
    margin-top: 8px;
    margin-bottom: 8px;
}
.communication-authoring-skeleton-scope.communication-authoring-channel-edit-skeleton .authoring-form-skeleton-shell--social-preview .authoring-footer-skeleton.buttons-holder {
    justify-content: flex-end;
    margin-top: 24px;
    padding-top: 0;
}
.communication-authoring-skeleton-scope.communication-authoring-channel-edit-skeleton .authoring-form-skeleton-shell--email-compact .authoring-form-skeleton__choice-card {
    min-height: 100px;
    max-width: none;
    border-radius: 6px;
}
.communication-authoring-skeleton-scope.communication-authoring-channel-edit-skeleton .authoring-form-skeleton__email-content-group {
    margin-bottom: 8px;
}
.communication-authoring-skeleton-scope.communication-authoring-channel-edit-skeleton .authoring-form-skeleton__editor--email-channel {
    width: 100%;
    min-height: 320px;
    margin-top: 16px;
    border-radius: 4px;
}
.communication-authoring-skeleton-scope.communication-authoring-channel-edit-skeleton .authoring-form-skeleton-shell--email-compact .authoring-footer-skeleton.buttons-holder {
    justify-content: flex-end;
    margin-top: 24px;
    padding-top: 0;
}
.communication-authoring-skeleton-scope.communication-authoring-channel-edit-skeleton .authoring-form-skeleton-shell--whatsapp-preview .form-group,
.communication-authoring-skeleton-scope.communication-authoring-channel-edit-skeleton .authoring-form-skeleton-shell--whatsapp-preview .authoring-form-skeleton__messaging-subfield {
    margin-bottom: 12px;
}
.communication-authoring-skeleton-scope.communication-authoring-channel-edit-skeleton .authoring-form-skeleton-shell--whatsapp-preview .form-group.mt20 {
    margin-top: 20px;
}
.communication-authoring-skeleton-scope.communication-authoring-channel-edit-skeleton .authoring-form-skeleton__whatsapp-preview-label {
    margin-bottom: 8px;
}
.communication-authoring-skeleton-scope.communication-authoring-channel-edit-skeleton .authoring-form-skeleton__whatsapp-editor-group {
    margin-bottom: 24px;
}
.communication-authoring-skeleton-scope.communication-authoring-channel-edit-skeleton .authoring-form-skeleton__whatsapp-editor-toolbar {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 10px;
}
.communication-authoring-skeleton-scope.communication-authoring-channel-edit-skeleton .authoring-form-skeleton__whatsapp-toolbar-icon {
    width: 28px;
    height: 28px;
    border-radius: 4px;
    flex-shrink: 0;
}
.communication-authoring-skeleton-scope.communication-authoring-channel-edit-skeleton .authoring-form-skeleton__editor--whatsapp {
    width: 100%;
    min-height: 280px;
    border-radius: 4px;
}
.communication-authoring-skeleton-scope.communication-authoring-channel-edit-skeleton .authoring-form-skeleton-shell--whatsapp-preview .authoring-form-skeleton__preview--phone {
    width: 100%;
    min-height: 380px;
    border-radius: 24px;
}
.communication-authoring-skeleton-scope.communication-authoring-channel-edit-skeleton .authoring-form-skeleton-shell--whatsapp-preview .authoring-footer-skeleton.buttons-holder {
    justify-content: flex-end;
    margin-top: 24px;
    padding-top: 0;
}
.communication-authoring-skeleton-scope.communication-authoring-channel-edit-skeleton .authoring-form-skeleton-shell--sms-preview .form-group,
.communication-authoring-skeleton-scope.communication-authoring-channel-edit-skeleton .authoring-form-skeleton-shell--sms-preview .authoring-form-skeleton__messaging-subfield {
    margin-bottom: 12px;
}
.communication-authoring-skeleton-scope.communication-authoring-channel-edit-skeleton .authoring-form-skeleton-shell--sms-preview .form-group.mt20 {
    margin-top: 20px;
}
.communication-authoring-skeleton-scope.communication-authoring-channel-edit-skeleton .authoring-form-skeleton__sms-preview-label {
    margin-bottom: 8px;
}
.communication-authoring-skeleton-scope.communication-authoring-channel-edit-skeleton .authoring-form-skeleton__sms-editor-group {
    margin-bottom: 8px;
}
.communication-authoring-skeleton-scope.communication-authoring-channel-edit-skeleton .authoring-form-skeleton__sms-editor-row {
    align-items: flex-start;
}
.communication-authoring-skeleton-scope.communication-authoring-channel-edit-skeleton .authoring-form-skeleton__sms-editor-row > [class*='col-']:first-child {
    padding-right: 15px;
}
.communication-authoring-skeleton-scope.communication-authoring-channel-edit-skeleton .authoring-form-skeleton__sms-editor-toolbar {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 10px;
}
.communication-authoring-skeleton-scope.communication-authoring-channel-edit-skeleton .authoring-form-skeleton__sms-toolbar-icon {
    width: 28px;
    height: 28px;
    border-radius: 4px;
    flex-shrink: 0;
}
.communication-authoring-skeleton-scope.communication-authoring-channel-edit-skeleton .authoring-form-skeleton__editor--sms {
    width: 100%;
    min-height: 280px;
    border-radius: 4px;
}
.communication-authoring-skeleton-scope.communication-authoring-channel-edit-skeleton .authoring-form-skeleton__sms-editor-row .authoring-form-skeleton__preview--phone {
    width: 100%;
    min-height: 380px;
    border-radius: 24px;
    margin-top: 0;
}
.communication-authoring-skeleton-scope.communication-authoring-channel-edit-skeleton .authoring-form-skeleton__sms-bottom-strip {
    margin-top: 8px;
    margin-bottom: 8px;
}
.communication-authoring-skeleton-scope.communication-authoring-channel-edit-skeleton .authoring-form-skeleton-shell--sms-preview .authoring-footer-skeleton.buttons-holder {
    justify-content: flex-end;
    margin-top: 24px;
    padding-top: 0;
}
.communication-authoring-skeleton-scope.communication-authoring-channel-edit-skeleton .authoring-form-skeleton-shell--rcs-preview .form-group,
.communication-authoring-skeleton-scope.communication-authoring-channel-edit-skeleton .authoring-form-skeleton-shell--rcs-preview .authoring-form-skeleton__messaging-subfield {
    margin-bottom: 12px;
}
.communication-authoring-skeleton-scope.communication-authoring-channel-edit-skeleton .authoring-form-skeleton-shell--rcs-preview .form-group.mt20 {
    margin-top: 20px;
}
.communication-authoring-skeleton-scope.communication-authoring-channel-edit-skeleton .authoring-form-skeleton__rcs-split-content {
    margin-bottom: 8px;
}
.communication-authoring-skeleton-scope.communication-authoring-channel-edit-skeleton .authoring-form-skeleton__rcs-preview-label {
    margin-bottom: 0;
}
.communication-authoring-skeleton-scope.communication-authoring-channel-edit-skeleton .authoring-form-skeleton__rcs-editor-row {
    align-items: flex-start;
    margin-bottom: 8px;
}
.communication-authoring-skeleton-scope.communication-authoring-channel-edit-skeleton .authoring-form-skeleton__rcs-editor-row > [class*='col-']:first-child {
    padding-right: 15px;
}
.communication-authoring-skeleton-scope.communication-authoring-channel-edit-skeleton .authoring-form-skeleton__rcs-editor-toolbar {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 10px;
}
.communication-authoring-skeleton-scope.communication-authoring-channel-edit-skeleton .authoring-form-skeleton__rcs-toolbar-icon {
    width: 28px;
    height: 28px;
    border-radius: 4px;
    flex-shrink: 0;
}
.communication-authoring-skeleton-scope.communication-authoring-channel-edit-skeleton .authoring-form-skeleton__editor--rcs {
    width: 100%;
    min-height: 280px;
    border-radius: 4px;
}
.communication-authoring-skeleton-scope.communication-authoring-channel-edit-skeleton .authoring-form-skeleton__rcs-editor-row .authoring-form-skeleton__preview--phone {
    width: 100%;
    min-height: 380px;
    border-radius: 24px;
    margin-top: 0;
}
.communication-authoring-skeleton-scope.communication-authoring-channel-edit-skeleton .authoring-form-skeleton__rcs-interactivity {
    margin-top: 8px;
    margin-bottom: 8px;
}
.communication-authoring-skeleton-scope.communication-authoring-channel-edit-skeleton .authoring-form-skeleton__rcs-interactivity .g-2 {
    --bs-gutter-x: 12px;
}
.communication-authoring-skeleton-scope.communication-authoring-channel-edit-skeleton .authoring-form-skeleton__rcs-bottom-strip {
    margin-top: 8px;
    margin-bottom: 8px;
}
.communication-authoring-skeleton-scope.communication-authoring-channel-edit-skeleton .authoring-form-skeleton-shell--rcs-preview .authoring-footer-skeleton.buttons-holder {
    justify-content: flex-end;
    margin-top: 24px;
    padding-top: 0;
}
.communication-authoring-skeleton-scope.communication-authoring-channel-edit-skeleton .authoring-form-skeleton-shell--web-push-preview .form-group,
.communication-authoring-skeleton-scope.communication-authoring-channel-edit-skeleton .authoring-form-skeleton-shell--web-push-preview .authoring-form-skeleton__messaging-subfield {
    margin-bottom: 12px;
}
.communication-authoring-skeleton-scope.communication-authoring-channel-edit-skeleton .authoring-form-skeleton-shell--web-push-preview .form-group.mt20 {
    margin-top: 20px;
}
.communication-authoring-skeleton-scope.communication-authoring-channel-edit-skeleton .authoring-form-skeleton__web-push-split-content {
    margin-bottom: 8px;
}
.communication-authoring-skeleton-scope.communication-authoring-channel-edit-skeleton .authoring-form-skeleton__web-push-content-tabs .authoring-form-skeleton__tab-strip {
    margin-bottom: 12px;
}
.communication-authoring-skeleton-scope.communication-authoring-channel-edit-skeleton .authoring-form-skeleton__web-push-preview-label {
    margin-bottom: 0;
}
.communication-authoring-skeleton-scope.communication-authoring-channel-edit-skeleton .authoring-form-skeleton__web-push-editor-row {
    align-items: flex-start;
    margin-bottom: 8px;
}
.communication-authoring-skeleton-scope.communication-authoring-channel-edit-skeleton .authoring-form-skeleton__web-push-editor-row > [class*='col-']:first-child {
    padding-right: 15px;
}
.communication-authoring-skeleton-scope.communication-authoring-channel-edit-skeleton .authoring-form-skeleton__editor--web-push {
    width: 100%;
    min-height: 280px;
    border-radius: 4px;
}
.communication-authoring-skeleton-scope.communication-authoring-channel-edit-skeleton .authoring-form-skeleton__web-push-editor-row .authoring-form-skeleton__preview--browser {
    width: 100%;
    min-height: 300px;
    border-radius: 8px;
    margin-top: 0;
}
.communication-authoring-skeleton-scope.communication-authoring-channel-edit-skeleton .authoring-form-skeleton__web-push-expiry,
.communication-authoring-skeleton-scope.communication-authoring-channel-edit-skeleton .authoring-form-skeleton__web-push-hashtag {
    margin-top: 8px;
    margin-bottom: 8px;
}
.communication-authoring-skeleton-scope.communication-authoring-channel-edit-skeleton .authoring-form-skeleton__web-push-tags-input {
    width: 100%;
    min-height: 72px;
    border-radius: 4px;
}
.communication-authoring-skeleton-scope.communication-authoring-channel-edit-skeleton .authoring-form-skeleton__web-push-bottom-strip {
    margin-top: 8px;
    margin-bottom: 8px;
    padding: 16px 12px 4px;
    background: #eef5fc;
    border-radius: 4px;
    box-sizing: border-box;
}
.communication-authoring-skeleton-scope.communication-authoring-channel-edit-skeleton .authoring-form-skeleton-shell--web-push-preview .authoring-footer-skeleton.buttons-holder {
    justify-content: flex-end;
    margin-top: 24px;
    padding-top: 0;
}
.communication-authoring-skeleton-scope.communication-authoring-channel-edit-skeleton .authoring-form-skeleton-shell--mobile-push-preview .form-group,
.communication-authoring-skeleton-scope.communication-authoring-channel-edit-skeleton .authoring-form-skeleton-shell--mobile-push-preview .authoring-form-skeleton__messaging-subfield {
    margin-bottom: 12px;
}
.communication-authoring-skeleton-scope.communication-authoring-channel-edit-skeleton .authoring-form-skeleton-shell--mobile-push-preview .form-group.mt20 {
    margin-top: 20px;
}
.communication-authoring-skeleton-scope.communication-authoring-channel-edit-skeleton .authoring-form-skeleton__mobile-push-split-content {
    margin-bottom: 8px;
}
.communication-authoring-skeleton-scope.communication-authoring-channel-edit-skeleton .authoring-form-skeleton__mobile-push-content-tabs .authoring-form-skeleton__tab-strip {
    margin-bottom: 12px;
}
.communication-authoring-skeleton-scope.communication-authoring-channel-edit-skeleton .authoring-form-skeleton__mobile-push-preview-label {
    margin-bottom: 0;
}
.communication-authoring-skeleton-scope.communication-authoring-channel-edit-skeleton .authoring-form-skeleton__mobile-push-editor-row {
    align-items: flex-start;
    margin-bottom: 8px;
}
.communication-authoring-skeleton-scope.communication-authoring-channel-edit-skeleton .authoring-form-skeleton__mobile-push-editor-row > [class*='col-']:first-child {
    padding-right: 15px;
}
.communication-authoring-skeleton-scope.communication-authoring-channel-edit-skeleton .authoring-form-skeleton__editor--mobile-push {
    width: 100%;
    min-height: 280px;
    border-radius: 4px;
}
.communication-authoring-skeleton-scope.communication-authoring-channel-edit-skeleton .authoring-form-skeleton__mobile-push-editor-row .authoring-form-skeleton__preview--phone {
    width: 100%;
    min-height: 380px;
    border-radius: 24px;
    margin-top: 0;
}
.communication-authoring-skeleton-scope.communication-authoring-channel-edit-skeleton .authoring-form-skeleton__mobile-push-alert-sound,
.communication-authoring-skeleton-scope.communication-authoring-channel-edit-skeleton .authoring-form-skeleton__mobile-push-expiry,
.communication-authoring-skeleton-scope.communication-authoring-channel-edit-skeleton .authoring-form-skeleton__mobile-push-hashtag {
    margin-top: 8px;
    margin-bottom: 8px;
}
.communication-authoring-skeleton-scope.communication-authoring-channel-edit-skeleton .authoring-form-skeleton__mobile-push-tags-input {
    width: 100%;
    min-height: 72px;
    border-radius: 4px;
}
.communication-authoring-skeleton-scope.communication-authoring-channel-edit-skeleton .authoring-form-skeleton__mobile-push-bottom-strip {
    margin-top: 8px;
    margin-bottom: 8px;
    padding: 16px 12px 4px;
    background: #eef5fc;
    border-radius: 4px;
    box-sizing: border-box;
}
.communication-authoring-skeleton-scope.communication-authoring-channel-edit-skeleton .authoring-form-skeleton-shell--mobile-push-preview .authoring-footer-skeleton.buttons-holder {
    justify-content: flex-end;
    margin-top: 24px;
    padding-top: 0;
}
`;
