import { ADD, ARE_YOU_SURE_REMOVE, ARE_YOU_SURE_RESET, ARE_YOU_SURE_WANT_TO_RESET, CONFIRMATION, DO_YOU_WISH_TO_CONTINUE_NEW, EDIT, REMOVE, RESET, SWITCHING_TABS_WILL_DESCARD_NEW } from 'Constants/GlobalConstant/Placeholders';
import { arrow_left_mini, arrow_right_mini, pencil_edit_medium, restart_medium } from 'Constants/GlobalConstant/Glyphicons';
import { Fragment, memo, useEffect, useRef, useState } from 'react';
import _isNil from 'lodash/isNil';
import { useSelector } from 'react-redux';
import { Row, Col } from 'react-bootstrap';

import RSTooltip from 'Components/RSTooltip';
import RSConfirmationModal from 'Components/ConfirmationModal';
import { ConditionalWrapper, Wrapper } from 'Components/RSTabber/Component/RSTab/constant.jsx';
import TabLabelEditor from 'Components/RSTabSlide/TabLabelEditor';
import TruncatedCell from 'Components/RSKendoGrid/TruncateCell.jsx'
import { mapResTabberClasses } from '../utils';
import { SMART_SLIDE_DEFAULT_TAB_MAX } from '../config';
import { selectCreateCommunicationState } from 'Reducers/communication/createCommunication/Create/selectors';

const getSmartSlideScrollItemCount = (tabs = []) =>
    tabs.reduce((sum, item) => sum + 1 + (item?.add ? 1 : 0), 0);

const SmartSlideVariant = ({
    activeClass = '',
    arrow = false,
    subText = false,
    or = false,
    tabData = [],
    defaultTab = tabData && tabData?.length > 0 ? tabData?.length - 1 : null,
    callBack = () => {},
    defaultClass = '',
    animate = false,
    refresh = false,
    isRefreshConfirmation = false,
    onRefresh = () => {},
    onRemoveMenu = () => {},
    disableOtherTabs = false,
    onAddMenu = () => {},
    isRemoveConfirmation = false,
    isTabChangeConfirmation = false,
    clear = false,
    onClear = () => {},
    customTooltipName = 'Add',
    customIconsize = 'md',
    disable = false,
    singleTab = false,
    isMandatory = false,
    isFormRefresh = false,
    tabMaxLength = 0,
    dynamicTab = '',
    componentClassName = '',
    componentClassname = '',
    isModalOpen = false,
    customColumn = null,
    customClassName = '',
    enableTabLabelEdit = false,
    onTabLabelSave = null,
    onTabLabelChange = null,
    onTabLabelCancel = null,
    tabLabelMaxLength = 0,
    tabLabelValidator = null,
    tabLabelEmptyErrorMessage,
    tabLabelPlaceholder,
    tabLabelsExternallyControlled = false,
    tabSubTextFirst = false,
}) => {
    const [confirmationModal, setConfirmationModal] = useState(false);
    const [isRefresh, setIsRefresh] = useState(false);
    const [isTabChangeConfirm, setTabChangeConfirm] = useState({ show: false, index: null });
    const [hasPrev, setHasPrev] = useState(false);
    const [hasNext, setHasNext] = useState(false);
    const [labelEdit, setLabelEdit] = useState({ index: null, value: '', original: '' });

    const tabsContainerRef = useRef(null);
    const { enableTab } = useSelector(selectCreateCommunicationState);

    const SCROLL_AMOUNT = 200;

    const handleTabChange = (index) => {
        setLabelEdit({ index: null, value: '', original: '' });
        if (index !== defaultTab) {
            if (isTabChangeConfirmation) {
                setTabChangeConfirm({ show: true, index });
            } else {
                callBack(tabData[index], index);
            }
        }
    };

    const startLabelEdit = (index, e) => {
        e?.stopPropagation?.();
        const text = tabData[index]?.text ?? '';
        const s = String(text);
        setLabelEdit({ index, value: s, original: s });
    };

    const handleLabelCommit = (index, trimmedText) => {
        if (typeof onTabLabelSave !== 'function') {
            setLabelEdit({ index: null, value: '', original: '' });
            return;
        }
        const prevText = tabData[index]?.text ?? '';
        if (trimmedText !== prevText) {
            onTabLabelSave(index, trimmedText, tabData[index]);
        }
        setLabelEdit({ index: null, value: '', original: '' });
    };

    const cancelLabelEdit = () => {
        if (labelEdit.index !== null && typeof onTabLabelCancel === 'function') {
            onTabLabelCancel(labelEdit.index, labelEdit.original, tabData[labelEdit.index]);
        }
        setLabelEdit({ index: null, value: '', original: '' });
    };

    const updateScrollState = () => {
        const container = tabsContainerRef.current;
        if (!container) return;
        setHasPrev(container.scrollLeft > 0);
        setHasNext(container.scrollLeft + container.clientWidth < container.scrollWidth - 1);
    };

    const handleScrollLeft = () => {
        tabsContainerRef.current?.scrollBy({ left: -SCROLL_AMOUNT, behavior: 'smooth' });
    };

    const handleScrollRight = () => {
        tabsContainerRef.current?.scrollBy({ left: SCROLL_AMOUNT, behavior: 'smooth' });
    };

    useEffect(() => {
        const container = tabsContainerRef.current;
        if (container) {
            // Scroll to the active tab
            if (defaultTab !== null && defaultTab < tabData.length) {
                // Calculate the correct tab index considering add buttons
                let tabIndex = 0;
                for (let i = 0; i < defaultTab; i++) {
                    tabIndex++; // Main tab
                    if (tabData[i]?.add) {
                        tabIndex++; // Add button if present
                    }
                }

                const activeTabElement = container.querySelector(`li:nth-child(${tabIndex + 1})`);
                if (activeTabElement) {
                    activeTabElement.scrollIntoView({
                        behavior: 'smooth',
                        block: 'nearest',
                        inline: 'center',
                    });
                }
            }
            updateScrollState();
        }
    }, [tabData.length, defaultTab]);

    useEffect(() => {
        const container = tabsContainerRef.current;
        if (!container) return;

        const handleScroll = () => updateScrollState();
        const handleWheel = (e) => {
            if (e.deltaY !== 0) {
                container.scrollBy({ left: e.deltaY, behavior: 'smooth' });
                e.preventDefault();
            }
        };

        container.addEventListener('scroll', handleScroll);
        container.addEventListener('wheel', handleWheel, { passive: false });
        window.addEventListener('resize', updateScrollState);

        updateScrollState();

        return () => {
            container.removeEventListener('scroll', handleScroll);
            container.removeEventListener('wheel', handleWheel);
            window.removeEventListener('resize', updateScrollState);
        };
    }, [tabData.length]);

    const resolvedTabMaxLength = tabMaxLength > 0 ? tabMaxLength : SMART_SLIDE_DEFAULT_TAB_MAX;
    const scrollItemCount = getSmartSlideScrollItemCount(tabData);
    const shouldShowScrollControls = scrollItemCount > resolvedTabMaxLength;

    return (
        <div className={`smartLinkModal-CSS ${customClassName}`}>
            <div className={mapResTabberClasses(`rs-scroll-tabbar position-relative ${dynamicTab}`)}>
                <Row className="align-items-center">
                    <Col sm={customColumn ? customColumn : shouldShowScrollControls || refresh || clear ? 11 : 12}>
                        <div
                            ref={tabsContainerRef}
                            className={mapResTabberClasses('rs-scroll-container')}
                        >
                            <ul
                                className={mapResTabberClasses(
                                    `rs-scrollTabList-container ${or ? 'or-tab' : ''} ${animate ? 'animate-tab' : ''}`,
                                )}
                            >
                                {tabData.map((item, index) => {
                                    const isDisabled =
                                        disableOtherTabs && !item.disable
                                            ? defaultTab !== null && defaultTab !== index
                                            : item.disable;

                                    const wrapperClass = mapResTabberClasses(
                                        `tabDefault ${defaultTab === index && !singleTab ? activeClass : ''} ${
                                            item.activeTip ? 'active-arrow' : ''
                                        } ${isDisabled ? 'pe-none click-off' : ''} ${
                                            disable || item.noPoniter ? 'pointer-event-none' : ''
                                        } ${defaultClass}`,
                                    );

                                    return (
                                        <Fragment key={item?.id ?? index}>
                                            <li
                                                className={wrapperClass}
                                                onClick={() => !isDisabled && !disable && handleTabChange(index)}
                                                role="tab"
                                                tabIndex={isDisabled || disable ? -1 : 0}
                                            >
                                                <ConditionalWrapper
                                                    condition={!!item?.tooltiptext}
                                                    wrapper={(children) => (
                                                        <RSTooltip
                                                            text={item.tooltiptext}
                                                            position={item.tooltipPosition || 'top'}
                                                            innerContent={false}
                                                        >
                                                            {Wrapper(children)}
                                                        </RSTooltip>
                                                    )}
                                                    noWrapper={(children) => Wrapper(children)}
                                                >
                                                    {item?.image && <img src={item.image} alt="tab-img" />}
                                                    {item?.icon && <i className={item.icon}></i>}
                                                    {item?.iconLeft && <i className={item.iconLeft}></i>}
                                                    {tabLabelsExternallyControlled && subText && tabSubTextFirst && item?.text2 ? (
                                                        (() => {
                                                            const smartLinkNameTrimmed = String(item?.text ?? '').trim();
                                                            const sub = String(item?.text2 ?? '').trim();
                                                            const smartLinkHasCustomName =
                                                                Boolean(smartLinkNameTrimmed) &&
                                                                smartLinkNameTrimmed.toLowerCase() !== sub.toLowerCase();
                                                            return (
                                                                <div
                                                                    className={mapResTabberClasses(
                                                                        `tab-smartlink-label-stack${
                                                                            smartLinkHasCustomName
                                                                                ? ' tab-smartlink-label-stack--named'
                                                                                : ''
                                                                        }`,
                                                                    )}
                                                                >
                                                                    <span
                                                                        className={mapResTabberClasses(
                                                                            'tab-subtext tab-subtext-first',
                                                                        )}
                                                                        aria-hidden={!smartLinkHasCustomName}
                                                                    >
                                                                        {item.text2}
                                                                    </span>
                                                                    <span
                                                                        className={mapResTabberClasses(
                                                                            `${item.textClass || ''} tab-label`.trim(),
                                                                        )}
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            if (!isDisabled && !disable) handleTabChange(index);
                                                                        }}
                                                                    >

                                                                        <TruncatedCell value = {smartLinkNameTrimmed || item.text2} noTable= {true}/>
                                                                    </span>
                                                                </div>
                                                            );
                                                        })()
                                                    ) : (
                                                        <Fragment>
                                                            {subText && tabSubTextFirst && item?.text2 && (
                                                                <span className={mapResTabberClasses('tab-subtext tab-subtext-first')}>
                                                                    {item.text2}
                                                                </span>
                                                            )}
                                                            {item?.text &&
                                                                (enableTabLabelEdit && labelEdit.index === index ? (
                                                                    <TabLabelEditor
                                                                        value={labelEdit.value}
                                                                        onCommit={(trimmed) =>
                                                                            handleLabelCommit(index, trimmed)
                                                                        }
                                                                        onCancel={cancelLabelEdit}
                                                                        maxLength={tabLabelMaxLength}
                                                                        textClass={item.textClass}
                                                                        placeholderText={tabLabelPlaceholder}
                                                                        onValueChange={(nextVal) => {
                                                                            setLabelEdit((prev) =>
                                                                                prev.index === index
                                                                                    ? { ...prev, value: nextVal }
                                                                                    : prev,
                                                                            );
                                                                            if (typeof onTabLabelChange === 'function') {
                                                                                onTabLabelChange(index, nextVal, item);
                                                                            }
                                                                        }}
                                                                        validator={
                                                                            typeof tabLabelValidator === 'function'
                                                                                ? (t) =>
                                                                                      tabLabelValidator(t, index, item)
                                                                                : undefined
                                                                        }
                                                                        emptyErrorMessage={tabLabelEmptyErrorMessage}
                                                                    />
                                                                ) : (
                                                                    <span
                                                                        className={mapResTabberClasses(
                                                                            `${item.textClass || ''} tab-label`.trim(),
                                                                        )}
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            if (!isDisabled && !disable) handleTabChange(index);
                                                                        }}
                                                                    >
                                                                        {item.text}
                                                                    </span>
                                                                ))}
                                                        </Fragment>
                                                    )}
                                                    {enableTabLabelEdit &&
                                                        item?.text &&
                                                        labelEdit.index !== index &&
                                                        defaultTab === index && (
                                                            <RSTooltip
                                                                text={EDIT}
                                                                position="top"
                                                                className={mapResTabberClasses('tab-remove lh0')}
                                                                tooltipOverlayClass="rs-tag-remove-tooltip"
                                                                innerContent={false}
                                                            >
                                                                <div className={mapResTabberClasses('tab-edit-icon')}>
                                                                    <i
                                                                        className={`${pencil_edit_medium} icon-md color-primary-blue`}
                                                                        onClick={(e) => startLabelEdit(index, e)}
                                                                    />
                                                                </div>
                                                            </RSTooltip>
                                                        )}
                                                    {item?.isMandatory && <span className="color-primary-red">*</span>}
                                                    {arrow && <div className={mapResTabberClasses('arrowBar')}></div>}
                                                    {subText && !tabSubTextFirst && <h3>{item.text2}</h3>}
                                                    {or && <span className={mapResTabberClasses('or-divider user-select-none')}></span>}
                                                    
                                                    {item?.remove && (
                                                        <RSTooltip
                                                            text={REMOVE}
                                                            position="top"
                                                            className={mapResTabberClasses('tab-remove lh0')}
                                                            tooltipOverlayClass="rs-tag-remove-tooltip"
                                                            innerContent={false}
                                                        >
                                                            <div className={item?.isRemove ? 'pe-none click-off' : ''}>
                                                                <i
                                                                    className={`${item?.remove} icon-${customIconsize} color-primary-red`}
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        if (isRemoveConfirmation) {
                                                                            setConfirmationModal(true);
                                                                        } else {
                                                                            onRemoveMenu(index, item);
                                                                        }
                                                                    }}
                                                                    role="button"
                                                                    tabIndex={0}
                                                                    aria-label="Remove Tab"
                                                                />
                                                            </div>
                                                        </RSTooltip>
                                                    )}
                                                </ConditionalWrapper>
                                            </li>
                                            {item.add && (
                                                <li className={mapResTabberClasses('tabDefault tab-add')}>
                                                    <RSTooltip
                                                        text={customTooltipName ?? ADD}
                                                        position="top"
                                                        className="lh0"
                                                        tooltipOverlayClass="rs-tag-remove-tooltip"
                                                        innerContent={false}
                                                    >
                                                        <div className={item?.isAdd ? 'pe-none click-off' : ''}>
                                                            <i
                                                                className={`${item.add} icon-${customIconsize} color-primary-blue`}
                                                                onClick={() => onAddMenu(index + 1)}
                                                                role={item?.isAdd ? 'presentation' : 'button'}
                                                                tabIndex={item?.isAdd ? -1 : 0}
                                                            />
                                                        </div>
                                                    </RSTooltip>
                                                </li>
                                            )}
                                        </Fragment>
                                    );
                                })}
                            </ul>
                        </div>
                    </Col>

                    {(shouldShowScrollControls || refresh || clear) && (
                        <Col sm={1} className="px10">
                            {shouldShowScrollControls && (
                                <div className={mapResTabberClasses('rs-tab-source-controls scroll-controls')}>
                                    <div
                                        className={`scroll-left ${!hasPrev ? 'pe-none click-off' : ''}`}
                                        onClick={hasPrev ? handleScrollLeft : undefined}
                                        role="button"
                                        tabIndex={hasPrev ? 0 : -1}
                                        aria-disabled={!hasPrev}
                                        aria-label="Scroll tabs left"
                                    >
                                        <i className={`${arrow_left_mini} icon-sm`} />
                                    </div>
                                    <div
                                        className={`scroll-right ${!hasNext ? 'pe-none click-off' : ''}`}
                                        onClick={hasNext ? handleScrollRight : undefined}
                                        role="button"
                                        tabIndex={hasNext ? 0 : -1}
                                        aria-disabled={!hasNext}
                                        aria-label="Scroll tabs right"
                                    >
                                        <i className={`${arrow_right_mini} icon-sm`} />
                                    </div>
                                </div>
                            )}

                            {(refresh || clear) && (
                                <div className="action-controls">
                                {refresh && (
                                    <RSTooltip
                                        text={RESET}
                                        position="top"
                                        className="lh0"
                                        innerContent={false}
                                    >
                                        <i
                                            id="rs_data_refresh"
                                            className={`${restart_medium} icon-md color-primary-blue cp ${
                                                _isNil(defaultTab) ? 'click-off' : ''
                                            }`}
                                            innerContent={false}
                                            onClick={() => {
                                                if (_isNil(defaultTab)) return;
                                                if (isRefreshConfirmation) {
                                                    setIsRefresh(true);
                                                } else {
                                                    onRefresh(defaultTab);
                                                    callBack(null, null);
                                                }
                                            }}
                                            role={_isNil(defaultTab) ? 'presentation' : 'button'}
                                            tabIndex={_isNil(defaultTab) ? -1 : 0}
                                        />
                                    </RSTooltip>
                                )}
                                {clear && (
                                    <RSTooltip
                                        text={RESET}
                                        position="top"
                                        className="lh0"
                                        innerContent={false}
                                    >
                                        <i
                                            id="rs_data_clear"
                                            innerContent={false}
                                            className={`${restart_medium} icon-md color-primary-blue cp ${
                                                _isNil(defaultTab) || enableTab?.refreshStatus ? 'click-off' : ''
                                            }`}
                                            onClick={() => {
                                                if (_isNil(defaultTab) || enableTab?.refreshStatus) return;
                                                onClear(defaultTab);
                                            }}
                                            role={
                                                _isNil(defaultTab) || enableTab?.refreshStatus
                                                    ? 'presentation'
                                                    : 'button'
                                            }
                                            tabIndex={_isNil(defaultTab) || enableTab?.refreshStatus ? -1 : 0}
                                        />
                                    </RSTooltip>
                                )}
                            </div>
                            )}
                        </Col>
                    )}
                </Row>

                {/* Remove / Refresh Confirmation Modal */}
                <RSConfirmationModal
                    show={confirmationModal || isRefresh}
                    isBorder
                    header={CONFIRMATION}
                    text={
                        isRefresh
                            ? isFormRefresh
                                ? ARE_YOU_SURE_RESET
                                : ARE_YOU_SURE_WANT_TO_RESET
                            : ARE_YOU_SURE_REMOVE
                    }
                    handleClose={() => {
                        if (isRefresh) {
                            setIsRefresh(false);
                        } else {
                            setConfirmationModal(false);
                        }
                    }}
                    handleConfirm={() => {
                        if (isRefresh) {
                            setIsRefresh(false);
                            onRefresh(defaultTab);
                            callBack(null, null);
                        } else {
                            setConfirmationModal(false);
                            onRemoveMenu();
                        }
                    }}
                />

                {/* Tab Change Confirmation Modal */}
                <RSConfirmationModal
                    show={isTabChangeConfirm.show}
                    isBorder
                    header={CONFIRMATION}
                    htmlContent={
                        <>
                            <p className="text-center lh-sm">{SWITCHING_TABS_WILL_DESCARD_NEW}</p>
                            {/* <p className="text-center mt5">{DO_YOU_WISH_TO_CONTINUE_NEW}</p> */}
                        </>
                    }
                    handleClose={() =>
                        setTabChangeConfirm({
                            show: false,
                            index: null,
                        })
                    }
                    handleConfirm={() => {
                        setLabelEdit({ index: null, value: '' });
                        callBack(tabData[isTabChangeConfirm.index], isTabChangeConfirm.index);
                        setTabChangeConfirm({
                            show: false,
                            index: null,
                        });
                    }}
                />
            </div>

            <div className={componentClassName || componentClassname}>
                {tabData[defaultTab] &&
                    typeof tabData[defaultTab].component === 'function' &&
                    tabData[defaultTab].component()}
            </div>
        </div>
    );
};

export default memo(SmartSlideVariant);
