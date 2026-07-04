/** ResGrid list card skeleton — mirrors resgrid.scss skeleton-list block (before app.scss load). */
const RESGRID_SKELETON_BASE = '#e0e5eb';
const RESGRID_SKELETON_SHINE = '#eeeeee';
const RESGRID_BORDER_COLOR = '#a6c6e2';
const RESGRID_CARD_BOX_SHADOW = '0 0 5px rgba(0, 0, 0, 0.05), 0 0 5px rgba(0, 0, 0, 0.05)';
const RESGRID_DIVIDER = '#c2cfe3';

const scoped = (selector) =>
    [`.resgrid ${selector}`, `.an-sk-list-rows-wrap ${selector}`, selector].join(',\n');

export const resgridListSkeletonCriticalCss = `
@keyframes resgridListSkeletonShimmer {
    0% { background-position: 200% 0; }
    100% { background-position: -200% 0; }
}
${scoped('.resgrid--skeleton-list')} {
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: 21px;
    box-sizing: border-box;
}
.an-sk-list-rows-wrap.rs-grid-listing {
    overflow: visible;
    box-sizing: border-box;
}
.an-sk-list-rows-wrap .resgrid.resgrid-listing {
    width: 100%;
    overflow: visible;
    box-sizing: border-box;
}
${scoped('.resgrid--skeleton-list-card')},
${scoped('.resgrid--skeleton-list-card--communication')},
${scoped('.resgrid--skeleton-list-card--analytics')} {
    display: flex;
    align-items: center;
    width: 100%;
    height: 104px;
    min-height: 104.9px;
    max-height: 104.9px;
    padding: 8px 10px;
    background: #ffffff;
    border: 1px solid ${RESGRID_BORDER_COLOR};
    border-radius: var(--globalBorderRadius, 5px);
    box-shadow: ${RESGRID_CARD_BOX_SHADOW};
    box-sizing: border-box;
    overflow: hidden;
}
${scoped('.resgrid--skeleton-accent')} {
    flex-shrink: 0;
    width: 5px;
    align-self: stretch;
    min-height: 87px;
    margin-left: -8px;
    margin-top: -7px;
    border-radius: 3px;
    background: linear-gradient(90deg, ${RESGRID_SKELETON_BASE} 25%, ${RESGRID_SKELETON_SHINE} 50%, ${RESGRID_SKELETON_BASE} 75%);
    background-size: 200% 100%;
    animation: resgridListSkeletonShimmer 1.5s ease-in-out infinite;
}
${scoped('.resgrid--skeleton-col')} {
    display: flex;
    flex-direction: column;
    justify-content: center;
    gap: 5px;
    padding: 8px 10px;
    position: relative;
    box-sizing: border-box;
}
${scoped('.resgrid--skeleton-col--primary')} {
    flex: 1 1 45%;
    min-width: 0;
    padding-left: 10px;
}
${scoped('.resgrid--skeleton-col--primary::after')} {
    content: '';
    position: absolute;
    right: 0;
    top: 11px;
    bottom: 0;
    width: 1px;
    height: 85%;
    background: ${RESGRID_DIVIDER};
    transform: translateY(-10%);
}
${scoped('.resgrid--skeleton-col--mid')} {
    flex: 0 0 19%;
    min-width: 120px;
    padding-left: 20px;
}
${scoped('.resgrid--skeleton-col--actions')} {
    flex: 0 0 140px;
    align-items: flex-end;
    padding-right: 1px;
    padding-top: 2px;
    padding-bottom: 23px;
    gap: 12px;
}
${scoped('.resgrid--skeleton-row-inline')} {
    display: flex;
    align-items: center;
    gap: 10px;
    flex-wrap: wrap;
}
${scoped('.resgrid--skeleton-block')} {
    display: block;
    border-radius: 4px;
    background: linear-gradient(90deg, ${RESGRID_SKELETON_BASE} 25%, ${RESGRID_SKELETON_SHINE} 50%, ${RESGRID_SKELETON_BASE} 75%);
    background-size: 200% 100%;
    animation: resgridListSkeletonShimmer 1.5s ease-in-out infinite;
}
${scoped('.resgrid--skeleton-block.no-animation')},
${scoped('.resgrid--skeleton-accent.no-animation')} {
    animation: none;
    background: ${RESGRID_SKELETON_BASE};
}
${scoped('.resgrid--skeleton-block--badge')} {
    width: 86px;
    height: 21px;
    border-radius: 8px;
    flex-shrink: 0;
}
${scoped('.resgrid--skeleton-block--meta')} {
    width: 254px;
    max-width: 45%;
    height: 21px;
    flex: 1 1 auto;
}
${scoped('.resgrid--skeleton-block--title')} {
    width: 50%;
    max-width: 500px;
    min-width: 200px;
    height: 21px;
}
${scoped('.resgrid--skeleton-block--line-md')} {
    width: 150px;
    max-width: 100%;
    height: 13px;
}
${scoped('.resgrid--skeleton-block--line-sm')} {
    width: 100px;
    max-width: 80%;
    height: 13px;
}
${scoped('.resgrid--skeleton-block--pill')} {
    width: 100%;
    max-width: 220px;
    height: 34px;
    border-radius: 10px;
}
${scoped('.resgrid--skeleton-block--icon')} {
    width: 25px;
    height: 25px;
    border-radius: 10px;
    flex-shrink: 0;
}
${scoped('.resgrid--skeleton-block--label')} {
    width: 72px;
    max-width: 55%;
    height: 12px;
}
${scoped('.resgrid--skeleton-block--indicator')} {
    width: 20px;
    height: 20px;
    border-radius: 50%;
    flex-shrink: 0;
}
${scoped('.resgrid--skeleton-block--avatar')} {
    width: 46px;
    height: 46px;
    border-radius: 4px;
    flex-shrink: 0;
    margin-top: 10px;
}
${scoped('.resgrid--skeleton-icon-row')} {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: 12px;
    width: 100%;
}
${scoped('.resgrid--skeleton-expand-corner')} {
    position: absolute;
    right: 2px;
    bottom: 2px;
    width: 0;
    height: 0;
    border-bottom: 24px solid ${RESGRID_SKELETON_BASE};
    border-left: 24px solid transparent;
    border-radius: 0 0 var(--globalBorderRadius, 5px);
    pointer-events: none;
}
${scoped('.resgrid--skeleton-expand-corner.no-animation')} {
    border-bottom-color: ${RESGRID_SKELETON_BASE};
}
${scoped('.resgrid--skeleton-list-card--app')} {
    position: relative;
    display: flex;
    align-items: stretch;
    width: 100%;
    min-height: 68px;
    height: 68px;
    max-height: 68px;
    padding: 0;
    overflow: hidden;
    background: #ffffff;
    border: 1px solid ${RESGRID_BORDER_COLOR};
    border-radius: var(--globalBorderRadius, 5px);
    box-shadow: ${RESGRID_CARD_BOX_SHADOW};
    box-sizing: border-box;
}
${scoped('.resgrid--skeleton-list-card--app .resgrid--skeleton-col--app')} {
    display: flex;
    flex-direction: column;
    justify-content: center;
    gap: 5px;
    flex: 0 1 auto;
    min-width: 0;
    padding: 8px 10px;
    box-sizing: border-box;
    position: relative;
}
${scoped('.resgrid--skeleton-list-card--app .resgrid--skeleton-col--app:nth-child(1)')} {
    flex: 0 1 30%;
    max-width: 30%;
    padding-left: 20px;
}
${scoped('.resgrid--skeleton-list-card--app .resgrid--skeleton-col--app:nth-child(2)')} {
    flex: 0 1 20%;
    max-width: 20%;
    padding-left: 25px;
}
${scoped('.resgrid--skeleton-list-card--app .resgrid--skeleton-col--app:nth-child(3)')} {
    flex: 0 1 35%;
    max-width: 35%;
}
${scoped('.resgrid--skeleton-list-card--app .resgrid--skeleton-col--app:nth-child(4)')} {
    flex: 0 1 17%;
    max-width: 17%;
    padding-left: 20px;
}
${scoped('.resgrid--skeleton-list-card--app .resgrid--skeleton-col--app:nth-child(1)::after')},
${scoped('.resgrid--skeleton-list-card--app .resgrid--skeleton-col--app:nth-child(3)::after')} {
    content: '';
    position: absolute;
    right: 0;
    top: 11px;
    bottom: 0;
    width: 1px;
    height: 85%;
    background: ${RESGRID_DIVIDER};
    transform: translateY(-10%);
}
${scoped('.resgrid--skeleton-list-card--app .resgrid--skeleton-col--app-actions')} {
    display: flex;
    flex-direction: column;
    justify-content: center;
    flex: 0 0 auto;
    min-width: 0;
    align-items: flex-end;
    padding: 8px 32px 10px 6px;
    box-sizing: border-box;
}
${scoped('.resgrid--skeleton-list-card--app .resgrid--skeleton-col--app-actions .resgrid--skeleton-icon-row')} {
    gap: 6px;
    flex-wrap: nowrap;
}
${scoped('.resgrid--skeleton-list-card--app .resgrid--skeleton-col--app-actions .resgrid--skeleton-block--icon')} {
    width: 24px;
    height: 24px;
}
`;
