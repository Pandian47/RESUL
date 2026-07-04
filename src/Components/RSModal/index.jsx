import { popup_close_circle_fill_medium, popup_close_circle_medium } from 'Constants/GlobalConstant/Glyphicons';
import { memo, useCallback, useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { Modal } from 'react-bootstrap';

import RSIcon from 'Components/RSIcon';
import RSTooltip from 'Components/RSTooltip';
import useBodyPointerLock, { lockBodyScroll, unlockBodyScroll } from 'Hooks/useBodyPointerLock';
import { useSelector } from 'react-redux';

/** Matches `.modal-body.css-scrollbar { max-height: calc(100vh - 220px) }` in _rsModal.scss */
const MODAL_BODY_SCROLL_MAX_HEIGHT_OFFSET_PX = 220;

const RSModal = ({
    settings = {},
    isCloseButton = true,
    header = true,
    body = <></>,
    footer = false,
    handleClose = () => {},
    show = false,
    size = 'lg',
    isBorder = true,
    className = '',
    closeClassName = '',
    headerRightContent = false,
    headerTitleClass = false,
    headerTitleTooltip = false,
    bodyClassName = '',
    footerClassName = '',
    isCloseDisabled = false,
    lockBackground = false,
    isCustomScroll = true,
    isMarginTop = true,
    fullscreen = false,
    closeTooltipPosition = true,
    downloadModal = false,
    noBottomBorder = false,
    isHeaderTitle = true,
    isFailuremodal = false,
    headerClassName='',
    customContentClassName=''
}) => {
    const [isVisible, setIsVisible] = useState(false);
    const [shouldRender, setShouldRender] = useState(false);
    const [contentHeight, setContentHeight] = useState(null);
    const [hasBodyOverflow, setHasBodyOverflow] = useState(false);
    const innerRef = useRef(null);
    const bodyRef = useRef(null);
    const didLockScrollRef = useRef(false);
    const showRef = useRef(show);
    const [enableHeightTransition, setEnableHeightTransition] = useState(false);
    const { failureApiErrors } = useSelector(({ globalstate }) => globalstate);

    const syncBodyScrollbar = useCallback(() => {
        if (!isCustomScroll) {
            setHasBodyOverflow(false);
            return;
        }

        const bodyEl = bodyRef.current;
        if (!bodyEl) return;

        const maxBodyHeight = Math.max(0, window.innerHeight - MODAL_BODY_SCROLL_MAX_HEIGHT_OFFSET_PX);
        setHasBodyOverflow(bodyEl.scrollHeight > maxBodyHeight + 1);
    }, [isCustomScroll]);

    useEffect(() => {
        if (!show) {
            setContentHeight(null);
            setEnableHeightTransition(false);
            setHasBodyOverflow(false);
        }
    }, [show]);

    useEffect(() => {
        if (!innerRef.current || !isVisible) return;

        const observer = new ResizeObserver(() => {
            const height = innerRef.current?.offsetHeight;
            if (height != null && height > 0) {
                setContentHeight(height);
                requestAnimationFrame(() => setEnableHeightTransition(true));
            }
            requestAnimationFrame(syncBodyScrollbar);
        });

        observer.observe(innerRef.current);
        if (bodyRef.current) {
            observer.observe(bodyRef.current);
        }

        window.addEventListener('resize', syncBodyScrollbar);
        requestAnimationFrame(syncBodyScrollbar);

        return () => {
            observer.disconnect();
            window.removeEventListener('resize', syncBodyScrollbar);
        };
    }, [isVisible, syncBodyScrollbar, body]);

    useBodyPointerLock(isVisible && lockBackground);

    useEffect(() => {
        showRef.current = show;
    }, [show]);

    useEffect(() => {
        if (show) {
            setShouldRender(true);
        }
    }, [show]);

    useEffect(() => {
        if (!shouldRender) return undefined;

        if (show) {
            const frameId = requestAnimationFrame(() => {
                requestAnimationFrame(() => setIsVisible(true));
            });
            return () => cancelAnimationFrame(frameId);
        }

        setIsVisible(false);
        return undefined;
    }, [show, shouldRender]);

    useEffect(() => () => {
        if (didLockScrollRef.current) {
            unlockBodyScroll();
            didLockScrollRef.current = false;
        }
    }, []);

    const isCloseLocked = isCloseDisabled || lockBackground;
    const mergedCloseClassName = [
        closeClassName,
        isCloseLocked ? 'rs-modal-close--disabled' : '',
    ]
        .filter(Boolean)
        .join(' ')
        .trim();

    const handleModalClose = () => {
        if (isCloseLocked) return;
        handleClose(false);
    };

    const {
        onEntering: settingsOnEntering,
        onExited: settingsOnExited,
        ...restSettings
    } = settings;

    const handleModalEntering = (...args) => {
        if (!didLockScrollRef.current) {
            lockBodyScroll();
            didLockScrollRef.current = true;
        }
        settingsOnEntering?.(...args);
    };

    const handleModalExited = (...args) => {
        if (!showRef.current) {
            if (didLockScrollRef.current) {
                unlockBodyScroll();
                didLockScrollRef.current = false;
            }
            setShouldRender(false);
        }
        settingsOnExited?.(...args);
    };

    if (!shouldRender) return null;

    return (
        <Modal
            show={isVisible}
            centered
            backdrop="static"
            size={size}
            onHide={handleModalClose}
            className={`rs-modal ${isCloseLocked ? 'rs-modal--locked' : ''} ${className} ${isFailuremodal && failureApiErrors?.length ? 'visually-hidden' : ''}`}
            dialogClassName="rsm-dialog"
            contentClassName={`rsmd-content p0 ${customContentClassName}`}
            fullscreen={fullscreen}
            {...restSettings}
            scrollable
            onEntering={handleModalEntering}
            onExited={handleModalExited}
        >
            <div
                style={{
                    height: contentHeight !== null ? `${contentHeight}px` : 'auto',
                    transition: enableHeightTransition
                        ? 'height 0.45s cubic-bezier(0.25, 0.8, 0.25, 1)'
                        : 'none',
                    overflow: 'hidden',
                }}
            >
                <div ref={innerRef} className={`${downloadModal ? 'click-off' : ''}`}>
                    {header && (
                       <Modal.Header 
                            className={`rsmdc-header ${headerTitleClass} ${noBottomBorder ? 'border-0 pb0 border-bottom-0' : ''} ${
                                headerRightContent && isMarginTop ? 'mt0' : ''
                            } ${isBorder ? 'border-bottom' : 'border-0'} `}
                        >
                            {isHeaderTitle &&
                                (headerTitleTooltip ? (
                                    <RSTooltip position="top" text={header}>
                                        <h2 className={`${headerClassName} modal-title`}>{header}</h2>
                                    </RSTooltip>
                                ) : (
                                    <h2 className={`modal-title ${headerClassName}`}>{header}</h2>
                                ))}
                            {headerRightContent && <div className="modal-header-right-content">{headerRightContent}</div>}
                            {isCloseButton && (
                                <div
                                    onMouseDown={isCloseLocked ? undefined : handleModalClose}
                                    className={mergedCloseClassName}
                                    aria-disabled={isCloseLocked}
                                >
                                    <RSIcon
                                        className="icon-md color-primary-blue"
                                        closeTooltipPosition={closeTooltipPosition ? 'left' : 'top'}
                                        defaultItem={popup_close_circle_medium}
                                        hoverItem={popup_close_circle_fill_medium}
                                    />
                                </div>
                            )}
                        </Modal.Header>
                    )}
                    {body && (
                        <Modal.Body
                            ref={bodyRef}
                            className={`rsmdc-body ${bodyClassName} ${
                                isCustomScroll && hasBodyOverflow ? 'css-scrollbar' : ''
                            } modal-min-height`}
                        >
                            {body}
                        </Modal.Body>
                    )}
                    {footer && <Modal.Footer className={`rsmdc-footer ${footerClassName}`}>{footer}</Modal.Footer>}
                </div>
            </div>
        </Modal>
    );
};

RSModal.propTypes = {
    settings: PropTypes.object,
    handleClose: PropTypes.func,
    show: PropTypes.bool,
    header: PropTypes.oneOfType([PropTypes.bool, PropTypes.object, PropTypes.string]),
    headerRightContent: PropTypes.oneOfType([PropTypes.bool, PropTypes.object, PropTypes.string]),
    body: PropTypes.oneOfType([PropTypes.bool, PropTypes.object, PropTypes.string, PropTypes.array]),
    footer: PropTypes.oneOfType([PropTypes.bool, PropTypes.object]),
    size: PropTypes.string,
    isBorder: PropTypes.bool,
    isCloseButton: PropTypes.bool,
    className: PropTypes.string,
    closeClassName: PropTypes.string,
    isCloseDisabled: PropTypes.bool,
    lockBackground: PropTypes.bool,
    isCustomScroll: PropTypes.bool,
    isMarginTop: PropTypes.bool,
    fullscreen: PropTypes.bool,
    noBottomBorder: PropTypes.bool,
    customContentClassName: PropTypes.string,
};

export default memo(RSModal);
