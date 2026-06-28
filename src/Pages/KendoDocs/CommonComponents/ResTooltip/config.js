/**
 * ResTooltip - consolidated tooltip (RSTooltip + container behavior + RSMdcTooltip).
 */

export const TOOLTIP_VARIANTS = ['default', 'container', 'mdc'];

export const LEGACY_VARIANT_MAP = {
    RSTooltip: 'default',
    RSMdcTooltip: 'mdc',
};

export const TOOLTIP_MDC_OVERLAY_CLASS = 'res-mdc-tooltip-overlay';

export const VARIANT_PRESETS = {
    default: {
        trigger: ['hover', 'focus', 'click'],
        delay: { show: 0, hide: 0 },
        innerContent: false,
        wrapperTag: 'div',
        flip: false,
    },
    container: {
        trigger: ['hover', 'focus', 'click'],
        delay: { show: 0, hide: 0 },
        innerContent: true,
        wrapperTag: 'div',
        flip: false,
    },
    mdc: {
        trigger: ['hover', 'focus'],
        delay: { show: 150, hide: 100 },
        innerContent: false,
        wrapperTag: 'div',
        flip: true,
    },
};

export const PROPS_METADATA = [
    {
        name: 'variant',
        type: 'string',
        description: 'Tooltip behavior preset. default uses React-Bootstrap container behavior. container renders inside the trigger wrapper. mdc is for MDC workflow edge labels.',
        example: 'variant="default"',
    },
    {
        name: 'text',
        type: 'string | number | ReactNode',
        description: 'Tooltip body. Supports JSX for MDC schedule popups.',
        example: 'text="Help text"',
    },
    {
        name: 'position',
        type: 'string',
        description: 'Bootstrap placement: top | bottom | left | right.',
        example: 'position="top"',
    },
    {
        name: 'className',
        type: 'string',
        description: 'Extra classes on the wrapper. Legacy rs-tooltip-* tokens map to res-tooltip-* automatically.',
        example: 'className="lh0"',
    },
    {
        name: 'trigger',
        type: 'string | string[]',
        description: 'OverlayTrigger events. Default varies by variant.',
        example: "trigger={['hover', 'focus']}",
    },
    {
        name: 'innerContent',
        type: 'boolean',
        description: 'When true (container variant), portal tooltip into the wrapper ref to avoid overflow clipping.',
        example: 'innerContent={false}',
    },
    {
        name: 'tooltipOverlayClass',
        type: 'string',
        description: 'Extra class on the Bootstrap Tooltip overlay.',
        example: 'tooltipOverlayClass="toolTipOverlayZindexCSS"',
    },
    {
        name: 'show',
        type: 'boolean',
        description: 'Controlled visibility (default variant).',
        example: 'show={isOpen}',
    },
    {
        name: 'customText',
        type: 'string',
        description: 'HTML string rendered inside the tooltip (default variant).',
        example: 'customText="<strong>Bold</strong> help"',
    },
    {
        name: 'wrapperTag',
        type: 'string | element',
        description: 'HTML tag for the trigger wrapper. Default variant often uses span in KendoDocs.',
        example: 'wrapperTag="span"',
    },
    {
        name: 'isDefaultShow',
        type: 'boolean',
        description: 'MDC variant - controlled default-visible state (e.g. edge schedule labels).',
        example: 'isDefaultShow={visible}',
    },
    {
        name: 'container',
        type: 'RefObject',
        description: 'MDC/container variant - portal target ref (e.g. React Flow edge label container).',
        example: 'container={containerRef}',
    },
];

export const TOOLTIP_CONFIG = {
    name: { prefix: 'res', componentName: 'tooltip' },
    componentName: 'ResTooltip',
    className: 'res-tooltip',
    scssFileName: 'restooltip.scss',
};
