/** Breadcrumb strip, tab radius, and portlet/card chrome before app.scss loads. */
export const skeletonShellSharedCriticalCss = `
body:has(.page-breadcrumb-skeleton) .breadcrumbs:not(.page-breadcrumb-skeleton) {
    display: none !important;
}
.page-breadcrumb-breadcrumbs {
    position: fixed;
    top: 60px;
    left: 0;
    right: 0;
    z-index: 1001;
    height: 19px;
    width: 100%;
    background: #f0f0f0;
    box-sizing: border-box;
}
.page-breadcrumb-skeleton .section-padding-x {
    height: 100%;
}
.page-breadcrumb-skeleton .container {
    max-width: 1260px;
    margin-left: auto;
    margin-right: auto;
}
.page-breadcrumb-skeleton .breadcrumb {
    display: flex;
    justify-content: flex-end;
    align-items: center;
    margin: 0;
    padding: 0;
    list-style: none;
    font-size: 11px;
    height: 19px;
}
.page-breadcrumb-skeleton .breadcrumb li {
    position: relative;
    color: #0018f9;
    padding-left: 15px;
}
.page-breadcrumb-skeleton .breadcrumb li.active {
    color: #333;
}
.page-breadcrumb-skeleton .breadcrumb li span {
    display: none;
}
/* Tab strip — match .rs-tabs .tabDefault radius (rst-left-space) */
.tab-bar-view-skeleton .tabDefault,
.pref-de-top-tabs-skeleton .tabDefault,
.pref-de-top-tabs-skeleton__list .tabDefault,
.audience-tabs-skeleton__tab,
.communication-tabs-skeleton__list .tabDefault,
.dashboard-tabs-skeleton__list .tabDefault,
.form-embedAPI .pref-form-generator-publish-skeleton .pref-fg-publish-tabs-skeleton__list .tabDefault,
.form-embedAPI .pref-form-generator-publish-skeleton .tab-bar-view-skeleton__list .tabDefault {
    border-top-left-radius: var(--globalBorderRadius, 5px);
    border-top-right-radius: var(--globalBorderRadius, 5px);
    overflow: visible;
}
/* Skeleton tab strips — no text labels (empty tab blocks only) */
.tab-bar-view-skeleton .tabDefault span,
.audience-tabs-skeleton__tab span,
.dashboard-tabs-skeleton__list .tabDefault span,
.analytics-skeleton-scope .analytics-tabs-skeleton__list .tabDefault span,
.communication-skeleton-scope .communication-tabs-skeleton__list .tabDefault span,
.preferences-subpage-skeleton-scope.communication-settings .pref-cs-top-tabs-skeleton__list .tabDefault span {
    display: none !important;
}
/* Skeleton tabs — neutral grey only (no active blue / caret) */
.tab-bar-view-skeleton .tabDefault,
.tab-bar-view-skeleton .tabDefault.active,
.audience-skeleton-scope .audience-tabs-skeleton__tab,
.audience-skeleton-scope .audience-tabs-skeleton__tab.active,
.audience-skeleton-scope .rs-tabs .tabDefault,
.audience-skeleton-scope .rs-tabs .tabDefault.active,
.dashboard-skeleton-scope .dashboard-tabs-skeleton__tab,
.dashboard-skeleton-scope .dashboard-tabs-skeleton__tab.active,
.dashboard-skeleton-scope .rs-tabs .tabDefault,
.dashboard-skeleton-scope .rs-tabs .tabDefault.active,
.preferences-subpage-skeleton-scope .pref-offer-tabs-skeleton .tabDefault,
.preferences-subpage-skeleton-scope .pref-offer-tabs-skeleton .tabDefault.active,
.preferences-subpage-skeleton-scope .pref-tg-tabs-skeleton .tabDefault,
.preferences-subpage-skeleton-scope .pref-tg-tabs-skeleton .tabDefault.active,
.preferences-subpage-skeleton-scope .pref-tg-tabs-skeleton__tab,
.preferences-subpage-skeleton-scope .pref-tg-tabs-skeleton__tab.active,
.analytics-skeleton-scope .analytics-tabs-skeleton__list .tabDefault,
.analytics-skeleton-scope .analytics-tabs-skeleton__list .tabDefault.active,
.preferences-subpage-skeleton-scope.communication-settings .pref-cs-top-tabs-skeleton__list .tabDefault,
.preferences-subpage-skeleton-scope.communication-settings .pref-cs-top-tabs-skeleton__list .tabDefault.active,
.preferences-subpage-skeleton-scope.pc-data-exchange .pref-de-top-tabs-skeleton__list .tabDefault,
.preferences-subpage-skeleton-scope.pc-data-exchange .pref-de-top-tabs-skeleton__list .tabDefault.active,
.pref-de-tab-content-skeleton-gate.pc-data-exchange .pref-de-top-tabs-skeleton__list .tabDefault,
.pref-de-tab-content-skeleton-gate.pc-data-exchange .pref-de-top-tabs-skeleton__list .tabDefault.active,
.page-content.pc-data-exchange .pref-de-top-tabs-skeleton__list .tabDefault,
.page-content.pc-data-exchange .pref-de-top-tabs-skeleton__list .tabDefault.active,
.communication-skeleton-scope .communication-tabs-skeleton__list .tabDefault,
.communication-skeleton-scope .communication-tabs-skeleton__list .tabDefault.active,
.page-layout-skeleton--inline .pls-tab,
.page-layout-skeleton--inline .pls-tab.is-active,
.communication-creation-skeleton-scope .cc-delivery-skeleton__tab,
.communication-creation-skeleton-scope .cc-delivery-skeleton__tab--active,
.communication-creation-skeleton-scope .communication-creation-delivery-skeleton .delivery-method-tabs-skeleton__tab,
.communication-creation-skeleton-scope .communication-creation-delivery-skeleton .cc-delivery-skeleton__tab--active,
.form-embedAPI .pref-form-generator-publish-skeleton .pref-fg-publish-tabs-skeleton__list .tabDefault,
.form-embedAPI .pref-form-generator-publish-skeleton .tab-bar-view-skeleton__list .tabDefault {
    background: #e2e7ee !important;
    background-color: #e2e7ee !important;
    color: inherit !important;
}
.tab-bar-view-skeleton .tabDefault.active::before,
.audience-skeleton-scope .audience-tabs-skeleton__tab.active::before,
.audience-skeleton-scope .rs-tabs .tabDefault.active::before,
.dashboard-skeleton-scope .dashboard-tabs-skeleton__tab.active::before,
.dashboard-skeleton-scope .rs-tabs .tabDefault.active::before,
.preferences-subpage-skeleton-scope .pref-offer-tabs-skeleton .tabDefault.active::before,
.preferences-subpage-skeleton-scope .pref-tg-tabs-skeleton .tabDefault.active::before,
.preferences-subpage-skeleton-scope .pref-tg-tabs-skeleton__tab.active::before,
.analytics-skeleton-scope .analytics-tabs-skeleton__list .tabDefault.active::before,
.communication-skeleton-scope .communication-tabs-skeleton__list .tabDefault.active::before,
.preferences-subpage-skeleton-scope.communication-settings .pref-cs-top-tabs-skeleton__list .tabDefault.active::before,
.preferences-subpage-skeleton-scope.pc-data-exchange .pref-de-top-tabs-skeleton__list .tabDefault.active::before,
.pref-de-tab-content-skeleton-gate.pc-data-exchange .pref-de-top-tabs-skeleton__list .tabDefault.active::before,
.page-content.pc-data-exchange .pref-de-top-tabs-skeleton__list .tabDefault.active::before,
.preferences-subpage-skeleton-scope.pc-data-exchange .pref-de-vertical-tabs li.tabDefault::after,
.preferences-subpage-skeleton-scope.pc-data-exchange .pref-de-vertical-tabs li.tabDefault.active::after,
.pref-de-tab-content-skeleton-gate.pc-data-exchange .pref-de-vertical-tabs li.tabDefault::after,
.pref-de-tab-content-skeleton-gate.pc-data-exchange .pref-de-vertical-tabs li.tabDefault.active::after,
.page-content.dataExchangePageCSS .pref-de-vertical-tabs li.tabDefault::after,
.page-content.dataExchangePageCSS .pref-de-vertical-tabs li.tabDefault.active::after,
.page-layout-skeleton--inline .pls-tab.is-active:before,
.communication-creation-skeleton-scope .cc-delivery-skeleton__tab--active::before,
.communication-creation-skeleton-scope .communication-creation-delivery-skeleton .cc-delivery-skeleton__tab--active::before,
    display: none !important;
    content: none !important;
    border: none !important;
}
.audience-skeleton-scope .audience-tabs-skeleton__tab.active span,
.audience-skeleton-scope .rs-tabs .tabDefault.active span,
.communication-skeleton-scope .communication-tabs-skeleton__list .tabDefault.active span {
    color: #333 !important;
}
.page-layout-skeleton--inline .pls-tab.is-active .pls-tab-label {
    background: #c5ced8 !important;
}
.communication-creation-skeleton-scope .cc-delivery-skeleton__tab--active .skeleton-shimmer,
.communication-creation-skeleton-scope .communication-creation-delivery-skeleton .cc-delivery-skeleton__tab--active .skeleton-shimmer {
    background-color: #e2e7ee !important;
}
/* MDM / portlet cards — visible on page bg (#f5f7fc) before app.scss */
.audience-skeleton-scope .box-design,
.audience-skeleton-scope .portlet-container,
.dashboard-skeleton-scope .box-design,
.dashboard-skeleton-scope .portlet-container,
.communication-skeleton-scope .box-design,
.communication-skeleton-scope .portlet-container {
    background: #fff;
    border: 1px solid #c2cfe3;
    border-radius: var(--globalBorderRadius, 5px);
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.08);
    box-sizing: border-box;
}
.audience-skeleton-scope .page-content-holder,
.audience-skeleton-scope .audience-page-shell-skeleton__content,
.audience-skeleton-scope .audience-suspense-fallback,
.dashboard-skeleton-scope .page-content-holder,
.dashboard-skeleton-scope .dashboard-page-shell-skeleton__content,
.communication-skeleton-scope .page-content-holder,
.communication-skeleton-scope .pc-tabs-wrapper .page-content {
    background-color: #f5f7fc;
}
.audience-skeleton-scope .audience-page-header-skeleton,
.dashboard-skeleton-scope .dashboard-page-header-skeleton,
.communication-skeleton-scope .communication-page-header-skeleton,
.analytics-skeleton-scope .analytics-page-header-skeleton,
.rs-page-header-skeleton {
    padding-top: 0;
    padding-bottom: 0;
    box-sizing: border-box;
    cursor: not-allowed;
}
.rs-page-header-skeleton .skeleton-page-header-bar {
    display: inline-block;
    vertical-align: middle;
    background-color: #e2e7ee;
    border-radius: 4px;
    box-sizing: border-box;
    flex-shrink: 0;
    cursor: not-allowed;
    pointer-events: auto;
}
.rs-page-header-skeleton .skeleton-page-header-bar--circle {
    border-radius: 50%;
}
.rs-page-header-skeleton .heading-title-text {
    display: flex;
    align-items: center;
}
.audience-skeleton-scope .rs-page-header-skeleton .heading-title-text h1,
.dashboard-skeleton-scope .rs-page-header-skeleton .heading-title-text h1,
.communication-skeleton-scope .rs-page-header-skeleton .heading-title-text h1,
.analytics-skeleton-scope .rs-page-header-skeleton .heading-title-text h1,
.rs-page-header-skeleton .heading-title-text h1,
.rs-page-header-skeleton .repo-title {
    margin: 0;
    padding: 0;
    line-height: 1;
}
.rs-page-header-skeleton .mhwc-left,
.rs-page-header-skeleton .mhwc-right {
    display: flex;
    align-items: center;
}
.audience-skeleton-scope .main-heading-wrapper .mhw-container.container,
.dashboard-skeleton-scope .main-heading-wrapper .mhw-container.container,
.communication-skeleton-scope .main-heading-wrapper .mhw-container.container,
.analytics-skeleton-scope .main-heading-wrapper .mhw-container.container,
.analytics-report-skeleton-scope .main-heading-wrapper .mhw-container.container {
    max-width: 1260px;
    padding-left: 0;
    padding-right: 0;
    display: flex;
    align-items: center;
    justify-content: space-between;
    min-height: 45px;
    padding-top: 10px;
    padding-bottom: 10px;
    box-sizing: border-box;
}
.analytics-skeleton-scope .pc-tabs-wrapper,
.communication-skeleton-scope .pc-tabs-wrapper,
.audience-skeleton-scope .audience-page-shell-skeleton__content {
    margin-top: 0;
}
.analytics-skeleton-scope .pc-tabs-wrapper .page-content,
.communication-skeleton-scope .pc-tabs-wrapper .page-content {
    padding-top: 0;
    margin-top: 0;
}
.audience-skeleton-scope .mdm-overview-col-cards .box-design {
    background: #fff;
}
/* TabBarViewSkeleton — match RSTabbarFluid (fullWhiteBackground > .container > tabs) */
.tab-bar-view-skeleton__container,
[class*='tabs-skeleton__container'],
[class*='top-tabs-skeleton__container'] {
    max-width: 1260px;
    width: 100%;
    margin-left: auto;
    margin-right: auto;
    padding-left: 0 !important;
    padding-right: 0 !important;
    box-sizing: border-box;
}
.tab-bar-view-skeleton,
[class*='-tabs-skeleton'].mb0,
.fullWhiteBackground[class*='tabs-skeleton'],
.fullWhiteBackground[class*='top-tabs-skeleton'] {
    width: 100%;
    max-width: 100%;
    margin-left: 0;
    margin-right: 0;
    box-sizing: border-box;
}
.tab-bar-view-skeleton__list,
[class*='tabs-skeleton__list'],
[class*='top-tabs-skeleton__list'] {
    display: flex;
    flex-wrap: nowrap;
    width: 100%;
    margin: 0;
    padding: 0;
    list-style: none;
    box-sizing: border-box;
}
/* Shells that wrapped TabBarView in an extra bootstrap Container (duplicate gutter) */
.dashboard-skeleton-scope .page-content .fullWhiteBackground > .container:not(.px0):not(.mhw-container),
.communication-skeleton-scope .fullWhiteBackground > .container:not(.px0):not(.mhw-container),
.audience-skeleton-scope .fullWhiteBackground > .container:not(.px0):not(.mhw-container),
.analytics-skeleton-scope .fullWhiteBackground > .container:not(.px0):not(.mhw-container),
.analytics-skeleton-scope .fullWhiteBackground.analytics-tabs-skeleton > .container:not(.px0),
.audience-skeleton-scope .fullWhiteBackground > .container:not(.px0):not(.mhw-container),
.audience-skeleton-scope .fullWhiteBackground.audience-tabs-skeleton > .container:not(.px0) {
    max-width: 1260px;
    width: 100%;
    margin-left: auto;
    margin-right: auto;
    padding-left: 0 !important;
    padding-right: 0 !important;
    box-sizing: border-box;
}
`;
