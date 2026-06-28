/**
 * ResTooltip — consolidated tooltip component
 *
 * Replaces RSTooltip (variant="default"), wrapper-container tooltips
 * (variant="container"), and RSMdcTooltip (variant="mdc").
 *
 * @example
 * <ResTooltip text="Help text" position="top">
 *   <i className="icon-rs-circle-question-mark-mini" />
 * </ResTooltip>
 *
 * @example
 * <ResTooltip variant="mdc" isDefaultShow={visible} container={containerRef} text={<MdcContent />} position="top">
 *   <i className="icon-rs-timer-medium" />
 * </ResTooltip>
 */
import { Children, forwardRef, memo, useRef } from 'react';
import PropTypes from 'prop-types';
import { Fade, OverlayTrigger, Tooltip } from 'react-bootstrap';

import { TOOLTIP_VARIANTS, TOOLTIP_MDC_OVERLAY_CLASS } from './config';
import {
    mapResTooltipClasses,
    resolveTooltipPreset,
    TOOLTIP_CHILD_WRAPPER_CLASS,
    TOOLTIP_WRAPPER_CLASS,
} from './utils';

import './restooltip.scss';

const TOOLTIP_OVERLAY_CLASS = 'res-tooltip-overlay';
const TOOLTIP_UNMEASURED_CLASS = 'res-tooltip-unmeasured';
const TOOLTIP_EXITING_CLASS = 'res-tooltip-exiting';

const renderOverlayContent = (customText, text) => {
    if (customText) {
        return <div dangerouslySetInnerHTML={{ __html: customText }} />;
    }
    return text;
};

const buildClassName = (...classNames) => classNames.filter(Boolean).join(' ');

const ResTooltipFade = forwardRef((props, ref) => (
    <Fade
        {...props}
        ref={ref}
        timeout={180}
        transitionClasses={{ exiting: TOOLTIP_EXITING_CLASS }}
    />
));

ResTooltipFade.displayName = 'ResTooltipFade';

const ResTooltip = ({
    variant = 'default',
    position = 'top',
    text = '',
    className = '',
    children,
    trigger,
    innerContent,
    tooltipOverlayClass = '',
    show,
    customText,
    wrapperTag,
    isDefaultShow,
    container,
}) => {
    const ref = useRef();
    const preset = resolveTooltipPreset(variant, {
        trigger,
        innerContent,
        wrapperTag,
    });
    const WrapperTag = preset.wrapperTag;
    const mappedClassName = mapResTooltipClasses(className);
    const wrapperClassName = buildClassName(TOOLTIP_WRAPPER_CLASS, mappedClassName);

    const childContent =
        Children.count(children) > 1 ? (
            <span className={TOOLTIP_CHILD_WRAPPER_CLASS}>{children}</span>
        ) : (
            children
        );

    const containerEl = container?.current instanceof Element ? container.current : undefined;
    const isMdcControlled = variant === 'mdc' && typeof isDefaultShow === 'boolean';
    const resolvedInnerContent =
        innerContent === undefined ? preset.innerContent : innerContent;

    const overlayClassName = buildClassName(
        TOOLTIP_OVERLAY_CLASS,
        variant === 'mdc' ? TOOLTIP_MDC_OVERLAY_CLASS : '',
        mapResTooltipClasses(tooltipOverlayClass),
    );

    const renderOverlay = (overlayRenderProps) => {
        const {
            className: bootstrapClassName,
            hasDoneInitialMeasure,
            show: isOverlayShown,
            ...tooltipProps
        } = overlayRenderProps;
        const tooltipClassName = buildClassName(
            overlayClassName,
            bootstrapClassName,
            isOverlayShown && !hasDoneInitialMeasure ? TOOLTIP_UNMEASURED_CLASS : '',
        );

        return (
            <Tooltip
                {...tooltipProps}
                show={isOverlayShown}
                hasDoneInitialMeasure={hasDoneInitialMeasure}
                className={tooltipClassName || undefined}
            >
                {renderOverlayContent(customText, text)}
            </Tooltip>
        );
    };

    const overlayProps = {
        trigger: isMdcControlled ? null : preset.trigger,
        placement: position,
        flip: preset.flip,
        delay: preset.delay,
        overlay: renderOverlay,
        transition: ResTooltipFade,
        ...(containerEl ? { container: containerEl } : {}),
        ...(isMdcControlled ? { show: isDefaultShow, onToggle: () => {} } : {}),
        ...(!isMdcControlled && show !== undefined ? { show: show && true } : {}),
        ...(variant === 'container' && !containerEl
            ? { container: resolvedInnerContent ? ref : null }
            : {}),
        popperConfig: { modifiers: { preventOverflow: { boundariesElement: 'viewport' } } },
    };

    return (
        <OverlayTrigger {...overlayProps}>
            <WrapperTag className={wrapperClassName} ref={ref}>
                {childContent}
            </WrapperTag>
        </OverlayTrigger>
    );
};

ResTooltip.propTypes = {
    variant: PropTypes.oneOf(TOOLTIP_VARIANTS),
    position: PropTypes.string,
    text: PropTypes.oneOfType([PropTypes.string, PropTypes.object, PropTypes.number]),
    className: PropTypes.string,
    tooltipOverlayClass: PropTypes.string,
    innerContent: PropTypes.bool,
    trigger: PropTypes.oneOfType([PropTypes.string, PropTypes.arrayOf(PropTypes.string)]),
    show: PropTypes.bool,
    customText: PropTypes.string,
    wrapperTag: PropTypes.oneOfType([PropTypes.string, PropTypes.elementType]),
    isDefaultShow: PropTypes.bool,
    container: PropTypes.shape({ current: PropTypes.any }),
    children: PropTypes.node,
};

export default memo(ResTooltip);
