/** Scoped styles for Email → Template select preview loading skeleton. */
export const templatePreviewInnerSkeletonCriticalCss = `
.template-preview-inner-skeleton-scope {
    width: 100%;
    box-sizing: border-box;
}
.template-preview-inner-skeleton-scope .skeleton-shimmer {
    display: block;
    border-radius: 4px;
}
.template-preview-inner-skeleton__inbox-row {
    margin-bottom: 30px;
}
.template-preview-inner-skeleton__inbox-label {
    width: 20%;
    min-width: 120px;
    height: 14px;
}
.template-preview-inner-skeleton__inbox-field {
    width: 100%;
    max-width: 540px;
    height: 34px;
    border-radius: 5px;
}
.template-preview-inner-skeleton__inbox-hint {
    width: 42%;
    height: 11px;
    margin-top: 6px;
    margin-left: auto;
}
.template-preview-inner-skeleton__toolbar {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: 12px;
    margin-bottom: 15px;
    min-height: 24px;
}
.template-preview-inner-skeleton__vib-text {
    width: 220px;
    height: 12px;
    margin-right: auto;
}
.template-preview-inner-skeleton__checkbox {
    width: 118px;
    height: 16px;
}
.template-preview-inner-skeleton__icon {
    width: 20px;
    height: 20px;
    border-radius: 4px;
    flex-shrink: 0;
}
.template-preview-inner-skeleton__edm {
    max-width: 600px;
    margin: 0 auto;
    border: 1px solid #e2e7ee;
    border-radius: 8px;
    overflow: hidden;
    background: #fff;
}
.template-preview-inner-skeleton__canvas {
    min-height: 330px;
    padding: 20px 18px;
    box-sizing: border-box;
}
.template-preview-inner-skeleton__canvas-header {
    width: 220px;
    height: 12px;
    margin: 0 auto 20px;
}
.template-preview-inner-skeleton__no-data-panel {
    min-height: 132px;
    margin: 14px 0 18px;
    border: 1px solid #e2e7ee;
    border-radius: 8px;
    background: #f8fafc;
    display: flex;
    align-items: center;
    justify-content: center;
    box-sizing: border-box;
}
.template-preview-inner-skeleton__no-data {
    position: relative;
    top: auto;
    left: auto;
    transform: none;
    text-align: center;
}
.template-preview-inner-skeleton__no-data p {
    margin-bottom: 0;
}
.template-preview-inner-skeleton-scope--no-data .skeleton-shimmer::after {
    animation: none !important;
}
.template-preview-inner-skeleton__canvas-line {
    width: 100%;
    height: 12px;
    margin-bottom: 10px;
}
.template-preview-inner-skeleton__canvas-line:last-child {
    margin-bottom: 0;
}
.template-preview-inner-skeleton-scope--web-notification .template-preview-inner-skeleton__toggle-row,
.template-preview-inner-skeleton-scope--web-notification .template-preview-inner-skeleton__hashtag-row {
    margin-bottom: 24px;
}
.template-preview-inner-skeleton-scope--web-notification .template-preview-inner-skeleton__toggle-label {
    width: 72%;
    height: 14px;
}
.template-preview-inner-skeleton-scope--web-notification .template-preview-inner-skeleton__toggle {
    width: 44px;
    height: 24px;
    border-radius: 12px;
}
.template-preview-inner-skeleton-scope--web-notification .template-preview-inner-skeleton__hashtag-input {
    width: 100%;
    min-height: 72px;
    border-radius: 4px;
}
.template-preview-inner-skeleton-scope--web-notification .template-preview-inner-skeleton__hashtag-hint {
    width: 78%;
    height: 12px;
    margin-top: 8px;
}
.template-preview-inner-skeleton-scope--web-notification .template-preview-inner-skeleton__import-preview {
    width: 100%;
}
.template-preview-inner-skeleton-scope--web-notification .template-preview-inner-skeleton__import-preview-frame {
    width: 100%;
    min-height: 300px;
    border-radius: 8px;
    border: 1px solid #e2e7ee;
}
.template-preview-inner-skeleton-scope--web-notification .template-preview-inner-skeleton__no-data-panel--import {
    min-height: 300px;
    width: 100%;
}
`;
