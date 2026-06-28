/** Account setup — neutral shimmer; safe before app.scss. */
export const accountSetupSkeletonCriticalCss = `
.account-setup-skeleton-scope.page-content-holder,
.rs-page-content-wrapper .page-content-holder.account-setup-skeleton-scope {
    padding-top: 0;
}
.account-setup-skeleton-scope {
    width: 100%;
    box-sizing: border-box;
}
.account-setup-skeleton-scope .main-heading-wrapper {
    margin-bottom: 12px;
    padding-top: 0;
    padding-bottom: 0;
    min-height: 0;
}
.account-setup-skeleton-scope .main-heading-wrapper .mhw-container {
    min-height: 0;
    padding: 0;
    align-items: center;
}
.account-setup-skeleton-scope .page-content {
    margin-top: 0;
    padding-top: 78px;
}
.account-setup-skeleton-scope .skeleton-shimmer {
    position: relative;
    overflow: hidden;
    background-color: #e2e7ee;
    display: block;
    box-sizing: border-box;
    border-radius: 4px;
}
.account-setup-skeleton-scope .skeleton-shimmer::after {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.55), transparent);
    animation: accountSetupSkeletonShimmer 1.6s infinite;
}
@keyframes accountSetupSkeletonShimmer {
    0% { left: -100%; }
    100% { left: 100%; }
}
.account-setup-skeleton-scope .acc-setup-skel-page-title {
    width: 220px;
    max-width: 55vw;
    height: 34px;
    margin: 0;
}
/* RSProgressSteps — account-setup stepper */
.account-setup-skeleton-scope .acc-setup-skel-progress {
    display: table;
    table-layout: fixed;
    width: 100%;
    max-width: 800px;
    position: relative;
    margin: 1px auto 20px;
    padding: 0;
    list-style: none;
    box-sizing: border-box;
}
.account-setup-skeleton-scope .acc-setup-skel-step {
    display: table-cell;
    vertical-align: top;
    text-align: center;
    width: 1%;
    padding: 0;
    position: relative;
    box-sizing: border-box;
}
.account-setup-skeleton-scope .acc-setup-skel-step:not(:last-child)::before {
    content: '';
    display: block;
    overflow: hidden;
    position: relative;
    top: 24px;
    left: 50%;
    z-index: 1;
    width: 100%;
    height: 0;
    font-size: 0;
    border: none;
    border-top: 1px solid #c2cfe3;
    box-sizing: border-box;
}
.account-setup-skeleton-scope .acc-setup-skel-step__circle {
    display: inline-block;
    position: relative;
    z-index: 2;
    margin: 0 auto 5px;
}
.account-setup-skeleton-scope .acc-setup-skel-step__label {
    display: block;
    position: relative;
    z-index: 4;
    width: 72%;
    max-width: 110px;
    height: 24px;
    min-height: 24px;
    max-height: 24px;
    margin: 0 auto;
    border-radius: 4px;
}
.account-setup-skeleton-scope .acc-setup-skel-card {
    border: 1px solid #c2cfe3;
    border-radius: 5px;
    background: #fff;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.08);
    padding: 40px 19px;
    box-sizing: border-box;
}
.account-setup-skeleton-scope .acc-setup-skel-avatar {
    width: 135px;
    height: 135px;
    border-radius: 50%;
    margin: 20px auto 0;
}
.account-setup-skeleton-scope .acc-setup-skel-hint {
    width: 100%;
    max-width: 200px;
    height: 56px;
    margin: 30px auto 0;
    border-radius: 4px;
}
.account-setup-skeleton-scope .acc-setup-skel-fields-col {
    min-height: 290px;
    border-left: 1px solid #e9e9e9;
    padding-left: 30px;
    padding-right: 30px;
    box-sizing: border-box;
}
.account-setup-skeleton-scope .acc-setup-skel-form-group {
    position: relative;
    margin-bottom: 41px;
    box-sizing: border-box;
}
.account-setup-skeleton-scope .acc-setup-skel-form-group .acc-setup-skel-field-icon {
    position: absolute;
    right: 0;
    bottom: -19px;
}
.account-setup-skeleton-scope .acc-setup-skel-form-group .acc-setup-skel-field-hint {
    margin-top: 5px;
}
.account-setup-skeleton-scope .acc-setup-skel-input {
    width: 100%;
    height: 24px;
    min-height: 24px;
    max-height: 24px;
    border-radius: 4px;
    border: none;
}
.account-setup-skeleton-scope .skeleton-shimmer.width11px {
    display: inline-block;
    width: 11px;
    min-width: 11px;
    max-width: 11px;
}
.account-setup-skeleton-scope .skeleton-shimmer.height11px {
    height: 11px;
    min-height: 11px;
    max-height: 11px;
}
.account-setup-skeleton-scope .skeleton-shimmer.broderradis50\\% {
    border-radius: 50%;
}
.account-setup-skeleton-scope .skeleton-shimmer.width70px {
    display: inline-block;
    width: 70px;
    min-width: 70px;
    max-width: 70px;
    margin-top: 5px;
}
.account-setup-skeleton-scope .skeleton-shimmer.height15px {
    height: 15px;
    min-height: 15px;
    max-height: 15px;
}
.account-setup-skeleton-scope .buttons-holder .acc-setup-skel-btn-back,
.account-setup-skeleton-scope .buttons-holder .acc-setup-skel-btn-next {
    display: inline-block;
    width: 90px;
    height: 36px;
    min-height: 36px;
    max-height: 36px;
    border-radius: 4px;
    vertical-align: middle;
    box-sizing: border-box;
}
.account-setup-skeleton-scope .buttons-holder .acc-setup-skel-btn-next {
    margin-left: 15px;
}
/* Select account type — Agency / Brand cards */
.account-setup-skeleton-scope .acc-setup-skel-account-type-card {
    border: 1px solid #c2cfe3;
    border-radius: 5px;
    background: #fff;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.08);
    padding: 20px 0;
    box-sizing: border-box;
    min-height: 280px;
}
.account-setup-skeleton-scope .acc-setup-skel-account-type-box {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 10px 16px;
    box-sizing: border-box;
}
.account-setup-skeleton-scope .acc-setup-skel-account-type-box--divider {
    border-left: 1px solid #e9e9e9;
}
.account-setup-skeleton-scope .acc-setup-skel-account-type-icon {
    width: 175px;
    height: 175px;
    max-width: 100%;
    border-radius: 50%;
    margin: 10px auto;
}
.account-setup-skeleton-scope .acc-setup-skel-account-type-title {
    width: 88px;
    height: 24px;
    min-height: 24px;
    max-height: 24px;
    margin: 8px auto 6px;
}
.account-setup-skeleton-scope .acc-setup-skel-account-type-desc {
    width: 180px;
    max-width: 90%;
    height: 24px;
    min-height: 24px;
    max-height: 24px;
    margin: 0 auto;
}
@media (max-width: 767px) {
    .account-setup-skeleton-scope .acc-setup-skel-fields-col {
        border-left: 0;
        border-top: 1px solid #e9e9e9;
        margin-top: 24px;
        padding-top: 24px;
        padding-left: 15px;
        padding-right: 15px;
        min-height: auto;
    }
    .account-setup-skeleton-scope .acc-setup-skel-account-type-box--divider {
        border-left: 0;
        border-top: 1px solid #e9e9e9;
        margin-top: 16px;
        padding-top: 24px;
    }
    .account-setup-skeleton-scope .acc-setup-skel-account-type-icon {
        width: 140px;
        height: 140px;
    }
}
`;
