/** Form Generator publish modal — injected in RSModal before app.scss tab styles load. */
export const formGeneratorPublishModalSkeletonCriticalCss = `
.form-embedAPI .pref-form-generator-publish-skeleton .pref-fg-publish-tabs-skeleton__list {
    display: flex;
    flex-wrap: nowrap;
    width: 100%;
    list-style: none;
    margin: 0;
    padding: 0;
}
.form-embedAPI .pref-form-generator-publish-skeleton .pref-fg-publish-tabs-skeleton__list .tabDefault {
    min-height: 41px;
    flex: 1 1 0;
    box-sizing: border-box;
    padding: 0;
    background: transparent !important;
    border-left: 3px solid #f5f7fc;
}
.form-embedAPI .pref-form-generator-publish-skeleton .pref-fg-publish-tabs-skeleton__list .tabDefault:first-child {
    border-left: none;
}
.form-embedAPI .pref-form-generator-publish-skeleton .col-sm-3.tabDefault {
    max-width: 25%;
}
.form-embedAPI .pref-form-generator-publish-skeleton .col-sm-4.tabDefault {
    max-width: 33.333333%;
}
.form-embedAPI .pref-form-generator-publish-skeleton .pref-fg-publish-url-row {
    gap: 0;
}
.form-embedAPI .pref-form-generator-publish-skeleton .pref-fg-publish-url-field {
    min-width: 0;
    padding-bottom: 8px;
}
`;

/** Preference landing card grid — mirrors _preferences.scss before app.scss loads. */
export const preferencesSkeletonCriticalCss = `
.page-content-holder.preferences-skeleton-scope.page-layout-skeleton--inline,
.page-content-holder.preferences-subpage-skeleton-scope.page-layout-skeleton--inline,
.page-content-holder.preferences-route-skeleton {
    padding-top: 78px;
    margin: 0;
    width: 100%;
    max-width: 100%;
    box-sizing: border-box;
}
.preferences-skeleton-scope .main-heading-wrapper.container-fluid {
    box-sizing: border-box;
}
.preferences-skeleton-scope .main-heading-wrapper .mhw-container.container {
    max-width: 1260px;
    margin-left: auto;
    margin-right: auto;
    padding-left: 0;
    padding-right: 0;
    box-sizing: border-box;
}
.preferences-skeleton-scope.page-content-holder > .container-fluid:not(.main-heading-wrapper),
.preferences-skeleton-scope > .container.px0,
.preferences-skeleton-scope .page-content > .container.px0,
.preferences-skeleton-scope.pls-content > .container.px0,
.page-content-holder.preferences-skeleton-scope.page-layout-skeleton--inline .preferences-skeleton-scope.pls-content > .container.px0 {
    max-width: 1260px;
    margin-left: auto;
    margin-right: auto;
    width: 100%;
    box-sizing: border-box;
    padding-left: 0;
    padding-right: 0;
}
.page-content-holder.preferences-skeleton-scope.page-layout-skeleton--inline > div > .preferences-skeleton-scope.pls-content {
    width: 100%;
    box-sizing: border-box;
}
.preferences-skeleton-scope .pref-card {
    margin-bottom: 20px;
}
.preferences-skeleton-scope .pref-card:last-child {
    margin-bottom: 0;
}
.preferences-skeleton-scope .pref-card .pref-section-title {
    margin: 0 0 10px;
    display: block;
}
.preferences-skeleton-scope .pref-sk-section-title-bar {
    width: 120px;
    height: 18px;
    flex-shrink: 0;
    box-sizing: border-box;
}
.preferences-skeleton-scope .pref-sk-item-title-bar {
    width: 72%;
    height: 16px;
    flex-shrink: 0;
    box-sizing: border-box;
}
.preferences-skeleton-scope .pref-sk-item-desc-bar {
    width: 88%;
    height: 13px;
    flex-shrink: 0;
    box-sizing: border-box;
}
.preferences-skeleton-scope .pp-row {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
    list-style: none;
    padding: 0;
    margin: 0;
    min-height: 100px;
    background-color: transparent;
}
.preferences-skeleton-scope .pp-row li {
    width: calc(33.333% - 8px);
    min-width: 0;
    padding: 0;
    margin: 0;
    display: block;
    animation: none !important;
}
.preferences-skeleton-scope .pref-skeleton-card {
    display: flex;
    align-items: center;
    min-height: 95px;
    border: 1px solid #c2cfe3;
    border-radius: 5px;
    background: #fff;
    padding: 12px 17px;
    box-sizing: border-box;
}
.preferences-skeleton-scope .pref-skeleton-card .pref-item-content {
    display: flex;
    align-items: center;
    gap: 12px;
    width: 100%;
    min-width: 0;
}
.preferences-skeleton-scope .pref-skeleton-card .pref-icon {
    width: 44px;
    height: 44px;
    border-radius: 10px;
    flex-shrink: 0;
    background: #e2e7ee;
    border: 1px solid #d4e8f7;
}
.preferences-skeleton-scope .pref-skeleton-card .pref-item-text {
    display: flex;
    flex-direction: column;
    gap: 8px;
    flex: 1;
    min-width: 0;
}
.preferences-subpage-skeleton-scope .pref-subpage-skeleton-panel {
    margin-top: 0;
    padding: 20px 24px;
    min-height: 360px;
}
.preferences-subpage-skeleton-scope .pref-subpage-form-row {
    margin-bottom: 20px;
}
.preferences-subpage-skeleton-scope .pref-subpage-skeleton-panel__block {
    width: 100%;
    height: 200px;
    border-radius: 4px;
    margin-top: 8px;
}
.preferences-subpage-skeleton-scope .page-content.pc-my-profile {
    box-sizing: border-box;
}
.page-content-holder > .container-fluid:has(> .page-content.pc-my-profile),
.container-fluid:has(> .page-content.pc-my-profile) {
    --bs-gutter-x: 1.5rem;
    padding-right: calc(var(--bs-gutter-x) * 0.5);
    padding-left: calc(var(--bs-gutter-x) * 0.5);
    box-sizing: border-box;
}
.preferences-subpage-skeleton-scope .page-content.pc-my-profile > .container.px0 {
    max-width: 1260px;
    margin-left: auto;
    margin-right: auto;
    width: 100%;
    padding-left: 0;
    padding-right: 0;
    box-sizing: border-box;
}
.preferences-subpage-skeleton-scope.pref-subpage-skeleton-gate-host,
.preferences-subpage-skeleton-scope.pref-my-profile-skeleton-host {
    display: contents;
}
.preferences-subpage-skeleton-scope .pref-subpage-header-rs-page-header-main-heading-wrapper {
    --bs-gutter-x: 1.5rem;
    padding: 0 calc(var(--bs-gutter-x) * 0.5);
    box-sizing: border-box;
}
.preferences-subpage-skeleton-scope .pref-subpage-header-rs-page-header-skeleton .mhw-container {
    margin-top: 0 !important;
    padding: 10px 0;
    min-height: 45px;
    align-items: flex-end !important;
    box-sizing: border-box;
}
.preferences-subpage-skeleton-scope .pref-subpage-header-rs-page-header-skeleton .mhw-container .mhwc-left,
.preferences-subpage-skeleton-scope .pref-subpage-header-rs-page-header-skeleton .mhw-container .mhwc-right {
    align-items: flex-end;
}
.preferences-subpage-skeleton-scope .pref-subpage-header-rs-page-header-skeleton .heading-title-text h1 {
    margin: 0;
    padding: 0;
    line-height: 1;
    min-height: 32px;
}
.preferences-subpage-skeleton-scope .pref-subpage-header-rs-page-header-skeleton .skeleton-page-header-bar {
    display: block;
    vertical-align: unset;
    background-color: #e2e7ee;
}
.preferences-subpage-skeleton-scope .pref-subpage-header-rs-page-header-skeleton .skeleton-page-header-bar::after {
    display: none !important;
    content: none !important;
    animation: none !important;
}
.preferences-subpage-skeleton-scope .pref-my-profile-skeleton-panel {
    padding: 41px 19px !important;
    min-height: 420px;
    box-sizing: border-box;
    background: #fff;
    border: 1px solid #c2cfe3;
    border-radius: var(--globalBorderRadius, 5px);
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.08);
}
.preferences-subpage-skeleton-scope .pref-my-profile-skeleton-panel .row {
    --bs-gutter-x: 1.9rem;
}
.preferences-subpage-skeleton-scope .pref-my-profile-skeleton-panel.rs-box-min-height .box-left-border {
    min-height: 290px;
}
.preferences-subpage-skeleton-scope .pref-my-profile-skeleton-panel .pref-sk-avatar-col {
    padding-top: 0;
}
.preferences-subpage-skeleton-scope .pref-my-profile-skeleton-panel .accountsetup-image-upload {
    padding-left: 26px;
    padding-right: 30px;
    box-sizing: border-box;
}
.preferences-subpage-skeleton-scope .pref-my-profile-skeleton-panel .accountsetup-contact-info.box-left-border {
    border-left: 1px solid #e9e9e9;
    padding-left: 30px;
    padding-right: 30px;
    box-sizing: border-box;
}
@media (max-width: 767px) {
    .preferences-subpage-skeleton-scope .pref-my-profile-skeleton-panel .accountsetup-contact-info.box-left-border {
        border-left: none;
        padding-left: 12px;
        margin-top: 16px;
    }
}
.preferences-subpage-skeleton-scope .pref-my-profile-sk-bar {
    background-color: #e2e7ee;
    display: block;
    box-sizing: border-box;
    border-radius: 4px;
    flex-shrink: 0;
}
.preferences-subpage-skeleton-scope .pref-my-profile-sk-avatar {
    width: 120px;
    height: 120px;
    border-radius: 50%;
    flex-shrink: 0;
}
.preferences-subpage-skeleton-scope .pref-my-profile-sk-section-title {
    width: 140px;
    height: 20px;
}
.preferences-subpage-skeleton-scope .pref-my-profile-sk-section-title.pref-sk-section-title--second {
    width: 160px;
}
.preferences-subpage-skeleton-scope .pref-my-profile-sk-input {
    width: 100%;
    height: 32px;
}
.preferences-subpage-skeleton-scope .pref-sk-title-first-row .pref-my-profile-sk-input,
.preferences-subpage-skeleton-scope .pref-sk-country-row .pref-my-profile-sk-input,
.preferences-subpage-skeleton-scope .pref-sk-mobile-input-col .pref-my-profile-sk-input {
    display: block;
}
.preferences-subpage-skeleton-scope .pref-my-profile-sk-link {
    display: block;
    width: 130px;
    height: 10px;
    margin-left: auto;
    margin-top: 6px;
}
.preferences-subpage-skeleton-scope .pref-my-profile-sk-link--sm {
    width: 110px;
}
.preferences-subpage-skeleton-scope .pref-my-profile-sk-checkbox {
    width: 120px;
    height: 18px;
}
.preferences-subpage-skeleton-scope .pref-my-profile-sk-btn--cancel {
    width: 72px;
    height: 40px;
    flex-shrink: 0;
}
.preferences-subpage-skeleton-scope .pref-my-profile-sk-btn--save {
    width: 88px;
    height: 40px;
    flex-shrink: 0;
}
.preferences-subpage-skeleton-scope .pref-subpage-skeleton-panel--no-data {
    position: relative;
    min-height: 360px;
}
.preferences-subpage-skeleton-scope .pref-subpage-no-data-overlay {
    position: absolute;
    inset: 0;
    z-index: 20;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 24px;
    box-sizing: border-box;
    background: transparent;
    pointer-events: none;
}
.preferences-subpage-skeleton-scope .pref-subpage-no-data-overlay .pref-subpage-nodata-bar.nodata-bar,
.preferences-subpage-skeleton-scope .pref-subpage-no-data-overlay .nodata-bar.nodata-skeleton-con {
    position: static;
    left: auto;
    top: auto;
    transform: none;
    padding: 5px 10px;
    border-radius: 7px;
    background-color: #ffffff;
    white-space: normal;
    text-align: center;
    pointer-events: auto;
}
.preferences-subpage-skeleton-scope .pref-subpage-no-data-overlay .pref-subpage-nodata-bar p,
.preferences-subpage-skeleton-scope .pref-subpage-no-data-overlay .nodata-bar.nodata-skeleton-con p {
    white-space: normal;
    font-size: 17px;
    line-height: 1.4;
    justify-content: center;
}
.preferences-subpage-skeleton-scope .pref-subpage-skeleton-panel--no-data {
    position: relative;
    min-height: 420px;
}
.preferences-subpage-skeleton-scope .pref-account-settings-skeleton-panel.pref-subpage-skeleton-panel--no-data {
    min-height: 520px;
}
.preferences-subpage-skeleton-scope .pref-my-profile-skeleton-panel.pref-subpage-skeleton-panel--no-data {
    min-height: 480px;
}
.preferences-subpage-skeleton-scope .pref-users-add-edit-pref-subpage-skeleton-panel--no-data {
    position: relative;
    min-height: 0;
}
@keyframes prefUsersAddEditSkShimmer {
    0% { left: -100%; }
    100% { left: 100%; }
}
.preferences-subpage-skeleton-scope .pref-users-add-edit-sk-bar {
    background-color: #e2e7ee;
    display: block;
    box-sizing: border-box;
    border-radius: 4px;
    flex-shrink: 0;
}
.preferences-subpage-skeleton-scope .pref-users-add-edit-sk-bar:not(.pref-users-add-edit-sk-bar--static) {
    position: relative;
    overflow: hidden;
    transform: translateZ(0);
    backface-visibility: hidden;
}
.preferences-subpage-skeleton-scope .pref-users-add-edit-sk-bar:not(.pref-users-add-edit-sk-bar--static)::after {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.4) 50%, transparent 100%);
    animation: prefUsersAddEditSkShimmer 1.5s ease-in-out infinite;
    pointer-events: none;
    z-index: 1;
    will-change: left;
}
.preferences-subpage-skeleton-scope .pref-users-add-edit-sk-bar--static::after,
.preferences-subpage-skeleton-scope .pref-users-add-edit-pref-subpage-skeleton-panel--no-data .pref-users-add-edit-sk-bar::after {
    display: none !important;
    animation: none !important;
    content: none !important;
}
.preferences-subpage-skeleton-scope .pref-users-add-edit-sk-bar--static,
.preferences-subpage-skeleton-scope .pref-users-add-edit-pref-subpage-skeleton-panel--no-data .pref-users-add-edit-sk-bar {
    background-color: #dce3ec;
}
.preferences-subpage-skeleton-scope .pref-users-add-edit-sk-input {
    width: 100%;
    height: 24px;
}
.preferences-subpage-skeleton-scope .pref-users-add-edit-skeleton .pref-users-add-edit-sk-input,
.preferences-subpage-skeleton-scope .pref-users-add-edit-skeleton .pref-sk-input-bar {
    display: block;
}
.preferences-subpage-skeleton-scope .pref-users-add-edit-sk-toolbar-link {
    width: 88px;
    height: 16px;
    margin-left: auto;
}
.preferences-subpage-skeleton-scope .pref-sk-users-add-toolbar .fr {
    display: flex;
    justify-content: flex-end;
    width: 100%;
}
.preferences-subpage-skeleton-scope .pref-users-add-edit-sk-welcome {
    width: 100%;
    height: 98px;
}
.preferences-subpage-skeleton-scope .pref-users-add-edit-sk-password-hint {
    width: 120px;
    height: 15px;
    margin-top: 6px;
    border-radius: 4px;
}
.preferences-subpage-skeleton-scope .pref-users-add-edit-sk-checkbox {
    width: 15px;
    height: 15px;
    flex-shrink: 0;
}
.preferences-subpage-skeleton-scope .pref-users-add-edit-sk-checkbox-label {
    width: 140px;
    height: 14px;
}
.preferences-subpage-skeleton-scope .pref-users-add-edit-sk-btn {
    width: 100px;
    height: 40px;
    flex-shrink: 0;
}
.preferences-subpage-skeleton-scope .pref-users-add-edit-skeleton .pref-sk-checkbox-row {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 8px;
}
.preferences-subpage-skeleton-scope .pref-users-add-edit-skeleton .pref-sk-field--input-only {
    margin-bottom: 0;
    min-height: 40px;
}
.preferences-subpage-skeleton-scope .pref-users-add-edit-skeleton .pref-sk-field--welcome {
    min-height: 98px;
}
.preferences-subpage-skeleton-scope .pref-users-add-edit-skeleton .pref-sk-mobile-field {
    min-height: 40px;
    margin-bottom: 16px;
}
.preferences-subpage-skeleton-scope .pref-users-add-edit-skeleton .pref-sk-mobile-field > .col-sm-2 {
    flex: 0 0 auto;
    width: 16.666667%;
    max-width: 16.666667%;
    padding-right: 8px;
}
.preferences-subpage-skeleton-scope .pref-users-add-edit-skeleton .pref-sk-mobile-field > .col:not(.col-sm-2) {
    flex: 1 1 0;
    min-width: 0;
}
.preferences-subpage-skeleton-scope .pref-users-add-edit-skeleton .pref-sk-password-field {
    min-height: 45px;
}
.preferences-subpage-skeleton-scope .pref-users-add-edit-skeleton .pref-sk-password-hint {
    display: block;
}
.preferences-subpage-skeleton-scope .pref-sk-users-add-actions.pref-sk-buttons {
    margin-top: 21px;
    text-align: right;
}
.preferences-subpage-skeleton-scope .pref-subpage-skeleton-panel--no-data .pref-sk-panel-body {
    opacity: 1;
    pointer-events: none;
}
.preferences-subpage-skeleton-scope .pref-subpage-skeleton-panel--no-data .react-loading-skeleton {
    --base-color: #dce3ec;
    --highlight-color: #dce3ec;
    opacity: 1;
}
.preferences-subpage-skeleton-scope .pref-subpage-skeleton-panel--no-data .pref-sk-avatar .react-loading-skeleton {
    --base-color: #d0d8e4;
    --highlight-color: #d0d8e4;
}
.preferences-subpage-skeleton-scope .pref-subpage-no-data-overlay {
    position: absolute;
    inset: 0;
    z-index: 20;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 24px;
    box-sizing: border-box;
    background: transparent;
    pointer-events: none;
}
.preferences-subpage-skeleton-scope .pref-subpage-no-data-overlay .pref-subpage-nodata-bar.nodata-bar,
.preferences-subpage-skeleton-scope .pref-subpage-no-data-overlay .nodata-bar.nodata-skeleton-con {
    position: static;
    left: auto;
    top: auto;
    transform: none;
    padding: 5px 10px;
    border-radius: 7px;
    background-color: #ffffff;
    white-space: normal;
    text-align: center;
    pointer-events: auto;
}
.preferences-subpage-skeleton-scope .pref-subpage-no-data-overlay .pref-subpage-nodata-bar p,
.preferences-subpage-skeleton-scope .pref-subpage-no-data-overlay .nodata-bar.nodata-skeleton-con p {
    white-space: normal;
    font-size: 17px;
    line-height: 1.4;
    justify-content: center;
}
.preferences-subpage-skeleton-scope .pref-subpage-skeleton--no-data .pref-sk-buttons .react-loading-skeleton,
.preferences-subpage-skeleton-scope .pref-subpage-skeleton--no-data .pref-my-profile-sk-bar {
    --base-color: #dce3ec;
    --highlight-color: #dce3ec;
    background-color: #dce3ec;
}
.preferences-subpage-skeleton-scope .pref-sk-field--input-only {
    margin-bottom: 0;
    min-height: 48px;
}
.preferences-subpage-skeleton-scope .pref-sk-field--with-link {
    margin-bottom: 0;
    min-height: 58px;
}
.preferences-subpage-skeleton-scope .pref-sk-action-link {
    display: block;
    margin-left: auto;
    margin-top: 6px;
}
.preferences-subpage-skeleton-scope .pref-sk-mobile-field {
    min-height: 58px;
}
.preferences-subpage-skeleton-scope .pref-sk-mobile-input-col {
    flex: 1 1 0;
    min-width: 0;
    padding-left: 0;
}
.preferences-subpage-skeleton-scope .pref-sk-title-first-row,
.preferences-subpage-skeleton-scope .pref-sk-country-row {
    width: 100%;
    margin-bottom: 0;
    min-height: 48px;
}
.preferences-subpage-skeleton-scope .pref-sk-title-first-row .pref-sk-input-bar,
.preferences-subpage-skeleton-scope .pref-sk-country-row .pref-sk-input-bar {
    display: block;
}
.preferences-subpage-skeleton-scope .accountsetup-contact-info .row > [class*='col-'] {
    margin-bottom: 0;
}
.preferences-subpage-skeleton-scope .pref-sk-avatar-col {
    display: flex;
    justify-content: center;
    align-items: flex-start;
    padding-top: 8px;
}
.preferences-subpage-skeleton-scope .pref-sk-avatar {
    display: block;
}
.preferences-subpage-skeleton-scope .pref-sk-section-title {
    display: block;
    margin: 0 0 16px;
}
.preferences-subpage-skeleton-scope .pref-sk-section-title--second {
    margin-top: 8px;
}
.preferences-subpage-skeleton-scope .pref-sk-field {
    margin-bottom: 16px;
}
.preferences-subpage-skeleton-scope .pref-sk-label {
    margin-bottom: 6px;
    display: block;
}
.preferences-subpage-skeleton-scope .accountsetup-contact-info.box-left-border {
    border-left: 1px solid #e9e9e9;
    padding-left: 30px;
    padding-right: 30px;
    box-sizing: border-box;
}
@media (max-width: 767px) {
    .preferences-subpage-skeleton-scope .accountsetup-contact-info.box-left-border {
        border-left: none;
        padding-left: 12px;
        margin-top: 16px;
    }
}
.preferences-subpage-skeleton-scope .pref-sk-buttons {
    margin-top: 21px;
    text-align: right;
}
.preferences-subpage-skeleton-scope .pref-sk-buttons .d-flex {
    justify-content: flex-end;
    gap: 12px;
}
.preferences-subpage-skeleton-scope .pref-account-settings-skeleton-panel {
    padding: 40px 24px;
    box-sizing: border-box;
}
.preferences-subpage-skeleton-scope .pref-sk-field--input-only {
    margin-bottom: 0;
    min-height: 48px;
}
.preferences-subpage-skeleton-scope .pref-sk-field--regions {
    min-height: 58px;
    margin-bottom: 0;
}
.preferences-subpage-skeleton-scope .pref-sk-bu-banner {
    display: block;
    border-radius: 4px;
}
.preferences-subpage-skeleton-scope .pref-sk-region-pills {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 8px;
    min-height: 32px;
    margin-bottom: 8px;
}
.preferences-subpage-skeleton-scope .pref-sk-region-pill {
    border-radius: 12px;
    flex-shrink: 0;
}
.preferences-subpage-skeleton-scope .pref-sk-region-check {
    width: 100%;
    max-width: 220px;
    margin-top: 4px;
}
.preferences-subpage-skeleton-scope .pref-sk-bu-heading {
    margin: 20px 0 16px;
    display: block;
}
.preferences-subpage-skeleton-scope .pref-sk-bu-row {
    margin-bottom: 24px;
}
.preferences-subpage-skeleton-scope .pref-sk-bu-actions {
    padding-top: 6px;
}
.preferences-subpage-skeleton-scope .pref-sk-users-context {
    margin: 0 0 8px;
}
.preferences-subpage-skeleton-scope .pref-sk-users-toolbar {
    margin-bottom: var(--pageButtonTopSpace, 21px);
    min-height: 32px;
    align-items: center;
}
.preferences-subpage-skeleton-scope .pref-users-add-edit-skeleton {
    width: 100%;
    box-sizing: border-box;
}
.preferences-subpage-skeleton-scope .pref-sk-users-add-toolbar {
    min-height: 24px;
}
.preferences-subpage-skeleton-scope .pref-sk-checkbox-row {
    margin-bottom: 8px;
}
.pref-ad-user-skeleton {
    width: 100%;
    box-sizing: border-box;
}
.pref-ad-user-skeleton .buttons-holder {
    margin-top: 0;
}
.preferences-subpage-skeleton-scope .pref-roles-perm-edit-skeleton-wrap.pref-subpage-skeleton-panel--no-data {
    position: relative;
    min-height: 480px;
}
.preferences-subpage-skeleton-scope .pref-roles-perm-edit-skeleton-wrap .pref-sk-panel-body {
    min-height: 400px;
}
@keyframes prefRolesPermSkShimmer {
    0% { left: -100%; }
    100% { left: 100%; }
}
.preferences-subpage-skeleton-scope .pref-roles-perm-sk-bar {
    background-color: #e2e7ee;
    display: block;
    box-sizing: border-box;
    border-radius: 4px;
    flex-shrink: 0;
}
.preferences-subpage-skeleton-scope .pref-roles-perm-sk-bar:not(.pref-roles-perm-sk-bar--static) {
    position: relative;
    overflow: hidden;
    transform: translateZ(0);
    backface-visibility: hidden;
}
.preferences-subpage-skeleton-scope .pref-roles-perm-sk-bar:not(.pref-roles-perm-sk-bar--static)::after {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.4) 50%, transparent 100%);
    animation: prefRolesPermSkShimmer 1.5s ease-in-out infinite;
    pointer-events: none;
    z-index: 1;
    will-change: left;
}
.preferences-subpage-skeleton-scope .pref-roles-perm-sk-bar--static::after,
.preferences-subpage-skeleton-scope .pref-roles-perm-edit-skeleton-wrap.pref-subpage-skeleton-panel--no-data .pref-roles-perm-sk-bar::after {
    display: none !important;
    animation: none !important;
    content: none !important;
}
.preferences-subpage-skeleton-scope .pref-roles-perm-sk-bar--static,
.preferences-subpage-skeleton-scope .pref-roles-perm-edit-skeleton-wrap.pref-subpage-skeleton-panel--no-data .pref-roles-perm-sk-bar {
    background-color: #dce3ec;
}
.preferences-subpage-skeleton-scope .pref-roles-perm-edit-skeleton-wrap .form-group .col-sm-5 {
    display: flex;
    justify-content: flex-end;
}
.preferences-subpage-skeleton-scope .pref-roles-perm-sk-label {
    width: 80px;
    height: 14px;
}
.preferences-subpage-skeleton-scope .pref-roles-perm-sk-input {
    width: 100%;
    height: 32px;
}
.preferences-subpage-skeleton-scope .pref-roles-permissions-table-skeleton {
    margin-top: 20px;
    background-color: #ffffff;
    border: 1px solid #c2cfe3;
    border-radius: var(--globalBorderRadius, 10px);
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.08);
    padding: 0 !important;
    overflow: hidden;
}
.preferences-subpage-skeleton-scope .pref-roles-permissions-table-skeleton table {
    width: 100%;
    border-collapse: collapse;
    table-layout: fixed;
    border: 0;
}
.preferences-subpage-skeleton-scope .pref-roles-permissions-table-skeleton thead,
.preferences-subpage-skeleton-scope .pref-roles-permissions-table-skeleton tbody {
    border: 0;
}
.preferences-subpage-skeleton-scope .pref-roles-permissions-table-skeleton thead th {
    background-color: #0043ff !important;
    color: #ffffff;
    padding: 10px 16px;
    border: 0;
    font-weight: normal;
    font-size: 14px;
    vertical-align: middle;
}
.preferences-subpage-skeleton-scope .pref-roles-permissions-table-skeleton thead th:first-child {
    width: 40%;
    text-align: left;
}
.preferences-subpage-skeleton-scope .pref-roles-permissions-table-skeleton thead th:last-child {
    text-align: right;
}
.preferences-subpage-skeleton-scope .pref-roles-permissions-table-skeleton thead th .ml5 {
    color: #ffffff;
}
.preferences-subpage-skeleton-scope .pref-sk-perm-check-all {
    display: inline-flex;
    align-items: center;
    justify-content: flex-end;
}
.preferences-subpage-skeleton-scope .pref-sk-perm-check-all .ml5 {
    margin-left: 5px;
    color: #ffffff;
    font-size: 14px;
    line-height: 1;
}
.preferences-subpage-skeleton-scope .pref-roles-perm-sk-checkbox--header {
    width: 15px;
    height: 15px;
    background-color: rgba(255, 255, 255, 0.35);
}
.preferences-subpage-skeleton-scope .pref-roles-perm-sk-checkbox--header:not(.pref-roles-perm-sk-bar--static)::after {
    background: linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.55) 50%, transparent 100%);
}
.preferences-subpage-skeleton-scope .pref-roles-perm-sk-checkbox--header.pref-roles-perm-sk-bar--static,
.preferences-subpage-skeleton-scope .pref-roles-perm-edit-skeleton-wrap.pref-subpage-skeleton-panel--no-data .pref-roles-perm-sk-checkbox--header {
    background-color: rgba(255, 255, 255, 0.35);
}
.preferences-subpage-skeleton-scope .pref-roles-permissions-table-skeleton tbody td {
    padding: 10px 16px;
    border: 0;
    border-bottom: 1px solid #c2cfe3;
    vertical-align: middle;
    font-size: 14px;
}
.preferences-subpage-skeleton-scope .pref-roles-permissions-table-skeleton tbody tr:nth-child(odd) td {
    background-color: #ffffff;
}
.preferences-subpage-skeleton-scope .pref-roles-permissions-table-skeleton tbody tr:nth-child(even) td {
    background-color: #f0f8ff;
}
.preferences-subpage-skeleton-scope .pref-roles-permissions-table-skeleton tbody tr:last-child td {
    border-bottom: 0;
}
.preferences-subpage-skeleton-scope .pref-sk-perm-crud-cell {
    display: inline-flex;
    align-items: center;
    white-space: nowrap;
}
.preferences-subpage-skeleton-scope .pref-roles-perm-sk-title {
    height: 14px;
}
.preferences-subpage-skeleton-scope .pref-roles-perm-sk-title--0 {
    width: 50%;
}
.preferences-subpage-skeleton-scope .pref-roles-perm-sk-title--1 {
    width: 58%;
}
.preferences-subpage-skeleton-scope .pref-roles-perm-sk-title--2 {
    width: 66%;
}
.preferences-subpage-skeleton-scope .pref-roles-perm-sk-title--3 {
    width: 74%;
}
.preferences-subpage-skeleton-scope .pref-roles-perm-sk-checkbox {
    width: 15px;
    height: 15px;
}
.preferences-subpage-skeleton-scope .pref-roles-perm-sk-crud-label--short {
    width: 36px;
    height: 12px;
    margin-left: 5px;
}
.preferences-subpage-skeleton-scope .pref-roles-perm-sk-crud-label--long {
    width: 52px;
    height: 12px;
    margin-left: 5px;
}
.preferences-subpage-skeleton-scope .pref-sk-roles-perm-actions {
    margin-top: 21px;
    display: flex;
    justify-content: flex-end;
 
}
.preferences-subpage-skeleton-scope .pref-roles-perm-sk-btn {
    width: 112px;
    height: 40px;
    flex-shrink: 0;
    margin-left:25px;
}
.preferences-subpage-skeleton-scope .pref-users-grid-skeleton {
    width: 100%;
    box-sizing: border-box;
}
.preferences-subpage-skeleton-scope .pref-invoice-grid-skeleton {
    width: 100%;
    box-sizing: border-box;
}
.preferences-subpage-skeleton-scope .pref-invoice-tabs-skeleton__container,
.preferences-subpage-skeleton-scope .pref-invoice-tabs-skeleton .container {
    max-width: 1260px;
    width: 100%;
    margin-left: auto;
    margin-right: auto;
    padding-left: 0;
    padding-right: 0;
    box-sizing: border-box;
}
.preferences-subpage-skeleton-scope .pref-invoice-tabs-skeleton .rs-tabs.row {
    display: flex;
    width: 100%;
    margin: 0;
    flex-wrap: nowrap;
} 
.preferences-subpage-skeleton-scope .pref-invoice-tabs-skeleton .rs-tabs.row.pref-dc-tabs-skeleton__list {
    background-color: #e2e7ee !important;
}

.preferences-subpage-skeleton-scope .pref-invoice-tabs-skeleton .tabDefault {
    flex: 1 1 50%;
    max-width: 50%;
    min-height: 41px;
}
.preferences-subpage-skeleton-scope.rs-licence-info-skeleton-scope .pref-license-info-panel-skeleton,
.preferences-subpage-skeleton-scope .rs-licence-info-wrapper .pref-license-info-panel-skeleton {
    background: #fff;
    border: 1px solid #c2cfe3;
    border-radius: 5px;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.08);
    box-sizing: border-box;
    overflow: hidden;
}
.preferences-subpage-skeleton-scope.rs-licence-info-skeleton-scope .account-info .d-flex,
.preferences-subpage-skeleton-scope .rs-licence-info-wrapper .account-info .d-flex {
    display: flex;
    gap: 30px;
    width: 100%;
    box-sizing: border-box;
}
.preferences-subpage-skeleton-scope.rs-licence-info-skeleton-scope .account-info .flex-1,
.preferences-subpage-skeleton-scope .rs-licence-info-wrapper .account-info .flex-1 {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 15px;
    padding: 20px;
    box-sizing: border-box;
}
.preferences-subpage-skeleton-scope.rs-licence-info-skeleton-scope .account-info .flex-1:not(:last-child),
.preferences-subpage-skeleton-scope .rs-licence-info-wrapper .account-info .flex-1:not(:last-child) {
    border-right: 1px solid #e8ecf2;
}
.preferences-subpage-skeleton-scope.rs-licence-info-skeleton-scope .account-info .info-row,
.preferences-subpage-skeleton-scope .rs-licence-info-wrapper .account-info .info-row {
    display: flex;
    flex-direction: column;
    gap: 6px;
    margin-bottom: 10px;
}
.preferences-subpage-skeleton-scope.rs-licence-info-skeleton-scope .pref-license-info-actions-skeleton,
.preferences-subpage-skeleton-scope .rs-licence-info-wrapper .pref-license-info-actions-skeleton {
    display: flex;
    justify-content: flex-end;
    margin-top: 30px;
}
.preferences-subpage-skeleton-scope.rs-licence-info-skeleton-scope .react-loading-skeleton,
.preferences-subpage-skeleton-scope .rs-licence-info-wrapper .react-loading-skeleton {
    background-color: #e2e7ee !important;
}
.preferences-subpage-skeleton-scope.rs-licence-info-skeleton-scope .react-loading-skeleton::after,
.preferences-subpage-skeleton-scope .rs-licence-info-wrapper .react-loading-skeleton::after {
    background-image: linear-gradient(90deg, #e2e7ee, #eef2f9, #e2e7ee) !important;
}
.preferences-subpage-skeleton-scope .pref-roles-grid-skeleton,
.preferences-subpage-skeleton-scope .pref-alerts-grid-skeleton {
    width: 100%;
    box-sizing: border-box;
}
.preferences-subpage-skeleton-scope .pref-alerts-grid-skeleton .rs-grid-loading-skeleton table col:first-child,
.preferences-subpage-skeleton-scope .pref-alerts-grid-skeleton .rs-grid-loading-skeleton .k-table-td:first-child {
    width: 90% !important;
    max-width: 90% !important;
}
.preferences-subpage-skeleton-scope .pref-alerts-grid-skeleton .rs-grid-loading-skeleton table col:last-child,
.preferences-subpage-skeleton-scope .pref-alerts-grid-skeleton .rs-grid-loading-skeleton .k-table-td:last-child {
    width: 10% !important;
    max-width: 10% !important;
}
.preferences-subpage-skeleton-scope .pref-alerts-grid-pref-subpage-skeleton-panel--no-data {
    position: relative;
    min-height: 360px;
}
.preferences-subpage-skeleton-scope .pref-sk-roles-toolbar {
    margin-bottom: var(--pageButtonTopSpace, 21px);
    min-height: 32px;
    align-items: center;
}
.preferences-subpage-skeleton-scope .pref-sk-alerts-subheading {
    display: block;
    margin-bottom: 21px;
    margin-top:10px;
}
.preferences-subpage-skeleton-scope .pref-sk-notifications-toolbar {
    min-height: 32px;
    margin-bottom: 0;
    align-items: center;
}
.preferences-subpage-skeleton-scope .pref-notifications-grid-skeleton {
    border: 1px solid #c2cfe3;
    border-radius: 5px;
    background: #fff;
    overflow: hidden;
    box-sizing: border-box;
    min-height: 280px;
}
.preferences-subpage-skeleton-scope .pref-alerts-notifications-skeleton {
    border: 1px solid #c2cfe3;
    border-radius: 5px;
    background: #fff;
    overflow: hidden;
    box-sizing: border-box;
}
.preferences-subpage-skeleton-scope .pref-alerts-notifications-pref-subpage-skeleton-panel--no-data {
    position: relative;
    min-height: 360px;
}
.alertsAndNotificationCSS .pref-alerts-notifications-empty {
    min-height: 360px;
    display: flex;
    align-items: center;
    justify-content: center;
    border: 1px solid #c2cfe3;
    border-radius: 5px;
    box-sizing: border-box;
}
.alertsAndNotificationCSS .pref-alerts-notifications-empty .nodata-skeleton-con {
    position: static;
    transform: none;
}
.preferences-subpage-skeleton-scope .pref-sk-alert-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    padding: 19px;
    box-sizing: border-box;
}
.preferences-subpage-skeleton-scope .pref-sk-alert-row--alt {
    background-color: #f0f8fc;
}
.preferences-subpage-skeleton-scope .pref-sk-alert-row .pref-sk-toggle {
    border-radius: 14px;
    flex-shrink: 0;
}
.preferences-subpage-skeleton-scope .pref-sk-companies-toolbar {
    margin-bottom: var(--pageButtonTopSpace, 21px);
    min-height: 32px;
    display: flex;
    align-items: center;
    justify-content: flex-end;
}
.preferences-subpage-skeleton-scope .pref-companies-sk-toolbar-list {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    list-style: none;
    margin: 0;
    padding: 0;
}
@keyframes prefCompaniesSkShimmer {
    0% { left: -100%; }
    100% { left: 100%; }
}
.preferences-subpage-skeleton-scope .pref-companies-sk-bar {
    background-color: #e0e5eb;
    display: block;
    box-sizing: border-box;
    border-radius: 4px;
    flex-shrink: 0;
}
.preferences-subpage-skeleton-scope .pref-companies-sk-bar:not(.pref-companies-sk-bar--static) {
    position: relative;
    overflow: hidden;
    transform: translateZ(0);
    backface-visibility: hidden;
}
.preferences-subpage-skeleton-scope .pref-companies-sk-bar:not(.pref-companies-sk-bar--static)::after {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.4) 50%, transparent 100%);
    animation: prefCompaniesSkShimmer 1.5s ease-in-out infinite;
    pointer-events: none;
    z-index: 1;
    will-change: left;
}
.preferences-subpage-skeleton-scope .pref-companies-sk-bar--static::after,
.preferences-subpage-skeleton-scope .pref-companies-list-skeleton-grid.pref-subpage-skeleton-panel--no-data .pref-companies-sk-bar::after {
    display: none !important;
    animation: none !important;
    content: none !important;
}
.preferences-subpage-skeleton-scope .pref-companies-sk-bar--static,
.preferences-subpage-skeleton-scope .pref-companies-list-skeleton-grid.pref-subpage-skeleton-panel--no-data .pref-companies-sk-bar {
    background-color: #dce3ec;
}
.preferences-subpage-skeleton-scope .pref-companies-sk-toolbar-icon {
    width: 32px;
    height: 32px;
    border-radius: 50%;
}
.preferences-subpage-skeleton-scope .pref-companies-sk-col {
    margin-bottom: 27px;
}
.preferences-subpage-skeleton-scope .pref-companies-sk-card {
    position: relative;
    background: #fff;
    border-radius: 8px;
    border: 1px solid #e0e5eb;
    height: 155px;
    padding: 10px 15px 5px 23px;
    font-size: 13px;
    color: #222;
    overflow: hidden;
    min-width: 0;
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    box-sizing: border-box;
}
.preferences-subpage-skeleton-scope .pref-companies-sk-badge {
    position: absolute;
    top: 0;
    right: 15px;
    z-index: 3;
    width: 45px;
    height: 25px;
    clip-path: polygon(0% 0%, 100% 0%, 100% 60%, 50% 100%, 0% 60%);
    background: #e0e5eb;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.04);
}
.preferences-subpage-skeleton-scope .pref-companies-sk-info {
    display: table;
    width: 100%;
    height: 90px;
    margin-top: 20px;
    border-bottom: 1px solid #e9e9e9;
}
.preferences-subpage-skeleton-scope .pref-companies-sk-info-row {
    display: table-row;
}
.preferences-subpage-skeleton-scope .pref-companies-sk-logo-cell {
    display: table-cell;
    vertical-align: middle;
    width: 30%;
    padding-right: 10px;
    text-align: center;
    position: relative;
    bottom: 10px;
}
.preferences-subpage-skeleton-scope .pref-companies-sk-logo {
    width: 65px;
    height: 65px;
    margin: 0 auto;
}
.preferences-subpage-skeleton-scope .pref-companies-sk-text-cell {
    display: table-cell;
    vertical-align: middle;
    width: 70%;
    padding-left: 10px;
    border-left: 1px solid #e9e9e9;
}
.preferences-subpage-skeleton-scope .pref-companies-sk-title-row {
    display: flex;
    gap: 0.5rem;
    align-items: center;
}
.preferences-subpage-skeleton-scope .pref-companies-sk-title {
    width: 140px;
    height: 20px;
}
.preferences-subpage-skeleton-scope .pref-companies-sk-title-badge {
    width: 60px;
    height: 20px;
}
.preferences-subpage-skeleton-scope .pref-companies-sk-actions-left {
    display: flex;
    gap: 1rem;
    margin-top: 4px;
}
.preferences-subpage-skeleton-scope .pref-companies-sk-action-col {
    display: flex;
    flex-direction: column;
    align-items: center;
}
.preferences-subpage-skeleton-scope .pref-companies-sk-action-icon {
    width: 14px;
    height: 14px;
    border-radius: 50%;
}
.preferences-subpage-skeleton-scope .pref-companies-sk-action-label {
    width: 40px;
    height: 14px;
    margin-top: 4px;
}
.preferences-subpage-skeleton-scope .pref-companies-sk-actions-right {
    position: absolute;
    bottom: 8px;
    right: 18px;
    display: flex;
    gap: 10px;
}
.preferences-subpage-skeleton-scope .pc-offer-management > .container.px0,
.page-content.pc-offer-management > .container.px0 {
    max-width: 1260px;
    width: 100%;
    margin-left: auto;
    margin-right: auto;
    padding-left: 0;
    padding-right: 0;
    box-sizing: border-box;
}
.preferences-subpage-skeleton-scope .pref-offer-tabs-strip-fullWhiteBackground,
.page-content.pc-offer-management .pref-offer-tabs-strip-fullWhiteBackground {
    width: 100%;
    max-width: 100%;
    background: #f5f7fc;
    margin-bottom: 0;
    box-sizing: border-box;
}
.preferences-subpage-skeleton-scope .pref-offer-tabs-skeleton__container,
.preferences-subpage-skeleton-scope .pref-offer-tabs-strip-skeleton .container,
.page-content.pc-offer-management .pref-offer-tabs-strip-skeleton .container {
    max-width: 1260px;
    width: 100%;
    margin-left: auto;
    margin-right: auto;
    padding-left: 0;
    padding-right: 0;
    box-sizing: border-box;
    margin-top:10px;
}
.preferences-subpage-skeleton-scope .pref-offer-tabs-skeleton__list,
.preferences-subpage-skeleton-scope .pref-offer-tabs-skeleton .rs-tabs.row,
.page-content.pc-offer-management .pref-offer-tabs-skeleton .rs-tabs.row {
    display: flex;
    flex-wrap: nowrap;
    width: 100%;
    margin: 0;
    padding: 0;
    list-style: none;
    box-sizing: border-box;
}
.preferences-subpage-skeleton-scope .pref-offer-tabs-skeleton .tabDefault,
.preferences-subpage-skeleton-scope .pref-offer-tabs-skeleton__tab,
.page-content.pc-offer-management .pref-offer-tabs-skeleton .tabDefault,
.preferences-subpage-skeleton-scope .pref-offer-tabs-skeleton .tabDefault.active,
.page-content.pc-offer-management .pref-offer-tabs-skeleton .tabDefault.active {
    flex: 1 1 50%;
    max-width: 50%;
    min-width: 0;
    min-height: 41px;
    display: block;
    background: #e2e7ee !important;
    background-color: #e2e7ee !important;
    border-left: 3px solid #f5f7fc;
    border-top-left-radius: var(--globalBorderRadius, 5px);
    border-top-right-radius: var(--globalBorderRadius, 5px);
    box-sizing: border-box;
}
.preferences-subpage-skeleton-scope .pref-offer-tabs-skeleton .tabDefault:first-child,
.page-content.pc-offer-management .pref-offer-tabs-skeleton .tabDefault:first-child {
    border-left: none;
}
.preferences-subpage-skeleton-scope .pref-offer-tabs-strip-skeleton .row,
.page-content.pc-offer-management .pref-offer-tabs-strip-skeleton .row {
    margin-left: 0;
    margin-right: 0;
    width: 100%;
}
.preferences-subpage-skeleton-scope .pref-sk-offer-toolbar,
.preferences-subpage-skeleton-scope .pref-sk-offer-brands-toolbar {
    margin-bottom: var(--pageButtonTopSpace, 21px);
    min-height: 32px;
    align-items: center;
}
.preferences-subpage-skeleton-scope .pref-offer-grid-skeleton,
.preferences-subpage-skeleton-scope .pref-offer-brands-skeleton {
    width: 100%;
    max-width: 100%;
    box-sizing: border-box;
}
.preferences-subpage-skeleton-scope .pref-offer-brands-skeleton .skeleton-communication-list {
    width: 100%;
    margin: 0;
    padding: 0;
}
.preferences-subpage-skeleton-scope .pref-offer-brands-skeleton .skeleton-communication-list > * {
    width: 100% !important;
    max-width: 100%;
    margin-left: 0 !important;
    box-sizing: border-box;
}
.preferences-subpage-skeleton-scope .pc-offer-management .page-content {
    padding-top: 0;
    width: 100%;
    box-sizing: border-box;
}
.preferences-subpage-skeleton-scope .pref-create-offer-skeleton .form-group {
    margin-bottom: 21px;
}
.preferences-subpage-skeleton-scope .pref-sk-create-offer-title {
    margin: 0;
    font-weight: inherit;
    line-height: 1.2;
}
.preferences-subpage-skeleton-scope .pref-sk-create-offer-actions {
    margin-top: 21px;
    display: flex;
    justify-content: flex-end;
    gap: 12px;
}
.preferences-subpage-skeleton-scope .pref-create-brand-skeleton .form-group,
.preferences-subpage-skeleton-scope .pref-create-shop-skeleton .form-group {
    margin-bottom: 21px;
}
.preferences-subpage-skeleton-scope .pref-sk-create-brand-actions,
.preferences-subpage-skeleton-scope .pref-sk-create-shop-actions {
    margin-top: 21px;
    display: flex;
    justify-content: flex-end;
    gap: 12px;
}
.preferences-subpage-skeleton-scope .pref-discover-offers-filters {
    margin-bottom: 21px;
}
.preferences-subpage-skeleton-scope .pref-discover-offers-grid {
    gap: 25px 2%;
}
.preferences-subpage-skeleton-scope .pref-discover-offer-card-skeleton {
    border: 1px solid #c2cfe3;
    border-radius: 16px;
    overflow: hidden;
    background-color: #fff;
    width: 32%;
    box-sizing: border-box;
}
.preferences-subpage-skeleton-scope .pref-discover-offer-card-skeleton .pref-sk-offer-image {
    border-radius: 0;
}
.preferences-subpage-skeleton-scope .pref-discover-offer-card-skeleton .offer-card-body {
    padding: 24px;
    min-height: 287px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    box-sizing: border-box;
}
.preferences-skeleton-scope .pref-manage-categories-tags-panel,
.preferences-subpage-skeleton-scope .pref-manage-categories-tags-panel {
    min-height: 220px;
    padding: 12px;
    border: 1px solid #c2cfe3;
    border-radius: 5px;
    background-color: #fff;
    box-sizing: border-box;
}
.preferences-skeleton-scope .pref-sk-category-tag-pill,
.preferences-subpage-skeleton-scope .pref-sk-category-tag-pill {
    border-radius: 4px;
}
.preferences-skeleton-scope .pref-manage-categories-offer-types,
.preferences-subpage-skeleton-scope .pref-manage-categories-offer-types {
    min-height: 180px;
}
.preferences-subpage-skeleton-scope .pref-tg-card-skeleton {
    margin-bottom: 23px;
}
.preferences-subpage-skeleton-scope .pref-tg-card-skeleton .pref-tg-card-inner {
    min-height: 140px;
    width: 100%;
    box-sizing: border-box;
}
.preferences-subpage-skeleton-scope .pref-sk-assign-user-row--alt {
    background-color: rgba(240, 248, 252, 0.85);
}
.preferences-subpage-skeleton-scope .pref-sk-assign-role-actions {
    margin-top: 21px;
}
.preferences-subpage-skeleton-scope .pc-company-list .row {
    margin-left: -12px;
    margin-right: -12px;
}
.preferences-subpage-skeleton-scope .pref-companies-list-skeleton-grid.pref-subpage-skeleton-panel--no-data {
    position: relative;
    min-height: 420px;
}
.pc-company-list .pref-companies-list-empty {
    min-height: 420px;
    display: flex;
    align-items: center;
    justify-content: center;
    border: 1px solid #c2cfe3;
    border-radius: 5px;
    background: #fff;
    box-sizing: border-box;
    margin-top: 0;
}
.pc-company-list .pref-companies-list-empty .nodata-skeleton-con {
    position: static;
    transform: none;
}
.preferences-subpage-skeleton-scope .pref-company-localization-pref-subpage-skeleton-panel--no-data {
    position: relative;
    min-height: 520px;
}
.preferences-subpage-skeleton-scope .pref-company-localization-pref-subpage-skeleton-panel--no-data .react-loading-skeleton {
    --base-color: #dce3ec;
    --highlight-color: #dce3ec;
    opacity: 1;
}
.preferences-subpage-skeleton-scope .pref-sk-pager {
    margin-top: 21px;
    margin-bottom: 8px;
}
.page-content-holder.preferences-subpage-skeleton-scope:not(.page-layout-skeleton--inline),
.page-content-holder:has(.preferences-subpage-skeleton-scope):not(.page-layout-skeleton--inline),
.rs-page-content-wrapper .page-content-holder:has(.preferences-subpage-skeleton-scope) {
    padding-top: 78px;
    box-sizing: border-box;
}
.preferences-skeleton-scope .skeleton-shimmer {
    background: #e2e7ee;
    border-radius: 4px;
    display: block;
}
.page-layout-skeleton--inline .preferences-skeleton-scope .skeleton-shimmer::after,
.preferences-skeleton-scope .skeleton-shimmer::after {
    display: none !important;
    content: none !important;
    animation: none !important;
}
.preferences-subpage-skeleton-scope.data-catalogue,
.pref-subpage-skeleton-gate-host.data-catalogue,
.page-content.pc-data-catalogue {
    box-sizing: border-box;
}
.pref-subpage-skeleton-gate-host.data-catalogue {
    width: 100%;
}
.preferences-subpage-skeleton-scope.data-catalogue .container-fluid,
.pref-subpage-skeleton-gate-host.data-catalogue .container-fluid,
.page-content.pc-data-catalogue .container-fluid {
    width: 100%;
    max-width: 1260px;
    margin-left: auto;
    margin-right: auto;
    padding-left: 12px;
    padding-right: 12px;
    box-sizing: border-box;
}
.preferences-subpage-skeleton-scope.data-catalogue .pref-dc-page-skeleton,
.pref-subpage-skeleton-gate-host.data-catalogue .pref-dc-page-skeleton,
.page-content.pc-data-catalogue .pref-dc-page-skeleton {
    position: relative;
    width: 100%;
    max-width: 1260px;
    margin-left: auto;
    margin-right: auto;
    box-sizing: border-box;
}
.preferences-subpage-skeleton-scope.data-catalogue .pref-dc-page-skeleton > .row,
.pref-subpage-skeleton-gate-host.data-catalogue .pref-dc-page-skeleton > .row,
.page-content.pc-data-catalogue .pref-dc-page-skeleton > .row {
    display: flex;
    flex-wrap: wrap;
    margin-left: 0;
    margin-right: 0;
}
.preferences-subpage-skeleton-scope.data-catalogue .pref-dc-page-skeleton .px0,
.pref-subpage-skeleton-gate-host.data-catalogue .pref-dc-page-skeleton .px0,
.page-content.pc-data-catalogue .pref-dc-page-skeleton .px0,
.preferences-subpage-skeleton-scope.data-catalogue .pref-dc-page-skeleton .container.px0,
.pref-subpage-skeleton-gate-host.data-catalogue .pref-dc-page-skeleton .container.px0,
.page-content.pc-data-catalogue .pref-dc-page-skeleton .container.px0 {
    padding-left: 0;
    padding-right: 0;
    width: 100%;
    max-width: 100%;
    box-sizing: border-box;
}
.preferences-subpage-skeleton-scope.data-catalogue .pref-dc-page-skeleton .px5,
.pref-subpage-skeleton-gate-host.data-catalogue .pref-dc-page-skeleton .px5,
.page-content.pc-data-catalogue .pref-dc-page-skeleton .px5 {
    padding-left: 5px;
    padding-right: 5px;
}
.preferences-subpage-skeleton-scope.data-catalogue .pref-dc-page-skeleton .mx-0,
.pref-subpage-skeleton-gate-host.data-catalogue .pref-dc-page-skeleton .mx-0,
.page-content.pc-data-catalogue .pref-dc-page-skeleton .mx-0 {
    margin-left: 0;
    margin-right: 0;
}
.preferences-subpage-skeleton-scope.data-catalogue .pref-dc-page-skeleton .col-sm-12,
.pref-subpage-skeleton-gate-host.data-catalogue .pref-dc-page-skeleton .col-sm-12,
.page-content.pc-data-catalogue .pref-dc-page-skeleton .col-sm-12 {
    flex: 0 0 100%;
    max-width: 100%;
    width: 100%;
    box-sizing: border-box;
}
.preferences-subpage-skeleton-scope.data-catalogue .pref-dc-filter-info-bar-col,
.pref-subpage-skeleton-gate-host.data-catalogue .pref-dc-filter-info-bar-col,
.page-content.pc-data-catalogue .pref-dc-filter-info-bar-col {
    flex: 0 0 100%;
    max-width: 100%;
    width: 100%;
    margin-bottom: 8px;
    box-sizing: border-box;
}
.preferences-subpage-skeleton-scope.data-catalogue .box-design,
.pref-subpage-skeleton-gate-host.data-catalogue .box-design,
.page-content.pc-data-catalogue .box-design {
    background-color: #ffffff;
    border: 1px solid #c2cfe3;
    border-radius: var(--globalBorderRadius, 5px);
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.08);
    box-sizing: border-box;
}
.preferences-subpage-skeleton-scope.data-catalogue .primary-box-shadow,
.pref-subpage-skeleton-gate-host.data-catalogue .primary-box-shadow,
.page-content.pc-data-catalogue .primary-box-shadow {
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.08);
}
.preferences-subpage-skeleton-scope.data-catalogue .tag-list-block,
.pref-subpage-skeleton-gate-host.data-catalogue .tag-list-block,
.page-content.pc-data-catalogue .tag-list-block {
    padding: 15px 15px 10px;
    box-sizing: border-box;
}
.preferences-subpage-skeleton-scope.data-catalogue .pref-dc-attribute-block-skeleton .tag-list-block,
.pref-subpage-skeleton-gate-host.data-catalogue .pref-dc-attribute-block-skeleton .tag-list-block,
.page-content.pc-data-catalogue .pref-dc-attribute-block-skeleton .tag-list-block {
    padding: 0;
    margin-top: 0;
    border-top-left-radius: 10px;
    border-top-right-radius: 10px;
    overflow: hidden;
}
.preferences-subpage-skeleton-scope.data-catalogue .pref-dc-attribute-block-skeleton .border-bottom,
.pref-subpage-skeleton-gate-host.data-catalogue .pref-dc-attribute-block-skeleton .border-bottom,
.page-content.pc-data-catalogue .pref-dc-attribute-block-skeleton .border-bottom {
    border-bottom: 1px solid #c2cfe3;
}
.preferences-subpage-skeleton-scope.data-catalogue .pref-dc-attribute-block-skeleton .grid-inside-scrollbar,
.pref-subpage-skeleton-gate-host.data-catalogue .pref-dc-attribute-block-skeleton .grid-inside-scrollbar,
.page-content.pc-data-catalogue .pref-dc-attribute-block-skeleton .grid-inside-scrollbar {
    height: 210px;
    padding: 19px;
    padding-top: 5px;
    overflow: hidden;
    box-sizing: border-box;
}
.preferences-subpage-skeleton-scope.data-catalogue .pref-dc-attribute-block-data-attribute-block,
.pref-subpage-skeleton-gate-host.data-catalogue .pref-dc-attribute-block-data-attribute-block,
.page-content.pc-data-catalogue .pref-dc-attribute-block-data-attribute-block {
    position: relative;
    padding-bottom: 30px;
}
.preferences-subpage-skeleton-scope.data-catalogue .pref-dc-sidebar-tags-tag-list-block,
.pref-subpage-skeleton-gate-host.data-catalogue .pref-dc-sidebar-tags-tag-list-block,
.page-content.pc-data-catalogue .pref-dc-sidebar-tags-tag-list-block {
    margin-top: 25px;
    position: relative;
    flex: 0 0 520px;
    height: 520px !important;
    min-height: 520px;
    max-height: 520px;
    padding-right: 5px;
    display: flex;
    flex-direction: column;
    box-sizing: border-box;
}
.preferences-subpage-skeleton-scope.data-catalogue .pref-dc-sidebar-tags-skeleton .left-grid-inside-scrollbar,
.pref-subpage-skeleton-gate-host.data-catalogue .pref-dc-sidebar-tags-skeleton .left-grid-inside-scrollbar,
.page-content.pc-data-catalogue .pref-dc-sidebar-tags-skeleton .left-grid-inside-scrollbar {
    flex: 1 1 auto;
    min-height: 0;
    height: 100%;
    padding-bottom: 8px;
    overflow: hidden;
    box-sizing: border-box;
}
.preferences-subpage-skeleton-scope.data-catalogue .pref-dc-sidebar-brand-row.box-design,
.pref-subpage-skeleton-gate-host.data-catalogue .pref-dc-sidebar-brand-row.box-design,
.page-content.pc-data-catalogue .pref-dc-sidebar-brand-row.box-design {
    padding: 8px;
}
.preferences-subpage-skeleton-scope.data-catalogue .pref-dc-header-rs-page-header-skeleton .mhw-container,
.pref-subpage-skeleton-gate-host.data-catalogue .pref-dc-header-rs-page-header-skeleton .mhw-container {
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    padding: 5px 0;
    min-height: 40px;
    box-sizing: border-box;
}
.preferences-subpage-skeleton-scope.data-catalogue .pref-dc-header-rs-page-header-skeleton .mhwc-right,
.pref-subpage-skeleton-gate-host.data-catalogue .pref-dc-header-rs-page-header-skeleton .mhwc-right {
    gap: 15px;
}
.preferences-subpage-skeleton-scope.data-catalogue .data_catalogue_tab,
.pref-subpage-skeleton-gate-host.data-catalogue .data_catalogue_tab,
.page-content.pc-data-catalogue .data_catalogue_tab {
    width: 100%;
    box-sizing: border-box;
}
.preferences-subpage-skeleton-scope.data-catalogue .offset-sm-3,
.pref-subpage-skeleton-gate-host.data-catalogue .offset-sm-3,
.page-content.pc-data-catalogue .offset-sm-3 {
    margin-left: 25%;
}
.preferences-subpage-skeleton-scope.data-catalogue .col-sm-9,
.pref-subpage-skeleton-gate-host.data-catalogue .col-sm-9,
.page-content.pc-data-catalogue .col-sm-9 {
    flex: 0 0 75%;
    max-width: 75%;
    box-sizing: border-box;
}
.preferences-subpage-skeleton-scope.data-catalogue .data-catalogue .pref-dc-sidebar-col-sm-3.sticky,
.preferences-subpage-skeleton-scope.data-catalogue .pref-dc-sidebar-col-sm-3.sticky,
.pref-subpage-skeleton-gate-host.data-catalogue .pref-dc-sidebar-col-sm-3.sticky,
.page-content.pc-data-catalogue .pref-dc-sidebar-col-sm-3.sticky {
    position: fixed;
    top: 125px;
    width: 300px;
    max-width: 300px;
    height: calc(100vh - 345px);
    display: flex;
    flex-direction: column;
    box-sizing: border-box;
    z-index: 1;
}
.preferences-subpage-skeleton-scope.data-catalogue .data_catalogue_tab .pref-dc-main-skeleton,
.pref-subpage-skeleton-gate-host.data-catalogue .data_catalogue_tab .pref-dc-main-skeleton,
.page-content.pc-data-catalogue .data_catalogue_tab .pref-dc-main-skeleton {
    width: 100%;
    max-width: 100%;
    padding-left: 0;
    padding-right: 0;
    box-sizing: border-box;
}
.preferences-subpage-skeleton-scope.data-catalogue .pref-dc-main-skeleton > .row,
.pref-subpage-skeleton-gate-host.data-catalogue .pref-dc-main-skeleton > .row,
.page-content.pc-data-catalogue .pref-dc-main-skeleton > .row {
    display: flex;
    flex-wrap: wrap;
    margin-left: -12px;
    margin-right: -12px;
}
.preferences-subpage-skeleton-scope.data-catalogue .pref-dc-attribute-block-skeleton,
.pref-subpage-skeleton-gate-host.data-catalogue .pref-dc-attribute-block-skeleton,
.page-content.pc-data-catalogue .pref-dc-attribute-block-skeleton {
    flex: 0 0 50%;
    max-width: 50%;
    padding-left: 12px;
    padding-right: 12px;
    margin-bottom: 24px;
    box-sizing: border-box;
}
.preferences-subpage-skeleton-scope.data-catalogue .pref-dc-tabs-skeleton,
.pref-subpage-skeleton-gate-host.data-catalogue .pref-dc-tabs-skeleton,
.page-content.pc-data-catalogue .pref-dc-tabs-skeleton {
    width: 100%;
    background: #f5f7fc;
    box-sizing: border-box;
    margin-bottom: 0;
}
.preferences-subpage-skeleton-scope.data-catalogue .pref-dc-tabs-skeleton__container,
.pref-subpage-skeleton-gate-host.data-catalogue .pref-dc-tabs-skeleton__container,
.page-content.pc-data-catalogue .pref-dc-tabs-skeleton__container {
    max-width: 100%;
    width: 100%;
    padding-left: 0 !important;
    padding-right: 0 !important;
    box-sizing: border-box;
}
.preferences-subpage-skeleton-scope.data-catalogue .pref-dc-tabs-skeleton__list,
.pref-subpage-skeleton-gate-host.data-catalogue .pref-dc-tabs-skeleton__list,
.page-content.pc-data-catalogue .pref-dc-tabs-skeleton__list {
    display: flex;
    flex-wrap: nowrap;
    width: 100%;
    list-style: none;
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}
.preferences-subpage-skeleton-scope.data-catalogue .pref-dc-tabs-skeleton__list .tabDefault,
.pref-subpage-skeleton-gate-host.data-catalogue .pref-dc-tabs-skeleton__list .tabDefault,
.page-content.pc-data-catalogue .pref-dc-tabs-skeleton__list .tabDefault {
    flex: 1 1 50%;
    max-width: 50%;
    min-width: 0;
    min-height: 41px;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: #e2e7ee !important;
    border: none !important;
    border-left: 3px solid #f5f7fc !important;
    border-top-left-radius: var(--globalBorderRadius, 5px);
    border-top-right-radius: var(--globalBorderRadius, 5px);
    box-sizing: border-box;
    cursor: default;
    padding: 2px 6px;
    position: relative;
    text-align: center;
    list-style: none;
}
.preferences-subpage-skeleton-scope.data-catalogue .pref-dc-tabs-skeleton__list .tabDefault:first-child,
.pref-subpage-skeleton-gate-host.data-catalogue .pref-dc-tabs-skeleton__list .tabDefault:first-child,
.page-content.pc-data-catalogue .pref-dc-tabs-skeleton__list .tabDefault:first-child {
    border-left: none !important;
}
.preferences-subpage-skeleton-scope.data-catalogue .pref-dc-tabs-skeleton__list .tabDefault.active,
.pref-subpage-skeleton-gate-host.data-catalogue .pref-dc-tabs-skeleton__list .tabDefault.active,
.page-content.pc-data-catalogue .pref-dc-tabs-skeleton__list .tabDefault.active {
    background-color: #e2e7ee !important;
}
.preferences-subpage-skeleton-scope.data-catalogue .pref-dc-tabs-skeleton__list .tabDefault::before,
.preferences-subpage-skeleton-scope.data-catalogue .pref-dc-tabs-skeleton__list .tabDefault::after,
.preferences-subpage-skeleton-scope.data-catalogue .pref-dc-tabs-skeleton__list .tabDefault.active::before,
.pref-subpage-skeleton-gate-host.data-catalogue .pref-dc-tabs-skeleton__list .tabDefault::before,
.pref-subpage-skeleton-gate-host.data-catalogue .pref-dc-tabs-skeleton__list .tabDefault::after,
.pref-subpage-skeleton-gate-host.data-catalogue .pref-dc-tabs-skeleton__list .tabDefault.active::before,
.page-content.pc-data-catalogue .pref-dc-tabs-skeleton__list .tabDefault::before,
.page-content.pc-data-catalogue .pref-dc-tabs-skeleton__list .tabDefault::after,
.page-content.pc-data-catalogue .pref-dc-tabs-skeleton__list .tabDefault.active::before {
    display: none !important;
    content: none !important;
    border: none !important;
}
.preferences-subpage-skeleton-scope.data-catalogue .pref-dc-sidebar-expand-skeleton,
.pref-subpage-skeleton-gate-host.data-catalogue .pref-dc-sidebar-expand-skeleton,
.page-content.pc-data-catalogue .pref-dc-sidebar-expand-skeleton {
    display: flex;
    align-items: center;
    gap: 8px;
    position: absolute;
    right: 15px;
    top: 18px;
    z-index: 2;
    line-height: 0;
}
.preferences-subpage-skeleton-scope.data-catalogue .pref-dc-grid-table-skeleton,
.page-content.pc-data-catalogue .pref-dc-grid-table-skeleton {
    width: 100%;
    box-sizing: border-box;
}
.preferences-subpage-skeleton-scope.data-catalogue .pref-dc-grid-table-skeleton .rs-grid-loading-skeleton,
.page-content.pc-data-catalogue .pref-dc-grid-table-skeleton .rs-grid-loading-skeleton {
    margin: 0;
    width: 100%;
}
.preferences-subpage-skeleton-scope.data-catalogue .pref-dc-legend-skeleton {
    margin-top: 7px;
    display: flex;
    flex-flow: wrap;
    padding: 0;
    list-style: none;
    width: 100%;
}
.preferences-subpage-skeleton-scope.data-catalogue .pref-dc-legend-skeleton li {
    display: flex;
    align-items: center;
    margin-right: 15px;
    margin-bottom: 5px;
}
.preferences-subpage-skeleton-scope.data-catalogue .pref-dc-legend-skeleton__dot {
    display: inline-block;
    width: 10px;
    height: 10px;
    margin-right: 5px;
    border-radius: 50%;
    border: 1px solid;
    flex-shrink: 0;
    box-sizing: border-box;
}
.preferences-subpage-skeleton-scope.data-catalogue .pref-dc-legend-skeleton__dot--ingested {
    background-color: #f6f7f8;
    border-color: #d4d6de;
}
.preferences-subpage-skeleton-scope.data-catalogue .pref-dc-legend-skeleton__dot--kpi {
    background-color: #eff8ff;
    border-color: #66c8ed;
}
.preferences-subpage-skeleton-scope.data-catalogue .pref-dc-legend-skeleton__dot--transaction {
    background-color: #f1f8d9;
    border-color: #d1e88e;
}
.preferences-subpage-skeleton-scope.data-catalogue .pref-dc-legend-skeleton__dot--sensitive {
    background-color: #fee7d7;
    border-color: #fdc69d;
}
.preferences-subpage-skeleton-scope.data-catalogue .pref-dc-legend-skeleton li .skeleton-shimmer,
.preferences-subpage-skeleton-scope.data-catalogue .pref-dc-legend-skeleton li > span:last-child {
    border-radius: 4px;
}
.preferences-subpage-skeleton-scope.data-catalogue .pref-dc-skel-bar,
.pref-subpage-skeleton-gate-host.data-catalogue .pref-dc-skel-bar,
.page-content.pc-data-catalogue .pref-dc-skel-bar {
    display: block;
    background-color: #e2e7ee;
    border-radius: 4px;
    flex-shrink: 0;
    box-sizing: border-box;
}
.preferences-subpage-skeleton-scope.data-catalogue .pref-dc-skel-bar--circle,
.pref-subpage-skeleton-gate-host.data-catalogue .pref-dc-skel-bar--circle,
.page-content.pc-data-catalogue .pref-dc-skel-bar--circle {
    border-radius: 50%;
}
.preferences-subpage-skeleton-scope.data-catalogue .pref-dc-skel-bar::after,
.pref-subpage-skeleton-gate-host.data-catalogue .pref-dc-skel-bar::after,
.page-content.pc-data-catalogue .pref-dc-skel-bar::after {
    display: none !important;
    animation: none !important;
}
.preferences-subpage-skeleton-scope.data-catalogue .pref-dc-sidebar-toolbar,
.pref-subpage-skeleton-gate-host.data-catalogue .pref-dc-sidebar-toolbar,
.page-content.pc-data-catalogue .pref-dc-sidebar-toolbar {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    position: relative;
    margin-bottom: 19px;
    min-height: 32px;
}
.preferences-subpage-skeleton-scope.data-catalogue .pref-dc-sidebar-toolbar__title,
.pref-subpage-skeleton-gate-host.data-catalogue .pref-dc-sidebar-toolbar__title,
.page-content.pc-data-catalogue .pref-dc-sidebar-toolbar__title {
    display: flex;
    align-items: center;
    position: absolute;
    left: 0;
    margin: 0;
    padding-left: 4px;
}
.preferences-subpage-skeleton-scope.data-catalogue .pref-dc-sidebar-toolbar__actions,
.pref-subpage-skeleton-gate-host.data-catalogue .pref-dc-sidebar-toolbar__actions,
.page-content.pc-data-catalogue .pref-dc-sidebar-toolbar__actions {
    display: flex;
    list-style: none;
    margin: 0;
    padding: 0;
    gap: 8px;
}
.preferences-subpage-skeleton-scope.data-catalogue .pref-dc-sidebar-brand-row,
.pref-subpage-skeleton-gate-host.data-catalogue .pref-dc-sidebar-brand-row,
.page-content.pc-data-catalogue .pref-dc-sidebar-brand-row {
    display: flex;
    align-items: center;
    padding: 8px;
    box-sizing: border-box;
}
.preferences-subpage-skeleton-scope.data-catalogue .pref-dc-sidebar-brand-row__labels,
.pref-subpage-skeleton-gate-host.data-catalogue .pref-dc-sidebar-brand-row__labels,
.page-content.pc-data-catalogue .pref-dc-sidebar-brand-row__labels {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-left: 8px;
}
.preferences-subpage-skeleton-scope.data-catalogue .pref-dc-filter-info-bar,
.pref-subpage-skeleton-gate-host.data-catalogue .pref-dc-filter-info-bar,
.page-content.pc-data-catalogue .pref-dc-filter-info-bar {
    display: flex;
    align-items: center;
    width: 100%;
    margin-top: 35px;
    margin-bottom: 40px;
    box-sizing: border-box;
}
.preferences-subpage-skeleton-scope.data-catalogue .pref-dc-filter-info-bar__main,
.pref-subpage-skeleton-gate-host.data-catalogue .pref-dc-filter-info-bar__main,
.page-content.pc-data-catalogue .pref-dc-filter-info-bar__main {
    display: flex;
    align-items: center;
    flex: 1 1 auto;
    min-width: 0;
    padding-right: 12px;
}
.preferences-subpage-skeleton-scope.data-catalogue .pref-dc-filter-info-bar__icon,
.pref-subpage-skeleton-gate-host.data-catalogue .pref-dc-filter-info-bar__icon,
.page-content.pc-data-catalogue .pref-dc-filter-info-bar__icon {
    flex-shrink: 0;
    margin-right: 8px;
}
.preferences-subpage-skeleton-scope.data-catalogue .pref-dc-filter-info-bar__line,
.pref-subpage-skeleton-gate-host.data-catalogue .pref-dc-filter-info-bar__line,
.page-content.pc-data-catalogue .pref-dc-filter-info-bar__line {

}
.preferences-subpage-skeleton-scope.data-catalogue .pref-dc-attribute-block-skeleton__header,
.pref-subpage-skeleton-gate-host.data-catalogue .pref-dc-attribute-block-skeleton__header,
.page-content.pc-data-catalogue .pref-dc-attribute-block-skeleton__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 15px 19px;
    box-sizing: border-box;
}
.preferences-subpage-skeleton-scope.data-catalogue .pref-dc-attribute-block-skeleton__header-actions,
.pref-subpage-skeleton-gate-host.data-catalogue .pref-dc-attribute-block-skeleton__header-actions,
.page-content.pc-data-catalogue .pref-dc-attribute-block-skeleton__header-actions {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: 12px;
}
.preferences-subpage-skeleton-scope.data-catalogue .pref-dc-grid-toolbar-skeleton,
.pref-subpage-skeleton-gate-host.data-catalogue .pref-dc-grid-toolbar-skeleton,
.page-content.pc-data-catalogue .pref-dc-grid-toolbar-skeleton {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: 8px;
    margin-bottom: 10px;
}
.preferences-subpage-skeleton-scope.data-catalogue .pref-dc-header-rs-page-header-skeleton .heading-title-text h1,
.pref-subpage-skeleton-gate-host.data-catalogue .pref-dc-header-rs-page-header-skeleton .heading-title-text h1,
.page-content.pc-data-catalogue .pref-dc-header-rs-page-header-skeleton .heading-title-text h1 {
    margin: 0;
    padding: 0;
    line-height: 1.2;
}
.page-content-holder.preferences-subpage-skeleton-scope.data-catalogue.page-layout-skeleton--inline {
    padding-top: 78px;
}
.page-content-holder.preferences-subpage-skeleton-scope.data-catalogue.page-layout-skeleton--inline .pref-subpage-header-skeleton,
.pref-subpage-skeleton-gate-host.data-catalogue .pref-subpage-header-skeleton,
.pref-subpage-skeleton-gate-host.data-catalogue .pref-dc-header-skeleton {
    max-width: 1260px;
    margin-left: auto;
    margin-right: auto;
}
${formGeneratorPublishModalSkeletonCriticalCss}
`;

/** Communication settings — vertical tabs, sub-tabs, SMTP grid, edit form (before app.scss). */
export const communicationSettingsSkeletonCriticalCss = `
.preferences-subpage-skeleton-scope.communication-settings.page-content-holder,
.preferences-subpage-skeleton-scope.communication-settings .page-content.pc-communication-settings,
.page-layout-skeleton--inline.preferences-subpage-skeleton-scope.communication-settings {
    background-color: #f5f7fc;
    box-sizing: border-box;
}
.preferences-subpage-skeleton-scope.communication-settings .page-content.pc-communication-settings {
    padding-top: 0;
    margin-top: 0;
    width: 100%;
    box-sizing: border-box;
}
.preferences-subpage-skeleton-scope.communication-settings .page-content.pc-communication-settings > .container.px0,
.page-content-holder.preferences-subpage-skeleton-scope.communication-settings .page-content.pc-communication-settings > .container.px0,
.page-layout-skeleton--inline.preferences-subpage-skeleton-scope.communication-settings .page-content.pc-communication-settings > .container.px0 {
    max-width: 1260px;
    width: 100%;
    margin-left: auto;
    margin-right: auto;
    padding-left: 0;
    padding-right: 0;
    box-sizing: border-box;
}
.preferences-subpage-skeleton-scope.communication-settings .page-content.pc-communication-settings > .container.px0 > .mt30,
.page-content-holder.preferences-subpage-skeleton-scope.communication-settings .page-content.pc-communication-settings > .container.px0 > .mt30 {
    width: 100%;
    box-sizing: border-box;
}
/* All preferences TabBarViewSkeleton strips — align with 1260px tab panels */
.preferences-subpage-skeleton-scope [class*='tabs-skeleton__container'],
.preferences-subpage-skeleton-scope [class*='top-tabs-skeleton__container'],
.page-content-holder.preferences-subpage-skeleton-scope [class*='tabs-skeleton__container'],
.page-content-holder.preferences-subpage-skeleton-scope [class*='top-tabs-skeleton__container'] {
    max-width: 1260px;
    width: 100%;
    margin-left: auto;
    margin-right: auto;
    padding-left: 0 !important;
    padding-right: 0 !important;
    box-sizing: border-box;
}
/* Top tab strip — match communication listing / analytics TabBarViewSkeleton */
.preferences-subpage-skeleton-scope.communication-settings .pref-cs-top-tabs-skeleton,
.page-content.pc-communication-settings .pref-cs-top-tabs-skeleton {
    width: 100%;
    background: #f5f7fc;
    box-sizing: border-box;
    margin-bottom: 0;
}
.preferences-subpage-skeleton-scope.communication-settings .pref-cs-top-tabs-skeleton__container,
.page-content.pc-communication-settings .pref-cs-top-tabs-skeleton__container {
    max-width: 1260px;
    width: 100%;
    margin-left: auto;
    margin-right: auto;
    box-sizing: border-box;
}
.preferences-subpage-skeleton-scope.communication-settings .pref-cs-top-tabs-skeleton__list,
.page-content.pc-communication-settings .pref-cs-top-tabs-skeleton__list {
    display: flex;
    flex-wrap: nowrap;
    width: 100%;
    margin: 0;
    padding: 0;
    list-style: none;
    box-sizing: border-box;
}
.preferences-subpage-skeleton-scope.communication-settings .pref-cs-top-tabs-skeleton__list .tabDefault,
.page-content.pc-communication-settings .pref-cs-top-tabs-skeleton__list .tabDefault {
    flex: 1 1 33.333%;
    max-width: 33.333%;
    min-width: 0;
    min-height: 41px;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: #e2e7ee !important;
    border: none !important;
    border-left: 3px solid #f5f7fc !important;
    position: relative;
    padding: 2px 6px;
    border-top-left-radius: var(--globalBorderRadius, 5px);
    border-top-right-radius: var(--globalBorderRadius, 5px);
    box-sizing: border-box;
    text-align: center;
    cursor: default;
}
.preferences-subpage-skeleton-scope.communication-settings .pref-cs-top-tabs-skeleton__list .tabDefault:first-child,
.page-content.pc-communication-settings .pref-cs-top-tabs-skeleton__list .tabDefault:first-child {
    border-left: none !important;
}
.preferences-subpage-skeleton-scope.communication-settings .pref-cs-top-tabs-skeleton__list .tabDefault::before,
.preferences-subpage-skeleton-scope.communication-settings .pref-cs-top-tabs-skeleton__list .tabDefault::after,
.preferences-subpage-skeleton-scope.communication-settings .pref-cs-top-tabs-skeleton__list .tabDefault.active::before,
.page-content.pc-communication-settings .pref-cs-top-tabs-skeleton__list .tabDefault::before,
.page-content.pc-communication-settings .pref-cs-top-tabs-skeleton__list .tabDefault::after,
.page-content.pc-communication-settings .pref-cs-top-tabs-skeleton__list .tabDefault.active::before {
    display: none !important;
    content: none !important;
    border: none !important;
}
.preferences-subpage-skeleton-scope.communication-settings .pref-cs-top-tabs-skeleton__list .tabDefault.active,
.page-content.pc-communication-settings .pref-cs-top-tabs-skeleton__list .tabDefault.active {
    background-color: #e2e7ee !important;
    color: inherit !important;
}
.preferences-subpage-skeleton-scope.communication-settings .pref-cs-channel-skeleton {
    position: relative;
    width: 100%;
    max-width: 100%;
    margin-top: 0;
    box-sizing: border-box;
}
.preferences-subpage-skeleton-scope.communication-settings .pref-cs-channel-row {
    width: 100%;
    max-width: 100%;
    flex-wrap: nowrap;
    align-items: flex-start;
    margin-left: 0;
    margin-right: 0;
}
.preferences-subpage-skeleton-scope.communication-settings .pref-cs-smtp-grid .rs-grid-loading-skeleton tr.skeleton-blue-row,
.page-content.pc-communication-settings .pref-cs-smtp-grid .rs-grid-loading-skeleton tr.skeleton-blue-row {
    background-color: #0043ff !important;
}
.preferences-subpage-skeleton-scope.communication-settings .pref-cs-smtp-grid .rs-grid-loading-skeleton .skeleton-blue-cell,
.page-content.pc-communication-settings .pref-cs-smtp-grid .rs-grid-loading-skeleton .skeleton-blue-cell,
.preferences-subpage-skeleton-scope.communication-settings .pref-cs-smtp-grid .rs-grid-loading-skeleton tr.skeleton-blue-row td,
.page-content.pc-communication-settings .pref-cs-smtp-grid .rs-grid-loading-skeleton tr.skeleton-blue-row td {
    background-color: #0043ff !important;
}
.preferences-subpage-skeleton-scope.communication-settings .pref-cs-smtp-grid .rs-grid-loading-skeleton .skeleton-row td,
.page-content.pc-communication-settings .pref-cs-smtp-grid .rs-grid-loading-skeleton .skeleton-row td {
    background-color: #f5f7fc !important;
}
.preferences-subpage-skeleton-scope.communication-settings .pref-cs-smtp-grid .rs-grid-loading-skeleton .k-table-alt-row td,
.page-content.pc-communication-settings .pref-cs-smtp-grid .rs-grid-loading-skeleton .k-table-alt-row td {
    background-color: #fff !important;
}
.preferences-subpage-skeleton-scope.communication-settings .pref-cs-vertical-col {
    flex: 0 0 150px;
    max-width: 150px;
    margin-right: 10px;
}
.preferences-subpage-skeleton-scope.communication-settings .pref-cs-channel-main-col {
    flex: 1 1 0;
    min-width: 0;
    max-width: none;
}
.preferences-subpage-skeleton-scope.communication-settings .pref-cs-vertical-tabs {
    float: none;
    width: 100%;
    margin: 87px 0 0;
    padding: 5px !important;
    background: #fff;
    border: 1px solid #c2cfe3;
    border-radius: var(--globalBorderRadius, 5px);
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.08);
    box-sizing: border-box;
}
.preferences-subpage-skeleton-scope.communication-settings .pref-cs-vertical-tabs__item {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 115px;
    padding: 10px 8px;
    border-bottom: 1px solid #e9e9e9;
    background: #fff !important;
    box-sizing: border-box;
}
.preferences-subpage-skeleton-scope.communication-settings .pref-cs-vertical-tabs__item:last-child {
    border-bottom: none;
}
.preferences-subpage-skeleton-scope.communication-settings .pref-cs-vertical-tabs__item::after,
.page-content.pc-communication-settings .pref-cs-channel-skeleton .pref-cs-vertical-tabs__item::after,
.page-content.pc-communication-settings .pref-cs-channel-lazy-shell .pref-cs-vertical-tabs__item::after {
    display: none !important;
    content: none !important;
}
.page-content.pc-communication-settings .pref-cs-vertical-tabs__item.active,
.preferences-subpage-skeleton-scope.communication-settings .pref-cs-vertical-tabs__item.active {
    background: #fff !important;
}
.preferences-subpage-skeleton-scope.communication-settings .pref-cs-vertical-tabs__icon {
    margin-bottom: 8px;
}
.preferences-subpage-skeleton-scope.communication-settings .pref-cs-channel-main-col > .pref-cs-sub-tabs.rs-sub-tabs.rs-cc-sub-tabs {
    float: left;
    width: 100%;
    max-width: 100%;
    margin: 0;
    padding: 0;
    list-style: none;
    box-sizing: border-box;
    display: flex;
    flex-wrap: nowrap;
    gap: 7px;
    position: relative;
    z-index: 101;
}
.preferences-subpage-skeleton-scope.communication-settings .pref-cs-channel-main-col > .pref-cs-mail-tabs-content.tabs-content {
    float: none;
    width: 100%;
    max-width: 100%;
    margin: 0;
    padding: 0;
    box-sizing: border-box;
    clear: both;
}
.preferences-subpage-skeleton-scope.communication-settings .pref-cs-sub-tabs__item {
    float: none;
    flex: 0 0 177px;
    width: 177px;
    max-width: 177px;
    min-height: 85px;
    margin-left: 0;
    padding: 11px 19px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    border: 1px solid #c2cfe3;
    border-bottom: 0 !important;
    border-top-left-radius: 15px;
    border-top-right-radius: 15px;
    background: #fff !important;
    box-sizing: border-box;
}
.preferences-subpage-skeleton-scope.communication-settings .pref-cs-sub-tabs__item:first-child {
    margin-left: 0;
}
.preferences-subpage-skeleton-scope.communication-settings .pref-cs-channel-main-col .pref-cs-smtp-root,
.preferences-subpage-skeleton-scope.communication-settings .pref-cs-channel-main-col .pref-cs-mail-tabs-content .rsv-tabs-content {
    float: none !important;
    width: 100% !important;
    max-width: 100% !important;
    margin: 0 !important;
}
.preferences-subpage-skeleton-scope.communication-settings .pref-cs-sub-tabs__item::after,
.page-content.pc-communication-settings .pref-cs-channel-skeleton .pref-cs-sub-tabs__item::after,
.page-content.pc-communication-settings .pref-cs-channel-lazy-shell .pref-cs-sub-tabs__item::after {
    display: none !important;
    content: none !important;
}
.page-content.pc-communication-settings .pref-cs-sub-tabs__item.active,
.preferences-subpage-skeleton-scope.communication-settings .pref-cs-sub-tabs__item.active {
    background: #fff !important;
    border-color: #c2cfe3 !important;
}
.preferences-subpage-skeleton-scope.communication-settings .pref-cs-sub-tabs__icon,
.page-content.pc-communication-settings .pref-cs-sub-tabs__icon {
    width: 40px;
    height: 40px;
    margin-bottom: 6px;
}
.preferences-subpage-skeleton-scope.communication-settings .pref-cs-sub-tabs__label,
.page-content.pc-communication-settings .pref-cs-sub-tabs__label {
    width: 56px;
    height: 12px;
    margin-top: 0;
}
.preferences-subpage-skeleton-scope.communication-settings .pref-cs-sub-tabs__item:first-child .pref-cs-sub-tabs__label,
.page-content.pc-communication-settings .pref-cs-sub-tabs__item:first-child .pref-cs-sub-tabs__label {
    width: 72px;
}
.preferences-subpage-skeleton-scope.communication-settings .pref-cs-channel-main-col > .pref-cs-mail-tabs-content.tabs-content {
    margin-top: 0;
    border-top: 1px solid #c2cfe3;
}
.preferences-subpage-skeleton-scope.communication-settings .pref-cs-smtp-heading,
.page-content.pc-communication-settings .pref-cs-smtp-heading {
    margin-top: 0;
    margin-bottom: 0;
}
.preferences-subpage-skeleton-scope.communication-settings .pref-cs-smtp-root,
.page-content.pc-communication-settings .pref-cs-smtp-root {
    float: none;
    width: 100%;
    max-width: 100%;
}
.preferences-subpage-skeleton-scope.communication-settings .pref-cs-smtp-panel,
.page-content.pc-communication-settings .pref-cs-smtp-panel {
    margin-top: 0;
    padding: 0;
    width: 100%;
    box-sizing: border-box;
}
.preferences-subpage-skeleton-scope.communication-settings .pref-cs-smtp-panel-body,
.page-content.pc-communication-settings .pref-cs-smtp-panel-body {
    padding: 0 19px 19px;
    box-sizing: border-box;
}
.preferences-subpage-skeleton-scope.communication-settings .pref-cs-smtp-tab-body > .pref-cs-smtp-panel-body,
.page-content.pc-communication-settings .pref-cs-smtp-tab-body > .pref-cs-smtp-panel-body {
    padding-top: 0;
}
.preferences-subpage-skeleton-scope.communication-settings .pref-cs-smtp-panel-body--standalone,
.page-content.pc-communication-settings .pref-cs-smtp-panel-body--standalone {
    padding-top: 19px;
}
.preferences-subpage-skeleton-scope.communication-settings .pref-cs-smtp-tab-body.tabs-content,
.page-content.pc-communication-settings .pref-cs-smtp-tab-body.tabs-content,
.page-content.pc-communication-settings .pref-cs-smtp-tab-body.res-tabs-content {
    width: 100%;
    float: none;
    clear: both;
    box-sizing: border-box;
}
.preferences-subpage-skeleton-scope.communication-settings .pref-cs-smtp-panel .tabs-right-align.pageSub_tab,
.page-content.pc-communication-settings .pref-cs-smtp-panel .tabs-right-align.pageSub_tab,
.page-content.pc-communication-settings .pref-cs-smtp-panel .res-tabs-right-align.pageSub_tab {
    display: block;
    width: 100%;
    box-sizing: border-box;
}
.preferences-subpage-skeleton-scope.communication-settings .pref-cs-smtp-inner-tabber,
.page-content.pc-communication-settings .pref-cs-smtp-inner-tabber {
    width: 100%;
    box-sizing: border-box;
}
.preferences-subpage-skeleton-scope.communication-settings .pref-cs-smtp-inner-tabber > .pref-cs-inner-tabs,
.page-content.pc-communication-settings .pref-cs-smtp-inner-tabber > .pref-cs-inner-tabs,
.preferences-subpage-skeleton-scope.communication-settings .pref-cs-inner-tabs,
.page-content.pc-communication-settings .pref-cs-inner-tabs {
    display: flex;
    flex-wrap: nowrap;
    justify-content: flex-end;
    align-items: center;
    gap: 8px;
    margin: 0;
    padding: 12px 12px 0;
    list-style: none;
    width: 100%;
    float: none;
    box-sizing: border-box;
}
.preferences-subpage-skeleton-scope.communication-settings .pref-cs-inner-tabs__item,
.page-content.pc-communication-settings .pref-cs-inner-tabs__item {
    flex: 0 0 auto;
    width: auto;
    max-width: none;
    min-height: 32px;
    margin: 0;
    padding: 2px 4px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: transparent !important;
    border: none;
    box-sizing: border-box;
}
.preferences-subpage-skeleton-scope.communication-settings .pref-cs-inner-tabs__item::after,
.page-content.pc-communication-settings .pref-cs-inner-tabs__item::after {
    display: none !important;
    content: none !important;
}
.page-content.pc-communication-settings .pref-cs-inner-tabs__item.active,
.preferences-subpage-skeleton-scope.communication-settings .pref-cs-inner-tabs__item.active {
    background: transparent !important;
}
.preferences-subpage-skeleton-scope.communication-settings .pref-cs-skel-bar,
.page-content.pc-communication-settings .pref-cs-skel-bar {
    display: block;
    background-color: #dce3ec;
    border-radius: 4px;
    flex-shrink: 0;
    box-sizing: border-box;
}
.preferences-subpage-skeleton-scope.communication-settings .pref-cs-skel-bar--circle,
.page-content.pc-communication-settings .pref-cs-skel-bar--circle {
    border-radius: 50%;
}
.preferences-subpage-skeleton-scope.communication-settings .pref-cs-skel-bar--static::after,
.page-content.pc-communication-settings .pref-cs-skel-bar--static::after {
    display: none !important;
    animation: none !important;
    content: none !important;
}
.preferences-subpage-skeleton-scope.communication-settings .pref-cs-inner-tabs__pill--narrow,
.page-content.pc-communication-settings .pref-cs-inner-tabs__pill--narrow {
    width: 52px;
    height: 28px;
}
.preferences-subpage-skeleton-scope.communication-settings .pref-cs-inner-tabs__pill--wide,
.page-content.pc-communication-settings .pref-cs-inner-tabs__pill--wide {
    width: 64px;
    height: 28px;
}
.preferences-subpage-skeleton-scope.communication-settings .pref-cs-smtp-heading__title,
.page-content.pc-communication-settings .pref-cs-smtp-heading__title {
    width: 140px;
    height: 20px;
}
.preferences-subpage-skeleton-scope.communication-settings .pref-cs-smtp-heading__actions,
.page-content.pc-communication-settings .pref-cs-smtp-heading__actions {
    display: flex;
    align-items: center;
    gap: 8px;
    flex-shrink: 0;
}
.preferences-subpage-skeleton-scope.communication-settings .pref-cs-smtp-heading__btn,
.page-content.pc-communication-settings .pref-cs-smtp-heading__btn {
    width: 32px;
    height: 24px;
}
.preferences-subpage-skeleton-scope.communication-settings .pref-cs-smtp-heading__action,
.page-content.pc-communication-settings .pref-cs-smtp-heading__action {
    width: 32px;
    height: 32px;
}
.preferences-subpage-skeleton-scope.communication-settings .pref-cs-smtp-grid-table-shell,
.page-content.pc-communication-settings .pref-cs-smtp-grid-table-shell {
    width: 100%;
    padding: 5px;
    border: 1px solid #dce3ec;
    border-radius: 8px;
    background-color: #ffffff;
    box-sizing: border-box;
}
.preferences-subpage-skeleton-scope.communication-settings .pref-cs-smtp-grid-table,
.page-content.pc-communication-settings .pref-cs-smtp-grid-table {
    width: 100%;
    box-sizing: border-box;
}
.preferences-subpage-skeleton-scope.communication-settings .pref-cs-smtp-grid-table__table,
.page-content.pc-communication-settings .pref-cs-smtp-grid-table__table {
    width: 100%;
    border-collapse: separate;
    border-spacing: 0;
    table-layout: fixed;
    padding: 0;
    margin: 0;
    border-radius: 5px;
    overflow: hidden;
    background-color: #ffffff;
    border: 0;
    box-sizing: border-box;
}
.preferences-subpage-skeleton-scope.communication-settings .pref-cs-smtp-grid-table__header-cell,
.page-content.pc-communication-settings .pref-cs-smtp-grid-table__header-cell {
    height: 41px;
    padding: 0 10px;
    box-sizing: border-box;
    border-top: 0;
    border-bottom: 0;
    border-left: 0;
    background-color: #0043ff !important;
}
.preferences-subpage-skeleton-scope.communication-settings .pref-cs-smtp-grid-table__header-cell:not(:last-child),
.page-content.pc-communication-settings .pref-cs-smtp-grid-table__header-cell:not(:last-child) {
    border-right: 1px solid #e9e9e9;
}
.preferences-subpage-skeleton-scope.communication-settings .pref-cs-smtp-grid-table__header-cell:first-child,
.page-content.pc-communication-settings .pref-cs-smtp-grid-table__header-cell:first-child {
    border-top-left-radius: 5px;
}
.preferences-subpage-skeleton-scope.communication-settings .pref-cs-smtp-grid-table__header-cell:last-child,
.page-content.pc-communication-settings .pref-cs-smtp-grid-table__header-cell:last-child {
    border-top-right-radius: 5px;
    border-right: 0;
}
.preferences-subpage-skeleton-scope.communication-settings .pref-cs-smtp-grid-table__body-cell,
.page-content.pc-communication-settings .pref-cs-smtp-grid-table__body-cell {
    height: 55px;
    padding: 10px;
    box-sizing: border-box;
    border-top: 0;
    border-bottom: 0;
    border-left: 0;
    background-color: #f5f7fc !important;
}
.preferences-subpage-skeleton-scope.communication-settings .pref-cs-smtp-grid-table__body-row--alt .pref-cs-smtp-grid-table__body-cell,
.page-content.pc-communication-settings .pref-cs-smtp-grid-table__body-row--alt .pref-cs-smtp-grid-table__body-cell {
    background-color: #ffffff !important;
}
.preferences-subpage-skeleton-scope.communication-settings .pref-cs-smtp-grid-table__body-cell:not(:last-child),
.page-content.pc-communication-settings .pref-cs-smtp-grid-table__body-cell:not(:last-child) {
    border-right: 1px solid #e9e9e9;
}
.preferences-subpage-skeleton-scope.communication-settings .pref-cs-smtp-grid-table__body-row:last-child .pref-cs-smtp-grid-table__body-cell:first-child,
.page-content.pc-communication-settings .pref-cs-smtp-grid-table__body-row:last-child .pref-cs-smtp-grid-table__body-cell:first-child {
    border-bottom-left-radius: 5px;
}
.preferences-subpage-skeleton-scope.communication-settings .pref-cs-smtp-grid-table__body-row:last-child .pref-cs-smtp-grid-table__body-cell:last-child,
.page-content.pc-communication-settings .pref-cs-smtp-grid-table__body-row:last-child .pref-cs-smtp-grid-table__body-cell:last-child {
    border-bottom-right-radius: 5px;
    border-right: 0;
}
.preferences-subpage-skeleton-scope.communication-settings .pref-cs-smtp-grid,
.page-content.pc-communication-settings .pref-cs-smtp-grid {
    padding: 0;
    box-sizing: border-box;
}
.preferences-subpage-skeleton-scope.communication-settings .pref-cs-edit-skeleton-scope {
    width: 100%;
    box-sizing: border-box;
}
.preferences-subpage-skeleton-scope.communication-settings .pref-cs-smtp-edit-form {
    padding: 22px 22px 28px;
    margin-top: 0;
    width: 100%;
    box-sizing: border-box;
}
.preferences-subpage-skeleton-scope.communication-settings .pref-cs-smtp-edit-form.pref-cs-edit-form--tab-panel,
.page-content.pc-communication-settings .pref-cs-smtp-edit-form.pref-cs-edit-form--tab-panel {
    padding: 0;
    margin-top: 0;
}
.preferences-subpage-skeleton-scope.communication-settings .pref-cs-smtp-edit-form.pref-cs-edit-form--boxed,
.page-content.pc-communication-settings .pref-cs-smtp-edit-form.pref-cs-edit-form--boxed {
    margin-top: 5px;
}
.preferences-subpage-skeleton-scope.communication-settings .pref-cs-edit-heading {
    margin-bottom: 0;
}
.preferences-subpage-skeleton-scope.communication-settings .pref-cs-edit-field {
    margin-top: 20px;
    margin-bottom: 0;
}
.preferences-subpage-skeleton-scope.communication-settings .pref-cs-edit-field:first-of-type {
    margin-top: 20px;
}
.preferences-subpage-skeleton-scope.communication-settings .pref-cs-edit-validate-row {
    margin-top: 33px;
    margin-bottom: 0;
}
.preferences-subpage-skeleton-scope.communication-settings .pref-cs-edit-footer {
    margin-top: 16px;
    padding-top: 8px;
}
.preferences-subpage-skeleton-scope.communication-settings .pref-cs-edit-footer.pref-cs-buttons-outside,
.page-content.pc-communication-settings .pref-cs-edit-footer.pref-cs-buttons-outside,
.page-content.pc-communication-settings #pref-cs-sms-vendor-form-actions .pref-cs-edit-footer,
.page-content.pc-communication-settings #pref-cs-whatsapp-form-actions .pref-cs-edit-footer,
.page-content.pc-communication-settings #pref-cs-rcs-form-actions .pref-cs-edit-footer {
    margin-top: 20px;
    padding-top: 0;
    width: 100%;
    box-sizing: border-box;
}
.preferences-subpage-skeleton-scope.communication-settings .pref-cs-domain-form-skeleton {
    width: 100%;
    padding: 22px 22px 28px;
    margin-top: 0;
    box-sizing: border-box;
}
.preferences-subpage-skeleton-scope.communication-settings .pref-cs-domain-form-skeleton .pref-cs-edit-heading {
    margin-bottom: 20px;
}
.preferences-subpage-skeleton-scope.communication-settings .pref-cs-domain-form-footer {
    margin-top: 24px;
    padding-top: 8px;
}
.page-content.pc-communication-settings .pref-cs-domain-skeleton-scope {
    width: 100%;
    box-sizing: border-box;
}
.preferences-subpage-skeleton-scope.communication-settings .pref-cs-web-goal-form-skeleton {
    width: 100%;
    padding: 22px 22px 28px;
    margin-top: 0;
    box-sizing: border-box;
}
.preferences-subpage-skeleton-scope.communication-settings .pref-cs-web-permissions-skeleton,
.preferences-subpage-skeleton-scope.pref-cs-push-permissions-page-scope .pref-cs-push-permissions-page,
.pref-cs-push-permissions-skeleton-scope .pref-cs-push-permissions-page {
    width: 100%;
    box-sizing: border-box;
}
.pref-cs-push-permissions-skeleton-scope,
.page-content.alertsAndNotificationCSS .pref-cs-push-permissions-skeleton-scope,
.preferences-subpage-skeleton-scope.pref-cs-push-permissions-page-scope {
    width: 100%;
    box-sizing: border-box;
}
.pref-cs-push-permissions-skeleton-scope .pref-cs-push-permissions-panel,
.preferences-subpage-skeleton-scope.pref-cs-push-permissions-page-scope .pref-cs-push-permissions-panel {
    border: 1px solid #c2cfe3;
    border-radius: 5px;
    background: #fff;
    padding: 15px 19px 19px;
    box-sizing: border-box;
    width: 100%;
}
.pref-cs-push-permissions-skeleton-scope .pref-cs-push-permissions-page-title,
.preferences-subpage-skeleton-scope.pref-cs-push-permissions-page-scope .pref-cs-push-permissions-page-title {
    margin: 0 0 15px;
    line-height: 1.2;
}
.pref-cs-push-permissions-skeleton-scope .pref-cs-push-permissions-grid-wrap {
    width: 100%;
    margin-bottom: 0;
}
.pref-cs-push-permissions-skeleton-scope .pref-cs-push-permissions-table {
    table-layout: fixed;
    border-collapse: collapse;
}
.pref-cs-push-permissions-skeleton-scope .pref-cs-push-permissions-table td {
    border: 0;
    padding: 19px;
    vertical-align: middle;
    box-sizing: border-box;
}
.pref-cs-push-permissions-skeleton-scope .pref-cs-push-permissions-label {
    width: 90%;
}
.pref-cs-push-permissions-skeleton-scope .pref-cs-push-permissions-action {
    width: 10%;
    white-space: nowrap;
}
.pref-cs-push-permissions-skeleton-scope .pref-cs-push-permissions-row--alt td {
    background-color: #f0f8fc;
}
.pref-cs-push-permissions-skeleton-scope .pref-cs-push-permissions-toggle {
    border-radius: 14px;
}
.pref-cs-push-permissions-skeleton-scope .pref-cs-push-permissions-attributes,
.pref-cs-push-permissions-skeleton-scope .pref-cs-push-permissions-events {
    min-height: 140px;
    padding: 15px;
    box-sizing: border-box;
}
.pref-cs-push-permissions-skeleton-scope .pref-cs-push-permissions-attr-list li {
    margin-bottom: 6px;
}
.pref-cs-push-permissions-skeleton-scope .pref-cs-push-permissions-inbox {
    border: 1px solid #c2cfe3;
    border-radius: 5px;
    padding: 12px;
    box-sizing: border-box;
    min-height: 72px;
}
.pref-cs-push-permissions-skeleton-scope .pref-cs-push-permissions-footer {
    margin-top: 16px;
    padding-top: 8px;
}
.pref-cs-push-permissions-skeleton-scope .pref-cs-push-permissions-section-head {
    min-height: 28px;
}
.page-content.pc-communication-settings .pref-cs-web-goal-skeleton-scope,
.page-content.pc-communication-settings .pref-cs-web-permissions-skeleton-scope,
.page-content.alertsAndNotificationCSS .pref-cs-push-permissions-skeleton-scope {
    width: 100%;
    box-sizing: border-box;
}
.page-content.pc-communication-settings .pref-cs-edit-skeleton-scope,
.preferences-subpage-skeleton-scope.communication-settings .pref-cs-edit-skeleton-scope {
    width: 100%;
    box-sizing: border-box;
}
.preferences-subpage-skeleton-scope.communication-settings .pref-cs-inline-skeleton {
    padding-top: 0;
    background: transparent;
}
/* Live page: vertical channel Suspense (inside rs-vertical-tabs-wrapper > .tabs-content). */
.page-content.pc-communication-settings .pref-cs-channel-lazy-shell,
.preferences-subpage-skeleton-scope.communication-settings .pref-cs-channel-lazy-shell {
    width: 100%;
    max-width: 100%;
    box-sizing: border-box;
    float: left;
    clear: both;
}
.page-content.pc-communication-settings .pref-cs-channel-lazy-shell > .pref-cs-sub-tabs.rs-sub-tabs.rs-cc-sub-tabs,
.preferences-subpage-skeleton-scope.communication-settings .pref-cs-channel-lazy-shell > .pref-cs-sub-tabs.rs-sub-tabs.rs-cc-sub-tabs {
    float: left;
    width: 100%;
    max-width: 100%;
    margin: 0;
    padding: 0;
    list-style: none;
    box-sizing: border-box;
    display: flex;
    flex-wrap: nowrap;
    gap: 7px;
    position: relative;
    z-index: 101;
}
.page-content.pc-communication-settings .pref-cs-channel-lazy-shell > .pref-cs-mail-tabs-content.tabs-content,
.preferences-subpage-skeleton-scope.communication-settings .pref-cs-channel-lazy-shell > .pref-cs-mail-tabs-content.tabs-content {
    float: none;
    width: 100%;
    max-width: 100%;
    margin: 0;
    padding: 0;
    box-sizing: border-box;
    clear: both;
}
.page-content.pc-communication-settings .pref-cs-channel-lazy-shell .pref-cs-smtp-root,
.page-content.pc-communication-settings .pref-cs-channel-lazy-shell .pref-cs-mail-tabs-content .rsv-tabs-content,
.preferences-subpage-skeleton-scope.communication-settings .pref-cs-channel-lazy-shell .pref-cs-smtp-root,
.preferences-subpage-skeleton-scope.communication-settings .pref-cs-channel-lazy-shell .pref-cs-mail-tabs-content .rsv-tabs-content {
    float: none !important;
    width: 100% !important;
    max-width: 100% !important;
    margin: 0 !important;
}
.page-content.pc-communication-settings .rs-vertical-tabs-wrapper > .tabs-content > .pref-cs-channel-lazy-shell,
.preferences-subpage-skeleton-scope.communication-settings .rs-vertical-tabs-wrapper > .tabs-content > .pref-cs-channel-lazy-shell {
    width: 100%;
    max-width: 100%;
}
/* Inner tab lazy (SMTP / WhatsApp / Web) — panel only, inside existing box. */
.page-content.pc-communication-settings .tabs-content .pref-cs-smtp-tab-body,
.preferences-subpage-skeleton-scope.communication-settings .tabs-content .pref-cs-smtp-tab-body {
    width: 100%;
    box-sizing: border-box;
}
.page-content.pc-communication-settings .tabs-content .pref-cs-smtp-root,
.preferences-subpage-skeleton-scope.communication-settings .tabs-content .pref-cs-smtp-root {
    width: 100%;
    max-width: 100%;
    float: none !important;
    box-sizing: border-box;
}
.page-content.pc-communication-settings .pref-cs-channel-lazy-shell .pref-cs-sub-tabs__item,
.preferences-subpage-skeleton-scope.communication-settings .pref-cs-channel-lazy-shell .pref-cs-sub-tabs__item {
    float: none;
    flex: 0 0 177px;
    width: 177px;
    max-width: 177px;
    min-height: 85px;
    margin-left: 0;
    padding: 11px 19px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    border: 1px solid #c2cfe3;
    border-bottom: 0 !important;
    border-top-left-radius: 15px;
    border-top-right-radius: 15px;
    background: #fff !important;
    box-sizing: border-box;
}
.page-content.pc-communication-settings .pref-cs-channel-lazy-shell > .pref-cs-mail-tabs-content.tabs-content {
    margin-top: 0;
    border-top: 1px solid #c2cfe3;
}
/* Inner icon sub-tab Suspense — nested inside channel RSTabbar tabs-content. */
.page-content.pc-communication-settings .rs-vertical-tabs-wrapper .rs-cc-sub-tabs ~ .tabs-content > .pref-cs-smtp-root,
.page-content.pc-communication-settings .rs-vertical-tabs-wrapper .pref-cs-mail-tabs-content > .tabs-content > .pref-cs-smtp-root,
.page-content.pc-communication-settings .rs-vertical-tabs-wrapper .pref-cs-channel-lazy-shell .pref-cs-mail-tabs-content > .tabs-content > .pref-cs-smtp-root,
.preferences-subpage-skeleton-scope.communication-settings .rs-vertical-tabs-wrapper .rs-cc-sub-tabs ~ .tabs-content > .pref-cs-smtp-root,
.preferences-subpage-skeleton-scope.communication-settings .rs-vertical-tabs-wrapper .pref-cs-mail-tabs-content > .tabs-content > .pref-cs-smtp-root {
    float: none !important;
    width: 100% !important;
    max-width: 100% !important;
    margin: 0 !important;
    clear: both;
    box-sizing: border-box;
}
.page-content.pc-communication-settings .rs-vertical-tabs-wrapper .rs-cc-sub-tabs ~ .tabs-content > .pref-cs-smtp-root .pref-cs-smtp-panel,
.preferences-subpage-skeleton-scope.communication-settings .rs-vertical-tabs-wrapper .rs-cc-sub-tabs ~ .tabs-content > .pref-cs-smtp-root .pref-cs-smtp-panel {
    width: 100%;
    margin-top: 0;
    box-sizing: border-box;
}
.page-content.pc-communication-settings .rs-vertical-tabs-wrapper .rs-cc-sub-tabs ~ .tabs-content > .pref-cs-smtp-root .pref-cs-smtp-tab-body,
.preferences-subpage-skeleton-scope.communication-settings .rs-vertical-tabs-wrapper .rs-cc-sub-tabs ~ .tabs-content > .pref-cs-smtp-root .pref-cs-smtp-tab-body {
    width: 100% !important;
    float: none;
    clear: both;
    margin-top: 20px;
    box-sizing: border-box;
}
.page-content.pc-communication-settings .rs-vertical-tabs-wrapper .rs-cc-sub-tabs + .tabs-content .rsv-tabs-content,
.page-content.pc-communication-settings .rs-vertical-tabs-wrapper .tabs-right-align.pageSub_tab {
    width: 100%;
    max-width: 100%;
    float: none;
    clear: both;
    box-sizing: border-box;
}
.page-content.pc-communication-settings .pref-cs-notification-subtabs.tabs-right-align.pageSub_tab {
    position: relative;
    display: block;
}
.page-content.pc-communication-settings .pref-cs-notification-subtabs .rs-tabs.row,
.page-content.pc-communication-settings .pref-cs-notification-subtabs .res-tabs.row,
.page-content.pc-communication-settings .rs-vertical-tabs-wrapper .tabs-right-align.pageSub_tab .rs-tabs.row,
.page-content.pc-communication-settings .rs-vertical-tabs-wrapper .tabs-right-align.pageSub_tab .res-tabs.row,
.page-content.pc-communication-settings .rs-vertical-tabs-wrapper .res-tabs-right-align.pageSub_tab .rs-tabs.row,
.page-content.pc-communication-settings .rs-vertical-tabs-wrapper .res-tabs-right-align.pageSub_tab .res-tabs.row {
    display: flex;
    flex-wrap: nowrap;
    justify-content: flex-end;
    align-items: center;
    width: 100%;
    max-width: 100%;
    margin: 0;
    float: none;
}
.page-content.pc-communication-settings .rs-vertical-tabs-wrapper .box-design.bd-top-border .tabs-right-align.pageSub_tab .res-tabber > .res-tabs.row > .res-tab-default,
.page-content.pc-communication-settings .rs-vertical-tabs-wrapper .box-design.bd-top-border .tabs-right-align.pageSub_tab .res-tabber > .res-tabs.row > .res-tab-transparent,
.page-content.pc-communication-settings .rs-vertical-tabs-wrapper .box-design.bd-top-border .res-tabs-right-align.pageSub_tab .res-tabber > .res-tabs.row > .res-tab-default,
.page-content.pc-communication-settings .rs-vertical-tabs-wrapper .box-design.bd-top-border .res-tabs-right-align.pageSub_tab .res-tabber > .res-tabs.row > .res-tab-transparent {
    flex: 0 0 auto;
    width: auto;
    max-width: none;
}
.page-content.pc-communication-settings .pref-cs-notification-subtabs .tabs-content,
.page-content.pc-communication-settings .rs-vertical-tabs-wrapper .tabs-right-align.pageSub_tab .tabs-content,
.page-content.pc-communication-settings .rs-vertical-tabs-wrapper .tabs-right-align.pageSub_tab .res-tabs-content,
.page-content.pc-communication-settings .rs-vertical-tabs-wrapper .res-tabs-right-align.pageSub_tab .tabs-content,
.page-content.pc-communication-settings .rs-vertical-tabs-wrapper .res-tabs-right-align.pageSub_tab .res-tabs-content {
    clear: both;
    width: 100%;
    max-width: 100%;
    float: none;
    box-sizing: border-box;
}
/* Live vertical channel layout (before app.scss) — mirrors _rsTabber.scss .rs-vertical-tabs-wrapper */
.page-content.pc-communication-settings .rs-vertical-tabs-wrapper {
    position: relative;
    box-sizing: border-box;
}
.page-content.pc-communication-settings .rs-vertical-tabs-wrapper::after {
    content: '';
    display: table;
    clear: both;
}
.page-content.pc-communication-settings .rs-vertical-tabs-wrapper > .rsv-tabs-list.vertical-tabs {
    float: left;
    width: 150px;
    margin-right: 10px;
    box-sizing: border-box;
}
.page-content.pc-communication-settings .rs-vertical-tabs-wrapper > .tabs-content {
    float: left;
    width: calc(100% - 160px);
    max-width: calc(100% - 160px);
    box-sizing: border-box;
}
.page-content.pc-communication-settings .rs-vertical-tabs-wrapper .rs-cc-sub-tabs {
    float: left;
    width: 100%;
    max-width: 100%;
    position: relative;
    z-index: 101;
    box-sizing: border-box;
}
.page-content.pc-communication-settings .rs-vertical-tabs-wrapper .rs-cc-sub-tabs + .tabs-content {
    float: left;
    width: 100%;
    max-width: 100%;
    clear: both;
    box-sizing: border-box;
}
/* Lazy channel shell — skeleton only; lives inside channel column */
.page-content.pc-communication-settings .rs-vertical-tabs-wrapper > .tabs-content > .pref-cs-channel-lazy-shell--channel {
    width: 100%;
    max-width: 100%;
    float: left;
    clear: both;
    box-sizing: border-box;
}
.page-content.pc-communication-settings .rs-vertical-tabs-wrapper > .tabs-content > .pref-cs-channel-lazy-shell--channel > .pref-cs-sub-tabs.rs-sub-tabs.rs-cc-sub-tabs {
    float: left;
    width: 100%;
    max-width: 100%;
    position: relative;
    z-index: 101;
    box-sizing: border-box;
}
.page-content.pc-communication-settings .rs-vertical-tabs-wrapper > .tabs-content > .pref-cs-channel-lazy-shell--channel > .pref-cs-mail-tabs-content.tabs-content {
    float: left;
    width: 100%;
    clear: both;
    margin-top: 0;
    border-top: 1px solid #c2cfe3;
    box-sizing: border-box;
}
/* Email footer preview modal — inline skeleton while GetEmailFooterById + GetClientDetails load. */
.preferences-subpage-skeleton-scope .pref-email-footer-preview-skeleton,
.page-content.pc-communication-settings .pref-email-footer-preview-skeleton {
    width: 100%;
    max-width: 560px;
    margin: 0 auto;
    padding: 12px 16px 24px;
    box-sizing: border-box;
}
.preferences-subpage-skeleton-scope .pref-email-footer-preview-body,
.page-content.pc-communication-settings .pref-email-footer-preview-body {
    min-height: 280px;
    box-sizing: border-box;
}
`;

/** Consumption channel grid page — full-width Kendo table before app.scss loads. */
export const consumptionChannelSkeletonCriticalCss = `
.preferences-subpage-skeleton-scope .pref-consumption-channel-page-skeleton {
    width: 100%;
    box-sizing: border-box;
}
.preferences-subpage-skeleton-scope .pref-consumption-channel-page-skeleton .consumptionEmail {
    margin-bottom: 10px;
}
.preferences-subpage-skeleton-scope .pref-consumption-channel-page-skeleton .rs-kendo-grid-table {
    width: 100%;
    max-width: 100%;
    box-sizing: border-box;
}
.preferences-subpage-skeleton-scope .pref-consumption-channel-page-skeleton .rs-kendo-scrollable-grid,
.preferences-subpage-skeleton-scope .pref-consumption-channel-page-skeleton .rs-grid-loading-skeleton {
    width: 100% !important;
    max-width: 100% !important;
    margin: 0 !important;
    box-sizing: border-box;
}
.preferences-subpage-skeleton-scope .pref-consumption-channel-page-skeleton .rs-grid-loading-skeleton table {
    width: 100% !important;
    max-width: 100% !important;
    table-layout: fixed;
    border-collapse: collapse;
}
.preferences-subpage-skeleton-scope .pref-consumption-channel-page-skeleton .rs-grid-loading-skeleton .skeleton-blue-row td {
    width: auto !important;
}
.preferences-subpage-skeleton-scope .page-content .rs-consumptions-wrapper {
    max-width: 100%;
    width: 100%;
    box-sizing: border-box;
}
`;

/** Communication settings — subscribe / unsubscribe create-edit form. */
export const communicationSubscriptionSkeletonCriticalCss = `
.preferences-subpage-skeleton-scope.communication-subscription.page-content-holder,
.preferences-subpage-skeleton-scope.communication-subscription .page-content,
.page-layout-skeleton--inline.preferences-subpage-skeleton-scope.communication-subscription {
    background-color: #f5f7fc;
    box-sizing: border-box;
}
.preferences-subpage-skeleton-scope.communication-subscription .page-content.px0,
.page-content-holder .page-content.px0.mt21 {
    max-width: 1260px;
    width: 100%;
    margin-left: auto;
    margin-right: auto;
    padding-left: 0;
    padding-right: 0;
    box-sizing: border-box;
}
.preferences-subpage-skeleton-scope .pref-cs-subscription-form-skeleton,
.pref-cs-subscription-skeleton-scope .pref-cs-subscription-form-skeleton {
    width: 100%;
    background: #fff;
    border: 1px solid #c2cfe3;
    border-radius: var(--globalBorderRadius, 5px);
    box-sizing: border-box;
}
.preferences-subpage-skeleton-scope .pref-cs-subscription-logo-skeleton {
    width: 100%;
    max-width: 200px;
    margin: 20px auto 0;
}
.preferences-subpage-skeleton-scope .box-left-border.pref-cs-subscription-form-skeleton > .col-md-9,
.preferences-subpage-skeleton-scope .pref-cs-subscription-form-skeleton .box-left-border {
    border-left: 1px solid #e9e9e9;
    box-sizing: border-box;
}
@media (max-width: 767px) {
    .preferences-subpage-skeleton-scope .pref-cs-subscription-form-skeleton .box-left-border {
        border-left: none;
        margin-top: 20px;
        padding-top: 20px;
    }
}
.preferences-subpage-skeleton-scope .pref-cs-subscription-inner-tabs {
    padding: 0;
    margin: 40px 0 20px;
}
.preferences-subpage-skeleton-scope .pref-cs-subscription-footer {
    padding-top: 8px;
}
`;

/** Audience score — vertical tabs + score band + inner panels (route + in-tab gate). */
export const audienceScoreSkeletonCriticalCss = `
.preferences-subpage-skeleton-scope.pc-audience-score .pref-as-page-skeleton,
.page-content.audienceScorePageCSS.pref-as-page-skeleton,
.page-content.audienceScorePageCSS .pref-as-tabs-layout-skeleton {
    width: 100%;
    max-width: 100%;
    box-sizing: border-box;
    overflow: visible;
}
.preferences-subpage-skeleton-scope.pc-audience-score .pref-as-score-band-skeleton,
.page-content.audienceScorePageCSS .pref-as-score-band-skeleton {
    display: block;
    width: 100%;
    clear: both;
    box-sizing: border-box;
}
.preferences-subpage-skeleton-scope.pc-audience-score .pref-as-score-band-skeleton .audienceScoreListCSS li,
.page-content.audienceScorePageCSS .pref-as-score-band-skeleton .audienceScoreListCSS li {
    list-style: none;
    min-width: 28px;
    min-height: 28px;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 3px;
    margin-right: 5px;
    border: 1px solid #c2cfe3;
    background: #fff;
    box-sizing: border-box;
}
.preferences-subpage-skeleton-scope.pc-audience-score .pref-as-score-band-skeleton .audienceScoreListCSS li.active,
.page-content.audienceScorePageCSS .pref-as-score-band-skeleton .audienceScoreListCSS li.active {
    background: #004fdf;
    border-color: #004fdf;
}
.preferences-subpage-skeleton-scope.pc-audience-score .pref-as-tabs-layout-skeleton,
.page-content.audienceScorePageCSS .pref-as-tabs-layout-skeleton {
    position: relative;
    width: 100%;
    clear: both;
    box-sizing: border-box;
}
.preferences-subpage-skeleton-scope.pc-audience-score .pref-as-tabs-layout-skeleton::after,
.page-content.audienceScorePageCSS .pref-as-tabs-layout-skeleton::after,
.page-content.audienceScorePageCSS .rs-vertical-tabs-wrapper.pref-as-live-tabs::after {
    content: '';
    display: table;
    clear: both;
}
.preferences-subpage-skeleton-scope.pc-audience-score .pref-as-vertical-tabs,
.page-content.audienceScorePageCSS .pref-as-vertical-tabs,
.page-content.audienceScorePageCSS .rs-vertical-tabs-wrapper.pref-as-live-tabs > .rsv-tabs-list.vertical-tabs {
    float: left;
    width: 150px;
    margin-right: 10px;
    padding: 5px !important;
    background: #fff;
    border: 1px solid #c2cfe3;
    border-radius: var(--globalBorderRadius, 5px);
    box-shadow: 0 0 5px 0 rgba(0, 0, 0, 0.05);
    list-style: none;
    box-sizing: border-box;
}
.preferences-subpage-skeleton-scope.pc-audience-score .pref-as-vertical-tabs__item,
.page-content.audienceScorePageCSS .pref-as-vertical-tabs__item {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 72px;
    padding: 8px 4px;
    border-bottom: 1px solid #e9e9e9;
    box-sizing: border-box;
}
.preferences-subpage-skeleton-scope.pc-audience-score .pref-as-vertical-tabs__item:last-child,
.page-content.audienceScorePageCSS .pref-as-vertical-tabs__item:last-child {
    border-bottom: none;
}
.preferences-subpage-skeleton-scope.pc-audience-score .pref-as-vertical-tabs__item.active,
.page-content.audienceScorePageCSS .pref-as-vertical-tabs__item.active {
    background: #004fdf !important;
}
.preferences-subpage-skeleton-scope.pc-audience-score .pref-as-vertical-tabs__item::after,
.page-content.audienceScorePageCSS .pref-as-vertical-tabs__item::after {
    display: none !important;
}
.preferences-subpage-skeleton-scope.pc-audience-score .pref-as-tabs-content-skeleton,
.page-content.audienceScorePageCSS .pref-as-tabs-content-skeleton,
.page-content.audienceScorePageCSS .rs-vertical-tabs-wrapper.pref-as-live-tabs > .tabs-content {
    float: left;
    width: calc(100% - 160px);
    min-width: 0;
    box-sizing: border-box;
}
.preferences-subpage-skeleton-scope.pc-audience-score .pref-as-inner-skeleton,
.page-content.audienceScorePageCSS .pref-as-inner-skeleton {
    width: 100%;
    box-sizing: border-box;
}
.preferences-subpage-skeleton-scope.pc-audience-score .pref-as-persona-grid,
.page-content.audienceScorePageCSS .pref-as-persona-grid {
    display: flex;
    flex-wrap: wrap;
    width: 100%;
    margin-left: 0;
    margin-right: 0;
    box-sizing: border-box;
}
.preferences-subpage-skeleton-scope.pc-audience-score .pref-as-persona-grid__col,
.page-content.audienceScorePageCSS .pref-as-persona-grid__col {
    flex: 0 0 50%;
    max-width: 50%;
    box-sizing: border-box;
}
.preferences-subpage-skeleton-scope.pc-audience-score .pref-as-inner-skeleton .box-design.bd-top-border,
.page-content.audienceScorePageCSS .pref-as-inner-skeleton .box-design.bd-top-border {
    overflow: visible;
}
.preferences-subpage-skeleton-scope.pc-audience-score .pref-as-persona-card-skeleton,
.page-content.audienceScorePageCSS .pref-as-persona-card-skeleton {
    width: 100%;
    box-sizing: border-box;
}
.page-content.audienceScorePageCSS .rs-vertical-tabs-wrapper.pref-as-live-tabs {
    position: relative;
    clear: both;
    width: 100%;
}
`;

/** Data exchange — top RSTabbarFluid + vertical category tabs + connector cards. */
export const dataExchangeSkeletonCriticalCss = `
.preferences-subpage-skeleton-scope.pc-data-exchange,
.pref-de-tab-content-skeleton-gate.pc-data-exchange,
.pref-de-route-body,
.page-content.pc-data-exchange {
    box-sizing: border-box;
}
.pref-de-route-body {
    width: 100%;
    max-width: 1260px;
    margin-left: auto;
    margin-right: auto;
    padding-left: 12px;
    padding-right: 12px;
}
.preferences-subpage-skeleton-scope.pc-data-exchange .pref-de-page-skeleton,
.pref-de-tab-content-skeleton-gate.pc-data-exchange .pref-de-page-skeleton,
.page-content.pc-data-exchange.pref-de-page-skeleton {
    width: 100%;
    max-width: 1260px;
    margin-left: auto;
    margin-right: auto;
    box-sizing: border-box;
    margin-top:10px;
}
.preferences-subpage-skeleton-scope.pc-data-exchange .pref-de-skel-bar,
.pref-de-tab-content-skeleton-gate.pc-data-exchange .pref-de-skel-bar,
.page-content.pc-data-exchange .pref-de-skel-bar {
    display: block;
    background-color: #e2e7ee;
    border-radius: 4px;
    flex-shrink: 0;
    box-sizing: border-box;
}
.preferences-subpage-skeleton-scope.pc-data-exchange .pref-de-skel-bar--circle,
.pref-de-tab-content-skeleton-gate.pc-data-exchange .pref-de-skel-bar--circle,
.page-content.pc-data-exchange .pref-de-skel-bar--circle {
    border-radius: 50%;
}
.preferences-subpage-skeleton-scope.pc-data-exchange .pref-de-skel-bar::after,
.pref-de-tab-content-skeleton-gate.pc-data-exchange .pref-de-skel-bar::after,
.page-content.pc-data-exchange .pref-de-skel-bar::after {
    display: none !important;
    animation: none !important;
}
.preferences-subpage-skeleton-scope.pc-data-exchange .pref-de-header-rs-page-header-skeleton .heading-title-text h1,
.pref-de-tab-content-skeleton-gate.pc-data-exchange .pref-de-header-rs-page-header-skeleton .heading-title-text h1,
.page-content.pc-data-exchange .pref-de-header-rs-page-header-skeleton .heading-title-text h1 {
    margin: 0;
    padding: 0;
    line-height: 1.2;
}
.preferences-subpage-skeleton-scope.pc-data-exchange .pref-de-header-rs-page-header-skeleton .mhw-container,
.pref-de-route-body .pref-de-header-rs-page-header-skeleton .mhw-container {
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    padding: 5px 0;
    min-height: 40px;
    box-sizing: border-box;
}
.preferences-subpage-skeleton-scope.pc-data-exchange .pref-de-header-rs-page-header-skeleton .mhwc-right,
.pref-de-route-body .pref-de-header-rs-page-header-skeleton .mhwc-right {
    gap: 15px;
}
.preferences-subpage-skeleton-scope.pc-data-exchange .pref-de-ingestion-skeleton,
.pref-de-tab-content-skeleton-gate.pc-data-exchange .pref-de-ingestion-skeleton,
.page-content.pc-data-exchange .pref-de-ingestion-skeleton {
    margin-top: 21px;
    width: 100%;
}
.preferences-subpage-skeleton-scope.pc-data-exchange .pref-de-api-skeleton,
.pref-de-tab-content-skeleton-gate.pc-data-exchange .pref-de-api-skeleton,
.page-content.pc-data-exchange .pref-de-api-skeleton {
    margin-top: 20px;
    width: 100%;
}
.preferences-subpage-skeleton-scope.pc-data-exchange .pref-de-api-panel-skeleton .pref-de-ingestion-panel-skeleton__content,
.pref-de-tab-content-skeleton-gate.pc-data-exchange .pref-de-api-panel-skeleton .pref-de-ingestion-panel-skeleton__content,
.page-content.pc-data-exchange .pref-de-api-panel-skeleton .pref-de-ingestion-panel-skeleton__content {
    margin-left: 0;
}
.preferences-subpage-skeleton-scope.pc-data-exchange .pref-de-ingestion-panel-skeleton__toolbar--title-only,
.pref-de-tab-content-skeleton-gate.pc-data-exchange .pref-de-ingestion-panel-skeleton__toolbar--title-only,
.page-content.pc-data-exchange .pref-de-ingestion-panel-skeleton__toolbar--title-only {
    justify-content: flex-start;
    height: auto;
    margin-bottom: 15px;
}
.preferences-subpage-skeleton-scope.pc-data-exchange .pref-de-api-panel-skeleton .pref-de-integrated-card-skeleton__logo,
.pref-de-tab-content-skeleton-gate.pc-data-exchange .pref-de-api-panel-skeleton .pref-de-integrated-card-skeleton__logo,
.page-content.pc-data-exchange .pref-de-api-panel-skeleton .pref-de-integrated-card-skeleton__logo {
    min-height: 80px;
    padding: 16px 8px;
}
.preferences-subpage-skeleton-scope.pc-data-exchange .pref-de-ingestion-panel-skeleton__content,
.pref-de-tab-content-skeleton-gate.pc-data-exchange .pref-de-ingestion-panel-skeleton__content,
.page-content.pc-data-exchange .pref-de-ingestion-panel-skeleton__content {
    margin-left: 15px;
    width: 100%;
    box-sizing: border-box;
}
.preferences-subpage-skeleton-scope.pc-data-exchange .pref-de-ingestion-panel-skeleton__toolbar,
.pref-de-tab-content-skeleton-gate.pc-data-exchange .pref-de-ingestion-panel-skeleton__toolbar,
.page-content.pc-data-exchange .pref-de-ingestion-panel-skeleton__toolbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 0;
    width: 100%;
    box-sizing: border-box;
    height:74px;
}
/* API consumptions — toolbar: no 74px height, no 15px bottom margin */
.preferences-subpage-skeleton-scope.pc-data-exchange .pref-de-api-panel-skeleton .pref-de-ingestion-panel-skeleton__toolbar,
.pref-de-tab-content-skeleton-gate.pc-data-exchange .pref-de-api-panel-skeleton .pref-de-ingestion-panel-skeleton__toolbar,
.page-content.pc-data-exchange .pref-de-api-panel-skeleton .pref-de-ingestion-panel-skeleton__toolbar,
.preferences-subpage-skeleton-scope.pc-data-exchange .pref-de-api-panel-skeleton .pref-de-ingestion-panel-skeleton__toolbar--title-only,
.pref-de-tab-content-skeleton-gate.pc-data-exchange .pref-de-api-panel-skeleton .pref-de-ingestion-panel-skeleton__toolbar--title-only,
.page-content.pc-data-exchange .pref-de-api-panel-skeleton .pref-de-ingestion-panel-skeleton__toolbar--title-only {
    height: auto;
    margin-bottom: 15px;
    justify-content: flex-start;
}
.page-content.pc-data-exchange .pref-de-ingestion-panel-skeleton__toolbar .pref-de-skel-bar--circle {
  margin-right:18px
}
.preferences-subpage-skeleton-scope.pc-data-exchange .pref-de-ingestion-panel-skeleton__integrated-panel,
.pref-de-tab-content-skeleton-gate.pc-data-exchange .pref-de-ingestion-panel-skeleton__integrated-panel,
.page-content.pc-data-exchange .pref-de-ingestion-panel-skeleton__integrated-panel {
    margin-bottom: 15px;
    padding: 0;
    border: 1px solid #c2cfe3;
    border-radius: var(--globalBorderRadius, 5px);
    background-color: #ffffff;
    box-sizing: border-box;
}
.preferences-subpage-skeleton-scope.pc-data-exchange .pref-de-ingestion-panel-skeleton__available-heading,
.pref-de-tab-content-skeleton-gate.pc-data-exchange .pref-de-ingestion-panel-skeleton__available-heading,
.page-content.pc-data-exchange .pref-de-ingestion-panel-skeleton__available-heading {
    display: flex;
    align-items: center;
    margin-bottom: 15px;
    width: 100%;
    box-sizing: border-box;
}
/* Shared grid — ingestion integrated/available; API integrated uses 3 columns (override below) */
.preferences-subpage-skeleton-scope.pc-data-exchange .pref-de-cards-grid,
.pref-de-tab-content-skeleton-gate.pc-data-exchange .pref-de-cards-grid,
.page-content.pc-data-exchange .pref-de-cards-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    column-gap: 20px;
    row-gap: 21px;
    margin: 0;
    padding: 0;
    width: 100%;
    box-sizing: border-box;
}
/* API consumptions — integrated systems: 3 columns (matches live Col sm={4}) */
.preferences-subpage-skeleton-scope.pc-data-exchange .pref-de-api-panel-skeleton .pref-de-integrated-grid.pref-de-cards-grid,
.pref-de-tab-content-skeleton-gate.pc-data-exchange .pref-de-api-panel-skeleton .pref-de-integrated-grid.pref-de-cards-grid,
.page-content.pc-data-exchange .pref-de-api-panel-skeleton .pref-de-integrated-grid.pref-de-cards-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
}
/* API consumptions — available systems: 3 columns (matches live Col md={4}) */
.preferences-subpage-skeleton-scope.pc-data-exchange .pref-de-api-available-cards-row.pref-de-cards-grid,
.pref-de-tab-content-skeleton-gate.pc-data-exchange .pref-de-api-available-cards-row.pref-de-cards-grid,
.page-content.pc-data-exchange .pref-de-api-available-cards-row.pref-de-cards-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
}
.preferences-subpage-skeleton-scope.pc-data-exchange .pref-de-ingestion-panel-skeleton__integrated-panel .pref-de-cards-grid,
.pref-de-tab-content-skeleton-gate.pc-data-exchange .pref-de-ingestion-panel-skeleton__integrated-panel .pref-de-cards-grid,
.page-content.pc-data-exchange .pref-de-ingestion-panel-skeleton__integrated-panel .pref-de-cards-grid {
    padding: 10px;
    row-gap: 21px;
}
.preferences-subpage-skeleton-scope.pc-data-exchange .pref-de-integrated-grid,
.pref-de-tab-content-skeleton-gate.pc-data-exchange .pref-de-integrated-grid,
.page-content.pc-data-exchange .pref-de-integrated-grid,
.preferences-subpage-skeleton-scope.pc-data-exchange .pref-de-cards-row,
.pref-de-tab-content-skeleton-gate.pc-data-exchange .pref-de-cards-row,
.page-content.pc-data-exchange .pref-de-cards-row {
    width: 100%;
    box-sizing: border-box;
}
.preferences-subpage-skeleton-scope.pc-data-exchange .pref-de-connector-category,
.pref-de-tab-content-skeleton-gate.pc-data-exchange .pref-de-connector-category,
.page-content.pc-data-exchange .pref-de-connector-category {
    margin-bottom: 15px;
    width: 100%;
    box-sizing: border-box;
}
.preferences-subpage-skeleton-scope.pc-data-exchange .pref-de-connector-category__title,
.pref-de-tab-content-skeleton-gate.pc-data-exchange .pref-de-connector-category__title,
.page-content.pc-data-exchange .pref-de-connector-category__title {
    display: block;
    padding: 0;
    margin-bottom: 15px;
    box-sizing: border-box;
}
.preferences-subpage-skeleton-scope.pc-data-exchange .pref-de-integrated-card-skeleton,
.pref-de-tab-content-skeleton-gate.pc-data-exchange .pref-de-integrated-card-skeleton,
.page-content.pc-data-exchange .pref-de-integrated-card-skeleton,
.preferences-subpage-skeleton-scope.pc-data-exchange .pref-de-connector-skeleton,
.pref-de-tab-content-skeleton-gate.pc-data-exchange .pref-de-connector-skeleton,
.page-content.pc-data-exchange .pref-de-connector-skeleton,
.preferences-subpage-skeleton-scope.pc-data-exchange .pref-de-api-available-card-skeleton,
.pref-de-tab-content-skeleton-gate.pc-data-exchange .pref-de-api-available-card-skeleton,
.page-content.pc-data-exchange .pref-de-api-available-card-skeleton {
    width: 100%;
    min-width: 0;
    padding: 0;
    box-sizing: border-box;
}
.preferences-subpage-skeleton-scope.pc-data-exchange .pref-de-integrated-card-skeleton__card,
.pref-de-tab-content-skeleton-gate.pc-data-exchange .pref-de-integrated-card-skeleton__card,
.page-content.pc-data-exchange .pref-de-integrated-card-skeleton__card {
    position: relative;
    border: 1px solid #c2cfe3;
    border-radius: var(--globalBorderRadius, 5px);
    overflow: visible;
    background-color: #ffffff;
    box-sizing: border-box;
}
.preferences-subpage-skeleton-scope.pc-data-exchange .pref-de-integrated-card-skeleton__logo,
.pref-de-tab-content-skeleton-gate.pc-data-exchange .pref-de-integrated-card-skeleton__logo,
.page-content.pc-data-exchange .pref-de-integrated-card-skeleton__logo {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 116px;
    padding: 5px;
    border-bottom: 1px solid #c2cfe3;
    box-sizing: border-box;
}
.preferences-subpage-skeleton-scope.pc-data-exchange .pref-de-integrated-card-skeleton__title,
.pref-de-tab-content-skeleton-gate.pc-data-exchange .pref-de-integrated-card-skeleton__title,
.page-content.pc-data-exchange .pref-de-integrated-card-skeleton__title {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 10px 8px;
    border-bottom: 1px solid #c2cfe3;
    box-sizing: border-box;
}
.preferences-subpage-skeleton-scope.pc-data-exchange .pref-de-integrated-card-skeleton__status,
.pref-de-tab-content-skeleton-gate.pc-data-exchange .pref-de-integrated-card-skeleton__status,
.page-content.pc-data-exchange .pref-de-integrated-card-skeleton__status {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 6px;
    min-height: 58px;
    padding: 8px 10px;
    background-color: #ffffff;
    border-bottom-left-radius: var(--globalBorderRadius, 5px);
    border-bottom-right-radius: var(--globalBorderRadius, 5px);
    box-sizing: border-box;
}
.preferences-subpage-skeleton-scope.pc-data-exchange .pref-de-integrated-card-topSmallCard .pref-de-integrated-card-skeleton__action,
.pref-de-tab-content-skeleton-gate.pc-data-exchange .pref-de-integrated-card-topSmallCard .pref-de-integrated-card-skeleton__action,
.page-content.pc-data-exchange .pref-de-integrated-card-topSmallCard .pref-de-integrated-card-skeleton__action {
    position: absolute;
    top: 0;
    right: 5px;
    line-height: 0;
    z-index: 2;
    padding: 5px;
    box-sizing: border-box;
}
.preferences-subpage-skeleton-scope.pc-data-exchange .pref-de-integrated-card-topSmallCard .pref-de-integrated-card-skeleton__action .pref-de-skel-bar,
.pref-de-tab-content-skeleton-gate.pc-data-exchange .pref-de-integrated-card-topSmallCard .pref-de-integrated-card-skeleton__action .pref-de-skel-bar,
.page-content.pc-data-exchange .pref-de-integrated-card-topSmallCard .pref-de-integrated-card-skeleton__action .pref-de-skel-bar {
    border-radius: 50%;
    box-sizing: border-box;
}
.preferences-subpage-skeleton-scope.pc-data-exchange .pref-de-connector-skeleton__card,
.pref-de-tab-content-skeleton-gate.pc-data-exchange .pref-de-connector-skeleton__card,
.page-content.pc-data-exchange .pref-de-connector-skeleton__card {
    position: relative;
    border: 1px solid #c2cfe3;
    border-radius: var(--globalBorderRadius, 5px);
    overflow: visible;
    margin-bottom: 0;
    background-color: #ffffff;
    box-sizing: border-box;
}
.preferences-subpage-skeleton-scope.pc-data-exchange .pref-de-connector-skeleton__body,
.pref-de-tab-content-skeleton-gate.pc-data-exchange .pref-de-connector-skeleton__body,
.page-content.pc-data-exchange .pref-de-connector-skeleton__body {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 116px;
    padding: 5px;
    box-sizing: border-box;
}
.preferences-subpage-skeleton-scope.pc-data-exchange .pref-de-connector-topSmallCard .pref-de-connector-skeleton__add-icon,
.pref-de-tab-content-skeleton-gate.pc-data-exchange .pref-de-connector-topSmallCard .pref-de-connector-skeleton__add-icon,
.page-content.pc-data-exchange .pref-de-connector-topSmallCard .pref-de-connector-skeleton__add-icon {
    position: absolute;
    right: -12px;
    bottom: -12px;
    line-height: 0;
    z-index: 2;
}
.preferences-subpage-skeleton-scope.pc-data-exchange .pref-de-connector-topSmallCard .pref-de-connector-skeleton__add-icon .pref-de-skel-bar,
.pref-de-tab-content-skeleton-gate.pc-data-exchange .pref-de-connector-topSmallCard .pref-de-connector-skeleton__add-icon .pref-de-skel-bar,
.page-content.pc-data-exchange .pref-de-connector-topSmallCard .pref-de-connector-skeleton__add-icon .pref-de-skel-bar {
    border-radius: 50%;
    box-sizing: border-box;
}
.preferences-subpage-skeleton-scope.pc-data-exchange .pref-de-api-available-card-skeleton__card,
.pref-de-tab-content-skeleton-gate.pc-data-exchange .pref-de-api-available-card-skeleton__card,
.page-content.pc-data-exchange .pref-de-api-available-card-skeleton__card {
    position: relative;
    border: 1px solid #c2cfe3;
    border-radius: var(--globalBorderRadius, 5px);
    overflow: visible;
    margin-bottom: 0;
    background-color: #ffffff;
    box-sizing: border-box;
}
.preferences-subpage-skeleton-scope.pc-data-exchange .pref-de-api-available-card-skeleton__body,
.pref-de-tab-content-skeleton-gate.pc-data-exchange .pref-de-api-available-card-skeleton__body,
.page-content.pc-data-exchange .pref-de-api-available-card-skeleton__body {
    display: flex;
    align-items: center;
    justify-content: flex-start;
    gap: 12px;
    min-height: 116px;
    padding: 16px;
    box-sizing: border-box;
}
.preferences-subpage-skeleton-scope.pc-data-exchange .pref-de-api-available-card-skeleton__icon,
.pref-de-tab-content-skeleton-gate.pc-data-exchange .pref-de-api-available-card-skeleton__icon,
.page-content.pc-data-exchange .pref-de-api-available-card-skeleton__icon {
    flex-shrink: 0;
}
.preferences-subpage-skeleton-scope.pc-data-exchange .pref-de-api-available-card-skeleton__title,
.pref-de-tab-content-skeleton-gate.pc-data-exchange .pref-de-api-available-card-skeleton__title,
.page-content.pc-data-exchange .pref-de-api-available-card-skeleton__title {
    flex: 1;
    min-width: 0;
}
.preferences-subpage-skeleton-scope.pc-data-exchange .pref-de-api-available-card-topSmallCard .pref-de-api-available-card-skeleton__add-icon,
.pref-de-tab-content-skeleton-gate.pc-data-exchange .pref-de-api-available-card-topSmallCard .pref-de-api-available-card-skeleton__add-icon,
.page-content.pc-data-exchange .pref-de-api-available-card-topSmallCard .pref-de-api-available-card-skeleton__add-icon {
    position: absolute;
    right: -12px;
    bottom: -12px;
    line-height: 0;
    z-index: 2;
}
.preferences-subpage-skeleton-scope.pc-data-exchange .pref-de-api-available-card-topSmallCard .pref-de-api-available-card-skeleton__add-icon .pref-de-skel-bar,
.pref-de-tab-content-skeleton-gate.pc-data-exchange .pref-de-api-available-card-topSmallCard .pref-de-api-available-card-skeleton__add-icon .pref-de-skel-bar,
.page-content.pc-data-exchange .pref-de-api-available-card-topSmallCard .pref-de-api-available-card-skeleton__add-icon .pref-de-skel-bar {
    border-radius: 50%;
    box-sizing: border-box;
}
/* Top tab strip — Data ingestion | API consumptions | Publishers (neutral, edge-to-edge) */
.preferences-subpage-skeleton-scope.pc-data-exchange .pref-de-top-tabs-skeleton,
.pref-de-tab-content-skeleton-gate.pc-data-exchange .pref-de-top-tabs-skeleton,
.page-content.pc-data-exchange .pref-de-top-tabs-skeleton {
    width: 100%;
    background: #f5f7fc;
    box-sizing: border-box;
    margin-bottom: 0;
}
.preferences-subpage-skeleton-scope.pc-data-exchange .pref-de-top-tabs-skeleton__container,
.pref-de-tab-content-skeleton-gate.pc-data-exchange .pref-de-top-tabs-skeleton__container,
.page-content.pc-data-exchange .pref-de-top-tabs-skeleton__container {
    max-width: 1260px;
    width: 100%;
    margin-left: auto;
    margin-right: auto;
    padding-left: 0;
    padding-right: 0;
    box-sizing: border-box;
}
.preferences-subpage-skeleton-scope.pc-data-exchange .pref-de-top-tabs-skeleton__container > .row,
.pref-de-tab-content-skeleton-gate.pc-data-exchange .pref-de-top-tabs-skeleton__container > .row,
.page-content.pc-data-exchange .pref-de-top-tabs-skeleton__container > .row {
    display: flex;
    flex-wrap: wrap;
    margin-left: 0;
    margin-right: 0;
    width: 100%;
}
.preferences-subpage-skeleton-scope.pc-data-exchange .pref-de-top-tabs-skeleton__list,
.pref-de-tab-content-skeleton-gate.pc-data-exchange .pref-de-top-tabs-skeleton__list,
.page-content.pc-data-exchange .pref-de-top-tabs-skeleton__list,
.preferences-subpage-skeleton-scope.pc-data-exchange .pref-de-top-tabs-skeleton__list.rs-tabs,
.pref-de-tab-content-skeleton-gate.pc-data-exchange .pref-de-top-tabs-skeleton__list.rs-tabs,
.page-content.pc-data-exchange .pref-de-top-tabs-skeleton__list.rs-tabs {
    display: flex;
    flex-wrap: nowrap;
    width: 100%;
    margin: 0;
    padding: 0;
    list-style: none;
    box-sizing: border-box;
    gap: 0;
}
.preferences-subpage-skeleton-scope.pc-data-exchange .pref-de-top-tabs-skeleton__list .tabDefault,
.pref-de-tab-content-skeleton-gate.pc-data-exchange .pref-de-top-tabs-skeleton__list .tabDefault,
.page-content.pc-data-exchange .pref-de-top-tabs-skeleton__list .tabDefault,
.preferences-subpage-skeleton-scope.pc-data-exchange .pref-de-top-tabs-skeleton__tab,
.pref-de-tab-content-skeleton-gate.pc-data-exchange .pref-de-top-tabs-skeleton__tab,
.page-content.pc-data-exchange .pref-de-top-tabs-skeleton__tab,
.preferences-subpage-skeleton-scope.pc-data-exchange .pref-de-top-tabs-skeleton__list.rs-tabs .tabDefault,
.pref-de-tab-content-skeleton-gate.pc-data-exchange .pref-de-top-tabs-skeleton__list.rs-tabs .tabDefault,
.page-content.pc-data-exchange .pref-de-top-tabs-skeleton__list.rs-tabs .tabDefault {
    flex: 1 1 33.333%;
    max-width: 33.333%;
    min-width: 0;
    min-height: 41px;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: #e2e7ee !important;
    border: none !important;
    border-left: 3px solid #f5f7fc !important;
    border-top-left-radius: var(--globalBorderRadius, 5px);
    border-top-right-radius: var(--globalBorderRadius, 5px);
    box-sizing: border-box;
    cursor: default;
    padding: 2px 6px;
    position: relative;
    text-align: center;
    list-style: none;
}
.preferences-subpage-skeleton-scope.pc-data-exchange .pref-de-top-tabs-skeleton__list.rst-left-space .tabDefault,
.pref-de-tab-content-skeleton-gate.pc-data-exchange .pref-de-top-tabs-skeleton__list.rst-left-space .tabDefault,
.page-content.pc-data-exchange .pref-de-top-tabs-skeleton__list.rst-left-space .tabDefault {
    border-left: 3px solid #f5f7fc !important;
    border-top-left-radius: var(--globalBorderRadius, 5px);
}
.preferences-subpage-skeleton-scope.pc-data-exchange .pref-de-top-tabs-skeleton__list .tabDefault:first-child,
.pref-de-tab-content-skeleton-gate.pc-data-exchange .pref-de-top-tabs-skeleton__list .tabDefault:first-child,
.page-content.pc-data-exchange .pref-de-top-tabs-skeleton__list .tabDefault:first-child,
.preferences-subpage-skeleton-scope.pc-data-exchange .pref-de-top-tabs-skeleton__list.rst-left-space .tabDefault:first-child,
.pref-de-tab-content-skeleton-gate.pc-data-exchange .pref-de-top-tabs-skeleton__list.rst-left-space .tabDefault:first-child,
.page-content.pc-data-exchange .pref-de-top-tabs-skeleton__list.rst-left-space .tabDefault:first-child {
    border-left: none !important;
}
.preferences-subpage-skeleton-scope.pc-data-exchange .pref-de-top-tabs-skeleton__list .tabDefault.active,
.pref-de-tab-content-skeleton-gate.pc-data-exchange .pref-de-top-tabs-skeleton__list .tabDefault.active,
.page-content.pc-data-exchange .pref-de-top-tabs-skeleton__list .tabDefault.active,
.preferences-subpage-skeleton-scope.pc-data-exchange .pref-de-top-tabs-skeleton__tab.active,
.pref-de-tab-content-skeleton-gate.pc-data-exchange .pref-de-top-tabs-skeleton__tab.active,
.page-content.pc-data-exchange .pref-de-top-tabs-skeleton__tab.active {
    background-color: #e2e7ee !important;
    color: inherit !important;
}
.preferences-subpage-skeleton-scope.pc-data-exchange .pref-de-top-tabs-skeleton__list .tabDefault::before,
.preferences-subpage-skeleton-scope.pc-data-exchange .pref-de-top-tabs-skeleton__list .tabDefault::after,
.preferences-subpage-skeleton-scope.pc-data-exchange .pref-de-top-tabs-skeleton__tab::before,
.preferences-subpage-skeleton-scope.pc-data-exchange .pref-de-top-tabs-skeleton__tab::after,
.pref-de-tab-content-skeleton-gate.pc-data-exchange .pref-de-top-tabs-skeleton__list .tabDefault::before,
.pref-de-tab-content-skeleton-gate.pc-data-exchange .pref-de-top-tabs-skeleton__list .tabDefault::after,
.pref-de-tab-content-skeleton-gate.pc-data-exchange .pref-de-top-tabs-skeleton__tab::before,
.pref-de-tab-content-skeleton-gate.pc-data-exchange .pref-de-top-tabs-skeleton__tab::after,
.page-content.pc-data-exchange .pref-de-top-tabs-skeleton__list .tabDefault::before,
.page-content.pc-data-exchange .pref-de-top-tabs-skeleton__list .tabDefault::after,
.page-content.pc-data-exchange .pref-de-top-tabs-skeleton__tab::before,
.page-content.pc-data-exchange .pref-de-top-tabs-skeleton__tab::after,
.preferences-subpage-skeleton-scope.pc-data-exchange .pref-de-top-tabs-skeleton__list .tabDefault.active::before,
.pref-de-tab-content-skeleton-gate.pc-data-exchange .pref-de-top-tabs-skeleton__list .tabDefault.active::before,
.page-content.pc-data-exchange .pref-de-top-tabs-skeleton__list .tabDefault.active::before {
    display: none !important;
    content: none !important;
    border: none !important;
}
/* In-page gate — body only; live RSTabbarFluid top strip stays visible above */
.pref-de-tab-content-skeleton-gate.pc-data-exchange {
    width: 100%;
    min-height: 420px;
    box-sizing: border-box;
}
.pref-de-tab-content-skeleton-gate.pc-data-exchange .pref-de-ingestion-skeleton,
.pref-de-tab-content-skeleton-gate.pc-data-exchange .pref-de-api-skeleton {
    margin-top: 21px;
}
.page-content.pc-data-exchange .pref-de-top-tabs-skeleton,
.preferences-subpage-skeleton-scope.pc-data-exchange .pref-de-top-tabs-skeleton {
    margin-bottom: 0;
}
/* Vertical tabs + content — float layout (_rsTabber.scss) */
.preferences-subpage-skeleton-scope.pc-data-exchange .pref-de-tabs-layout-skeleton,
.pref-de-tab-content-skeleton-gate.pc-data-exchange .pref-de-tabs-layout-skeleton,
.page-content.dataExchangePageCSS .pref-de-tabs-layout-skeleton,
.page-content.dataExchangePageCSS .rs-vertical-tabs-wrapper.pref-de-live-tabs {
    position: relative;
    width: 100%;
    clear: both;
    box-sizing: border-box;
}
.preferences-subpage-skeleton-scope.pc-data-exchange .pref-de-tabs-layout-skeleton::after,
.pref-de-tab-content-skeleton-gate.pc-data-exchange .pref-de-tabs-layout-skeleton::after,
.page-content.dataExchangePageCSS .pref-de-tabs-layout-skeleton::after,
.page-content.dataExchangePageCSS .rs-vertical-tabs-wrapper.pref-de-live-tabs::after {
    content: '';
    display: table;
    clear: both;
}
.preferences-subpage-skeleton-scope.pc-data-exchange .pref-de-vertical-tabs,
.pref-de-tab-content-skeleton-gate.pc-data-exchange .pref-de-vertical-tabs,
.page-content.dataExchangePageCSS .pref-de-vertical-tabs,
.preferences-subpage-skeleton-scope.pc-data-exchange .pref-de-vertical-tabs.rsv-tabs-list,
.pref-de-tab-content-skeleton-gate.pc-data-exchange .pref-de-vertical-tabs.rsv-tabs-list,
.page-content.dataExchangePageCSS .pref-de-vertical-tabs.rsv-tabs-list {
    float: left;
    width: 150px;
    margin: 0 10px 0 0;
    padding: 5px !important;
    background: #fff;
    border: 1px solid #c2cfe3;
    border-radius: var(--globalBorderRadius, 5px);
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.08);
    list-style: none;
    box-sizing: border-box;
}
.preferences-subpage-skeleton-scope.pc-data-exchange .pref-de-vertical-tabs li.tabDefault,
.pref-de-tab-content-skeleton-gate.pc-data-exchange .pref-de-vertical-tabs li.tabDefault,
.page-content.dataExchangePageCSS .pref-de-vertical-tabs li.tabDefault,
.preferences-subpage-skeleton-scope.pc-data-exchange .pref-de-vertical-tabs.vertical-tabs li.tabDefault,
.pref-de-tab-content-skeleton-gate.pc-data-exchange .pref-de-vertical-tabs.vertical-tabs li.tabDefault,
.page-content.dataExchangePageCSS .pref-de-vertical-tabs.vertical-tabs li.tabDefault,
.preferences-subpage-skeleton-scope.pc-data-exchange .pref-de-vertical-tabs .tabDefault.pref-de-vertical-tabs__item,
.pref-de-tab-content-skeleton-gate.pc-data-exchange .pref-de-vertical-tabs .tabDefault.pref-de-vertical-tabs__item,
.page-content.dataExchangePageCSS .pref-de-vertical-tabs .tabDefault.pref-de-vertical-tabs__item {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 115px;
    min-height: 115px;
    padding: 8px 4px;
    border-bottom: 1px solid #e9e9e9;
    background: transparent !important;
    background-color: transparent !important;
    color: inherit !important;
    position: relative;
    text-align: center;
    cursor: default;
    box-sizing: border-box;
    list-style: none;
}
.preferences-subpage-skeleton-scope.pc-data-exchange .pref-de-vertical-tabs li.tabDefault:last-child,
.pref-de-tab-content-skeleton-gate.pc-data-exchange .pref-de-vertical-tabs li.tabDefault:last-child,
.page-content.dataExchangePageCSS .pref-de-vertical-tabs li.tabDefault:last-child,
.preferences-subpage-skeleton-scope.pc-data-exchange .pref-de-vertical-tabs .tabDefault.pref-de-vertical-tabs__item:last-child,
.pref-de-tab-content-skeleton-gate.pc-data-exchange .pref-de-vertical-tabs .tabDefault.pref-de-vertical-tabs__item:last-child,
.page-content.dataExchangePageCSS .pref-de-vertical-tabs .tabDefault.pref-de-vertical-tabs__item:last-child {
    border-bottom: none;
}
.preferences-subpage-skeleton-scope.pc-data-exchange .pref-de-vertical-tabs li.tabDefault.active,
.pref-de-tab-content-skeleton-gate.pc-data-exchange .pref-de-vertical-tabs li.tabDefault.active,
.page-content.dataExchangePageCSS .pref-de-vertical-tabs li.tabDefault.active,
.preferences-subpage-skeleton-scope.pc-data-exchange .pref-de-vertical-tabs .tabDefault.pref-de-vertical-tabs__item.active,
.pref-de-tab-content-skeleton-gate.pc-data-exchange .pref-de-vertical-tabs .tabDefault.pref-de-vertical-tabs__item.active,
.page-content.dataExchangePageCSS .pref-de-vertical-tabs .tabDefault.pref-de-vertical-tabs__item.active {
    background: transparent !important;
    background-color: transparent !important;
    color: inherit !important;
}
.preferences-subpage-skeleton-scope.pc-data-exchange .pref-de-vertical-tabs li.tabDefault::after,
.pref-de-tab-content-skeleton-gate.pc-data-exchange .pref-de-vertical-tabs li.tabDefault::after,
.page-content.dataExchangePageCSS .pref-de-vertical-tabs li.tabDefault::after,
.preferences-subpage-skeleton-scope.pc-data-exchange .pref-de-vertical-tabs li.tabDefault.active::after,
.pref-de-tab-content-skeleton-gate.pc-data-exchange .pref-de-vertical-tabs li.tabDefault.active::after,
.page-content.dataExchangePageCSS .pref-de-vertical-tabs li.tabDefault.active::after,
.preferences-subpage-skeleton-scope.pc-data-exchange .pref-de-vertical-tabs li.tabDefault::before,
.pref-de-tab-content-skeleton-gate.pc-data-exchange .pref-de-vertical-tabs li.tabDefault::before,
.page-content.dataExchangePageCSS .pref-de-vertical-tabs li.tabDefault::before,
.preferences-subpage-skeleton-scope.pc-data-exchange .pref-de-vertical-tabs li.tabDefault.active::before,
.pref-de-tab-content-skeleton-gate.pc-data-exchange .pref-de-vertical-tabs li.tabDefault.active::before,
.page-content.dataExchangePageCSS .pref-de-vertical-tabs li.tabDefault.active::before {
    display: none !important;
    content: none !important;
    border: none !important;
}
.preferences-subpage-skeleton-scope.pc-data-exchange .pref-de-vertical-tabs__icon,
.pref-de-tab-content-skeleton-gate.pc-data-exchange .pref-de-vertical-tabs__icon,
.page-content.dataExchangePageCSS .pref-de-vertical-tabs__icon {
    margin-bottom: 4px;
}
.preferences-subpage-skeleton-scope.pc-data-exchange .pref-de-ingestion-panel-skeleton,
.pref-de-tab-content-skeleton-gate.pc-data-exchange .pref-de-ingestion-panel-skeleton,
.page-content.dataExchangePageCSS .pref-de-ingestion-panel-skeleton,
.page-content.dataExchangePageCSS .rs-vertical-tabs-wrapper.pref-de-live-tabs .res-tabber > .res-tabs-content,
.page-content.dataExchangePageCSS .rs-vertical-tabs-wrapper.pref-de-live-tabs .res-tabber > .tabs-content,
.page-content.dataExchangePageCSS .rs-vertical-tabs-wrapper.pref-de-live-tabs > .tabs-content {
    float: left;
    width: calc(100% - 175px);
    box-sizing: border-box;
}
.react-loading-skeleton{background-color: #e2e7ee !important;}
`;

