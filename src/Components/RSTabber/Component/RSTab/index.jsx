import { ADD, ARE_YOU_SURE_REMOVE, ARE_YOU_SURE_RESET, ARE_YOU_SURE_WANT_TO_RESET, CONFIRMATION, DO_YOU_WISH_TO_CONTINUE_NEW, REMOVE, RESET, SWITCHING_TABS_WILL_DESCARD_NEW } from 'Constants/GlobalConstant/Placeholders';
import { restart_medium } from 'Constants/GlobalConstant/Glyphicons';
import { Fragment, useState } from 'react';
import _isNil from 'lodash/isNil';

import RSTooltip from 'Components/RSTooltip';
import RSConfirmationModal from 'Components/ConfirmationModal';

import { ConditionalWrapper, Wrapper } from './constant';
import { mapResTabberClasses } from 'Pages/KendoDocs/CommonComponents/ResTabber/utils';
import { useSelector } from 'react-redux';
import { selectCreateCommunicationState } from 'Reducers/communication/createCommunication/Create/selectors';

const RsTab = ({
    activeClass,
    arrow,
    subText,
    or,
    tabconfig,
    selectedIdx,
    setSelectedIndex,
    defaultClass,
    animate,
    refresh,
    isRefreshConfirmation,
    isClearConfirmation,
    onRefresh,
    onRemoveMenu,
    disableOtherTabs,
    onAddMenu,
    isRemoveConfirmation,
    isTabChangeConfirmation,
    clear,
    onClear,
    customTooltipName,
    customIconsize,
    disable,
    singleTab,
    isMandatory,
    isFormRefresh,
}) => {
    // console.log('tabconfig: ', tabconfig);
    const [confirmationModal, setConfimrationModal] = useState(false);
    const [isRefresh, setRefresh] = useState(false);
    const [isClear, setIsClear] = useState(false);
    const [isTabChangeConfirm, setTabChangeConfirm] = useState({
        show: false,
        index: null,
    });
    const { enableTab } = useSelector(selectCreateCommunicationState);

    const handleTabChange = (index) => {
        if (index !== selectedIdx) {
            if (isTabChangeConfirmation) {
                setTabChangeConfirm({
                    show: true,
                    index: index,
                });
            } else {
                setSelectedIndex(index);
            }
        }
    };

    return (
        <Fragment>
            {tabconfig.map((item, index) => {
                const isDisabled =
                    disableOtherTabs && !item.disable ? selectedIdx !== null && selectedIdx !== index : item.disable;
                const wrapperClass = mapResTabberClasses(
                    `tabDefault ${selectedIdx === index && !singleTab ? activeClass : ''} ${
                        item.activeTip ? 'active-arrow' : ''
                    } ${isDisabled ? 'pe-none click-off' : ''} ${disable ? 'pointer-event-none' : ''} ${
                        item.noPoniter ? 'pointer-event-none' : ''
                    } ${defaultClass}`,
                );

                return (
                    <Fragment key={item?.id ?? index}>
                        <li
                            className={`${wrapperClass} ${index === 0 ? 'single-tab' : ''}`}
                            onClick={() => {
                                if (!wrapperClass?.includes('click-off')) {
                                    handleTabChange(index);
                                }
                            }}
                        >
                            {/* <div className="d-flex justify-content-center"> */}
                            {/* <RSTooltip text={item.text} position={'top'}> */}
                            <ConditionalWrapper
                                condition={item?.tooltiptext}
                                wrapper={(children) => (
                                    <RSTooltip text={item?.tooltiptext} position={item?.tooltipPosition || 'top'}>
                                        {Wrapper(children)}
                                    </RSTooltip>
                                )}
                                noWrapper={(children) => Wrapper(children)}
                            >
                                {item?.image && <img src={item.image} alt={item.image} />}
                                {item?.icon && <i className={`${item.icon}`}></i>}
                                {item?.iconLeft && <i className={`${item.iconLeft}`}></i>}
                                {item?.text && (
                                    <span
                                        className={`${item.textClass} ${mapResTabberClasses('tab-label')}`.trim()}
                                        onClick={() => {
                                            handleTabChange(index);
                                        }}
                                    >
                                        {item.text}
                                    </span>
                                )}
                                {item?.isMandatory && <span className="color-primary-red">*</span>}
                                {arrow && <div className={mapResTabberClasses('arrowBar')} />}
                                {subText && <h3>{item.text2}</h3>}
                                {or && <span className={mapResTabberClasses('or-divider user-select-none')} />}
                                {item?.remove && (
                                    <RSTooltip
                                        text={REMOVE}
                                        position="top"
                                        className={mapResTabberClasses('tab-remove lh0')}
                                        innerContent={false}
                                    >
                                        <div className={item?.isRemove ? 'pe-none click-off' : ''}>
                                            <i
                                                className={`${item?.remove} icon-${customIconsize} color-primary-red`}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    if (isRemoveConfirmation) {
                                                        setConfimrationModal(true);
                                                    } else {
                                                        onRemoveMenu(index, item);
                                                    }
                                                }}
                                            />
                                        </div>
                                    </RSTooltip>
                                )}
                            </ConditionalWrapper>
                            {/* </RSTooltip> */}
                            {/* </div> */}
                        </li>
                        {item.add && (
                            <li className={mapResTabberClasses('tabDefault tab-add')}>
                                <RSTooltip text={customTooltipName ?? ADD} position="top" className="lh0">
                                    <div className={item?.isAdd ? 'pe-none click-off' : ''}>
                                        <i
                                            className={`${item.add} icon-md color-primary-blue`}
                                            onClick={() => onAddMenu(index + 1)}
                                        />
                                    </div>
                                </RSTooltip>
                            </li>
                        )}
                    </Fragment>
                );
            })}
            {animate && <span className={mapResTabberClasses('res-animate-key')} />}
            {refresh && !_isNil(selectedIdx) && (
                <li className={mapResTabberClasses('rs-tabs-refresh')}>
                    {/* <RSTooltip text={isFormRefresh ? 'Reset' : 'Refresh'} position="top" className="lh0"> */}
                    <RSTooltip text={RESET} position="top" className="lh0">
                        <div className={_isNil(selectedIdx) ? 'pe-none click-off' : ''}>
                            <i
                                id="rs_data_refresh"
                                className={`${restart_medium} icon-md color-primary-blue cp`}
                                onClick={() => {
                                    if (isRefreshConfirmation) {
                                        setRefresh(true);
                                    } else {
                                        onRefresh(selectedIdx);
                                        setSelectedIndex(null);
                                    }
                                }}
                            />
                        </div>
                    </RSTooltip>
                </li>
            )}
            {clear && (
                <li className={mapResTabberClasses('rs-tabs-refresh')}>
                    <RSTooltip text={RESET} position="top" className="lh0">
                        <div className={_isNil(selectedIdx) || enableTab?.refreshStatus ? 'click-off' : ''}>
                            <i
                                id="rs_data_refresh"
                                className={`${restart_medium} icon-md color-primary-blue cp`}
                                onClick={() => {
                                    if (isClearConfirmation) {
                                        setIsClear(true);
                                    } else {
                                        onClear(selectedIdx);
                                    }
                                }}
                            />
                        </div>
                    </RSTooltip>
                </li>
            )}
            {/* Modals */}
           {( confirmationModal || isRefresh || isClear) && <RSConfirmationModal
                isBorder
                header={CONFIRMATION}
                show={confirmationModal || isRefresh || isClear}
                text={
                    isRefresh
                        ? isFormRefresh
                            ? ARE_YOU_SURE_RESET
                            : ARE_YOU_SURE_WANT_TO_RESET
                        : isClear
                        ? ARE_YOU_SURE_WANT_TO_RESET
                        : ARE_YOU_SURE_REMOVE
                }
                handleClose={() => {
                    if (isRefresh) {
                        setRefresh(false);
                    } else if (isClear) {
                        setIsClear(false);
                    } else {
                        setConfimrationModal(false);
                    }
                }}
                handleConfirm={() => {
                    if (isRefresh) {
                        setRefresh(false);
                        onRefresh(null);
                        setSelectedIndex(null);
                    } else if (isClear) {
                        setIsClear(false);
                        onClear(selectedIdx);
                    } else {
                        setConfimrationModal(false);
                        onRemoveMenu();
                    }
                }}
            /> }
           {isTabChangeConfirm.show  && <RSConfirmationModal
                show={isTabChangeConfirm.show}
                isBorder
                header={CONFIRMATION}
                // text={`Are you sure you want to change tab. Your previous data will lost`}
                htmlContent={
                    <>
                        <p className="text-center lh-sm">{SWITCHING_TABS_WILL_DESCARD_NEW}</p>
                        {/* <p className="text-center mt5">
                    {DO_YOU_WISH_TO_CONTINUE_NEW}                   
                </p> */}
                    </>
                }
                handleClose={() =>
                    setTabChangeConfirm({
                        show: false,
                        index: null,
                    })
                }
                handleConfirm={() => {
                    setSelectedIndex(isTabChangeConfirm.index);
                    setTabChangeConfirm({
                        show: false,
                        index: null,
                    });
                }}
            /> }
        </Fragment>
    );
};

export default RsTab;
