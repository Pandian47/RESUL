import { memo } from 'react';
import _isNil from 'lodash/isNil';
import { Col } from 'react-bootstrap';
import RsTab from 'Components/RSTabber/Component/RSTab';
import { useTabState } from '../hooks';
import { mapResTabberClasses } from '../utils';

const DefaultVariant = ({
    defaultTab = 0,
    heading = '',
    flatTabs = false,
    ccTabs = false,
    cTabsBig = false,
    noMarginLeftRight = false,
    componentClassName = '',
    tabData = [],
    callBack = () => {},
    defaultClass = '',
    className = '',
    disableOtherTabs = false,
    animate,
    onAddMenu = () => {},
    onRefresh = () => {},
    onRemoveMenu = () => {},
    refresh,
    isRefreshConfirmation = false,
    isClearConfirmation = false,
    isRemoveConfirmation,
    isHeadingBlock = false,
    activeClass = 'active',
    arrow,
    subText,
    or,
    dynamicTab = '',
    isTabChangeConfirmation,
    clear,
    onClear = () => {},
    extraClassName,
    leftspace = false,
    customTooltipName,
    isCreateCommunication = false,
    deliverytext_center = false,
    customIconsize = 'md',
    singleTab = false,
    isLoginScreen = false,
    isMandatory = false,
    isFormRefresh = false,
    noHeader = false,
    disableWrapperTransition = false,
}) => {
    const { selectedIdx, tabconfig, setSelectedIndex } = useTabState({
        defaultTab,
        tabData,
        callBack,
    });
    const handleSelect = (index, isForceUpdate = false) => {
        setSelectedIndex(index, isForceUpdate);
    };

    const tabProps = {
        activeClass,
        arrow,
        subText,
        or,
        tabconfig,
        selectedIdx,
        setSelectedIndex: handleSelect,
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
        isCreateCommunication,
        customIconsize,
        singleTab,
        isLoginScreen,
        isMandatory,
        isFormRefresh,
        noHeader,
    };

    return (
        <>
            {!!heading?.length ? (
                <div
                    className={mapResTabberClasses(
                        `rs-tabs-with-heading ${
                            _isNil(selectedIdx)
                                ? 'rs-tabs-closed-wrapper'
                                : `rs-tabs-opened-wrapper${disableWrapperTransition ? '' : ' transition'}`
                        } ${extraClassName || ''}`,
                    )}
                >
                    <div
                        className={mapResTabberClasses(
                            `row rstwh-holder ${flatTabs ? 'rs-flat-tabs' : ''} ${
                                cTabsBig ? 'rs-camp-tabs-big' : ''
                            } ${noMarginLeftRight ? 'mx0' : ''} ${ccTabs ? 'mx0' : ''} ${
                                extraClassName ? extraClassName : ''
                            }`,
                        )}
                    >
                        {_isNil(selectedIdx) && isHeadingBlock ? (
                            <Col sm={12}>
                                <div className="ctabs-big-label mb30">
                                    <h3>{heading}</h3>
                                </div>
                            </Col>
                        ) : (
                            <Col sm={3} className={`tstwh-label ${leftspace ? '' : 'pr0'} ${noHeader ? 'd-none' : ''}`}>
                                <div className={`font-sm mt10 ${deliverytext_center ? 'mt38' : ''}`}>{heading}</div>
                            </Col>
                        )}

                        <ul
                            className={mapResTabberClasses(
                                `${className} ${dynamicTab} ${or ? 'or-tab' : 'tstwh-tabs'} ${
                                    animate ? 'animate-tab' : ''
                                } ${_isNil(selectedIdx) ? 'rsctf-closed' : 'rsctf-opened'}`,
                            )}
                        >
                            <RsTab {...tabProps} />
                        </ul>
                        {isCreateCommunication && _isNil(selectedIdx) ? (
                            <ul className="infoContent">
                                {tabData?.map((tab, ind) => (
                                    <li key={ind}>{tab?.infocontent}</li>
                                ))}
                            </ul>
                        ) : null}
                    </div>
                    {tabconfig?.[selectedIdx]?.component?.()}
                </div>
            ) : (
                <>
                    <ul
                        className={mapResTabberClasses(
                            `${className} ${dynamicTab} ${or ? 'or-tab' : ''} ${animate ? 'animate-tab' : ''}`,
                        )}
                    >
                        <RsTab {...tabProps} />
                    </ul>
                    {isLoginScreen ? (
                        <div className="login-cont">
                            <div className={`${mapResTabberClasses('tabs-content')} ${componentClassName}`.trim()}>
                                {tabconfig?.[selectedIdx]?.component?.()}
                            </div>
                        </div>
                    ) : (
                        <div className={`${mapResTabberClasses('tabs-content')} ${componentClassName}`.trim()}>
                            {tabconfig?.[selectedIdx]?.component?.()}
                        </div>
                    )}
                </>
            )}
        </>
    );
};

export default memo(DefaultVariant);
