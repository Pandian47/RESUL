/** Dynamic list creation — matches CreateDynamicListCSS / _dynamicListCreate.scss / RSPageHeader */
export const dynamicListCreationSkeletonCriticalCss = `
.audience-dynamic-list-creation-skeleton.page-content-holder,
.audience-dynamic-list-inline-skeleton {
    width: 100%;
    box-sizing: border-box;
}
.audience-dynamic-list-creation-skeleton.page-content-holder {
    padding-top: 78px;
    background-color: #f5f7fc;
}
.audience-dynamic-list-creation-skeleton .container {
    max-width: 1260px;
    margin-left: auto;
    margin-right: auto;
}
.audience-dynamic-list-creation-skeleton .dynamic-list-creation-page-header-skeleton.main-heading-wrapper,
.audience-dynamic-list-inline-skeleton .dynamic-list-creation-page-header-skeleton.main-heading-wrapper {
    margin-bottom: 0;
    padding-bottom: 0;
}
.audience-dynamic-list-creation-skeleton .dynamic-list-creation-page-header-skeleton .heading-title-text,
.audience-dynamic-list-inline-skeleton .dynamic-list-creation-page-header-skeleton .heading-title-text {
    display: flex;
    align-items: flex-end;
}
.audience-dynamic-list-creation-skeleton .dynamic-list-creation-page-header-skeleton.rs-page-header-skeleton .heading-title-text h1,
.audience-dynamic-list-inline-skeleton .dynamic-list-creation-page-header-skeleton.rs-page-header-skeleton .heading-title-text h1 {
    margin: 0;
    padding: 0;
    line-height: 1.2;
}
.audience-dynamic-list-creation-skeleton .dynamic-list-creation-page-header-skeleton .mhw-container,
.audience-dynamic-list-inline-skeleton .dynamic-list-creation-page-header-skeleton .mhw-container {
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    padding: 5px 0;
    min-height: 40px;
    box-sizing: border-box;
}
.audience-dynamic-list-creation-skeleton .dynamic-list-creation-page-header-skeleton .mhwc-right,
.audience-dynamic-list-inline-skeleton .dynamic-list-creation-page-header-skeleton .mhwc-right {
    gap: 15px;
}
.audience-dynamic-list-creation-skeleton .page-content,
.audience-dynamic-list-inline-skeleton .page-content,
.audience-dynamic-list-inline-skeleton .CreateDynamicListCSS.dl-skeleton-form {
    margin-top: 0;
    padding-top: 0;
}
.audience-dynamic-list-creation-skeleton .CreateDynamicListCSS.dl-skeleton-form,
.audience-dynamic-list-inline-skeleton .CreateDynamicListCSS.dl-skeleton-form,
.dynamic-list-creation-skeleton.dl-skeleton-form {
    width: 100%;
    box-sizing: border-box;
}
.dynamic-list-creation-skeleton.dl-skeleton-form {
    padding: 0;
}
.audience-dynamic-list-creation-skeleton .dl-skeleton-form .mb0,
.audience-dynamic-list-inline-skeleton .dl-skeleton-form .mb0,
.dynamic-list-creation-skeleton .mb0 {
    margin-bottom: 0 !important;
}
.audience-dynamic-list-creation-skeleton .dl-skeleton-form .mb20,
.audience-dynamic-list-inline-skeleton .dl-skeleton-form .mb20,
.dynamic-list-creation-skeleton .mb20 {
    margin-bottom: 20px;
}
.audience-dynamic-list-creation-skeleton .dl-skeleton-form .mb25,
.audience-dynamic-list-inline-skeleton .dl-skeleton-form .mb25,
.dynamic-list-creation-skeleton .mb25 {
    margin-bottom: 25px;
}
.audience-dynamic-list-creation-skeleton .dl-skeleton-form .mb30,
.audience-dynamic-list-inline-skeleton .dl-skeleton-form .mb30,
.dynamic-list-creation-skeleton .mb30 {
    margin-bottom: 30px;
}
.audience-dynamic-list-creation-skeleton .dl-skeleton-form .mb41,
.audience-dynamic-list-inline-skeleton .dl-skeleton-form .mb41,
.dynamic-list-creation-skeleton .mb41 {
    margin-bottom: 41px;
}
.audience-dynamic-list-creation-skeleton .dl-skeleton-form .mt30,
.audience-dynamic-list-inline-skeleton .dl-skeleton-form .mt30,
.dynamic-list-creation-skeleton .mt30 {
    margin-top: 30px;
}
.audience-dynamic-list-creation-skeleton .dl-skeleton-form .pl30,
.audience-dynamic-list-inline-skeleton .dl-skeleton-form .pl30,
.dynamic-list-creation-skeleton .pl30 {
    padding-left: 30px;
}
.audience-dynamic-list-creation-skeleton .dl-skeleton-form .pr0,
.audience-dynamic-list-inline-skeleton .dl-skeleton-form .pr0,
.dynamic-list-creation-skeleton .pr0 {
    padding-right: 0;
}
.audience-dynamic-list-creation-skeleton .dl-skeleton-form .p0,
.audience-dynamic-list-inline-skeleton .dl-skeleton-form .p0,
.dynamic-list-creation-skeleton.p0 {
    padding: 0;
}
.audience-dynamic-list-creation-skeleton .dl-skeleton-form .d-flex,
.audience-dynamic-list-inline-skeleton .dl-skeleton-form .d-flex,
.dynamic-list-creation-skeleton .d-flex {
    display: flex;
}
.audience-dynamic-list-creation-skeleton .dl-skeleton-form .align-items-center,
.audience-dynamic-list-inline-skeleton .dl-skeleton-form .align-items-center,
.dynamic-list-creation-skeleton .align-items-center {
    align-items: center;
}
.audience-dynamic-list-creation-skeleton .dl-skeleton-form .justify-content-end,
.audience-dynamic-list-inline-skeleton .dl-skeleton-form .justify-content-end,
.dynamic-list-creation-skeleton .justify-content-end {
    justify-content: flex-end;
}
.audience-dynamic-list-creation-skeleton .dl-skeleton-form .flex-shrink-0,
.audience-dynamic-list-inline-skeleton .dl-skeleton-form .flex-shrink-0,
.dynamic-list-creation-skeleton .flex-shrink-0 {
    flex-shrink: 0;
}
.audience-dynamic-list-creation-skeleton .dl-skeleton-form .gap-3,
.audience-dynamic-list-inline-skeleton .dl-skeleton-form .gap-3,
.dynamic-list-creation-skeleton .gap-3 {
    gap: 1rem;
}
.audience-dynamic-list-creation-skeleton .dl-skeleton-form .control-label-left,
.audience-dynamic-list-inline-skeleton .dl-skeleton-form .control-label-left,
.dynamic-list-creation-skeleton .dl-skeleton-form .control-label-left {
    font-size: 19px;
    font-weight: 400;
    line-height: 1.5;
    color: #333333;
    text-align: left;
    font-family: MuktaRegular, sans-serif;
    margin: 0;
    display: block;
}
.audience-dynamic-list-creation-skeleton .dl-skeleton-col-label,
.audience-dynamic-list-inline-skeleton .dl-skeleton-col-label,
.dynamic-list-creation-skeleton .dl-skeleton-col-label {
    font-size: 19px;
    font-weight: 400;
    line-height: 1.5;
    color: #333333;
    font-family: MuktaRegular, sans-serif;
    padding-top: 0;
}
.audience-dynamic-list-creation-skeleton .dl-skeleton-form__field,
.audience-dynamic-list-inline-skeleton .dl-skeleton-form__field,
.dynamic-list-creation-skeleton .dl-skeleton-form__field {
    width: 100%;
    max-width: 100%;
    display: block;
    box-sizing: border-box;
}
.audience-dynamic-list-creation-skeleton .dl-skeleton-form__field--input,
.audience-dynamic-list-inline-skeleton .dl-skeleton-form__field--input,
.dynamic-list-creation-skeleton .dl-skeleton-form__field--input,
.audience-dynamic-list-creation-skeleton .dl-skeleton-bar--label,
.audience-dynamic-list-inline-skeleton .dl-skeleton-bar--label,
.dynamic-list-creation-skeleton .dl-skeleton-bar--label,
.audience-dynamic-list-creation-skeleton .dl-skeleton-bar--checkbox,
.audience-dynamic-list-inline-skeleton .dl-skeleton-bar--checkbox,
.dynamic-list-creation-skeleton .dl-skeleton-bar--checkbox {
    height: 24px;
}
.audience-dynamic-list-creation-skeleton .dl-skeleton-form__field--compact,
.audience-dynamic-list-inline-skeleton .dl-skeleton-form__field--compact,
.dynamic-list-creation-skeleton .dl-skeleton-form__field--compact {
    height: 24px;
}
.audience-dynamic-list-creation-skeleton .dl-skeleton-row--list-name,
.audience-dynamic-list-inline-skeleton .dl-skeleton-row--list-name,
.dynamic-list-creation-skeleton .dl-skeleton-row--list-name {
    margin-top: 30px;
    margin-bottom: 15px;
}
.audience-dynamic-list-creation-skeleton .dl-skeleton-row--rules,
.audience-dynamic-list-inline-skeleton .dl-skeleton-row--rules,
.dynamic-list-creation-skeleton .dl-skeleton-row--rules,
.audience-dynamic-list-creation-skeleton .dl-skeleton-row--match-field,
.audience-dynamic-list-inline-skeleton .dl-skeleton-row--match-field,
.dynamic-list-creation-skeleton .dl-skeleton-row--match-field {
    margin-bottom: 41px;
}
.audience-dynamic-list-creation-skeleton .dl-skeleton-radio-row,
.audience-dynamic-list-inline-skeleton .dl-skeleton-radio-row,
.dynamic-list-creation-skeleton .dl-skeleton-radio-row {
    display: flex;
    align-items: center;
    gap: 24px;
    min-height: 24px;
}
.audience-dynamic-list-creation-skeleton .dl-skeleton-radio-option,
.audience-dynamic-list-inline-skeleton .dl-skeleton-radio-option,
.dynamic-list-creation-skeleton .dl-skeleton-radio-option {
    display: flex;
    align-items: center;
    gap: 8px;
}
.audience-dynamic-list-creation-skeleton .createDynamicListBox > .position-relative,
.audience-dynamic-list-inline-skeleton .createDynamicListBox > .position-relative,
.dynamic-list-creation-skeleton .createDynamicListBox > .position-relative {
    border: 1px dashed #0000ff !important;
    border-radius: var(--globalBorderRadius, 5px);
    background: #fff;
    padding: 19px;
    margin-top: 0;
    margin-bottom: 20px;
    position: relative;
    box-sizing: border-box;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.08);
}
.audience-dynamic-list-creation-skeleton .dl-skeleton-rule-group__title,
.audience-dynamic-list-inline-skeleton .dl-skeleton-rule-group__title,
.dynamic-list-creation-skeleton .dl-skeleton-rule-group__title {
    margin: 0;
    padding: 0;
}
.audience-dynamic-list-creation-skeleton .dl-skeleton-rule-group__title .skeleton-shimmer,
.audience-dynamic-list-inline-skeleton .dl-skeleton-rule-group__title .skeleton-shimmer,
.dynamic-list-creation-skeleton .dl-skeleton-rule-group__title .skeleton-shimmer {
    height: 24px;
}
.audience-dynamic-list-creation-skeleton .dl-skeleton-radio-pill,
.audience-dynamic-list-inline-skeleton .dl-skeleton-radio-pill,
.dynamic-list-creation-skeleton .dl-skeleton-radio-pill {
    border-radius: 50%;
    width: 24px !important;
    height: 24px !important;
}
.audience-dynamic-list-creation-skeleton .rightOutSidePlusIcon.dl-skeleton-plus-wrap,
.audience-dynamic-list-inline-skeleton .rightOutSidePlusIcon.dl-skeleton-plus-wrap,
.dynamic-list-creation-skeleton .rightOutSidePlusIcon.dl-skeleton-plus-wrap {
    position: absolute;
    right: -35px;
    bottom: 0;
    line-height: 0;
}
.audience-dynamic-list-creation-skeleton .dl-skeleton-approval__checkbox-row,
.audience-dynamic-list-inline-skeleton .dl-skeleton-approval__checkbox-row,
.dynamic-list-creation-skeleton .dl-skeleton-approval__checkbox-row {
    display: flex;
    align-items: center;
    gap: 8px;
    min-height: 24px;
    margin-bottom: 0;
}
.audience-dynamic-list-creation-skeleton .dl-skeleton-approval__checkbox-label,
.audience-dynamic-list-inline-skeleton .dl-skeleton-approval__checkbox-label,
.dynamic-list-creation-skeleton .dl-skeleton-approval__checkbox-label {
    font-size: 19px;
    font-weight: 400;
    line-height: 1.5;
    color: #333333;
    font-family: MuktaRegular, sans-serif;
    margin-left: 8px;
    margin-right: 8px;
}
.audience-dynamic-list-creation-skeleton .dl-skeleton-approval__send-row.requestApprovalBlock,
.audience-dynamic-list-inline-skeleton .dl-skeleton-approval__send-row.requestApprovalBlock,
.dynamic-list-creation-skeleton .dl-skeleton-approval__send-row.requestApprovalBlock {
    margin-top: 10px;
    margin-bottom: 30px;
}
.audience-dynamic-list-creation-skeleton .dl-skeleton-approval__send-action,
.audience-dynamic-list-inline-skeleton .dl-skeleton-approval__send-action,
.dynamic-list-creation-skeleton .dl-skeleton-approval__send-action {
    display: flex;
    align-items: center;
}
.audience-dynamic-list-creation-skeleton .dl-skeleton-approval,
.audience-dynamic-list-inline-skeleton .dl-skeleton-approval,
.dynamic-list-creation-skeleton .dl-skeleton-approval {
    margin-top: 0;
    margin-bottom: 0;
}
.audience-dynamic-list-creation-skeleton .dl-skeleton-footer,
.audience-dynamic-list-inline-skeleton .dl-skeleton-footer,
.dynamic-list-creation-skeleton .dl-skeleton-footer {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: 1rem;
    width: 100%;
    margin-top: 24px;
    padding-bottom: 16px;
    box-sizing: border-box;
}
.audience-dynamic-list-creation-skeleton .dl-skeleton-footer .dl-skeleton-footer__cancel,
.audience-dynamic-list-inline-skeleton .dl-skeleton-footer .dl-skeleton-footer__cancel,
.dynamic-list-creation-skeleton .dl-skeleton-footer .dl-skeleton-footer__cancel,
.audience-dynamic-list-creation-skeleton .dl-skeleton-footer .dl-skeleton-footer__primary,
.audience-dynamic-list-inline-skeleton .dl-skeleton-footer .dl-skeleton-footer__primary,
.dynamic-list-creation-skeleton .dl-skeleton-footer .dl-skeleton-footer__primary {
    display: block;
    flex: 0 0 auto;
    flex-shrink: 0 !important;
    min-width: 0;
    height: 36px !important;
    box-sizing: border-box;
}
.audience-dynamic-list-creation-skeleton .dl-skeleton-footer .dl-skeleton-footer__cancel,
.audience-dynamic-list-inline-skeleton .dl-skeleton-footer .dl-skeleton-footer__cancel,
.dynamic-list-creation-skeleton .dl-skeleton-footer .dl-skeleton-footer__cancel {
    background-color: #e2e7ee !important;
    width: 72px !important;
    min-width: 72px;
}
.audience-dynamic-list-creation-skeleton .dl-skeleton-footer .dl-skeleton-footer__primary,
.audience-dynamic-list-inline-skeleton .dl-skeleton-footer .dl-skeleton-footer__primary,
.dynamic-list-creation-skeleton .dl-skeleton-footer .dl-skeleton-footer__primary {
    background-color: #e2e7ee !important;
    width: 108px !important;
    min-width: 108px;
}
.audience-dynamic-list-creation-skeleton .skeleton-shimmer,
.audience-dynamic-list-inline-skeleton .skeleton-shimmer,
.dynamic-list-creation-skeleton .skeleton-shimmer {
    background-color: #e2e7ee;
    border-radius: 4px;
    display: inline-block;
    vertical-align: middle;
    flex-shrink: 0;
}
.audience-dynamic-list-creation-skeleton .dl-skeleton-form .skeleton-shimmer:not(.dl-skeleton-footer__cancel):not(.dl-skeleton-footer__primary):not(.dl-skeleton-radio-pill),
.audience-dynamic-list-inline-skeleton .dl-skeleton-form .skeleton-shimmer:not(.dl-skeleton-footer__cancel):not(.dl-skeleton-footer__primary):not(.dl-skeleton-radio-pill),
.dynamic-list-creation-skeleton .dl-skeleton-form .skeleton-shimmer:not(.dl-skeleton-footer__cancel):not(.dl-skeleton-footer__primary):not(.dl-skeleton-radio-pill) {
    height: 24px;
}
.audience-dynamic-list-creation-skeleton .skeleton-shimmer::after,
.audience-dynamic-list-inline-skeleton .skeleton-shimmer::after,
.dynamic-list-creation-skeleton .skeleton-shimmer::after {
    display: none !important;
    animation: none !important;
}
.audience-dynamic-list-inline-skeleton {
    width: 100%;
    box-sizing: border-box;
}
`;
