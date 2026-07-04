import { memo, useRef, useState, useEffect, useCallback } from 'react';
import _isNil from 'lodash/isNil';
import { Col } from 'react-bootstrap';
import { motion } from 'framer-motion';
import RsTab from 'Components/RSTabber/Component/RSTab';
import { useTabState } from '../hooks';
import { mapResTabberClasses } from '../utils';
import TabContentTransition from './TabContentTransition';

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

    // --- Sliding active tab indicator hook ---
    const useTabIndicator = (ulRef, activeIdx, config) => {
        const [indicatorStyle, setIndicatorStyle] = useState(null);
        const [isTransparent, setIsTransparent] = useState(false);

        useEffect(() => {
            const ulEl = ulRef.current;
            if (!ulEl) return;

            const updateIndicator = () => {
                const activeLi = ulEl.querySelector('.tabDefault.active, .res-tab-default.active');
                if (!activeLi) {
                    setIndicatorStyle(null);
                    return;
                }
                
                const parentRect = ulEl.getBoundingClientRect();
                const activeRect = activeLi.getBoundingClientRect();
                
                setIndicatorStyle({
                    left: activeRect.left - parentRect.left,
                    width: activeRect.width,
                    height: activeRect.height,
                });
                
                const isTrans = activeLi.classList.contains('res-tab-transparent') || 
                                activeLi.classList.contains('tabTransparent');
                setIsTransparent(isTrans);
            };

            const handle = requestAnimationFrame(updateIndicator);

            const ro = new ResizeObserver(updateIndicator);
            ro.observe(ulEl);

            window.addEventListener('resize', updateIndicator);
            return () => {
                cancelAnimationFrame(handle);
                ro.disconnect();
                window.removeEventListener('resize', updateIndicator);
            };
        }, [activeIdx, config]);

        return { indicatorStyle, isTransparent };
    };

    const ulRef1 = useRef(null);
    const { indicatorStyle: style1, isTransparent: trans1 } = useTabIndicator(ulRef1, selectedIdx, tabconfig);

    const ulRef2 = useRef(null);
    const { indicatorStyle: style2, isTransparent: trans2 } = useTabIndicator(ulRef2, selectedIdx, tabconfig);

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
                            ref={ulRef1}
                            style={{ position: 'relative' }}
                            className={mapResTabberClasses(
                                `${className} ${dynamicTab} ${or ? 'or-tab' : 'tstwh-tabs'} ${
                                    animate ? 'animate-tab' : ''
                                } ${_isNil(selectedIdx) ? 'rsctf-closed' : 'rsctf-opened'} res-tab-sliding-enabled`,
                            )}
                        >
                            <RsTab {...tabProps} />
                            
                            {style1 && (
                                <motion.div
                                    className={`res-tab-active-indicator ${
                                        trans1 ? 'res-tab-indicator-transparent' : 'res-tab-indicator-solid'
                                    }`}
                                    initial={false}
                                    animate={{
                                        x: style1.left,
                                        width: style1.width,
                                        height: trans1 ? 1 : style1.height,
                                    }}
                                    transition={{
                                        type: 'spring',
                                        stiffness: 380,
                                        damping: 30,
                                        mass: 0.8,
                                    }}
                                    style={{
                                        position: 'absolute',
                                        left: 0,
                                        bottom: 0,
                                    }}
                                />
                            )}
                        </ul>
                        {isCreateCommunication && _isNil(selectedIdx) ? (
                            <ul className="infoContent">
                                {tabData?.map((tab, ind) => (
                                    <li key={ind}>{tab?.infocontent}</li>
                                ))}
                            </ul>
                        ) : null}
                    </div>
                    <TabContentTransition selectedIdx={selectedIdx}>
                        {tabconfig?.[selectedIdx]?.component?.()}
                    </TabContentTransition>
                </div>
            ) : (
                <>
                    <ul
                        ref={ulRef2}
                        style={{ position: 'relative' }}
                        className={mapResTabberClasses(
                            `${className} ${dynamicTab} ${or ? 'or-tab' : ''} ${animate ? 'animate-tab' : ''} res-tab-sliding-enabled`,
                        )}
                    >
                        <RsTab {...tabProps} />
                        
                        {style2 && (
                            <motion.div
                                className={`res-tab-active-indicator ${
                                    trans2 ? 'res-tab-indicator-transparent' : 'res-tab-indicator-solid'
                                }`}
                                initial={false}
                                animate={{
                                    x: style2.left,
                                    width: style2.width,
                                    height: trans2 ? 1 : style2.height,
                                }}
                                transition={{
                                    type: 'spring',
                                    stiffness: 380,
                                    damping: 30,
                                    mass: 0.8,
                                }}
                                style={{
                                    position: 'absolute',
                                    left: 0,
                                    bottom: 0,
                                }}
                            />
                        )}
                    </ul>
                    {isLoginScreen ? (
                        <div className="login-cont">
                            <div className={`${mapResTabberClasses('tabs-content')} ${componentClassName}`.trim()}>
                                <TabContentTransition selectedIdx={selectedIdx}>
                                    {tabconfig?.[selectedIdx]?.component?.()}
                                </TabContentTransition>
                            </div>
                        </div>
                    ) : (
                        <div className={`${mapResTabberClasses('tabs-content')} ${componentClassName}`.trim()}>
                            <TabContentTransition selectedIdx={selectedIdx}>
                                {tabconfig?.[selectedIdx]?.component?.()}
                            </TabContentTransition>
                        </div>
                    )}
                </>
            )}
        </>
    );
};

export default memo(DefaultVariant);
