/** Target list creation — layout before app.scss (_targetListCreate.scss / RSPageHeader). */
export const audienceTargetListCreationCriticalCss = `
body:has(.audience-target-list-creation-skeleton[aria-busy='true']),
body:has(.audience-target-list-creation-inline-skeleton--with-shell) {
    background-color: #f5f7fc;
}
.rs-page-content-wrapper:has(.audience-target-list-creation-inline-skeleton),
.rs-page-content-wrapper:has(.audience-target-list-creation-skeleton) {
    min-height: calc(100vh - 74px);
    background-color: #f5f7fc !important;
}
body:has(.audience-target-list-creation-skeleton[aria-busy='true']) .page-breadcrumb-skeleton.breadcrumbs {
    background-color: #f0f0f0 !important;
}
/* Nested shell — avoid double padding-top when skeleton is inside another page-content-holder */
.page-content-holder:has(> .audience-target-list-creation-skeleton.page-content-holder) {
    padding-top: 0 !important;
    background-color: #f5f7fc !important;
}
.audience-target-list-creation-skeleton.page-content-holder,
.audience-target-list-creation-inline-skeleton {
    width: 100%;
    box-sizing: border-box;
}
.audience-target-list-creation-skeleton.page-content-holder .container px0 {
    padding-left: 0 !important;
    padding-right: 0 !important;

}
.audience-target-list-creation-skeleton.page-content-holder {
    padding-top: 78px;
    background-color: #f5f7fc !important;
}
/* Breadcrumb top band — match live RSHeader breadcrumbs (#f0f0f0), not white #root */
.audience-target-list-creation-skeleton .page-breadcrumb-skeleton.breadcrumbs,
.audience-target-list-creation-inline-skeleton--with-shell .page-breadcrumb-skeleton.breadcrumbs {
    background-color: #f0f0f0 !important;
    position: fixed;
    top: 60px;
    left: 0;
    right: 0;
    z-index: 1001;
    height: 19px;
    width: 100%;
    box-sizing: border-box;
}
.audience-target-list-creation-skeleton .page-breadcrumb-skeleton .breadcrumb li span,
.audience-target-list-creation-inline-skeleton--with-shell .page-breadcrumb-skeleton .breadcrumb li span {
    display: inline-block !important;
    height: 9px;
    border-radius: 4px;
    background-color: #c5ced8;
    color: transparent;
    font-size: 0;
    line-height: 0;
    overflow: hidden;
    vertical-align: middle;
}
.audience-target-list-creation-skeleton .page-breadcrumb-skeleton .breadcrumb li:first-child span,
.audience-target-list-creation-inline-skeleton--with-shell .page-breadcrumb-skeleton .breadcrumb li:first-child span {
    width: 56px;
}
.audience-target-list-creation-skeleton .page-breadcrumb-skeleton .breadcrumb li.active span,
.audience-target-list-creation-inline-skeleton--with-shell .page-breadcrumb-skeleton .breadcrumb li.active span {
    width: 76px;
    background-color: #aeb8c6;
}
.audience-target-list-creation-inline-skeleton--with-shell {
    padding-top: 78px;
    background-color: #f5f7fc !important;
    width: 100%;
    box-sizing: border-box;
}
.audience-target-list-creation-skeleton .target-list-creation-page-header-skeleton.main-heading-wrapper {
    margin-top: 0;
    background-color: #f5f7fc !important;
}
.page-content-holder:has(.audience-tl-skeleton-body) .main-heading-wrapper.container-fluid,
.audience-target-list-creation-skeleton .main-heading-wrapper.container-fluid {
    box-sizing: border-box;
}
.audience-target-list-creation-skeleton .target-list-creation-page-header-skeleton.main-heading-wrapper,
.audience-target-list-creation-inline-skeleton .target-list-creation-page-header-skeleton.main-heading-wrapper {
    margin-bottom: 0;
    padding-bottom: 0;
    width: 100%;
    box-sizing: border-box;
}
.audience-target-list-creation-skeleton .target-list-creation-page-header-skeleton .heading-title-text,
.audience-target-list-creation-inline-skeleton .target-list-creation-page-header-skeleton .heading-title-text {
    display: flex;
    align-items: flex-end;
}
.audience-target-list-creation-skeleton .target-list-creation-page-header-skeleton .skeleton-page-header-bar,
.audience-target-list-creation-inline-skeleton .target-list-creation-page-header-skeleton .skeleton-page-header-bar {
    display: inline-block;
    background-color: #e2e7ee;
    border-radius: 4px;
    box-sizing: border-box;
}
.page-content-holder:has(.audience-tl-skeleton-body) .main-heading-wrapper .mhw-container.container,
.audience-target-list-creation-skeleton .target-list-creation-page-header-skeleton .mhw-container,
.audience-target-list-creation-inline-skeleton .target-list-creation-page-header-skeleton .mhw-container {
    max-width: 1260px;
    margin-left: auto;
    margin-right: auto;
    padding-left: 0;
    padding-right: 0;
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    padding-top: 10px;
    padding-bottom: 10px;
    min-height: 45px;
    box-sizing: border-box;
}
.audience-target-list-creation-skeleton.page-content-holder > .container-fluid:not(.main-heading-wrapper) {
    width: 100%;
    max-width: 100%;
    box-sizing: border-box;
}
.audience-target-list-creation-skeleton .page-content > .container.px0,
.page-content:has(.audience-tl-skeleton-body) > .container.px0,
.page-content:has(.audience-target-list-creation-inline-skeleton) > .container.px0 {
    max-width: 1260px;
    margin-left: auto;
    margin-right: auto;
    padding-left: 0 !important;
    padding-right: 0 !important;
    width: 100%;
    box-sizing: border-box;
}
.audience-target-list-creation-skeleton .page-content,
.page-content:has(.audience-tl-skeleton-body),
.page-content:has(.audience-target-list-creation-inline-skeleton) {
    padding-left: 0;
    padding-right: 0;
}
.audience-target-list-creation-skeleton .container {
    max-width: 1260px;
    margin-left: auto;
    margin-right: auto;
    box-sizing: border-box;
}
/* RSPageHeader skeleton — title shimmer + BU / dept / Back */
.audience-target-list-creation-skeleton .target-list-creation-page-header-skeleton.rs-page-header-skeleton .heading-title-text h1 {
    margin: 0;
    padding: 0;
    line-height: 1.2;
}
.audience-target-list-creation-skeleton .target-list-creation-page-header-skeleton .mhwc-left,
.audience-target-list-creation-skeleton .target-list-creation-page-header-skeleton .mhwc-right {
    display: flex;
    align-items: center;
}
.audience-target-list-creation-skeleton .target-list-creation-page-header-skeleton .mhw-container {
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    padding: 10px 0;
    min-height: 45px;
    box-sizing: border-box;
}
.audience-target-list-creation-skeleton .target-list-creation-page-header-skeleton .mhwc-right {
    gap: 15px;
}
.audience-target-list-creation-skeleton .page-content,
.audience-target-list-creation-inline-skeleton .page-content {
    margin-top: 0;
    padding-top: 0;
}
.audience-target-list-creation-skeleton .audience-tl-skeleton-body,
.audience-target-list-creation-inline-skeleton .audience-tl-skeleton-body {
    width: 100%;
    box-sizing: border-box;
    position: relative;
    min-height: calc(100vh - 200px);
    overflow: visible;
}
.audience-target-list-creation-skeleton .audience-tl-skeleton-left.sticky,
.audience-target-list-creation-inline-skeleton .audience-tl-skeleton-left.sticky {
    position: relative;
    top: auto;
    width: 320px;
    float: left;
    z-index: 1;
}
.audience-target-list-creation-skeleton .audience-tl-skeleton-left-attributes > .skeleton-span-con,
.audience-target-list-creation-inline-skeleton .audience-tl-skeleton-left-attributes > .skeleton-span-con {
    min-height: 0;
    padding: 0;
}
.audience-target-list-creation-skeleton .audience-tl-skeleton-left-attributes .skeleton-span-con,
.audience-target-list-creation-inline-skeleton .audience-tl-skeleton-left-attributes .skeleton-span-con {
    min-height: auto;
    padding: 0;
}
.audience-target-list-creation-skeleton .audience-tl-skeleton-left-attributes .tl-attribtueSkeleton-block,
.audience-target-list-creation-inline-skeleton .audience-tl-skeleton-left-attributes .tl-attribtueSkeleton-block {
    min-height: calc(100vh - 281px);
    box-sizing: border-box;
}
.audience-target-list-creation-skeleton .rs-targetList-rightSide.audience-tl-skeleton-right,
.audience-target-list-creation-inline-skeleton .rs-targetList-rightSide.audience-tl-skeleton-right {
    width: calc(100% - 320px);
    margin-left: 360px;
    margin-top: 5px;
    box-sizing: border-box;
    padding-left: 0;
    padding-right: 40px;
    display: flex;
    flex-direction: column;
    min-height: calc(100vh - 220px);
    overflow: visible;
}
.audience-target-list-creation-skeleton .audience-tl-skeleton-right > .row,
.audience-target-list-creation-inline-skeleton .audience-tl-skeleton-right > .row {
    margin-left: 0;
    margin-right: 0;
}
.audience-target-list-creation-skeleton .audience-tl-skeleton-meta,
.audience-target-list-creation-inline-skeleton .audience-tl-skeleton-meta {
    margin-top: 7px;
}
.audience-target-list-creation-skeleton .audience-tl-skeleton-options,
.audience-target-list-creation-inline-skeleton .audience-tl-skeleton-options {
    margin-top: 20px;
}
.audience-target-list-creation-skeleton .rs-targetList-rightSide.audience-tl-skeleton-right::after,
.audience-target-list-creation-inline-skeleton .rs-targetList-rightSide.audience-tl-skeleton-right::after {
    content: '';
    display: table;
    clear: both;
}
.audience-target-list-creation-skeleton .audience-tl-skeleton-segment,
.audience-target-list-creation-inline-skeleton .audience-tl-skeleton-segment {
    margin-top: 10px;
    padding: 0;
    border: none;
    background: transparent;
    box-shadow: none;
    overflow: visible;
    box-sizing: border-box;
}
.audience-target-list-creation-skeleton .audience-tl-skeleton-segment .skeleton-span-con,
.audience-target-list-creation-inline-skeleton .audience-tl-skeleton-segment .skeleton-span-con {
    padding: 0;
    overflow: visible;
}
.audience-target-list-creation-skeleton .audience-tl-skeleton-segment .tl-segment-create-skeleton__center,
.audience-target-list-creation-inline-skeleton .audience-tl-skeleton-segment .tl-segment-create-skeleton__center {
    display: flex;
}
.audience-target-list-creation-skeleton .audience-tl-skeleton-footer,
.audience-target-list-creation-inline-skeleton .audience-tl-skeleton-footer {
    margin-top: auto;
    padding-top: 28px;
    padding-bottom: 24px;
}
.audience-target-list-creation-skeleton .skeleton-shimmer,
.audience-target-list-creation-inline-skeleton .skeleton-shimmer {
    background-color: #e2e7ee;
}
`;
