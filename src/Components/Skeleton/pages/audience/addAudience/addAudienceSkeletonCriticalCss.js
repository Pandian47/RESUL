/** Add audience page — layout before app.scss (_audience.scss). */
export const addAudienceSkeletonCriticalCss = `
.audience-add-audience-page-content-holder {
    padding-top: 78px;
    width: 100%;
    box-sizing: border-box;
    background-color: #f5f7fc;
}
.audience-add-audience-skeleton .container {
    max-width: 1260px;
    margin-left: auto;
    margin-right: auto;
}
.audience-add-audience-skeleton .add-audience-page-header-rs-page-header-skeleton .heading-title-text h1 {
    margin: 0;
    padding: 0;
    line-height: 1.2;
}
.audience-add-audience-skeleton .add-audience-page-header-skeleton .mhw-container {
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    padding: 10px 0;
    min-height: 45px;
    box-sizing: border-box;
}
.audience-add-audience-skeleton .add-audience-page-header-skeleton .mhwc-right {
    gap: 15px;
}
.audience-add-audience-skeleton .page-content.mt21 {
    margin-top: 21px;
}
.audience-add-audience-skeleton .add-audience-skeleton-form.box-design {
    padding: 21px !important;
    background: #fff;
    border: 1px solid #c2cfe3;
    border-radius: var(--globalBorderRadius, 5px);
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.08);
    box-sizing: border-box;
    margin-bottom: 0;
}
.audience-add-audience-skeleton .add-audience-skeleton-form .form-group,
.audience-add-audience-inline-skeleton .add-audience-skeleton-form .form-group {
    margin-bottom: 0;
}
.audience-add-audience-skeleton .add-audience-skeleton-form__row--first,
.audience-add-audience-inline-skeleton .add-audience-skeleton-form__row--first {
    margin-bottom: 21px;
    padding-bottom: 0;
}
.audience-add-audience-skeleton .add-audience-skeleton-form__row--second,
.audience-add-audience-inline-skeleton .add-audience-skeleton-form__row--second {
    margin-bottom: 0;
}
.audience-add-audience-skeleton .add-audience-skeleton-form__label {
    display: block;
    margin-left: auto;
    max-width: 140px;
}
.audience-add-audience-skeleton .add-audience-skeleton-form__field {
    width: 100%;
    max-width: 100%;
}
.audience-add-audience-skeleton .add-audience-skeleton-form__refresh {
    flex-shrink: 0;
}
.audience-add-audience-skeleton .add-audience-skeleton-footer.buttons-holder {
    margin-top: 21px;
    padding-bottom: 16px;
}
.audience-add-audience-skeleton .add-audience-skeleton-footer__cancel {
    background-color: transparent !important;
}
.audience-add-audience-skeleton .add-audience-skeleton-footer__upload {
    background-color: #d4dce8 !important;
}
.audience-add-audience-skeleton .skeleton-shimmer,
.audience-add-audience-inline-skeleton .skeleton-shimmer {
    background-color: #e2e7ee;
    border-radius: 4px;
}
.audience-add-audience-skeleton .skeleton-shimmer::after,
.audience-add-audience-inline-skeleton .skeleton-shimmer::after {
    display: none !important;
    animation: none !important;
}
.audience-add-audience-inline-skeleton {
    width: 100%;
    box-sizing: border-box;
}
`;
