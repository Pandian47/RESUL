/**
 * ResTabber - Configuration
 * Consolidated tab component replacing RSTabber, RSPTab, RSTabberFluid,
 * RSTabberSlide, RSTabSlide, and RSChartTabber.
 */

const TABBER_NAME_CONFIG = {
    prefix: 'res',
    componentName: 'tabber',
};

const capitalize = (str) => str.charAt(0).toUpperCase() + str.slice(1);

const generateComponentName = ({ prefix, componentName }) =>
    `${capitalize(prefix)}${capitalize(componentName)}`;

const generateClassName = ({ prefix, componentName }) =>
    `${prefix.toLowerCase()}-${componentName.toLowerCase()}`;

const generateDocRoute = ({ prefix, componentName }) =>
    `/docs/component/${prefix.toLowerCase()}${componentName.toLowerCase()}`;

export const tabberClass = (modifier) => {
    const base = generateClassName(TABBER_NAME_CONFIG);
    return modifier ? `${base}--${modifier}` : base;
};

export const TABBER_CONFIG = {
    name: TABBER_NAME_CONFIG,
    componentName: generateComponentName(TABBER_NAME_CONFIG),
    className: generateClassName(TABBER_NAME_CONFIG),
    docRoute: generateDocRoute(TABBER_NAME_CONFIG),
    scssFileName: `${generateClassName(TABBER_NAME_CONFIG)}.scss`,
};

export default TABBER_CONFIG;

/** Supported variant keys */
export const TAB_VARIANTS = ['default', 'portlet', 'fluid', 'slide', 'smartSlide', 'chartTabber'];

/** Default visible tab slots before horizontal scroll + carousel controls (smartSlide / RSTabSlide). */
export const SMART_SLIDE_DEFAULT_TAB_MAX = 5;

/** Maps legacy component names to ResTabber variants */
export const LEGACY_VARIANT_MAP = {
    RSTabber: 'default',
    RSPTab: 'portlet',
    RSTabberFluid: 'fluid',
    RSTabberSlide: 'slide',
    RSTabSlide: 'smartSlide',
    RSChartTabber: 'chartTabber',
};

// ---------------------------------------------------------------------------
// Variant presets — default feature flags per variant
// Individual props always override these values.
// ---------------------------------------------------------------------------

export const VARIANT_PRESETS = {
    default: {
        scrollable: false,
        headingLayout: true,
        addRemoveTabs: true,
        refreshControl: true,
        overflowDropdown: false,
        horizontalScroll: false,
        editableLabels: false,
        iconOnlyTabs: false,
        fullWidthBar: false,
    },
    portlet: {
        scrollable: false,
        headingLayout: false,
        addRemoveTabs: false,
        refreshControl: false,
        overflowDropdown: false,
        horizontalScroll: false,
        editableLabels: false,
        iconOnlyTabs: true,
        fullWidthBar: false,
    },
    fluid: {
        scrollable: false,
        headingLayout: false,
        addRemoveTabs: false,
        refreshControl: false,
        overflowDropdown: true,
        horizontalScroll: false,
        editableLabels: false,
        iconOnlyTabs: false,
        fullWidthBar: true,
    },
    slide: {
        scrollable: true,
        headingLayout: false,
        addRemoveTabs: false,
        refreshControl: false,
        overflowDropdown: false,
        horizontalScroll: true,
        editableLabels: false,
        iconOnlyTabs: false,
        fullWidthBar: false,
    },
    smartSlide: {
        scrollable: true,
        headingLayout: false,
        addRemoveTabs: true,
        refreshControl: true,
        overflowDropdown: false,
        horizontalScroll: true,
        editableLabels: true,
        iconOnlyTabs: false,
        fullWidthBar: false,
    },
    chartTabber: {
        scrollable: false,
        headingLayout: false,
        addRemoveTabs: false,
        refreshControl: false,
        overflowDropdown: false,
        horizontalScroll: false,
        editableLabels: false,
        iconOnlyTabs: false,
        fullWidthBar: false,
    },
};

// ---------------------------------------------------------------------------
// Props metadata (for documentation auto-generation)
// ---------------------------------------------------------------------------

export const PROPS_METADATA = [
    { name: 'variant', type: 'String', default: '"default"', description: 'Tab layout variant: "default", "portlet", "fluid", "slide", "smartSlide", "chartTabber"' },
    { name: 'tabData', type: 'Array | Function', default: '[]', description: 'Tab definitions: { id, text, component, icon, disable, add, remove, ... }' },
    { name: 'defaultTab', type: 'Number', default: '0', description: 'Initially selected tab index' },
    { name: 'callBack', type: 'Function', default: '() => {}', description: 'Called when tab changes: (tab, index, isForceUpdate?) => void' },
    { name: 'onTabChange', type: 'Function', default: 'undefined', description: 'Alias for callBack' },
    { name: 'features', type: 'Object', default: 'undefined', description: 'Feature flags object to override variant preset' },
    { name: 'className', type: 'String', default: '""', description: 'CSS class for tab list <ul>' },
    { name: 'defaultClass', type: 'String', default: '""', description: 'CSS class applied to each tab <li>' },
    { name: 'activeClass', type: 'String', default: '"active"', description: 'CSS class for the active tab' },
    { name: 'componentClassName', type: 'String', default: '""', description: 'CSS class for tab content wrapper' },
    { name: 'heading', type: 'String', default: '""', description: 'Side heading label (default variant)' },
    { name: 'flatTabs', type: 'Boolean', default: 'false', description: 'Flat tab styling (default variant)' },
    { name: 'ccTabs', type: 'Boolean', default: 'false', description: 'Communication creation tab layout' },
    { name: 'cTabsBig', type: 'Boolean', default: 'false', description: 'Large campaign tab labels' },
    { name: 'animate', type: 'Boolean', default: 'false', description: 'Animated tab indicator' },
    { name: 'arrow', type: 'Boolean', default: 'false', description: 'Show arrow bar under active tab' },
    { name: 'subText', type: 'Boolean', default: 'false', description: 'Show secondary text (text2) below tab label' },
    { name: 'or', type: 'Boolean', default: 'false', description: 'OR divider between tabs' },
    { name: 'dynamicTab', type: 'String', default: '""', description: 'Additional dynamic CSS class on tab list' },
    { name: 'disableOtherTabs', type: 'Boolean', default: 'false', description: 'Disable all tabs except the active one' },
    { name: 'singleTab', type: 'Boolean', default: 'false', description: 'Hide active styling when only one tab' },
    { name: 'refresh', type: 'Boolean', default: 'false', description: 'Show refresh/reset control' },
    { name: 'clear', type: 'Boolean', default: 'false', description: 'Show clear control' },
    { name: 'onRefresh', type: 'Function', default: '() => {}', description: 'Refresh control callback' },
    { name: 'onClear', type: 'Function', default: '() => {}', description: 'Clear control callback' },
    { name: 'onAddMenu', type: 'Function', default: '() => {}', description: 'Add tab button callback' },
    { name: 'onRemoveMenu', type: 'Function', default: '() => {}', description: 'Remove tab button callback' },
    { name: 'isRefreshConfirmation', type: 'Boolean', default: 'false', description: 'Confirm before refresh' },
    { name: 'isClearConfirmation', type: 'Boolean', default: 'false', description: 'Confirm before clear' },
    { name: 'isRemoveConfirmation', type: 'Boolean', default: 'false', description: 'Confirm before remove' },
    { name: 'isTabChangeConfirmation', type: 'Boolean', default: 'false', description: 'Confirm before switching tabs' },
    { name: 'count', type: 'Number', default: '7', description: 'Max visible tabs before overflow dropdown (fluid variant)' },
    { name: 'remTabs', type: 'Number', default: 'undefined', description: 'Tabs to move into overflow dropdown (fluid variant)' },
    { name: 'tabMaxLength', type: 'Number', default: '0', description: 'Show scroll controls when tab count exceeds this (slide variants)' },
    { name: 'customRender', type: 'Boolean', default: 'false', description: 'Render custom slot beside tabs (slide variant)' },
    { name: 'renderItem', type: 'ReactNode', default: 'null', description: 'Custom slot content (slide variant)' },
    { name: 'isBorderWhite', type: 'Boolean', default: 'true', description: 'White border on scroll tabs (slide variant)' },
    { name: 'isDetailAnalytics', type: 'Boolean', default: 'false', description: 'Analytics detail link tabs (slide variant)' },
    { name: 'onTabClick', type: 'Function', default: 'null', description: 'Custom click handler for analytics tabs' },
    { name: 'enableTabLabelEdit', type: 'Boolean', default: 'false', description: 'Inline tab label editing (smartSlide variant)' },
    { name: 'onTabLabelSave', type: 'Function', default: 'null', description: 'Save edited tab label' },
    { name: 'onTabLabelChange', type: 'Function', default: 'null', description: 'Tab label value change while editing' },
    { name: 'onTabLabelCancel', type: 'Function', default: 'null', description: 'Cancel tab label edit' },
    { name: 'tabLabelMaxLength', type: 'Number', default: '0', description: 'Max length for editable tab labels' },
    { name: 'tabLabelsExternallyControlled', type: 'Boolean', default: 'false', description: 'External label control for smart links' },
    { name: 'children', type: 'ReactNode', default: 'undefined', description: 'Extra content beside tab bar (portlet variant)' },
    { name: 'isLoginScreen', type: 'Boolean', default: 'false', description: 'Login screen content wrapper (default variant)' },
    { name: 'isCreateCommunication', type: 'Boolean', default: 'false', description: 'Communication plan navigation integration' },
    { name: 'chartHeading', type: 'String', default: '""', description: 'Portlet heading (chartTabber variant)' },
    { name: 'footer', type: 'Boolean | ReactNode', default: 'false', description: 'Show per-tab footer slot (chartTabber variant)' },
    { name: 'headerIcon', type: 'ReactNode', default: 'null', description: 'Extra header icon slot (chartTabber variant)' },
    { name: 'autoHeight', type: 'Boolean', default: 'false', description: 'Disable fixed portlet-md height (chartTabber variant)' },
    { name: 'expandView', type: 'Boolean', default: 'false', description: 'Show expand/collapse control (chartTabber variant)' },
    { name: 'gridView', type: 'ReactNode', default: 'null', description: 'Alternate grid view content (chartTabber variant)' },
    { name: 'expandIcon', type: 'Function', default: 'null', description: 'Expand toggle callback (chartTabber variant)' },
    { name: 'hideTabs', type: 'Boolean', default: 'false', description: 'Hide tab list in portlet header (chartTabber variant)' },
    { name: 'containerClass', type: 'String', default: '""', description: 'Extra portlet container classes (chartTabber variant)' },
];

export const FEATURE_MATRIX = [
    { feature: 'Standard tab bar', supported: true },
    { feature: 'Heading + tab layout', supported: true },
    { feature: 'Icon-only portlet tabs', supported: true },
    { feature: 'Full-width fluid bar', supported: true },
    { feature: 'Overflow dropdown (fluid)', supported: true },
    { feature: 'Horizontal scroll tabs', supported: true },
    { feature: 'Add / remove tabs', supported: true },
    { feature: 'Refresh / clear controls', supported: true },
    { feature: 'Tab change confirmation', supported: true },
    { feature: 'Inline tab label editing', supported: true },
    { feature: 'Animated tab indicator', supported: true },
    { feature: 'OR divider tabs', supported: true },
    { feature: 'Sub-text labels', supported: true },
    { feature: 'Disable other tabs', supported: true },
    { feature: 'Custom content slot', supported: true },
    { feature: 'Analytics link tabs', supported: true },
    { feature: 'Login screen wrapper', supported: true },
];
