/** Setup complete page — neutral shimmer; safe before app.scss. */
export const setupCompleteSkeletonCriticalCss = `
.setup-complete-skeleton-scope.page-content-holder,
.rs-page-content-wrapper .page-content-holder.setup-complete-skeleton-scope {
    padding-top: 0;
}
.setup-complete-skeleton-scope .main-heading-wrapper {
    margin-bottom: 12px;
    padding-top: 0;
    padding-bottom: 0;
}
.setup-complete-skeleton-scope .main-heading-wrapper .mhw-container {
    min-height: 0;
    padding: 0;
    align-items: center;
}
.setup-complete-skeleton-scope .page-content {
    margin-top: 0;
    padding-top: 0;
}
.setup-complete-skeleton-scope .skeleton-shimmer {
    position: relative;
    overflow: hidden;
    background-color: #e2e7ee;
    display: block;
    box-sizing: border-box;
    border-radius: 4px;
}
.setup-complete-skeleton-scope .skeleton-shimmer::after {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.55), transparent);
    animation: setupCompleteSkeletonShimmer 1.6s infinite;
}
@keyframes setupCompleteSkeletonShimmer {
    0% { left: -100%; }
    100% { left: 100%; }
}
.setup-complete-skeleton-scope .setup-complete-skel-page-title {
    width: 260px;
    max-width: 70vw;
    height: 34px;
    margin: 0;
}
.setup-complete-skeleton-scope .setup-complete-skel-card {
    border: 1px solid #c2cfe3;
    border-radius: 5px;
    background: #fff;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.08);
    min-height: 370px;
    display: flex;
    align-items: center;
    justify-content: center;
    text-align: center;
    position: relative;
    padding: 40px 19px;
    box-sizing: border-box;
}
.setup-complete-skeleton-scope .setup-complete-skel-body {
    width: 100%;
    max-width: 720px;
    margin: 0 auto;
    display: flex;
    flex-direction: column;
    align-items: center;
}
.setup-complete-skeleton-scope .setup-complete-skel-icon {
    width: 72px;
    height: 72px;
    border-radius: 50%;
    margin: 0 auto 30px;
}
.setup-complete-skeleton-scope .setup-complete-skel-heading {
    width: 62%;
    max-width: 420px;
    height: 28px;
    margin: 0 auto 30px;
}
.setup-complete-skeleton-scope .setup-complete-skel-line {
    width: 78%;
    max-width: 560px;
    height: 16px;
    margin: 0 auto 12px;
}
.setup-complete-skeleton-scope .setup-complete-skel-line--short {
    width: 52%;
    max-width: 360px;
    height: 16px;
    margin: 0 auto 12px;
}
.setup-complete-skeleton-scope .setup-complete-skel-line--support {
    width: 68%;
    max-width: 480px;
    height: 16px;
    margin: 8px auto 0;
}
.setup-complete-skeleton-scope .setup-complete-skel-countdown {
    position: absolute;
    right: 19px;
    bottom: 10px;
    width: 120px;
    height: 12px;
}
`;
