import { CLOSE, CREATED_ON, INFO } from 'Constants/GlobalConstant/Placeholders';
import { circle_close_mini, circle_info_mini } from 'Constants/GlobalConstant/Glyphicons';
import { memo, useCallback, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import { Col } from 'react-bootstrap';

import GalleryFactSkeleton from 'Components/Skeleton/Components/GalleryFactSkeleton';
import RSTooltip from 'Components/RSTooltip';
import TruncatedCell from 'Components/RSKendoGrid/TruncateCell';
import {
    buildTemplateCardCssVars,
    getTemplateCardColClassName,
    resolveShowStatusAccent,
} from './resTemplateCardUtils';

import './ResTemplateCard.scss';

const ResTemplateCardInfoPanel = ({
    topItems = [],
    metrics = [],
    isLoading = false,
    onClose = null,
}) => (
    <div className="rsgp-content">
        {onClose && (
            <div className="d-flex rsgpc-close-icon">
                <RSTooltip position="top" text={CLOSE} className="lh0"  innerContent ={false}>
                    <div
                        role="button"
                        tabIndex={0}
                        onClick={onClose}
                        onKeyDown={(event) => {
                            if (event.key === 'Enter' || event.key === ' ') {
                                event.preventDefault();
                                onClose();
                            }
                        }}
                    >
                        <i className={`${circle_close_mini} color-primary-blue icon-sm`} />
                    </div>
                </RSTooltip>
            </div>
        )}
        {topItems.length > 0 && (
            <ul className="rsgpc-top">
                {topItems.map((item, index) => (
                    <li key={`info-top-${index}`}>
                        <small className="top-label">{item.label}</small>
                        <div className="top-desc">{item.value}</div>
                    </li>
                ))}
            </ul>
        )}
        {isLoading ? (
            <GalleryFactSkeleton />
        ) : (
            metrics.length > 0 && (
                <ul className="rsgpc-bottom">
                    {metrics.map((item, index) => (
                        <li key={`info-metric-${index}`}>
                            <small className="bottom-label">{item.label}:</small>
                            <span className="bottom-desc">{item.value}</span>
                        </li>
                    ))}
                </ul>
            )
        )}
    </div>
);

ResTemplateCardInfoPanel.propTypes = {
    topItems: PropTypes.arrayOf(
        PropTypes.shape({
            label: PropTypes.node,
            value: PropTypes.node,
        }),
    ),
    metrics: PropTypes.arrayOf(
        PropTypes.shape({
            label: PropTypes.node,
            value: PropTypes.node,
        }),
    ),
    isLoading: PropTypes.bool,
    onClose: PropTypes.func,
};

/**
 * ResTemplateCard — card shell only (header, body div, footer, info popup).
 *
 * Pass `bodyContent` with whatever markup you need (img, iframe, div, etc.).
 * No preview parsing here — that belongs in page/demo code (e.g. KendoDocs preview).
 */
const ResTemplateCard = ({
    col = 3,
    wrapCol = true,
    variant = 'gallery',
    className = '',
    statusClass = '',
    from = '',
    cardHeight = null,
    cardMinHeight = 0,
    cardPadding,
    createdDate = null,
    headerMeta = null,
    moreIcon = null,
    title = null,
    titleNode = null,
    showHeader = true,
    bodyContent = null,
    wrapBody = true,
    bodyClassName = '',
    showOverlay = false,
    overlay = null,
    actionButtons = null,
    cardOverlay = null,
    footer = null,
    info = null,
    infoPanel = null,
    infoTrigger = null,
    isInfoOpen,
    onInfoOpen = null,
    onInfoClose = null,
    hideInfoTrigger = false,
    showStatusAccent,
    hideBottomAccent,
    noBoxShadow = false,
    style = null,
}) => {
    const isCommunicationVariant = variant === 'communication';
    const hasInfo = infoPanel != null || info != null;
    const isInfoControlled = isInfoOpen !== undefined;
    const [internalInfoOpen, setInternalInfoOpen] = useState(false);
    const resolvedInfoOpen = isInfoControlled ? isInfoOpen : internalInfoOpen;

    const handleInfoOpen = useCallback(() => {
        if (!isInfoControlled) {
            setInternalInfoOpen(true);
        }
        onInfoOpen?.();
    }, [isInfoControlled, onInfoOpen]);

    const handleInfoClose = useCallback(() => {
        if (!isInfoControlled) {
            setInternalInfoOpen(false);
        }
        onInfoClose?.();
    }, [isInfoControlled, onInfoClose]);

    const resolvedShowStatusAccent = resolveShowStatusAccent({
        showStatusAccent,
        hideBottomAccent,
        variant,
    });

    const resolvedHeaderMeta = useMemo(() => {
        if (headerMeta) return headerMeta;
        if (!createdDate) return null;

        return (
            <>
                <span className="rctcb-by-text">{CREATED_ON} : </span>
                <span className="rct-date">{createdDate}</span>
            </>
        );
    }, [headerMeta, createdDate]);

    const rootClassName = useMemo(
        () =>
            [
                'res-template-card',
                'gallery-list',
                getTemplateCardColClassName(col),
                `res-template-card--${variant}`,
                isCommunicationVariant ? 'email-template-grid no-box-shadow ai-gallery-gird' : '',
                isCommunicationVariant && from ? from : '',
                !resolvedShowStatusAccent ? 'res-template-card--no-status-accent no-box-shadow' : '',
                noBoxShadow ? 'no-box-shadow res-template-card--no-box-shadow' : '',
                resolvedInfoOpen ? 'res-template-card--info-open galleryCarouselActive' : '',
                statusClass,
                className,
                'mb15'
            ]
                .filter(Boolean)
                .join(' '),
        [
            col,
            variant,
            isCommunicationVariant,
            from,
            resolvedShowStatusAccent,
            noBoxShadow,
            statusClass,
            resolvedInfoOpen,
            className,
        ],
    );

    const cardInlineStyle = useMemo(() => {
        const cssVars = buildTemplateCardCssVars({
            variant,
            col,
            cardHeight,
            cardPadding,
            cardMinHeight,
            showStatusAccent: resolvedShowStatusAccent,
        });

        return { ...cssVars, ...style };
    }, [
        variant,
        col,
        cardHeight,
        cardPadding,
        cardMinHeight,
        resolvedShowStatusAccent,
        style,
    ]);

    const cardContent = (
        <div className={rootClassName} style={cardInlineStyle}>
            {cardOverlay}
            {showHeader && (
                <div className="res-template-card__header gl-top">
                    {(resolvedHeaderMeta || moreIcon) && (
                        <div className="res-template-card__header-row">
                            {resolvedHeaderMeta && (
                                <div className="res-template-card__header-meta">{resolvedHeaderMeta}</div>
                            )}
                            {moreIcon && (
                                <div className="res-template-card__header-actions">{moreIcon}</div>
                            )}
                        </div>
                    )}
                    {(titleNode || title) && (
                        <div className="res-template-card__title rsg-campaign-name text-left">
                            {titleNode ||
                                (title ? (
                                    <TruncatedCell
                                        noTable
                                        value={title}
                                        truncateClassName="res-template-card__title-text"
                                    />
                                ) : null)}
                        </div>
                    )}
                </div>
            )}
            {wrapBody && (bodyContent || showOverlay) ? (
                <div
                    className={['res-template-card__body', 'gl-body', bodyClassName]
                        .filter(Boolean)
                        .join(' ')}
                >
                    {bodyContent}
                    {showOverlay && (
                        <div className="res-template-card__interaction">
                            {overlay || <div className="res-template-card__overlay overlay" />}
                            {actionButtons && (
                                <div className="res-template-card__actions template-buttons-section">
                                    {actionButtons}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            ) : (
                bodyContent
            )}
            {footer && <div className="res-template-card__footer gl-bottom">{footer}</div>}
            {hasInfo && !hideInfoTrigger && !resolvedInfoOpen && (
                <div
                    className="res-template-card__footer res-template-card__info-trigger gl-bottom"
                    onClick={handleInfoOpen}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(event) => {
                        if (event.key === 'Enter' || event.key === ' ') {
                            event.preventDefault();
                            handleInfoOpen();
                        }
                    }}
                >
                    {infoTrigger || (
                        <RSTooltip position="top" text={INFO} className="lh0" innerContent ={false}>
                            <i className={`${circle_info_mini} icon-xs primary-color`} />
                        </RSTooltip>
                    )}
                </div>
            )}
            {hasInfo && resolvedInfoOpen && (
                <div className="rs-gallery-popup res-template-card__info-panel">
                    {infoPanel || (
                        <ResTemplateCardInfoPanel
                            topItems={info?.topItems}
                            metrics={info?.metrics}
                            isLoading={info?.isLoading}
                            onClose={handleInfoClose}
                        />
                    )}
                </div>
            )}
        </div>
    );

    if (!wrapCol) return cardContent;

    return <Col sm={col}>{cardContent}</Col>;
};

ResTemplateCard.propTypes = {
    col: PropTypes.number,
    wrapCol: PropTypes.bool,
    variant: PropTypes.oneOf(['gallery', 'communication']),
    className: PropTypes.string,
    statusClass: PropTypes.string,
    from: PropTypes.string,
    cardHeight: PropTypes.number,
    cardMinHeight: PropTypes.number,
    cardPadding: PropTypes.number,
    showStatusAccent: PropTypes.bool,
    hideBottomAccent: PropTypes.bool,
    noBoxShadow: PropTypes.bool,
    createdDate: PropTypes.node,
    headerMeta: PropTypes.node,
    /** Three-dot menu — pass full custom node (dropdown + icon div). */
    moreIcon: PropTypes.node,
    title: PropTypes.string,
    titleNode: PropTypes.node,
    showHeader: PropTypes.bool,
    bodyContent: PropTypes.node,
    wrapBody: PropTypes.bool,
    bodyClassName: PropTypes.string,
    showOverlay: PropTypes.bool,
    overlay: PropTypes.node,
    actionButtons: PropTypes.node,
    cardOverlay: PropTypes.node,
    footer: PropTypes.node,
    info: PropTypes.shape({
        topItems: PropTypes.arrayOf(
            PropTypes.shape({
                label: PropTypes.node,
                value: PropTypes.node,
            }),
        ),
        metrics: PropTypes.arrayOf(
            PropTypes.shape({
                label: PropTypes.node,
                value: PropTypes.node,
            }),
        ),
        isLoading: PropTypes.bool,
    }),
    infoPanel: PropTypes.node,
    infoTrigger: PropTypes.node,
    isInfoOpen: PropTypes.bool,
    onInfoOpen: PropTypes.func,
    onInfoClose: PropTypes.func,
    hideInfoTrigger: PropTypes.bool,
    style: PropTypes.object,
};

export default memo(ResTemplateCard);
