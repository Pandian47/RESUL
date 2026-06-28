/** Grid loading skeleton — visible before reskendogrid.scss / app theme load. */
export const GRID_SKELETON_HEADER_BG = '#0043ff';
export const GRID_SKELETON_ROW_BG = '#ffffff';
export const GRID_SKELETON_ROW_ALT_BG = '#f0f8ff';
export const GRID_SKELETON_BORDER = '#e9e9e9';
export const GRID_SKELETON_TABLE_PADDING = '5px';
export const GRID_SKELETON_TABLE_RADIUS = '10px';
export const GRID_SKELETON_TABLE_SHADOW =
    '0 0 5px 0 rgba(0, 0, 0, 0.05), 0 0 5px 0 rgba(0, 0, 0, 0.05)';
/** Inner corner radius when table has 5px padding and 10px outer radius. */
export const GRID_SKELETON_CELL_INNER_RADIUS = '5px';
export const GRID_SKELETON_BORDER_RADIUS = 'var(--globalBorderRadius, 5px)';
export const GRID_SKELETON_HEADER_HEIGHT = 41;
export const GRID_SKELETON_BODY_HEIGHT = 55;

export const gridLoadingSkeletonCriticalCss = `
@keyframes rsGridSkeletonShimmerPos {
    0% { background-position: -100% 0; }
    100% { background-position: 200% 0; }
}
.rs-grid-loading-skeleton {
    width: 100%;
    position: relative;
    box-sizing: border-box;
}
.rs-grid-loading-skeleton:not(.skeleton-body-only) {
    overflow: hidden;
}
.rs-grid-loading-m-15 {
    margin: 15px;
}
.rs-grid-loading-m-10 {
    margin: 10px;
}
.rs-grid-loading-consumption-rs-grid-loading-skeleton--loading {
    max-width: 100%;
    overflow: hidden;
}
.rs-grid-loading-skeleton .nodata-bar.nodata-skeleton-con {
    z-index: 10;
    height: 35px;
}
.rs-grid-loading-grid-empty-skeleton {
    overflow: visible;
}
.rs-grid-loading-grid-empty-skeleton .skeleton-row.k-table-alt-row,
.rs-grid-loading-grid-empty-skeleton .skeleton-row.k-table-alt-row td,
.rs-grid-loading-grid-empty-skeleton .skeleton-row.k-table-alt-row .k-table-td {
    background-color: transparent;
}
.rs-grid-loading-grid-empty-skeleton .skeleton-row.k-table-alt-row {
    background-color: ${GRID_SKELETON_ROW_ALT_BG};
}
.rs-grid-loading-grid-empty-fit table.k-grid-table,
.rs-grid-loading-grid-empty-fit .k-table {
    width: 100% !important;
    max-width: 100% !important;
    min-width: 0 !important;
    table-layout: fixed;
}
.rs-grid-loading-grid-empty-fit .skeleton-row > td.skeleton-cell,
.rs-grid-loading-grid-empty-fit .skeleton-row > .k-table-td.skeleton-cell {
    min-width: 0 !important;
    box-sizing: border-box;
}
.rs-grid-loading-consumption-skeleton table,
.rs-grid-loading-consumption-skeleton .k-table {
    width: auto !important;
    min-width: 100%;
    table-layout: fixed;
}
.rs-grid-loading-skeleton:not(.skeleton-body-only) table.k-grid-table,
.rs-grid-loading-skeleton:not(.skeleton-body-only) table.k-grid-table.k-table,
.rs-grid-loading-skeleton:not(.skeleton-body-only) .k-grid-table.k-table {
    padding: ${GRID_SKELETON_TABLE_PADDING};
    border-radius: ${GRID_SKELETON_TABLE_RADIUS};
    box-shadow: ${GRID_SKELETON_TABLE_SHADOW};
    overflow: hidden;
    background-color: ${GRID_SKELETON_ROW_BG};
    position: relative;
    isolation: isolate; 
    border: 1px solid #a6c6e2;
}
.rs-grid-loading-skeleton table,
.rs-grid-loading-skeleton .k-table,
.rs-grid-loading-skeleton .k-grid-table {
    border-collapse: separate;
    border-spacing: 0;
    table-layout: fixed;
    box-sizing: border-box;
}
.rs-grid-loading-skeleton-body-only table.k-grid-table,
.rs-grid-loading-skeleton-body-only .k-grid-table.k-table,
.rs-grid-loading-skeleton-body-only .k-table {
    padding: 0 !important;
    border-radius: 0 !important;
    box-shadow: none !important;
    background-color: transparent !important;
    border: 0 !important;
    overflow: visible;
}
.rs-grid-loading-skeleton .skeleton-row > td,
.rs-grid-loading-skeleton .skeleton-row > .k-table-td,
.rs-grid-loading-skeleton .skeleton-row > .skeleton-cell {
    padding: 10px;
    border-top: 0;
    border-bottom: 0;
    border-left: 0;
    height: ${GRID_SKELETON_BODY_HEIGHT}px;
    box-sizing: border-box;
    position: relative;
    z-index: 2;
    background-color: transparent !important;
}
.rs-grid-loading-skeleton .k-table-row.skeleton-row,
.rs-grid-loading-skeleton .skeleton-row {
    position: relative;
    overflow: hidden;
    background-color: ${GRID_SKELETON_ROW_BG};
    background-image: linear-gradient(90deg, transparent 0%, rgba(0, 0, 0, 0.06) 50%, transparent 100%);
    background-size: 50% 100%;
    background-repeat: no-repeat;
    animation: rsGridSkeletonShimmerPos 1.5s ease-in-out infinite;
}
.rs-grid-loading-skeleton .k-table-row.skeleton-row.k-table-alt-row,
.rs-grid-loading-skeleton .skeleton-row.k-table-alt-row {
    background-color: ${GRID_SKELETON_ROW_ALT_BG};
}
.rs-grid-loading-skeleton .skeleton-row > td:not(:last-child),
.rs-grid-loading-skeleton .skeleton-row > .k-table-td:not(:last-child),
.rs-grid-loading-skeleton .skeleton-row > .skeleton-cell:not(:last-child) {
    border-right: 1px solid ${GRID_SKELETON_BORDER} !important;
}
.rs-grid-loading-skeleton .skeleton-row > td:last-child,
.rs-grid-loading-skeleton .skeleton-row > .k-table-td:last-child,
.rs-grid-loading-skeleton .skeleton-row > .skeleton-cell:last-child {
    border-right: 0 !important;
}
.rs-grid-loading-skeleton .skeleton-cell.no-border-left,
.rs-grid-loading-skeleton .k-table-td.no-border-left {
    border-left: 0 !important;
}
.rs-grid-loading-skeleton .skeleton-header-row,
.rs-grid-loading-skeleton .skeleton-blue-row {
    height: ${GRID_SKELETON_HEADER_HEIGHT}px;
    background-color: transparent !important;
    position: relative;
    overflow: hidden;
}
.rs-grid-loading-skeleton .skeleton-blue-row.hide {
    display: none !important;
}
.rs-grid-loading-skeleton .skeleton-header-row > td,
.rs-grid-loading-skeleton .skeleton-header-row > .k-table-td,
.rs-grid-loading-skeleton .skeleton-blue-row > td,
.rs-grid-loading-skeleton .skeleton-blue-row > .k-table-td,
.rs-grid-loading-skeleton .skeleton-blue-row > .skeleton-blue-cell {
    padding: 0 10px !important;
    height: ${GRID_SKELETON_HEADER_HEIGHT}px !important;
    min-height: ${GRID_SKELETON_HEADER_HEIGHT}px !important;
    max-height: ${GRID_SKELETON_HEADER_HEIGHT}px !important;
    line-height: ${GRID_SKELETON_HEADER_HEIGHT}px !important;
    box-sizing: border-box;
    position: relative;
    z-index: 2;
    border-top: 0 !important;
    border-bottom: 0 !important;
    border-left: 0 !important;
    background: ${GRID_SKELETON_HEADER_BG} !important;
    background-color: ${GRID_SKELETON_HEADER_BG} !important;
    background-image: none !important;
    animation: none !important;
}
.rs-grid-loading-skeleton .skeleton-blue-row > td:not(:last-child),
.rs-grid-loading-skeleton .skeleton-blue-row > .k-table-td:not(:last-child),
.rs-grid-loading-skeleton .skeleton-blue-row > .skeleton-blue-cell:not(:last-child) {
    border-right: 1px solid ${GRID_SKELETON_BORDER} !important;
}
.rs-grid-loading-skeleton .skeleton-blue-row > td:first-child,
.rs-grid-loading-skeleton .skeleton-blue-row > .k-table-td:first-child,
.rs-grid-loading-skeleton .skeleton-blue-row > .skeleton-blue-cell:first-child {
    border-top-left-radius: ${GRID_SKELETON_CELL_INNER_RADIUS} !important;
}
.rs-grid-loading-skeleton .skeleton-blue-row > td:last-child,
.rs-grid-loading-skeleton .skeleton-blue-row > .k-table-td:last-child,
.rs-grid-loading-skeleton .skeleton-blue-row > .skeleton-blue-cell:last-child {
    border-top-right-radius: ${GRID_SKELETON_CELL_INNER_RADIUS} !important;
    border-right: 0 !important;
}
.rs-grid-loading-skeleton .skeleton-row:last-child > td:first-child,
.rs-grid-loading-skeleton .skeleton-row:last-child > .k-table-td:first-child {
    border-bottom-left-radius: ${GRID_SKELETON_CELL_INNER_RADIUS};
}
.rs-grid-loading-skeleton .skeleton-row:last-child > td:last-child,
.rs-grid-loading-skeleton .skeleton-row:last-child > .k-table-td:last-child {
    border-bottom-right-radius: ${GRID_SKELETON_CELL_INNER_RADIUS};
}
.rs-grid-loading-skeleton .skeleton-header-row > td:not(:last-child),
.rs-grid-loading-skeleton .skeleton-header-row > .k-table-td:not(:last-child) {
    border-right: 1px solid ${GRID_SKELETON_BORDER};
}
.rs-grid-loading-skeleton-body-only {
    border-radius: 0;
    box-shadow: none;
    border: 0;
    margin: 0;
    padding: 0;
    width: 100%;
    min-width: 100%;
    max-width: none;
    box-sizing: border-box;
    overflow: visible;
}
.rs-grid-loading-skeleton-body-only .skeleton-row > td,
.rs-grid-loading-skeleton-body-only .skeleton-row > .k-table-td {
    border-left: 0;
}
.rs-grid-loading-skeleton-body-only table.k-grid-table,
.rs-grid-loading-skeleton-body-only .k-table {
    width: 100% !important;
    min-width: 100% !important;
    max-width: 100%;
    box-sizing: border-box;
    margin: 0;
}
.rs-grid-loading-skeleton-body-only .skeleton-row > td,
.rs-grid-loading-skeleton-body-only .skeleton-row > .k-table-td,
.rs-grid-loading-skeleton-body-only .k-table-row.skeleton-row > td,
.rs-grid-loading-skeleton-body-only .k-table-row.skeleton-row > .k-table-td {
    background-color: transparent !important;
}
.rs-grid-loading-no-animation .k-table-row.skeleton-row,
.rs-grid-loading-no-animation .skeleton-row {
    animation: none !important;
    background-image: none !important;
}
.MDM-AudienceList .grid-loading-state .rs-grid-loading-skeleton:not(.skeleton-body-only) {
    margin: 0;
    padding: 0;
    overflow: visible;
}
.MDM-AudienceList .grid-loading-state .rs-grid-loading-skeleton:not(.skeleton-body-only) table.k-grid-table,
.MDM-AudienceList .grid-loading-state .rs-grid-loading-skeleton:not(.skeleton-body-only) .k-grid-table.k-table {
    padding: 0 !important;
    border-radius: 0 !important;
    box-shadow: none !important;
    background-color: transparent !important;
    border: 0 !important;
}
.MDM-AudienceList .grid-loading-state .rs-grid-loading-skeleton .skeleton-row.k-table-alt-row,
.MDM-AudienceList .grid-loading-state .rs-grid-loading-skeleton .k-table-row.skeleton-row.k-table-alt-row {
    background-color: ${GRID_SKELETON_ROW_ALT_BG} !important;
}
`;

/** Injected after Kendo theme — suppresses UA :focus-visible ring on grid header filter triggers. */
export const gridHeaderFilterFocusCriticalCss = `
a.k-grid-header-menu.k-grid-column-menu:focus,
a.k-grid-header-menu.k-grid-column-menu:focus-visible,
a.k-grid-header-menu:focus-visible,
a.k-grid-column-menu:focus-visible,
.k-grid-header-menu.k-grid-column-menu:focus-visible,
.k-grid-header-menu:focus-visible,
.k-grid-column-menu:focus-visible,
.k-grid-filter:focus-visible,
.k-grid .k-grid-header a.k-grid-header-menu:focus-visible,
.k-grid .k-grid-header a.k-grid-column-menu:focus-visible {
    outline: none !important;
    outline-offset: 0 !important;
    outline-width: 0 !important;
    outline-style: none !important;
    box-shadow: none !important;
    -webkit-tap-highlight-color: transparent;
}
a.k-grid-header-menu.k-grid-column-menu:focus-visible::before,
a.k-grid-header-menu.k-grid-column-menu:focus-visible::after,
a.k-grid-header-menu:focus-visible::before,
a.k-grid-header-menu:focus-visible::after,
.k-grid-header-menu:focus-visible::before,
.k-grid-header-menu:focus-visible::after {
    opacity: 0 !important;
    box-shadow: none !important;
    border: none !important;
    outline: none !important;
    background: transparent !important;
}
`;
