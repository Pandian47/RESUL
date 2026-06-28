/**
 * ResGrid - Configuration
 */

const GRID_NAME_CONFIG = {
    prefix: 'res',
    componentName: 'grid',
};

const capitalize = (str) => str.charAt(0).toUpperCase() + str.slice(1);

const generateComponentName = ({ prefix, componentName }) =>
    `${capitalize(prefix)}${capitalize(componentName)}`;

const generateClassName = ({ prefix, componentName }) =>
    `${prefix.toLowerCase()}${componentName.toLowerCase()}`;

const generateDocRoute = ({ prefix, componentName }) =>
    `/docs/components/${prefix.toLowerCase()}${componentName.toLowerCase()}`;

export const gridClass = (modifier) => {
    const base = generateClassName(GRID_NAME_CONFIG);
    return modifier ? `${base}--${modifier}` : base;
};

/** Layout/block classes: resgrid-{segment} (single dash, not BEM --) */
export const layoutClass = (segment) => {
    const base = generateClassName(GRID_NAME_CONFIG);
    return segment ? `${base}-${segment}` : base;
};

export const GRID_CONFIG = {
    name: GRID_NAME_CONFIG,
    componentName: generateComponentName(GRID_NAME_CONFIG),
    className: generateClassName(GRID_NAME_CONFIG),
    docRoute: generateDocRoute(GRID_NAME_CONFIG),
    scssFileName: `${generateClassName(GRID_NAME_CONFIG)}.scss`,
    filterPopupClassName: `${generateClassName(GRID_NAME_CONFIG)}FilterPopup`,
    defaultEmptyMessage: 'No Records Found',
};

/** Nested list-detail empty copy (shops, device configs, etc.) */
export const LIST_DETAIL_EMPTY_MESSAGES = {
    appDevices: 'No device configurations added yet.',
    brandShops: 'No shops added to this brand yet.',
};

/** Brand / shop listing fallback — same asset as Assets/Images/index.js Image_placeholder */
export { default as BRAND_SHOP_IMAGE_PLACEHOLDER } from 'Assets/Images/data_exchange/image-placeholder.svg';

/** Centralised layout class names — keep in sync with $resgrid in resgrid.scss */
/** Status label / statusID → CSS class for card accent, badge, and expand corner */
export const LIST_STATUS_CLASS_MAP = {
    Completed: 'status-completed',
    'Multi status': 'status-multistatus',
    'In progress': 'status-inprogress',
    Scheduled: 'status-scheduled',
    Draft: 'status-draft',
    Active: 'status-draft',
    Inactive: 'status-draft',
    Sent: 'status-scheduled',
    Alert: 'status-alert',
    Archived: 'status-archive',
    Reject: 'status-reject',
    Stop: 'status-stop',
    Stopped: 'status-stop',
    Paused: 'status-pause',
    pause: 'status-pause',
    Extraction: 'status-extraction',
    Delete: 'status-alert',
    InComplete: 'status-alert',
};

export { CHANNEL_COLORS, COMMUNICATION_STATUS_COLORS } from './tokens';

export const LIST_STATUS_DEFAULT_CLASS = 'status-completed';

/** Expanded detail table column widths (px) — exposed as CSS vars on list wrapper */
export const LIST_DETAIL_COLUMN_WIDTHS = {
    channel: 112,
    status: 72,
};

/** Defaults for list (card) layout spacing and platform class hooks */
export const LIST_LAYOUT_DEFAULTS = {
    rowGap: 15,
    detailOverlap: 22,
    detailColumnWidths: LIST_DETAIL_COLUMN_WIDTHS,
    cardClassNames: '',
    detailViewClassNames: '',
    detailTableClassNames: '',
    wrapperPlatformClass: '',
    statusClassMap: LIST_STATUS_CLASS_MAP,
};

/**
 * Presets for listing screens — merge with `listConfig` or pass `listPreset` on ResGrid.
 * `detailOverlap` pulls the detail row under the card header; default 22 works with rowGap 10.
 */
/** List-card skeleton shapes — one per ResGrid listing module */
export const SKELETON_LIST_VARIANTS = ['communication', 'analytics', 'app', 'brand'];

export const resolveSkeletonListVariant = ({
    skeletonVariant,
    listPreset,
    listConfig,
} = {}) => {
    if (skeletonVariant && SKELETON_LIST_VARIANTS.includes(skeletonVariant)) {
        return skeletonVariant;
    }
    if (listConfig?.skeletonVariant && SKELETON_LIST_VARIANTS.includes(listConfig.skeletonVariant)) {
        return listConfig.skeletonVariant;
    }
    if (listPreset === 'analytics') return 'analytics';
    if (listPreset === 'app') return 'app';
    if (listPreset === 'brand') return 'brand';
    if (listPreset === 'communication' || listPreset === 'platform') return 'communication';
    return 'communication';
};

export const LIST_LAYOUT_PRESETS = {
    default: {
        variant: 'default',
        ...LIST_LAYOUT_DEFAULTS,
    },
    analytics: {
        variant: 'analytics',
        rowGap: 15,
        detailOverlap: 22,
        wrapperPlatformClass: 'rs-grid-listing',
        cardClassNames: 'rs-communication-list comm-listing',
        detailViewClassNames: 'rs-grid-detail-view',
        detailTableClassNames: 'grid-detail-content grid-listing-comm',
    },
    communication: {
        variant: 'communication',
        rowGap: 15,
        detailOverlap: 22,
        wrapperPlatformClass: 'rs-grid-listing',
        cardClassNames: 'rs-communication-list comm-listing',
        detailViewClassNames: 'rs-grid-detail-view',
        detailTableClassNames: 'grid-detail-content grid-listing-comm',
    },
    /** Legacy platform spacing (21px between collapsed cards) */
    platform: {
        variant: 'platform',
        rowGap: 15,
        detailOverlap: 22,
        wrapperPlatformClass: 'rs-grid-listing',
        cardClassNames: 'rs-communication-list comm-listing',
        detailViewClassNames: 'rs-grid-detail-view',
        detailTableClassNames: 'grid-detail-content grid-listing-comm',
    },
    /** Mobile push app notification listing (rs-list-grid-wrapper cards) */
    app: {
        variant: 'app',
        rowGap: 21,
        detailOverlap: 22,
        wrapperPlatformClass: 'rs-grid-listing',
    },
    /** Offer management — brands & shops listing */
    brand: {
        variant: 'brand',
        rowGap: 15,
        detailOverlap: 22,
        wrapperPlatformClass: 'rs-grid-listing brandShops',
    },
};

export const resolveListLayoutConfig = (listPreset, listConfig = {}) => {
    const presetKey =
        listPreset && LIST_LAYOUT_PRESETS[listPreset] ? listPreset : listConfig?.variant;
    const preset = presetKey && LIST_LAYOUT_PRESETS[presetKey]
        ? LIST_LAYOUT_PRESETS[presetKey]
        : LIST_LAYOUT_PRESETS.default;

    const merged = {
        ...LIST_LAYOUT_DEFAULTS,
        ...preset,
        ...(listConfig && typeof listConfig === 'object' ? listConfig : {}),
    };

    if (merged.detailOverlap == null && merged.rowGap != null) {
        merged.detailOverlap = merged.rowGap + 12;
    }

    return merged;
};

export const LAYOUT_CLASSES = {
    base: GRID_CONFIG.className,
    kendoListTable: layoutClass('kendo-list-table'),
    listing: layoutClass('listing'),
    kendoGridTable: layoutClass('kendo-grid-table'),
    listWrapper: `${layoutClass('kendo-list-table')} ${layoutClass('listing')}`,
    tableWrapper: layoutClass('kendo-grid-table'),
    communicationList: layoutClass('communication-list'),
    communicationIcon: layoutClass('communication-icon'),
    detailView: layoutClass('detail-view'),
    detailContent: layoutClass('detail-content'),
    detailListing: layoutClass('detail-listing'),
    loadingSkeleton: layoutClass('loading-skeleton'),
    docsPreview: layoutClass('docs-preview'),
    filterMenu: layoutClass('filter-menu'),
    listTags: layoutClass('list-tags'),
    listCardMeta: layoutClass('list-card-meta'),
    listCardMetaText: layoutClass('list-card-meta-text'),
    listCardTitle: layoutClass('list-card-title pt5'),
    colChannel: layoutClass('col-channel'),
    colStatus: layoutClass('col-status'),
    colMetrics: layoutClass('col-metrics'),
    colAction: layoutClass('col-action'),
    channelIcon: layoutClass('channel-icon'),
};

/** Portals tooltips to body — prevents clipping inside list/table card overflow */
export const GRID_TOOLTIP_OVERLAY_CLASS = 'toolTipOverlayZindexCSS';

export const GRID_TOOLTIP_PROPS = {
    innerContent: false,
    tooltipOverlayClass: GRID_TOOLTIP_OVERLAY_CLASS,
};

export const PAGER_CONFIG = {
    info: true,
    pageSizes: [5, 10, 20],
    previousNext: true,
    buttonCount: 4,
    className: `${GRID_CONFIG.className}-pager`,
};

export const INITIAL_GRID_STATE = {
    skip: 0,
    take: 5,
    sort: [],
    filter: undefined,
    group: [],
};

export const SCROLL_MODES = {
    none: `${GRID_CONFIG.className}-fixed-grid`,
    scrollable: `${GRID_CONFIG.className}-scrollable-grid`,
    virtual: `${GRID_CONFIG.className}-virtual-grid`,
};

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

export const FILTER_ICON_REPLACEMENTS = [
    { selector: '.k-i-more-vertical, .k-svg-i-more-vertical', classes: ['icon-rs-filter-mini', 'icon-xs'] },
];

export const PROPS_METADATA = [
    { name: 'data', type: 'Array', default: '[]', description: 'Grid row data' },
    { name: 'columns', type: 'Array', default: '[]', description: 'Column definitions (field, title, cell, truncate, filter, width, etc.)' },
    { name: 'loading', type: 'Boolean', default: 'false', description: 'Shows internal skeleton rows' },
    { name: 'error', type: 'Boolean | String', default: 'false', description: 'Shows error state with optional message' },
    { name: 'skeletonRows', type: 'Number', default: '5', description: 'Number of skeleton rows while loading' },
    {
        name: 'skeletonVariant',
        type: 'String',
        default: 'communication',
        description: 'List skeleton shape: communication | analytics | app | brand (auto from listPreset when omitted)',
    },
    { name: 'emptyMessage', type: 'String | Node', default: '"No Records Found"', description: 'Empty state message when data is empty' },
    { name: 'emptyContent', type: 'Node', default: 'undefined', description: 'Custom empty state content (overrides emptyMessage)' },
    { name: 'sortable', type: 'Boolean', default: 'true', description: 'Enable column sorting' },
    { name: 'filterable', type: 'Boolean', default: 'false', description: 'Enable column filtering' },
    { name: 'pageable', type: 'Boolean | Object', default: 'true', description: 'Enable pagination or pass Kendo pager settings' },
    { name: 'selectable', type: 'Boolean | Object', default: 'false', description: 'Enable row selection (single or multi)' },
    { name: 'resizable', type: 'Boolean', default: 'false', description: 'Enable column resizing' },
    { name: 'reorderable', type: 'Boolean', default: 'false', description: 'Enable column reordering' },
    { name: 'scrollable', type: 'String', default: '"none"', description: 'Scroll mode: none, scrollable, virtual' },
    { name: 'stickyHeader', type: 'Boolean', default: 'false', description: 'Sticky table header on scroll' },
    { name: 'layout', type: 'String', default: '"table"', description: 'Layout mode: "list" (card listing — Analytics/Communication) or "table" (tabular data)' },
    {
        name: 'listPreset',
        type: 'String',
        default: 'undefined',
        description:
            'List layout preset: "analytics" | "communication" | "platform" | "default" — sets row gap, platform classes, and detail overlap',
    },
    {
        name: 'listConfig',
        type: 'Object',
        default: 'undefined',
        description:
            'Overrides list preset: { rowGap, detailOverlap, cardClassNames, detailViewClassNames, detailTableClassNames, wrapperPlatformClass, statusClassMap, variant }',
    },
    { name: 'total', type: 'Number', default: 'undefined', description: 'Total record count for server-side pagination' },
    { name: 'dataState', type: 'Object', default: 'undefined', description: 'Controlled data state (skip, take, sort, filter)' },
    { name: 'onDataStateChange', type: 'Function', default: 'undefined', description: 'Data state change handler' },
    { name: 'isServerSide', type: 'Boolean', default: 'false', description: 'Server-side data operations (skip client process)' },
    { name: 'exportable', type: 'Boolean | Object', default: 'false', description: 'Enable export toolbar (csv, excel, pdf)' },
    { name: 'toolbar', type: 'Node', default: 'undefined', description: 'Custom toolbar content above the grid' },
    { name: 'wrapperClassName', type: 'String', default: '""', description: 'Additional wrapper CSS classes' },
    { name: 'className', type: 'String', default: '""', description: 'Additional grid CSS classes' },
    { name: 'detail', type: 'Function | Component', default: 'undefined', description: 'Master-detail row renderer' },
    { name: 'expandField', type: 'String', default: 'undefined', description: 'Boolean field on each row for expanded state (e.g. "expanded")' },
    { name: 'onExpandChange', type: 'Function', default: 'undefined', description: 'Expand/collapse handler — receives { dataItem }' },
    { name: 'dataItemKey', type: 'String', default: '"id" when detail + expandField are set', description: 'Unique row key for Kendo v15 detailExpand (required for list expand)' },
    { name: 'pageSizes', type: 'Array', default: '[5, 10, 20]', description: 'Pagination page size options' },
    { name: 'hidePaginationInfo', type: 'Boolean', default: 'false', description: 'Hide pager info text' },
    { name: 'hideFirstLastNav', type: 'Boolean', default: 'false', description: 'Hide first/last pager buttons' },
];

export const FEATURE_MATRIX = [
    { feature: 'Sorting', supported: true },
    { feature: 'Filtering', supported: true },
    { feature: 'Pagination', supported: true },
    { feature: 'Row Selection', supported: true },
    { feature: 'Multi Selection', supported: true },
    { feature: 'Column Reordering', supported: true },
    { feature: 'Column Resizing', supported: true },
    { feature: 'Sticky Header', supported: true },
    { feature: 'Responsive Layout', supported: true },
    { feature: 'Skeleton Loading', supported: true },
    { feature: 'Empty State', supported: true },
    { feature: 'Error State', supported: true },
    { feature: 'Tooltip (Truncate)', supported: true },
    { feature: 'Export CSV', supported: true },
    { feature: 'Export Excel', supported: true },
    { feature: 'Export PDF', supported: true },
    { feature: 'Virtual Scrolling', supported: true },
    { feature: 'Server-side Pagination', supported: true },
    { feature: 'Lazy Loading', supported: true },
    { feature: 'Custom Cell Rendering', supported: true },
    { feature: 'Custom Header Rendering', supported: true },
    { feature: 'Master-Detail Rows', supported: true },
    { feature: 'List Layout (Cards)', supported: true },
];

export default GRID_CONFIG;
