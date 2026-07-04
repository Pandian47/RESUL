/** Communication creation — matches Planning / RSTabbar / DeliveryMethod (before app.scss). */
export const communicationCreationSkeletonCriticalCss = `
.communication-creation-skeleton-scope .cc-page-skeleton,
.communication-creation-skeleton-scope.cc-page-skeleton {
    width: 100%;
    box-sizing: border-box;
}
.communication-creation-skeleton-scope.page-content-holder,
.communication-creation-skeleton-scope.communication-creation-suspense-fallback {
    padding-top: 78px;
    margin: 0;
    width: 100%;
    max-width: 100%;
    box-sizing: border-box;
    background-color: transparent;
}
.communication-creation-skeleton-scope .page-content,
.communication-creation-skeleton-scope .communication-creation-inline-skeleton,
.communication-creation-skeleton-scope .cc-page-skeleton__inline {
    background-color: transparent;
}
.communication-creation-skeleton-scope .cc-page-skeleton__fluid,
.communication-creation-skeleton-scope .communication-creation-page-fluid {
    width: 100%;
    max-width: 100%;
    margin-top: 0;
    margin-bottom: 0;
    margin-left: auto;
    margin-right: auto;
    padding-left: 12px;
    padding-right: 12px;
    box-sizing: border-box;
}
/* Type selection — matches live .rs-camp-tabs-holder .rs-tabs-closed-wrapper */
.communication-creation-skeleton-scope.page-content-holder:has(.communication-creation-page-fluid--select-type),
.communication-creation-skeleton-scope.communication-creation-suspense-fallback:has(.communication-creation-page-fluid--select-type),
.communication-creation-skeleton-scope.page-layout-skeleton--inline:has(.communication-creation-page-fluid--select-type) {
    overflow: hidden;
}
.communication-creation-skeleton-scope .communication-creation-page-fluid--select-type {
    overflow: hidden;
}
.communication-creation-skeleton-scope .communication-creation-page-fluid--select-type .cc-page-skeleton__content,
.communication-creation-skeleton-scope .communication-creation-page-fluid--select-type .page-content {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: stretch;
    height: calc(100vh - 236px);
    min-height: calc(100vh - 236px);
    max-height: calc(100vh - 236px);
    overflow: hidden;
}
.communication-creation-skeleton-scope .communication-creation-page-fluid--select-type .cc-delivery-type-skeleton__closed,
.communication-creation-skeleton-scope .communication-creation-page-fluid--select-type .delivery-type-select-skeleton .cc-delivery-type-skeleton__closed {
    align-items: center;
    padding-bottom: 0;
}
.communication-creation-skeleton-scope .cc-page-skeleton__content,
.communication-creation-skeleton-scope .page-content {
    width: 100%;
    padding-top: 0;
    padding-bottom: 0;
    padding-left: 0;
    padding-right: 0;
    margin-top: 0;
    margin-bottom: 0;
    margin-left: 0;
    margin-right: 0;
    box-sizing: border-box;
}
.communication-creation-skeleton-scope .cc-page-skeleton__inner,
.communication-creation-skeleton-scope .communication-creation-page-inner {
    display: grid;
    width: 100%;
    max-width: 1260px;
    margin-top: 0;
    margin-bottom: 0;
    margin-left: auto;
    margin-right: auto;
    padding-top: 0;
    padding-bottom: 0;
    padding-left: 0;
    padding-right: 0;
    box-sizing: border-box;
}
.communication-creation-skeleton-scope .cc-page-skeleton__planning,
.communication-creation-skeleton-scope .planning-layout {
    width: 100%;
    margin-top: 0;
    margin-bottom: 0;
    margin-left: 0;
    margin-right: 0;
    padding: 0;
    box-sizing: border-box;
}
.communication-creation-skeleton-scope .cc-page-skeleton__body,
.communication-creation-skeleton-scope .communication-create {
    clear: both;
    width: 100%;
    margin-top: 0;
    margin-bottom: 0;
    margin-left: 0;
    margin-right: 0;
    padding: 0;
    box-sizing: border-box;
}
.communication-creation-skeleton-scope .cc-page-skeleton__route-body {
    width: 100%;
    margin-top: 0;
    margin-bottom: 0;
    margin-left: 0;
    margin-right: 0;
    padding: 0;
    box-sizing: border-box;
}
.communication-creation-skeleton-scope .container {
    max-width: 1260px;
    margin-left: auto;
    margin-right: auto;
}
.communication-creation-skeleton-scope .main-heading-wrapper.container-fluid {
    margin-bottom: 0;
    background-color: transparent;
    box-sizing: border-box;
}
.communication-creation-skeleton-scope .communication-creation-page-header-skeleton .heading-title-text h1 {
    margin: 0;
    font-size: 32px;
    font-weight: 500;
    line-height: 1.2;
    color: #0000ff;
    font-family: MuktaMedium, sans-serif;
}
.communication-creation-skeleton-scope .communication-creation-page-header-skeleton {
    margin-top: 0;
    margin-bottom: 0;
    margin-left: 0;
    margin-right: 0;
}
/* Plan / Create / Execute stepper */
.communication-creation-skeleton-scope .cc-plan-steps-skeleton__list,
.communication-creation-skeleton-scope .plan-progress-steps-skeleton__list {
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
.communication-creation-skeleton-scope .cc-plan-steps-skeleton__item,
.communication-creation-skeleton-scope .plan-progress-steps-skeleton__list .plan-progress-steps-skeleton__item {
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
.communication-creation-skeleton-scope .cc-plan-steps-skeleton__item::before,
.communication-creation-skeleton-scope .plan-progress-steps-skeleton__list .plan-progress-steps-skeleton__item::before {
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
    padding: 0px 10px
}
.communication-creation-skeleton-scope .cc-plan-steps-skeleton__item:last-child::before,
.communication-creation-skeleton-scope .plan-progress-steps-skeleton__list .plan-progress-steps-skeleton__item:last-child::before {
    content: inherit;
}
.communication-creation-skeleton-scope .cc-plan-steps-skeleton__step,
.communication-creation-skeleton-scope .plan-progress-steps-skeleton__step {
    display: inline-block;
    position: relative;
    z-index: 2;
    margin-top: 0;
    margin-bottom: 5px;
    margin-left: auto;
    margin-right: auto;
    box-sizing: border-box;
}
.communication-creation-skeleton-scope .cc-plan-steps-skeleton__title,
.communication-creation-skeleton-scope .plan-progress-steps-skeleton__title {
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
/* Delivery method — RSTabbar opened layout (skeleton-only classes; no live tab utilities) */
.communication-creation-skeleton-scope .cc-delivery-skeleton,
.communication-creation-skeleton-scope .communication-creation-delivery-skeleton {
    width: 100%;
    box-sizing: border-box;
}
.communication-creation-skeleton-scope .cc-delivery-skeleton__opened,
.communication-creation-skeleton-scope .communication-creation-delivery-skeleton .cc-delivery-skeleton__opened {
    width: 100%;
    box-sizing: border-box;
}
.communication-creation-skeleton-scope .cc-delivery-skeleton__header,
.communication-creation-skeleton-scope .communication-creation-delivery-skeleton .cc-delivery-skeleton__header {
    display: flex;
    flex-wrap: nowrap;
    align-items: flex-end;
    width: 100%;
    margin-left: 0;
    margin-right: 0;
    box-sizing: border-box;
}
.communication-creation-skeleton-scope .cc-delivery-skeleton__label-col,
.communication-creation-skeleton-scope .communication-creation-delivery-skeleton .cc-delivery-skeleton__label-col {
    flex: 0 0 25%;
    max-width: 25%;
    padding-right: 0;
    margin-bottom: 21px;
    box-sizing: border-box;
}
.communication-creation-skeleton-scope .cc-delivery-skeleton__label-wrap,
.communication-creation-skeleton-scope .communication-creation-delivery-skeleton .cc-delivery-skeleton__label-wrap {
    margin-top: 10px;
    margin-bottom: 0;
    box-sizing: border-box;
}
.communication-creation-skeleton-scope .cc-delivery-skeleton__section-label,
.communication-creation-skeleton-scope .communication-creation-delivery-skeleton .cc-delivery-skeleton__section-label {
    display: block;
    height: 24px;
    margin-top: 0;
    margin-bottom: 0;
    margin-left: 0;
    margin-right: 0;
}
.communication-creation-skeleton-scope .cc-delivery-skeleton__tab-list,
.communication-creation-skeleton-scope .communication-creation-delivery-skeleton .delivery-method-tabs-skeleton__tab-list {
    display: flex;
    flex-wrap: nowrap;
    justify-content: start;
    align-items: flex-end;
    flex: 0 0 75%;
    max-width: 75%;
    width: 100%;
    margin-top: 0;
    margin-bottom: 0;
    margin-left: 0;
    margin-right: 0;
    padding: 0;
    list-style: none;
    box-sizing: border-box;
}
.communication-creation-skeleton-scope .cc-delivery-skeleton__tab,
.communication-creation-skeleton-scope .communication-creation-delivery-skeleton .delivery-method-tabs-skeleton__tab {
    flex: 0 0 auto;
    width: calc((100% - 20px) / 3);
    max-width: 220px;
    min-width: 0;
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    text-align: center;
    min-height: 0;
    height: auto;
    padding: 10px 14px;
    margin-top: 0;
    margin-bottom: 0;
    margin-left: 0;
    margin-right: 10px;
    border: 1px solid #c2cfe3;
    border-bottom: 0;
    border-top-left-radius: 15px;
    border-top-right-radius: 15px;
    background: #ffffff !important;
    box-sizing: border-box;
    pointer-events: none;
}
.communication-creation-skeleton-scope .cc-delivery-skeleton__tab--first,
.communication-creation-skeleton-scope .communication-creation-delivery-skeleton .cc-delivery-skeleton__tab--first {
    margin-left: 0;
}
.communication-creation-skeleton-scope .cc-delivery-skeleton__tab:last-child,
.communication-creation-skeleton-scope .communication-creation-delivery-skeleton .delivery-method-tabs-skeleton__tab:last-child {
    margin-right: 0;
}
.communication-creation-skeleton-scope .cc-delivery-skeleton__tab-inner,
.communication-creation-skeleton-scope .communication-creation-delivery-skeleton .cc-delivery-skeleton__tab-inner {
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 100%;
    box-sizing: border-box;
}
.communication-creation-skeleton-scope .cc-delivery-skeleton__tab-icon,
.communication-creation-skeleton-scope .communication-creation-delivery-skeleton .delivery-method-tabs-skeleton__icon-shimmer {
    margin-left: auto;
    margin-right: auto;
}
.communication-creation-skeleton-scope .cc-delivery-skeleton__tab-label-wrap,
.communication-creation-skeleton-scope .communication-creation-delivery-skeleton .cc-delivery-skeleton__tab-label-wrap {
    display: block;
    width: 100%;
    box-sizing: border-box;
}
.communication-creation-skeleton-scope .cc-delivery-skeleton__tab-label,
.communication-creation-skeleton-scope .communication-creation-delivery-skeleton .delivery-method-tabs-skeleton__label-shimmer {
    display: block;
    margin-top: 0;
    margin-bottom: 0;
    margin-left: auto;
    margin-right: auto;
}
/* Delivery method form panel */
.communication-creation-skeleton-scope .dm-skeleton,
.communication-creation-skeleton-scope .delivery-method-skeleton {
    width: 100%;
    margin-top: 0;
    margin-bottom: 0;
    margin-left: 0;
    margin-right: 0;
    padding: 0;
    box-sizing: border-box;
}
.communication-creation-skeleton-scope .cc-delivery-skeleton__opened > .dm-skeleton,
.communication-creation-skeleton-scope .cc-delivery-skeleton__opened > .delivery-method-skeleton,
.communication-creation-skeleton-scope .communication-creation-delivery-skeleton .cc-delivery-skeleton__opened > .delivery-method-skeleton {
    width: 100%;
    margin-top: 0;
    margin-bottom: 0;
    clear: both;
    box-sizing: border-box;
}
.communication-creation-skeleton-scope .dm-skeleton__panel,
.communication-creation-skeleton-scope .delivery-method-skeleton__panel {
    width: 100%;
    margin-top: 0;
    margin-bottom: 0;
    margin-left: 0;
    margin-right: 0;
    padding-top: 19px;
    padding-bottom: 19px;
    padding-left: 19px;
    padding-right: 19px;
    background: #ffffff;
    border: 1px solid #c2cfe3;
    border-top-left-radius: 0;
    border-top-right-radius: 0;
    border-bottom-left-radius: var(--globalBorderRadius, 5px);
    border-bottom-right-radius: var(--globalBorderRadius, 5px);
    box-shadow: none;
    box-sizing: border-box;
    position: relative;
    z-index: 1;
}
.communication-creation-skeleton-scope .dm-skeleton__row,
.communication-creation-skeleton-scope .delivery-method-skeleton__row {
    display: flex;
    flex-wrap: nowrap;
    align-items: center;
    width: 100%;
    margin-top: 0;
    margin-bottom: 41px;
    margin-left: 0;
    margin-right: 0;
    padding: 0;
    box-sizing: border-box;
}
.communication-creation-skeleton-scope .dm-skeleton__row--align-top,
.communication-creation-skeleton-scope .delivery-method-skeleton__row.dm-skeleton__row--align-top {
    align-items: flex-start;
}
.communication-creation-skeleton-scope .dm-skeleton__row--align-top .dm-skeleton__label-col,
.communication-creation-skeleton-scope .delivery-method-skeleton__row.dm-skeleton__row--align-top .delivery-method-skeleton__label-col {
    padding-top: 4px;
}
.communication-creation-skeleton-scope .dm-skeleton__row--with-checkbox,
.communication-creation-skeleton-scope .delivery-method-skeleton__row.dm-skeleton__row--with-checkbox {
    min-height: 58px;
}
.communication-creation-skeleton-scope .dm-skeleton__row--mt50,
.communication-creation-skeleton-scope .delivery-method-skeleton__row.dm-skeleton__row--mt50 {
    margin-top: 50px;
    margin-bottom: 41px;
}
.communication-creation-skeleton-scope .dm-skeleton__row--mt20,
.communication-creation-skeleton-scope .delivery-method-skeleton__row.dm-skeleton__row--mt20 {
    margin-top: 25px;
}
.communication-creation-skeleton-scope .dm-skeleton__row:last-child,
.communication-creation-skeleton-scope .delivery-method-skeleton__panel > .dm-skeleton__row:last-child,
.communication-creation-skeleton-scope .delivery-method-skeleton__panel > .delivery-method-skeleton__row:last-child {
    margin-bottom: 0;
}
.communication-creation-skeleton-scope .dm-skeleton__label-col,
.communication-creation-skeleton-scope .delivery-method-skeleton__label-col {
    flex: 0 0 33.333333%;
    max-width: 33.333333%;
    margin-top: 0;
    margin-bottom: 0;
    margin-left: 0;
    margin-right: 0;
    padding-top: 0;
    padding-bottom: 0;
    padding-left: 0;
    padding-right: 31px;
    text-align: right;
    box-sizing: border-box;
}
.communication-creation-skeleton-scope .dm-skeleton__field-col,
.communication-creation-skeleton-scope .delivery-method-skeleton__field-col {
    flex: 0 0 58.333333%;
    max-width: 58.333333%;
    margin-top: 0;
    margin-bottom: 0;
    margin-left: 0;
    margin-right: 0;
    padding: 0;
    box-sizing: border-box;
}
.communication-creation-skeleton-scope .dm-skeleton__label,
.communication-creation-skeleton-scope .delivery-method-skeleton__label,
.communication-creation-skeleton-scope .dm-skeleton__field,
.communication-creation-skeleton-scope .delivery-method-skeleton__field {
    display: block;
    height: 24px;
    margin-top: 0;
    margin-bottom: 0;
}
.communication-creation-skeleton-scope .dm-skeleton__label,
.communication-creation-skeleton-scope .delivery-method-skeleton__label {
    margin-left: auto;
    margin-right: 0;
}
.communication-creation-skeleton-scope .dm-skeleton__label--w40,
.communication-creation-skeleton-scope .delivery-method-skeleton__label.dm-skeleton__label--w40 { width: 40%; }
.communication-creation-skeleton-scope .dm-skeleton__label--w42,
.communication-creation-skeleton-scope .delivery-method-skeleton__label.dm-skeleton__label--w42 { width: 42%; }
.communication-creation-skeleton-scope .dm-skeleton__label--w48,
.communication-creation-skeleton-scope .delivery-method-skeleton__label.dm-skeleton__label--w48 { width: 48%; }
.communication-creation-skeleton-scope .dm-skeleton__label--w52,
.communication-creation-skeleton-scope .delivery-method-skeleton__label.dm-skeleton__label--w52 { width: 52%; }
.communication-creation-skeleton-scope .dm-skeleton__label--w55,
.communication-creation-skeleton-scope .delivery-method-skeleton__label.dm-skeleton__label--w55 { width: 55%; }
.communication-creation-skeleton-scope .dm-skeleton__label--w58,
.communication-creation-skeleton-scope .delivery-method-skeleton__label.dm-skeleton__label--w58 { width: 58%; }
.communication-creation-skeleton-scope .dm-skeleton__label--w60,
.communication-creation-skeleton-scope .delivery-method-skeleton__label.dm-skeleton__label--w60 { width: 60%; }
.communication-creation-skeleton-scope .dm-skeleton__label--w65,
.communication-creation-skeleton-scope .delivery-method-skeleton__label.dm-skeleton__label--w65 { width: 65%; }
.communication-creation-skeleton-scope .dm-skeleton__label--w68,
.communication-creation-skeleton-scope .delivery-method-skeleton__label.dm-skeleton__label--w68 { width: 68%; }
.communication-creation-skeleton-scope .dm-skeleton__label--w70,
.communication-creation-skeleton-scope .delivery-method-skeleton__label.dm-skeleton__label--w70 { width: 70%; }
.communication-creation-skeleton-scope .dm-skeleton__label--w72,
.communication-creation-skeleton-scope .delivery-method-skeleton__label.dm-skeleton__label--w72 { width: 72%; }
.communication-creation-skeleton-scope .dm-skeleton__label--w78,
.communication-creation-skeleton-scope .delivery-method-skeleton__label.dm-skeleton__label--w78 { width: 78%; }
.communication-creation-skeleton-scope .dm-skeleton__field--full,
.communication-creation-skeleton-scope .delivery-method-skeleton__field.dm-skeleton__field--full { width: 100%; }
.communication-creation-skeleton-scope .dm-skeleton__field--w55,
.communication-creation-skeleton-scope .delivery-method-skeleton__field.dm-skeleton__field--w55 { width: 55%; }
.communication-creation-skeleton-scope .dm-skeleton__checkbox,
.communication-creation-skeleton-scope .delivery-method-skeleton__checkbox {
    display: block;
    height: 24px;
    margin-top: 14px;
    margin-bottom: 0;
    margin-left: 0;
    margin-right: 0;
}
.communication-creation-skeleton-scope .dm-skeleton__checkbox--w140,
.communication-creation-skeleton-scope .delivery-method-skeleton__checkbox.dm-skeleton__checkbox--w140 { width: 140px; }
.communication-creation-skeleton-scope .dm-skeleton__checkbox--w160,
.communication-creation-skeleton-scope .delivery-method-skeleton__checkbox.dm-skeleton__checkbox--w160 { width: 160px; }
.communication-creation-skeleton-scope .dm-skeleton__checkbox--w180,
.communication-creation-skeleton-scope .delivery-method-skeleton__checkbox.dm-skeleton__checkbox--w180 { width: 180px; }
.communication-creation-skeleton-scope .dm-skeleton__checkbox--w220,
.communication-creation-skeleton-scope .delivery-method-skeleton__checkbox.dm-skeleton__checkbox--w220 { width: 220px; }
.communication-creation-skeleton-scope .dm-skeleton__field-pair,
.communication-creation-skeleton-scope .delivery-method-skeleton__field-pair {
    display: flex;
    flex-wrap: nowrap;
    align-items: center;
    width: 100%;
    margin-top: 0;
    margin-bottom: 0;
    margin-left: 0;
    margin-right: 0;
    padding: 0;
    box-sizing: border-box;
}
.communication-creation-skeleton-scope .dm-skeleton__field-half,
.communication-creation-skeleton-scope .delivery-method-skeleton__field-half {
    flex: 0 0 50%;
    max-width: 50%;
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
.communication-creation-skeleton-scope .dm-skeleton__field-half + .dm-skeleton__field-half,
.communication-creation-skeleton-scope .delivery-method-skeleton__field-half + .delivery-method-skeleton__field-half {
    padding-left: 12px;
}
.communication-creation-skeleton-scope .dm-skeleton__toggle,
.communication-creation-skeleton-scope .delivery-method-skeleton__toggle {
    display: block;
    width: 68px;
    height: 32px;
    border-radius: 12px;
    margin-top: 0;
    margin-bottom: 0;
    margin-left: 0;
    margin-right: 0;
}
.communication-creation-skeleton-scope .dm-skeleton__inline-lines,
.communication-creation-skeleton-scope .delivery-method-skeleton__inline-lines {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    width: 100%;
    margin-top: 0;
    margin-bottom: 0;
    margin-left: 0;
    margin-right: 0;
    padding: 0;
    row-gap: 16px;
    column-gap: 24px;
    box-sizing: border-box;
}
.communication-creation-skeleton-scope .dm-skeleton__inline-line,
.communication-creation-skeleton-scope .delivery-method-skeleton__inline-line {
    display: block;
    height: 24px;
    margin-top: 0;
    margin-bottom: 0;
    margin-left: 0;
    margin-right: 0;
}
.communication-creation-skeleton-scope .dm-skeleton__inline-lines--w64 .dm-skeleton__inline-line,
.communication-creation-skeleton-scope .delivery-method-skeleton__inline-lines--w64 .delivery-method-skeleton__inline-line {
    width: 64px;
}
.communication-creation-skeleton-scope .dm-skeleton__inline-lines--w56 .dm-skeleton__inline-line,
.communication-creation-skeleton-scope .delivery-method-skeleton__inline-lines--w56 .delivery-method-skeleton__inline-line {
    width: 56px;
}
.communication-creation-skeleton-scope .dm-skeleton__freq-tab-list,
.communication-creation-skeleton-scope .delivery-method-skeleton__freq-tab-list {
    display: flex;
    flex-wrap: wrap;
    width: 100%;
    margin-top: 0;
    margin-bottom: 0;
    margin-left: 0;
    margin-right: 0;
    padding: 0;
    gap: 8px;
    list-style: none;
    box-sizing: border-box;
}
.communication-creation-skeleton-scope .dm-skeleton__freq-tab,
.communication-creation-skeleton-scope .delivery-method-skeleton__freq-tab {
    margin-top: 0;
    margin-bottom: 0;
    margin-left: 0;
    margin-right: 0;
    padding: 0;
    list-style: none;
    pointer-events: none;
    box-sizing: border-box;
}
.communication-creation-skeleton-scope .dm-skeleton__freq-tab-shimmer,
.communication-creation-skeleton-scope .delivery-method-skeleton__freq-tab-shimmer {
    display: block;
    height: 32px;
    margin-top: 0;
    margin-bottom: 0;
    margin-left: 0;
    margin-right: 0;
}
.communication-creation-skeleton-scope .dm-skeleton__freq-tab-shimmer--0,
.communication-creation-skeleton-scope .delivery-method-skeleton__freq-tab-shimmer.dm-skeleton__freq-tab-shimmer--0 { width: 82px; }
.communication-creation-skeleton-scope .dm-skeleton__freq-tab-shimmer--1,
.communication-creation-skeleton-scope .delivery-method-skeleton__freq-tab-shimmer.dm-skeleton__freq-tab-shimmer--1 { width: 72px; }
.communication-creation-skeleton-scope .dm-skeleton__freq-tab-shimmer--2,
.communication-creation-skeleton-scope .delivery-method-skeleton__freq-tab-shimmer.dm-skeleton__freq-tab-shimmer--2 { width: 58px; }
.communication-creation-skeleton-scope .dm-skeleton__freq-tab-shimmer--3,
.communication-creation-skeleton-scope .delivery-method-skeleton__freq-tab-shimmer.dm-skeleton__freq-tab-shimmer--3 { width: 68px; }
.communication-creation-skeleton-scope .dm-skeleton__freq-tab-shimmer--4,
.communication-creation-skeleton-scope .delivery-method-skeleton__freq-tab-shimmer.dm-skeleton__freq-tab-shimmer--4 { width: 72px; }
.communication-creation-skeleton-scope .dm-skeleton__footer,
.communication-creation-skeleton-scope .delivery-method-skeleton__footer {
    display: flex;
    flex-wrap: nowrap;
    justify-content: flex-end;
    align-items: center;
    width: 100%;
    margin-top: 24px;
    margin-bottom: 0;
    margin-left: 0;
    margin-right: 0;
    padding: 0;
    gap: 12px;
    box-sizing: border-box;
}
.communication-creation-skeleton-scope .dm-skeleton__footer-btn,
.communication-creation-skeleton-scope .delivery-method-skeleton__footer-btn {
    display: block;
    width: 72px;
    height: 36px;
    min-height: 36px;
    max-height: 36px;
    margin-top: 0;
    margin-bottom: 0;
    margin-left: 0;
    margin-right: 0;
    flex-shrink: 0;
    box-sizing: border-box;
}
.communication-creation-skeleton-scope .dm-skeleton__footer-btn--wide,
.communication-creation-skeleton-scope .delivery-method-skeleton__footer-btn.dm-skeleton__footer-btn--wide {
    width: 88px;
}
.communication-creation-skeleton-scope .delivery-method-skeleton .skeleton-shimmer--label,
.communication-creation-skeleton-scope .delivery-method-skeleton .skeleton-shimmer--field,
.communication-creation-skeleton-scope .dm-skeleton .skeleton-shimmer--label,
.communication-creation-skeleton-scope .dm-skeleton .skeleton-shimmer--field {
    height: 24px;
}
/* Type selection phase — skeleton-only classes (no live RSTabbar / Bootstrap utilities) */
.communication-creation-skeleton-scope .cc-delivery-type-skeleton,
.communication-creation-skeleton-scope .delivery-type-select-skeleton {
    width: 100%;
    box-sizing: border-box;
}
.communication-creation-skeleton-scope .cc-delivery-type-skeleton__closed,
.communication-creation-skeleton-scope .delivery-type-select-skeleton .cc-delivery-type-skeleton__closed {
    display: flex;
    justify-content: center;
    align-items: flex-start;
    min-height: 0;
    width: 100%;
    padding-top: 0;
    padding-bottom: 24px;
    box-sizing: border-box;
}
.communication-creation-skeleton-scope .cc-delivery-type-skeleton__holder,
.communication-creation-skeleton-scope .delivery-type-select-skeleton .cc-delivery-type-skeleton__holder {
    width: 100%;
    margin-left: 0;
    margin-right: 0;
    box-sizing: border-box;
}
.communication-creation-skeleton-scope .cc-delivery-type-skeleton__heading-col,
.communication-creation-skeleton-scope .delivery-type-select-skeleton .cc-delivery-type-skeleton__heading-col {
    width: 100%;
    margin-top: 0;
    margin-bottom: 0;
    padding-left: 0;
    padding-right: 0;
    box-sizing: border-box;
}
.communication-creation-skeleton-scope .cc-delivery-type-skeleton__heading-wrap,
.communication-creation-skeleton-scope .delivery-type-select-skeleton .cc-delivery-type-skeleton__heading-wrap {
    display: flex;
    justify-content: center;
    margin-top: 0;
    margin-bottom: 30px;
    padding: 0;
    text-align: center;
    box-sizing: border-box;
}
.communication-creation-skeleton-scope .cc-delivery-type-skeleton__heading,
.communication-creation-skeleton-scope .delivery-type-select-skeleton__heading {
    display: block;
    margin-left: auto;
    margin-right: auto;
    margin-top: 0;
    margin-bottom: 0;
}
.communication-creation-skeleton-scope .cc-delivery-type-skeleton__column-list,
.communication-creation-skeleton-scope .delivery-type-select-skeleton__column-list {
    display: flex;
    justify-content: center;
    flex-wrap: nowrap;
    width: 591px;
    max-width: 100%;
    margin-top: 0;
    margin-bottom: 0;
    margin-left: auto;
    margin-right: auto;
    padding: 0;
    list-style: none;
    box-sizing: border-box;
}
.communication-creation-skeleton-scope .cc-delivery-type-skeleton__column,
.communication-creation-skeleton-scope .delivery-type-select-skeleton__column-list .cc-delivery-type-skeleton__column {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    width: 177px;
    flex-shrink: 0;
    margin-top: 0;
    margin-bottom: 0;
    margin-left: 30px;
    margin-right: 0;
    padding: 0;
    list-style: none;
    box-sizing: border-box;
}
.communication-creation-skeleton-scope .cc-delivery-type-skeleton__column:first-child,
.communication-creation-skeleton-scope .delivery-type-select-skeleton__column-list .cc-delivery-type-skeleton__column:first-child {
    margin-left: 0;
}
.communication-creation-skeleton-scope .cc-delivery-type-skeleton__card,
.communication-creation-skeleton-scope .delivery-type-select-skeleton__card {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    width: 177px;
    height: 150px;
    margin: 0;
    padding: 0;
    background: #ffffff;
    border: 1px solid #c2cfe3;
    border-radius: var(--globalBorderRadius, 5px);
    box-sizing: border-box;
}
.communication-creation-skeleton-scope .cc-delivery-type-skeleton__icon,
.communication-creation-skeleton-scope .delivery-type-select-skeleton__icon {
    margin-left: auto;
    margin-right: auto;
}
.communication-creation-skeleton-scope .cc-delivery-type-skeleton__card-label,
.communication-creation-skeleton-scope .delivery-type-select-skeleton__card-label {
    display: block;
    margin-top: 0;
    margin-bottom: 0;
    margin-left: auto;
    margin-right: auto;
}
.communication-creation-skeleton-scope .cc-delivery-type-skeleton__info,
.communication-creation-skeleton-scope .delivery-type-select-skeleton__info {
    width: 100%;
    margin-top: 20px;
    margin-bottom: 0;
    margin-left: 0;
    margin-right: 0;
    padding-top: 0;
    padding-bottom: 0;
    padding-right: 0;
    box-sizing: border-box;
}
.communication-creation-skeleton-scope .cc-delivery-type-skeleton__column:nth-child(2) .cc-delivery-type-skeleton__info,
.communication-creation-skeleton-scope .delivery-type-select-skeleton__column-list .cc-delivery-type-skeleton__column:nth-child(2) .delivery-type-select-skeleton__info {
    padding-left: 3px;
}
.communication-creation-skeleton-scope .cc-delivery-type-skeleton__column:nth-child(3) .cc-delivery-type-skeleton__info,
.communication-creation-skeleton-scope .delivery-type-select-skeleton__column-list .cc-delivery-type-skeleton__column:nth-child(3) .delivery-type-select-skeleton__info {
    padding-left: 5px;
}
.communication-creation-skeleton-scope .cc-delivery-type-skeleton__info-line,
.communication-creation-skeleton-scope .delivery-type-select-skeleton__info .cc-delivery-type-skeleton__info-line {
    margin-left: 0;
    margin-right: 0;
}
.communication-creation-skeleton-scope .skeleton-shimmer {
    background-color: #e2e7ee;
}
.communication-creation-skeleton-scope .skeleton-shimmer.skeleton-shimmer--circle {
    border-radius: 50%;
}
.communication-creation-skeleton-scope .skeleton-shimmer::after {
    display: none !important;
    animation: none !important;
}
.communication-creation-skeleton-scope.communication-creation-inline-skeleton,
.communication-creation-skeleton-scope .cc-page-skeleton__inline {
    padding-top: 0;
    min-height: 0;
    background: transparent;
}
.communication-creation-skeleton-scope.communication-creation-inline-skeleton .cc-delivery-skeleton,
.communication-creation-skeleton-scope.communication-creation-inline-skeleton .communication-creation-delivery-skeleton {
    margin-top: 0;
}
.communication-creation-skeleton-scope.communication-creation-inline-skeleton .cc-delivery-skeleton__header,
.communication-creation-skeleton-scope.communication-creation-inline-skeleton .communication-creation-delivery-skeleton .cc-delivery-skeleton__header {
    margin-top: 0;
}
.communication-creation-skeleton-scope .cc-delivery-skeleton__tab--active,
.communication-creation-skeleton-scope .communication-creation-delivery-skeleton .cc-delivery-skeleton__tab--active {
    background: #ffffff !important;
    background-color: #ffffff;
    border-color: #c2cfe3;
}
.communication-creation-skeleton-scope .cc-delivery-skeleton__tab--active .skeleton-shimmer,
.communication-creation-skeleton-scope .communication-creation-delivery-skeleton .cc-delivery-skeleton__tab--active .skeleton-shimmer {
    background-color: #e2e7ee;
}
.communication-creation-skeleton-scope .cc-delivery-skeleton__tab--active::after,
.communication-creation-skeleton-scope .communication-creation-delivery-skeleton .cc-delivery-skeleton__tab--active::after {
    display: none;
    content: none;
}
`;
