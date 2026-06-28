/**
 * ResKendoGrid - Configuration
 * Dynamic naming configuration for the consolidated Kendo Grid component.
 *
 * Changing `prefix` or `componentName` here will automatically update:
 * - Component export name
 * - CSS class names
 * - Documentation route
 */

const GRID_NAME_CONFIG = {
    prefix: 'res',
    componentName: 'kendogrid',
};

/**
 * Generate PascalCase component name from config.
 * @example { prefix: 'res', componentName: 'kendogrid' } -> 'ResKendoGrid'
 */
const generateComponentName = ({ prefix, componentName }) => {
    const capitalize = (str) => str.charAt(0).toUpperCase() + str.slice(1);
    return `${capitalize(prefix)}${capitalize(componentName)}`;
};

/**
 * Generate kebab-case / lowercase CSS class from config.
 * @example { prefix: 'res', componentName: 'kendogrid' } -> 'reskendogrid'
 */
const generateClassName = ({ prefix, componentName }) => {
    return `${prefix.toLowerCase()}${componentName.toLowerCase()}`;
};

/**
 * Generate documentation route from config.
 * @example { prefix: 'res', componentName: 'kendogrid' } -> '/docs/component/reskendogrid'
 */
const generateDocRoute = ({ prefix, componentName }) => {
    return `/docs/component/${prefix.toLowerCase()}${componentName.toLowerCase()}`;
};

/**
 * BEM helper to generate modifier class names.
 * @param {string} modifier - BEM modifier name
 * @returns {string} Generated modifier class name
 * @example gridClass('loading') -> 'reskendogrid--loading'
 */
export const gridClass = (modifier) => {
    const base = generateClassName(GRID_NAME_CONFIG);
    return modifier ? `${base}--${modifier}` : base;
};

/**
 * Full configuration object exported for use across the component ecosystem.
 */
export const GRID_CONFIG = {
    name: GRID_NAME_CONFIG,
    componentName: generateComponentName(GRID_NAME_CONFIG),
    className: generateClassName(GRID_NAME_CONFIG),
    docRoute: generateDocRoute(GRID_NAME_CONFIG),
    scssFileName: `${generateClassName(GRID_NAME_CONFIG)}.scss`,
    /** Stable class for filter popup — must match global _rsKendo.scss / _rskendoGrid.scss */
    filterPopupClassName: 'rsKendoFilterTable',
};

export default GRID_CONFIG;

/** Portals tooltips to body — prevents clipping inside grid card overflow */
export const GRID_TOOLTIP_OVERLAY_CLASS = 'toolTipOverlayZindexCSS';

export const GRID_TOOLTIP_PROPS = {
    innerContent: false,
    tooltipOverlayClass: GRID_TOOLTIP_OVERLAY_CLASS,
};

// ---------------------------------------------------------------------------
// Variant presets — define default feature sets for each variant.
// Individual props always override these values.
// ---------------------------------------------------------------------------

export const VARIANT_PRESETS = {
    default: {
        paging: true,
        sorting: true,
        filtering: false,
        grouping: false,
        resizing: false,
        reordering: false,
        selection: false,
        searching: false,
        export: false,
        virtualScroll: false,
    },
    custom: {
        paging: true,
        sorting: true,
        filtering: true,
        grouping: false,
        resizing: false,
        reordering: false,
        selection: false,
        searching: false,
        export: false,
        virtualScroll: false,
    },
    advanced: {
        paging: true,
        sorting: true,
        filtering: true,
        grouping: true,
        resizing: true,
        reordering: true,
        selection: false,
        searching: false,
        export: false,
        virtualScroll: false,
    },
    grouped: {
        paging: true,
        sorting: true,
        filtering: false,
        grouping: true,
        resizing: true,
        reordering: true,
        selection: false,
        searching: true,
        export: false,
        virtualScroll: false,
    },
};

// ---------------------------------------------------------------------------
// Pager configuration
// ---------------------------------------------------------------------------

/** Default pager config used by "default" and "custom" variants. */
export const PAGER_CONFIG = {
    info: true,
    pageSizes: [5, 10, 20],
    previousNext: true,
    buttonCount: 4,
    className: `${GRID_CONFIG.className}-pager`,
};

/** Wrapper slot below the grid — matches ResGrid `.resgrid-pager` */
export const PAGER_LAYOUT_CLASS = `${GRID_CONFIG.className}-pager`;

/** Notification pager config — page sizes derived from an initial size. */
export const Notification_PAGER_CONFIG = {
    info: true,
    pageSizes: (initialSize) => [initialSize, initialSize * 2, initialSize * 3],
    previousNext: true,
    buttonCount: 4,
};

// ---------------------------------------------------------------------------
// Initial grid state configuration
// ---------------------------------------------------------------------------

/** Default initial config (static page size). */
export const INITIAL_CONFIG = {
    take: 5,
    skip: 0,
};

/** Auto-resize initial config (dynamic page size from window). */
export const INITIAL_CONFIG_AUTO = (pageSize) => ({
    take: pageSize,
    skip: 0,
});

/** Default pagination page sizes. */
export const DEFAULT_PAGE_SIZES = [5, 10, 20, 50];

/** Initial grid state for data-state-driven grids. */
export const INITIAL_GRID_STATE = {
    skip: 0,
    take: 5,
    group: [],
    sort: [],
    filter: undefined,
};

// ---------------------------------------------------------------------------
// Filter helpers
// ---------------------------------------------------------------------------

/** Value-independent filter operators (don't require a value). */
export const VALUE_INDEPENDENT_OPERATORS = new Set([
    'isnull',
    'isnotnull',
    'isempty',
    'isnotempty',
    'isnullorempty',
    'isnotnullorempty',
]);

/** Valid filter types for column menus. */
export const FILTER_TYPES = ['text', 'numeric', 'boolean', 'date'];

// ---------------------------------------------------------------------------
// Scroll mode mappings
// ---------------------------------------------------------------------------

export const SCROLL_MODES = {
    none: `${GRID_CONFIG.className}-fixed-grid`,
    scrollable: `${GRID_CONFIG.className}-scrollable-grid`,
};

/** Max visible columns in empty-state skeleton — prevents horizontal scroll in fixed-width layouts. */
export const MAX_EMPTY_GRID_COLUMNS = 7;

/** Default column count for pending grid skeleton when columns are not yet available. */
export const DEFAULT_SKELETON_COLUMN_COUNT = 6;

/** Width used for injected pending columns during initial load. */
export const DEFAULT_PENDING_COLUMN_WIDTH = 205;

// ---------------------------------------------------------------------------
// Icon replacement mappings for Kendo Grid UI elements
// ---------------------------------------------------------------------------

export const ICON_REPLACEMENTS = [
    { selector: '.k-i-caret-alt-to-left, .k-svg-i-caret-alt-to-left', classes: ['icon-rs-pagination-first-medium', 'icon-xs'], container: '.k-pager' },
    { selector: '.k-i-arrow-60-left', classes: ['icon-rs-pagination-previous-medium', 'icon-xs'], container: '.k-pager' },
    { selector: '.k-i-caret-alt-left, .k-svg-i-chevron-left', classes: ['icon-rs-pagination-previous-medium', 'icon-xs'], container: '.k-pager' },
    { selector: '.k-i-arrow-60-right', classes: ['icon-rs-pagination-next-medium', 'icon-xs'], container: '.k-pager' },
    { selector: '.k-i-caret-alt-right, .k-svg-i-chevron-right', classes: ['icon-rs-pagination-next-medium', 'icon-xs'], container: '.k-pager' },
    { selector: '.k-i-caret-alt-to-right, .k-svg-i-caret-alt-to-right', classes: ['icon-rs-pagination-last-medium', 'icon-xs'], container: '.k-pager' },
    { selector: '.k-i-arrow-double-left', classes: ['icon-rs-pagination-first-medium', 'icon-xs'], container: '.k-pager' },
    { selector: '.k-i-arrow-double-right', classes: ['icon-rs-pagination-last-medium', 'icon-xs'], container: '.k-pager' },
    { selector: '.k-i-chevron-left', classes: ['icon-rs-pagination-previous-medium', 'icon-xs'], container: '.k-pager' },
    { selector: '.k-i-chevron-right', classes: ['icon-rs-pagination-next-medium', 'icon-xs'], container: '.k-pager' },
    { selector: '.k-icon.k-i-sort-asc-small, .k-svg-i-sort-asc-small', classes: ['icon-rs-arrow-up-mini', 'icon-xs'], container: '.k-grid-header' },
    { selector: '.k-icon.k-i-sort-desc-small, .k-svg-i-sort-desc-small', classes: ['icon-rs-arrow-down-mini', 'icon-xs'], container: '.k-grid-header' },
];

/** Search icon replacement (used by RSKendoGrid/RSCustomKendoGrid). */
export const SEARCH_ICON_REPLACEMENT = {
    selector: '.k-i-search, .k-svg-i-search',
    classes: ['icon-smd', 'color-secondary-grey', 'icon-rs-circle-zoom-fill-edge-medium', 'position-absolute', 'top0', 'right0'],
};

/** Filter icon replacements — scoped to grid header only. */
export const FILTER_ICON_REPLACEMENTS = [
    {
        selector:
            '.k-i-more-vertical, .k-svg-i-more-vertical, .k-grid-header-menu .k-button-icon, .k-grid-header-menu .k-svg-icon',
        classes: ['icon-rs-filter-mini', 'icon-xs'],
        container: '.k-grid-header',
    },
];

// ---------------------------------------------------------------------------
// Props metadata (for documentation page auto-generation)
// ---------------------------------------------------------------------------

export const PROPS_METADATA = [
    { name: 'data', type: 'Array', default: '[]', description: 'Grid data array' },
    { name: 'columns', type: 'Array', default: '[]', description: 'Column definitions for default/custom/advanced variants' },
    { name: 'variant', type: 'String', default: '"default"', description: 'Grid variant: "default", "custom", "advanced", "grouped"' },
    { name: 'features', type: 'Object', default: 'undefined', description: 'Feature flags object to override variant preset' },
    { name: 'pageable', type: 'Boolean', default: 'true', description: 'Enable/disable pagination' },
    { name: 'sortable', type: 'Boolean', default: 'true', description: 'Enable/disable column sorting' },
    { name: 'filterable', type: 'Boolean', default: 'false', description: 'Enable/disable column filtering' },
    { name: 'groupable', type: 'Boolean', default: 'false', description: 'Enable/disable column grouping' },
    { name: 'resizable', type: 'Boolean', default: 'false', description: 'Enable/disable column resizing' },
    { name: 'reorderable', type: 'Boolean', default: 'false', description: 'Enable/disable column reordering' },
    { name: 'selectable', type: 'Boolean', default: 'false', description: 'Enable/disable row selection' },
    { name: 'searchable', type: 'Boolean', default: 'false', description: 'Enable/disable toolbar search (grouped variant)' },
    { name: 'settings', type: 'Object', default: '{}', description: 'Grid settings (total, etc.) for server-side mode' },
    { name: 'isDataStateRequired', type: 'Boolean', default: 'false', description: 'Enable server-side data operations mode' },
    { name: 'onDataStateChange', type: 'Function', default: '() => {}', description: 'Callback for data state changes (server-side)' },
    { name: 'scrollable', type: 'String|Boolean', default: '"none"', description: 'Scroll mode: "none", "scrollable", or boolean' },
    { name: 'isLoading', type: 'Boolean', default: 'false', description: 'Show loading skeleton state' },
    { name: 'noDataText', type: 'String', default: '""', description: 'Custom text for empty grid state' },
    { name: 'noDataShowIcon', type: 'Boolean', default: 'true', description: 'Show icon in empty state' },
    { name: 'noBoxShadow', type: 'Boolean', default: 'false', description: 'Disable box shadow on grid' },
    { name: 'pageSizes', type: 'Array', default: '[5, 10, 20]', description: 'Custom page size options' },
    { name: 'hidePaginationInfo', type: 'Boolean', default: 'false', description: 'Hide "X of Y items" info text' },
    { name: 'hideFirstLastNav', type: 'Boolean', default: 'false', description: 'Hide first/last page navigation' },
    { name: 'autoResizeSize', type: 'Boolean', default: 'false', description: 'Auto-adjust page size based on window height' },
    { name: 'isListTable', type: 'Boolean', default: 'true', description: 'Use grid-table vs list-table wrapper class' },
    { name: 'isConsumption', type: 'Boolean', default: 'false', description: 'Enable consumption-specific styling' },
    { name: 'callbackFilterChange', type: 'Function', default: '() => {}', description: 'Callback when filter changes' },
    { name: 'onPageSizeChange', type: 'Function', default: 'undefined', description: 'Callback when page size changes' },
    { name: 'staticColumns', type: 'Array', default: '[]', description: 'Static columns for grouped variant' },
    { name: 'groupedColumns', type: 'Array', default: '[]', description: 'Grouped column definitions for grouped variant' },
    { name: 'selectedChannel', type: 'String', default: '"All channels"', description: 'Channel filter for grouped variant' },
    { name: 'hideGroupingHeader', type: 'Boolean', default: 'false', description: 'Hide grouping drag header (grouped variant)' },
    { name: 'initialFilter', type: 'Object', default: 'null', description: 'Initial filter state' },
    { name: 'initialDataState', type: 'Object', default: 'undefined', description: 'Initial data state (grouped variant)' },
    { name: 'skeletonColumns', type: 'Number', default: 'undefined', description: 'Override skeleton column count for loading state' },
    { name: 'customSettingsClassName', type: 'String', default: '""', description: 'Additional CSS class for the inner grid' },
    { name: 'isCustomClass', type: 'String', default: '""', description: 'Additional CSS class for the wrapper' },
];

/** Feature matrix for documentation. */
export const FEATURE_MATRIX = [
    { feature: 'Paging', supported: true },
    { feature: 'Sorting', supported: true },
    { feature: 'Filtering', supported: true },
    { feature: 'Search', supported: true },
    { feature: 'Grouping', supported: true },
    { feature: 'Column Menu', supported: true },
    { feature: 'Column Reordering', supported: true },
    { feature: 'Column Resizing', supported: true },
    { feature: 'Row Selection', supported: true },
    { feature: 'Expand/Collapse Rows', supported: true },
    { feature: 'Custom Cell Rendering', supported: true },
    { feature: 'Custom Header Rendering', supported: true },
    { feature: 'Action Columns', supported: true },
    { feature: 'Toolbar Support', supported: true },
    { feature: 'Loading State', supported: true },
    { feature: 'Empty State', supported: true },
    { feature: 'Responsive Behavior', supported: true },
    { feature: 'Virtual Scrolling', supported: true },
    { feature: 'Server Side Data Operations', supported: true },
    { feature: 'Client Side Data Operations', supported: true },
    { feature: 'Export (Excel/PDF/CSV)', supported: false },
];
