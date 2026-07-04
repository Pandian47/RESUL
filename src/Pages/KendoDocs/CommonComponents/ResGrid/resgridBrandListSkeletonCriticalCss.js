/** Brand / shop list skeleton — self-contained critical CSS (no theme variables or platform classes). */
const SKELETON_BASE = '#e0e5eb';
const SKELETON_SHINE = '#eeeeee';
const BORDER_COLOR = '#c2cfe3';
const CARD_BOX_SHADOW = '0 0 5px rgba(0, 0, 0, 0.05), 0 0 5px rgba(0, 0, 0, 0.05)';
const DIVIDER = '#c2cfe3';
const CARD_RADIUS = '5px';
const ACCENT_RADIUS = '3px';

const scope = (selector) => `.resgrid ${selector}`;

export const resgridBrandListSkeletonCriticalCss = `
@keyframes resgridBrandListSkeletonShimmer {
    0% { background-position: 200% 0; }
    100% { background-position: -200% 0; }
}
${scope('.resgrid--skeleton-list')} {
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: 15px;
    box-sizing: border-box;
}
${scope('.resgrid--skeleton-list--brand')} {
    gap: 15px;
}
${scope('.resgrid--skeleton-list-card')},
${scope('.resgrid--skeleton-list-card--brand')} {
    display: flex;
    align-items: center;
    width: 100%;
    height: 104px;
    min-height: 104.9px;
    max-height: 104.9px;
    padding: 8px 0 8px 10px;
    background: #ffffff;
    border: 1px solid ${BORDER_COLOR};
    border-radius: ${CARD_RADIUS};
    box-shadow: ${CARD_BOX_SHADOW};
    box-sizing: border-box;
    overflow: hidden;
}
${scope('.resgrid--skeleton-list-card--brand')} {
    position: relative;
}
${scope('.resgrid--skeleton-list-card--brand::before')} {
    content: '';
    position: absolute;
    left: 1px;
    top: 2px;
    bottom: 2px;
    width: 5px;
    border-top-left-radius: ${ACCENT_RADIUS};
    border-bottom-left-radius: ${ACCENT_RADIUS};
    background: linear-gradient(90deg, ${SKELETON_BASE} 25%, ${SKELETON_SHINE} 50%, ${SKELETON_BASE} 75%);
    background-size: 200% 100%;
    animation: resgridBrandListSkeletonShimmer 1.5s ease-in-out infinite;
    z-index: 1;
}
${scope('.resgrid--skeleton-list-card--brand.no-animation::before')} {
    animation: none;
    background: ${SKELETON_BASE};
}
${scope('.resgrid--skeleton-block')} {
    display: block;
    border-radius: 4px;
    background: linear-gradient(90deg, ${SKELETON_BASE} 25%, ${SKELETON_SHINE} 50%, ${SKELETON_BASE} 75%);
    background-size: 200% 100%;
    animation: resgridBrandListSkeletonShimmer 1.5s ease-in-out infinite;
}
${scope('.resgrid--skeleton-block.no-animation')} {
    animation: none;
    background: ${SKELETON_BASE};
}
${scope('.resgrid--skeleton-block--badge')} {
    width: 86px;
    height: 21px;
    border-radius: 8px;
    flex-shrink: 0;
}
${scope('.resgrid--skeleton-block--title')} {
    width: 50%;
    max-width: 500px;
    min-width: 120px;
    height: 21px;
}
${scope('.resgrid--skeleton-block--label')} {
    width: 72px;
    max-width: 55%;
    height: 12px;
}
${scope('.resgrid--skeleton-block--line-md')} {
    width: 150px;
    max-width: 100%;
    height: 13px;
}
${scope('.resgrid--skeleton-block--pill')} {
    width: 100%;
    max-width: none;
    height: 34px;
    border-radius: ${ACCENT_RADIUS} ${ACCENT_RADIUS} 0 0;
}
${scope('.resgrid--skeleton-block--icon')} {
    width: 25px;
    height: 25px;
    border-radius: 10px;
    flex-shrink: 0;
}
${scope('.resgrid--skeleton-block--avatar')} {
    width: 46px;
    height: 46px;
    border-radius: 4px;
    flex-shrink: 0;
    margin-top: 0;
}
${scope('.resgrid--skeleton-row-inline')} {
    display: flex;
    align-items: center;
    gap: 10px;
    flex-wrap: wrap;
}
${scope('.resgrid--skeleton-brand-title-row')} {
    display: flex;
    align-items: center;
    gap: 12px;
    min-width: 0;
}
${scope('.resgrid--skeleton-brand-text')} {
    flex: 1 1 auto;
    display: flex;
    flex-direction: column;
    gap: 8px;
    min-width: 0;
    margin-top: 0;
    margin-left: 0;
}
${scope('.resgrid--skeleton-col--brand-primary')} {
    display: flex;
    flex-direction: column;
    justify-content: center;
    flex: 0 0 50%;
    max-width: 50%;
    min-width: 0;
    padding: 8px 10px 8px 20px;
    margin-left: 0;
    margin-top: 0;
    box-sizing: border-box;
    position: relative;
}
${scope('.resgrid--skeleton-col--brand-primary::after')} {
    content: '';
    position: absolute;
    right: 0;
    top: 11px;
    bottom: 0;
    width: 1px;
    height: 85%;
    background: ${DIVIDER};
    transform: translateY(-10%);
}
${scope('.resgrid--skeleton-col--brand-location')} {
    display: flex;
    flex-direction: column;
    justify-content: center;
    gap: 2px;
    flex: 0 0 17%;
    max-width: 17%;
    min-width: 0;
    padding: 8px 10px 8px 20px;
    margin-top: 0;
    box-sizing: border-box;
    position: relative;
}
${scope('.resgrid--skeleton-col--brand-spacer')} {
    flex: 0 0 19%;
    max-width: 19%;
    min-width: 0;
    padding: 0;
}
${scope('.resgrid--skeleton-col--actions')} {
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    flex: 1 1 auto;
    min-width: 0;
    align-items: stretch;
    padding: 2px 1px 10px 6px;
    gap: 8px;
    box-sizing: border-box;
}
${scope('.resgrid--skeleton-list-card--brand .resgrid--skeleton-col--actions .resgrid--skeleton-block--pill')} {
    width: 100%;
    max-width: none;
    height: 34px;
    border-radius: ${ACCENT_RADIUS} ${ACCENT_RADIUS} 0 0;
    position: relative;
    right: 1px;
}
${scope('.resgrid--skeleton-icon-row--brand')} {
    display: flex;
    align-items: center;
    justify-content: space-evenly;
    gap: 12px;
    width: 100%;
    margin-right: 0;
    padding-right: 8px;
    box-sizing: border-box;
}
${scope('.resgrid--skeleton-expand-corner')} {
    position: absolute;
    right: 2px;
    bottom: 2px;
    width: 0;
    height: 0;
    border-bottom: 24px solid ${SKELETON_BASE};
    border-left: 24px solid transparent;
    border-radius: 0 0 ${ACCENT_RADIUS};
    pointer-events: none;
}
${scope('.resgrid--skeleton-expand-corner.no-animation')} {
    border-bottom-color: ${SKELETON_BASE};
}
`;
