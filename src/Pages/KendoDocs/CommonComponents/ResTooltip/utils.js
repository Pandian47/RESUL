import { RES_COMPONENT_CLASS } from '../../kendoDocsPrefix.config';
import { VARIANT_PRESETS } from './config';
/** Legacy rs-tooltip / RS-MDC class tokens → res- prefixed ResTooltip classes. */
const CLASS_REPLACEMENTS = [
    ['rs-tooltip-child-wrapper', 'res-tooltip-child-wrapper'],
    ['rs-tooltip-wrapper', 'res-tooltip-wrapper'],
    ['RS-MDC-Tooltip-UI', 'res-mdc-tooltip-ui'],
    ['RSpopupHeading', 'res-popup-heading'],
    ['RSpopupSubHeading', 'res-popup-subheading'],
    ['RSpopupDate', 'res-popup-date'],
];

export const mapResTooltipClasses = (classString = '') => {
    if (!classString || typeof classString !== 'string') return '';
    let result = classString;
    CLASS_REPLACEMENTS.forEach(([from, to]) => {
        result = result.replace(new RegExp(`\\b${from}\\b`, 'g'), to);
    });
    return result.replace(/\s+/g, ' ').trim();
};

/** Wrapper classes — keep rs-* alias for global SCSS until full migration. */
export const TOOLTIP_WRAPPER_CLASS = `rs-tooltip-wrapper ${RES_COMPONENT_CLASS.tooltipWrapper}`;

export const TOOLTIP_CHILD_WRAPPER_CLASS = `rs-tooltip-child-wrapper ${RES_COMPONENT_CLASS.tooltipChildWrapper}`;

export const resolveTooltipPreset = (variant = 'default', props = {}) => {
    const preset = VARIANT_PRESETS[variant] || VARIANT_PRESETS.default;
    return {
        trigger: props.trigger ?? preset.trigger,
        delay: preset.delay,
        innerContent: props.innerContent ?? preset.innerContent,
        wrapperTag: props.wrapperTag ?? preset.wrapperTag,
        flip: preset.flip,
    };
};
