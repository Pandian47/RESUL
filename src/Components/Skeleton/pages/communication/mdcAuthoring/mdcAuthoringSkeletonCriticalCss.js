/** MDC route shell only — inner form uses communication-authoring-skeleton-scope. */
export const mdcAuthoringSkeletonCriticalCss = `
.mdc-authoring-route-shell {
    width: 100%;
    min-height: 240px;
    box-sizing: border-box;
}
.mdc-authoring-route-shell__body {
    min-height: 200px;
}
/* MDC hides RSHeader — never use page-content-holder (adds 78px top via .rs-page-content-wrapper). */
.mdc-authoring-skeleton-scope {
    width: 100%;
    box-sizing: border-box;
    padding: 0;
    margin: 0;
    min-height: 0;
    background-color: #f5f7fc;
}
.mdc-authoring-skeleton-scope--no-header {
    padding-top: 0;
}
.rs-page-content-wrapper .mdc-authoring-skeleton-scope {
    padding-top: 0;
    margin-top: 0;
}
/* Match CreateMdcCommunication: <Container className="col-10"> */
.mdc-authoring-skeleton-scope .container.col-10 {
    float: none;
    width: 83.33333333%;
    max-width: 100%;
    margin-left: auto;
    margin-right: auto;
}
@media (min-width: 1400px) {
    .mdc-authoring-skeleton-scope .container.col-10 {
        max-width: 1320px;
        width: 83.33333333%;
    }
}
.mdc-authoring-skeleton-scope .page-content.mdc-authoring-page-content,
.mdc-authoring-skeleton-scope .page-content {
    padding-bottom: 32px;
}
.mdc-authoring-skeleton-scope .mdc-authoring-campaign-info.mt21 {
    margin-top: 21px;
}
.mdc-authoring-skeleton-scope .communication-authoring-skeleton-scope.communication-authoring-channel-edit-skeleton {
    background: transparent;
    min-height: 0;
    padding: 0;
    margin: 0;
}
.mdc-authoring-skeleton-scope .skeleton-shimmer {
    position: relative;
    overflow: hidden;
    background-color: #e2e7ee;
    border-radius: 4px;
    display: block;
}
.mdc-authoring-skeleton-scope .skeleton-shimmer::after {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, #eef2f9, transparent);
    animation: mdcAuthoringSkeletonShimmer 1.6s infinite;
}
@keyframes mdcAuthoringSkeletonShimmer {
    0% { left: -100%; }
    100% { left: 100%; }
}
.mdc-authoring-skeleton-scope .mdc-authoring-campaign-info {
    margin-bottom: 21px;
    padding: 14px 16px;
    background: #fff;
    border: 1px solid #c2cfe3;
    border-radius: var(--globalBorderRadius, 5px);
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.08);
}
.mdc-authoring-skeleton-scope .mdc-authoring-campaign-info__row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    width: 100%;
}
.mdc-authoring-skeleton-scope .mdc-authoring-campaign-info__cols {
    display: flex;
    flex: 1;
    gap: 12px;
    min-width: 0;
}
.mdc-authoring-skeleton-scope .mdc-authoring-campaign-info__col {
    flex: 1;
    min-width: 0;
}
.mdc-authoring-skeleton-scope .mdc-authoring-campaign-info__actions {
    display: flex;
    gap: 8px;
    flex-shrink: 0;
}
.mdc-authoring-skeleton-scope .mdc-authoring-content-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 21px;
    min-height: 48px;
}
.mdc-authoring-skeleton-scope .mdc-authoring-form.box-design {
    padding: 22px 22px 28px;
    background: #fff;
    border: 1px solid #c2cfe3;
    border-top: 2px solid #c2cfe3 !important;
    border-radius: var(--globalBorderRadius, 5px);
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.08);
}
.mdc-authoring-skeleton-scope .mdc-authoring-form .form-group {
    margin-bottom: 41px;
}
.mdc-authoring-skeleton-scope .mdc-authoring-form__preview-row {
    display: flex;
    gap: 20px;
    margin-top: 8px;
    margin-bottom: 24px;
}
.mdc-authoring-skeleton-scope .mdc-authoring-form__editor {
    flex: 1;
    min-width: 0;
    min-height: 280px;
}
.mdc-authoring-skeleton-scope .mdc-authoring-form__phone {
    width: 220px;
    flex-shrink: 0;
    min-height: 380px;
    border-radius: 24px;
}
.mdc-authoring-skeleton-scope .mdc-authoring-footer {
    display: flex;
    justify-content: flex-end;
    gap: 15px;
    padding-top: 8px;
}
.mdc-authoring-skeleton-scope .mdc-authoring-form--email .mdc-authoring-footer {
    justify-content: flex-start;
}
.mdc-authoring-skeleton-scope .mdc-authoring-form--email .form-group {
    margin-bottom: 41px;
}
.mdc-authoring-skeleton-scope .mdc-authoring-form__preview-row--notification {
    justify-content: flex-end;
}
.mdc-authoring-skeleton-scope .mdc-authoring-form__notification-preview {
    width: 280px;
    min-height: 320px;
    flex-shrink: 0;
    border-radius: 8px;
}
.mdc-authoring-channel-form-skeleton {
    width: 100%;
}
`;
