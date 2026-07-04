import {
    AXIS_COLOR,
    GRID_BLUE_HEADER,
    GRID_BORDER,
    GRID_ROW_ALT,
    SKELETON_BORDER,
} from './mdmSkeletonUtils';

export const mdmOverviewSkeletonCriticalCss = `
.mdm-page-skeleton {
    width: 100%;
    max-width: 100%;
    padding-left: 0;
    padding-right: 0;
    box-sizing: border-box;
}
.mdm-page-skeleton .mdm-sk-overview-header {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    margin: var(--sp-space-sm) 0;
}
.mdm-page-skeleton .mdm-sk-overview-title {
    flex: 1 1 auto;
}
.mdm-page-skeleton .mdm-sk-overview-actions {
    display: flex;
    list-style: none;
    margin: 0;
    padding: 0;
    justify-content: flex-end;
    align-items: center;
}
.mdm-page-skeleton .mdm-sk-overview-actions li:not(:last-child) {
    margin-right: 10px;
}
.mdm-page-skeleton .mdm-sk-overview-row {
    display: flex;
    flex-wrap: wrap;
    align-items: stretch;
    width: 100%;
    margin: 0 0 25px;
    box-sizing: border-box;
    position: relative;
}
.mdm-page-skeleton .mdm-sk-overview-chart-col,
.mdm-page-skeleton .mdm-sk-overview-cards-col {
    box-sizing: border-box;
    width: 100%;
    display: flex;
}
@media (min-width: 576px) {
    .mdm-page-skeleton .mdm-sk-overview-chart-col,
    .mdm-page-skeleton .mdm-sk-overview-cards-col {
        flex: 0 0 50%;
        max-width: 50%;
    }
    .mdm-page-skeleton .mdm-sk-overview-chart-col {
        padding-left: 0;
        padding-right: 15px;
    }
    .mdm-page-skeleton .mdm-sk-overview-cards-col {
        padding-right: 0;
        padding-left: 15px;
    }
}
.mdm-page-skeleton .mdm-sk-chart-portlet {
    display: flex;
    flex-direction: column;
    height: 411px;
    margin-bottom: 0;
    width: 100%;
    background: #fff;
    border: 1px solid ${SKELETON_BORDER};
    border-radius: var(--globalBorderRadius, 5px);
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.08);
    padding: 19px;
    box-sizing: border-box;
}
.mdm-page-skeleton .mdm-sk-chart-portlet-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-shrink: 0;
}
.mdm-page-skeleton .mdm-sk-chart-portlet-body {
    flex: 1 1 auto;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    min-height: 0;
    margin-top: 0;
    padding-top: 0;
    padding-bottom: 0;
    background: transparent;
}
.mdm-page-skeleton .mdm-overview-chart-body {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;
    flex: 1 1 auto;
    min-height: 280px;
    padding: 0;
    box-sizing: border-box;
}
.mdm-page-skeleton .bubble-chart-skeleton {
    position: relative;
    width: 100%;
    max-width: 100%;
    min-height: 320px;
    height: 320px;
    margin: 0 auto;
}
.mdm-page-skeleton .bubble-chart-skeleton__bubble {
    position: absolute;
    transform: translate(-50%, -50%);
}
.mdm-page-skeleton .mdm-sk-cards-grid {
    display: flex;
    flex-wrap: wrap;
    width: 100%;
    margin: 0;
    align-content: flex-start;
}
.mdm-page-skeleton .mdm-sk-overview-card-col {
    box-sizing: border-box;
    width: 100%;
    display: flex;
    padding-left: 15px;
    padding-right: 15px;
}
@media (min-width: 576px) {
    .mdm-page-skeleton .mdm-sk-overview-card-col {
        flex: 0 0 50%;
        max-width: 50%;
    }
}
.mdm-page-skeleton .mdm-sk-overview-card-col--spaced {
    margin-bottom: 25px;
}
.mdm-page-skeleton .mdm-sk-overview-card-col--pl0 {
    padding-left: 0;
}
.mdm-page-skeleton .mdm-sk-overview-card-col--pr0 {
    padding-right: 0;
}
.mdm-page-skeleton .mdm-sk-profile-card {
    position: relative;
    height: 193px;
    width: 100%;
    max-width: 100%;
    padding: 19px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    overflow: hidden;
    border-radius: var(--globalBorderRadius, 5px);
    background: #fff;
    border: 1px solid ${SKELETON_BORDER};
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.08);
    box-sizing: border-box;
}
.mdm-page-skeleton .mdm-sk-profile-card-body {
    display: flex;
    align-items: flex-start;
    margin-top: 47px;
}
.mdm-page-skeleton .mdm-sk-profile-card-avatar {
    margin-right: 14px;
    margin-top: 2px;
}
.mdm-page-skeleton .mdm-sk-profile-card-content {
    flex: 1;
}
.mdm-page-skeleton .mdm-sk-profile-card-label {
    margin-bottom: 6px;
}
.mdm-page-skeleton .mdm-sk-profile-card-footer {
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    margin-top: 28px;
}
.mdm-page-skeleton .mdm-sk-block {
    flex-shrink: 0;
}
`;

export const mdmListAcquisitionSkeletonCriticalCss = `
.mdm-sk-list-acquisition-skeleton {
    position: relative;
    width: 100%;
    max-width: 100%;
    padding: 16px;
    margin-bottom: 27px;
    box-sizing: border-box;
    background: #fff;
    border: 1px solid ${SKELETON_BORDER};
    border-radius: var(--globalBorderRadius, 5px);
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.08);
}
.mdm-sk-list-acquisition-skeleton--chart-only {
    padding: 0;
    margin-bottom: 0;
    background: transparent;
    border: none;
    box-shadow: none;
    height: 100%;
    min-height: 220px;
    display: flex;
    flex-direction: column;
}
.mdm-sk-list-acquisition-skeleton--chart-only .mdm-sk-list-acquisition-chart {
    flex: 1;
    min-height: 180px;
}
.mdm-sk-list-acquisition-skeleton:not(.mdm-sk-list-acquisition-skeleton--no-offset) .mdm-sk-list-acquisition-chart {
    right: 31px;
}
.mdm-sk-list-acquisition-skeleton--no-offset .mdm-sk-list-acquisition-chart {
    right: 0;
}
.mdm-sk-list-acquisition-header {
    display: flex;
    align-items: center;
    gap: 8px;
}
.mdm-sk-list-acquisition-controls {
    display: flex;
    gap: 8px;
    justify-content: flex-end;
}
.mdm-sk-list-acquisition-chart {
    position: relative;
    width: 100%;
}
.mdm-sk-list-acquisition-axes {
    position: absolute;
    left: 50px;
    top: 0;
    width: calc(100% - 65px);
    height: 100%;
    border-left: 1px solid ${AXIS_COLOR};
    border-bottom: 1px solid ${AXIS_COLOR};
}
.mdm-sk-list-acquisition-chart-svg {
    position: absolute;
    left: 50px;
    top: 0;
    width: calc(100% - 65px);
    height: 100%;
}
.mdm-sk-list-acquisition-legend {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 32px;
    margin-top: 21px;
}
.mdm-sk-list-acquisition-legend-item {
    display: flex;
    align-items: center;
    gap: 8px;
}
.mdm-sk-list-acquisition-error {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    pointer-events: none;
}
.mdm-sk-list-acquisition-skeleton .mdm-sk-block {
    flex-shrink: 0;
}
`;

export const mdmAudienceListSkeletonCriticalCss = `
.mdm-sk-audience-list-skeleton {
    width: 100%;
    max-width: 100%;
    margin-bottom: 4px;
    padding: 19px;
    box-sizing: border-box;
    background: #fff;
    border: 1px solid ${SKELETON_BORDER};
    border-radius: var(--globalBorderRadius, 5px);
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.08);
}
.mdm-sk-audience-list-skeleton .mdm-sk-audience-list-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 10px;
}
.mdm-sk-audience-list-skeleton .mdm-sk-audience-list-title {
    flex: 1 1 auto;
    min-width: 0;
}
.mdm-sk-audience-list-skeleton .mdm-sk-audience-list-subtitle {
    margin-top: 19px;
    margin-bottom: 19px;
}
.mdm-sk-audience-list-skeleton .mdm-sk-audience-list-actions {
    display: flex;
    flex-shrink: 0;
    align-items: center;
    gap: 15px;
}
.mdm-sk-audience-list-skeleton .mdm-sk-audience-list-body {
    padding: 0;
}
.mdm-sk-audience-list-skeleton .mdm-sk-audience-grid-wrap {
    width: 100%;
    box-sizing: border-box;
}
.mdm-sk-audience-list-skeleton .mdm-sk-audience-grid-wrap .k-grid.rs-kendo-scrollable-grid {
    margin-bottom: 0;
    box-shadow: none;
    border-bottom-left-radius: var(--globalBorderRadius, 5px);
    border-bottom-right-radius: var(--globalBorderRadius, 5px);
}
.mdm-sk-audience-list-skeleton .mdm-sk-audience-grid-wrap .rs-grid-loading-skeleton {
    margin: 0;
    padding: 0;
    width: 100%;
    overflow: visible;
}
.mdm-sk-audience-list-skeleton .mdm-sk-audience-grid-wrap .rs-grid-loading-skeleton:not(.skeleton-body-only) table.k-grid-table,
.mdm-sk-audience-list-skeleton .mdm-sk-audience-grid-wrap .rs-grid-loading-skeleton:not(.skeleton-body-only) .k-grid-table.k-table {
    padding: 0 !important;
    border-radius: 0 !important;
    box-shadow: none !important;
    background-color: transparent !important;
    border: 0 !important;
}
.mdm-sk-audience-list-skeleton .mdm-sk-audience-grid-wrap .k-grid-table,
.mdm-sk-audience-list-skeleton .mdm-sk-audience-grid-wrap table {
    width: 100%;
    border-collapse: collapse;
    table-layout: fixed;
}
.mdm-sk-audience-list-skeleton .mdm-sk-audience-grid-wrap .skeleton-blue-row,
.mdm-sk-audience-list-skeleton .mdm-sk-audience-grid-wrap .skeleton-blue-cell {
    background-color: ${GRID_BLUE_HEADER} !important;
}
.mdm-sk-audience-list-skeleton .mdm-sk-audience-grid-wrap .skeleton-row.k-table-alt-row,
.mdm-sk-audience-list-skeleton .mdm-sk-audience-grid-wrap .skeleton-row.k-table-alt-row td,
.mdm-sk-audience-list-skeleton .mdm-sk-audience-grid-wrap .skeleton-row.k-table-alt-row .k-table-td {
    background-color: ${GRID_ROW_ALT} !important;
}
.mdm-sk-audience-list-skeleton .mdm-sk-audience-grid-wrap .skeleton-cell {
    border-right: 1px solid ${GRID_BORDER};
    box-sizing: border-box;
}
.mdm-sk-audience-list-skeleton .mdm-sk-audience-grid-wrap .skeleton-cell:first-child {
    border-left: 1px solid ${GRID_BORDER};
}
.mdm-sk-audience-list-skeleton .mdm-sk-audience-grid-wrap .rs-grid-loading-no-animation .skeleton-row::after,
.mdm-sk-audience-list-skeleton .mdm-sk-audience-grid-wrap .rs-grid-loading-no-animation tr:first-child::before {
    display: none !important;
    animation: none !important;
}
.mdm-sk-audience-list-skeleton .mdm-sk-block {
    flex-shrink: 0;
}
`;

export const mdmPageLayoutCriticalCss = `
.mdm-page-skeleton .mdm-sk-list-activity-wrap {
    margin-bottom: 25px;
}
.mdm-page-skeleton .mdm-sk-list-activity-wrap .mdm-sk-list-acquisition-skeleton {
    width: 100%;
    max-width: 100%;
    margin-bottom: 0;
}
`;

export const mdmPageSkeletonCriticalCss = `
${mdmOverviewSkeletonCriticalCss}
${mdmListAcquisitionSkeletonCriticalCss}
${mdmAudienceListSkeletonCriticalCss}
${mdmPageLayoutCriticalCss}
`;
