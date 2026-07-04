import { isValidElement } from 'react';

/** Legacy rs- / tab* class tokens mapped to res- prefixed ResTabber classes. */
const CLASS_REPLACEMENTS = [
    ['rs-scrollTabList-container', 'res-scroll-tab-list-container'],
    ['rs-vertical-tabs-wrapper', 'res-vertical-tabs-wrapper'],
    ['rs-tabs-with-heading', 'res-tabs-with-heading'],
    ['rs-tabs-closed-wrapper', 'res-tabs-closed-wrapper'],
    ['rs-tabs-opened-wrapper', 'res-tabs-opened-wrapper'],
    ['rs-tabs-icons-round', 'res-tabs-icons-round'],
    ['res-content-tabs-split', 'res-content-tabs-split'],
    ['rs-content-tabs-flat', 'res-content-tabs-flat'],
    ['rs-content-tabs-2', 'res-content-tabs-2'],
    ['rs-tabs-auto-width', 'res-tabs-auto-width'],
    ['rs-tab-source-controls', 'res-tab-source-controls'],
    ['rs-scroll-tabbar', 'res-scroll-tabbar'],
    ['rs-scroll-container', 'res-scroll-container'],
    ['rs-camp-tabs-holder', 'res-camp-tabs-holder'],
    ['rs-camp-tabs-big', 'res-camp-tabs-big'],
    ['rs-content-tabs', 'res-content-tabs'],
    ['rs-tabs-refresh', 'res-tabs-refresh'],
    ['rs-cc-sub-tabs', 'res-cc-sub-tabs'],
    ['rs-chart-tab', 'res-chart-tab'],
    ['rs-flat-tabs', 'res-flat-tabs'],
    ['rs-sub-tabs', 'res-sub-tabs'],
    ['rs-tab-horizontal', 'res-tab-horizontal'],
    ['rsv-tabs-content', 'res-v-tabs-content'],
    ['rsv-tabs-list', 'res-v-tabs-list'],
    ['rst-left-space', 'res-tabs-left-space'],
    ['rst-right-align', 'res-tabs-right-align'],
    ['rsctf-closed', 'res-ctf-closed'],
    ['rsctf-opened', 'res-ctf-opened'],
    ['no-scroll-rs-content-tabs', 'no-scroll-res-content-tabs'],
    ['res-tabs-2', 'res-tabs-2'],
    ['rs-tab-custom-border', 'res-tab-custom-border'],
    ['rs-tabs', 'res-tabs'],
    ['tabTransparent', 'res-tab-transparent'],
    ['tabDefault', 'res-tab-default'],
    ['tabs-content', 'res-tabs-content'],
    ['tabs-vertical', 'res-tabs-vertical'],
    ['tabs-right-align', 'res-tabs-right-align'],
    ['icons-tab', 'res-icons-tab'],
    ['vertical-tabs', 'vertical-tabs'],
    ['tab-vertical-content', 'res-tab-vertical-content'],
    ['tab-label-editor-root', 'res-tab-label-editor-root'],
    ['tab-label-editor-input-inner', 'res-tab-label-editor-input-inner'],
    ['tab-label-editor-rsinput', 'res-tab-label-editor-rsinput'],
    ['tab-label-editor-actions', 'res-tab-label-editor-actions'],
    ['tab-smartlink-label-stack--named', 'res-tab-smartlink-label-stack--named'],
    ['tab-smartlink-label-stack', 'res-tab-smartlink-label-stack'],
    ['tab-subtext-first', 'res-tab-subtext-first'],
    ['tab-subtext', 'res-tab-subtext'],
    ['tab-edit-icon', 'res-tab-edit-icon'],
    ['tab-add', 'res-tab-add'],
    ['tab-remove', 'res-tab-remove'],
    ['tab-label', 'res-tab-label'],
    ['tab-link', 'res-tab-link'],
    ['animate-tab', 'res-animate-tab'],
    ['animate-key', 'res-animate-key'],
    ['arrowBar', 'res-arrow-bar'],
    ['or-divider', 'res-or-divider'],
    ['or-tab', 'res-or-tab'],
];

const LEGACY_CLASS_MAP = new Map(CLASS_REPLACEMENTS);

/** Tab list containers that use the Framer Motion sliding active indicator. */
const SLIDING_INDICATOR_CONTAINER_CLASSES = new Set([
    'rs-tabs',
    'res-tabs',
    'res-tabs-2',
    'rs-chart-tab',
    'res-chart-tab',
]);

/** Layouts that keep their own static active styling — no sliding indicator. */
const SLIDING_INDICATOR_EXCLUDED_CLASSES = new Set([
    'vertical-tabs',
    'res-vertical-tabs',
    'rsv-tabs-list',
    'res-v-tabs-list',
    'tabs-vertical',
    'res-tabs-vertical',
    'res-tab-horizontal',
    'rs-tab-horizontal',
    'res-content-tabs',
    'rs-content-tabs',
    'res-content-tabs-flat',
    'rs-content-tabs-flat',
    'res-content-tabs-2',
    'rs-content-tabs-2',
    'res-content-tabs-split',
    'rs-content-tabs-split',
]);

const mapLegacyClassToken = (token) => {
    if (!token) return token;
    if (token.startsWith('res-') || token.startsWith('rs-')) {
        return LEGACY_CLASS_MAP.get(token) ?? token;
    }
    return LEGACY_CLASS_MAP.get(token) ?? token;
};

export const shouldEnableSlidingIndicator = (className = '', dynamicTab = '') => {
    const tokens = `${className} ${dynamicTab}`.trim().split(/\s+/).filter(Boolean);

    if (tokens.some((token) => SLIDING_INDICATOR_EXCLUDED_CLASSES.has(mapLegacyClassToken(token)))) {
        return false;
    }

    return tokens.some((token) => SLIDING_INDICATOR_CONTAINER_CLASSES.has(mapLegacyClassToken(token)));
};

export const mapResTabberClasses = (classString = '') => {
    if (!classString || typeof classString !== 'string') return '';

    const mapped = classString
        .trim()
        .split(/\s+/)
        .filter(Boolean)
        .map(mapLegacyClassToken)
        .join(' ');

    // Safety net for any historical double-prefix output (res-res-tab-* → res-tab-*)
    return mapped.replace(/\bres-res-/g, 'res-').replace(/\s+/g, ' ').trim();
};

/**
 * Normalize legacy prop aliases to a consistent shape.
 */
export const normalizeTabberProps = (props = {}) => {
    const {
        componentClassname,
        componentClassName,
        defaultSelectedItem,
        onTabChange,
        callBack,
        variant: _variant,
        features: _features,
        ...rest
    } = props;

    return {
        ...rest,
        defaultTab:
            rest.defaultTab !== undefined
                ? rest.defaultTab
                : defaultSelectedItem !== undefined
                  ? defaultSelectedItem
                  : 0,
        className: mapResTabberClasses(rest.className),
        defaultClass: mapResTabberClasses(rest.defaultClass),
        dynamicTab: mapResTabberClasses(rest.dynamicTab),
        extraClassName: mapResTabberClasses(rest.extraClassName),
        componentClassName: mapResTabberClasses(componentClassName ?? componentClassname ?? ''),
        callBack: onTabChange || callBack || (() => {}),
    };
};

export const TAB_LABEL_MAX_LENGTH = 25;

/**
 * Renders a tab panel from tabData entry. Guards against undefined components
 * (common when constants.jsx imports a panel that imports the same constants).
 */
export const renderTabPanel = (tab) => {
    if (!tab?.component || typeof tab.component !== 'function') {
        return null;
    }

    const panel = tab.component();

    if (panel == null || panel === false) {
        return panel;
    }

    if (isValidElement(panel) && panel.type == null) {
        if (import.meta.env.DEV) {
            console.error(
                '[ResTabber] Tab panel component is undefined — check circular imports in tab config:',
                { id: tab.id, text: tab.text },
            );
        }
        return null;
    }

    return panel;
};
