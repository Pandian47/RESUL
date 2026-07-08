import { memo, useRef, useState, useEffect } from 'react';
import { Col } from 'react-bootstrap';
import { AnimatePresence, motion } from 'framer-motion';
import RsTab from 'Components/RSTabber/Component/RSTab';
import { useTabState } from '../hooks';
import { mapResTabberClasses, renderTabPanel, shouldEnableSlidingIndicator } from '../utils';
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
        preserveNullDefault: isCreateCommunication,
    });
    const handleSelect = (index, isForceUpdate = false) => {
        setSelectedIndex(index, isForceUpdate);
    };

    // --- Sliding active tab indicator hook ---
    const useTabIndicator = (ulRef, activeIdx, config, enabled) => {
        const [indicatorStyle, setIndicatorStyle] = useState(null);
        const [isTransparent, setIsTransparent] = useState(false);

        useEffect(() => {
            if (!enabled) {
                setIndicatorStyle(null);
                return;
            }

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
        }, [activeIdx, config, enabled]);

        return { indicatorStyle, isTransparent };
    };

    const isSlidingEnabled = shouldEnableSlidingIndicator(className, dynamicTab);

    const ulRef1 = useRef(null);
    const { indicatorStyle: style1, isTransparent: trans1 } = useTabIndicator(
        ulRef1,
        selectedIdx,
        tabconfig,
        isSlidingEnabled,
    );

    const ulRef2 = useRef(null);
    const { indicatorStyle: style2, isTransparent: trans2 } = useTabIndicator(
        ulRef2,
        selectedIdx,
        tabconfig,
        isSlidingEnabled,
    );

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
                            selectedIdx == null
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
                        <AnimatePresence initial={false}>
                            {selectedIdx == null && isHeadingBlock ? (
                                <motion.div
                                    key="big-heading"
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    transition={{ duration: 0.28, ease: [0.4, 0, 0.2, 1] }}
                                    style={{ overflow: 'hidden', minHeight: 0 }}
                                    className="col-sm-12"
                                >
                                    <div className="ctabs-big-label mb30">
                                        <h3>{heading}</h3>
                                    </div>
                                </motion.div>
                            ) : (
                                <motion.div
                                    key="small-heading"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0, position: 'absolute' }}
                                    transition={{ duration: 0.28 }}
                                    className={`col-sm-3 tstwh-label ${leftspace ? '' : 'pr0'} ${noHeader ? 'd-none' : ''}`}
                                >
                                    <div className={`font-sm mt10 ${deliverytext_center ? 'mt38' : ''}`}>{heading}</div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <ul
                            ref={ulRef1}
                            style={{ position: 'relative' }}
                            className={mapResTabberClasses(
                                `${className} ${dynamicTab} ${or ? 'or-tab' : 'tstwh-tabs'} ${
                                    animate ? 'animate-tab' : ''
                                } ${selectedIdx == null ? 'rsctf-closed' : 'rsctf-opened'} ${
                                    isSlidingEnabled ? 'res-tab-sliding-enabled' : ''
                                }`,
                            )}
                        >
                            <RsTab {...tabProps} />

                            {isSlidingEnabled && style1 && (
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

                        {/*
                         * Description text below the delivery-method cards.
                         * Animates height + opacity so the space it occupies collapses
                         * smoothly when a tab is selected, preventing the abrupt position
                         * jump of content below it.
                         */}
                        <AnimatePresence initial={false}>
                            {isCreateCommunication && selectedIdx == null && (
                                <motion.ul
                                    key="infoContent"
                                    className="infoContent"
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    transition={{ duration: 0.28, ease: [0.4, 0, 0.2, 1] }}
                                    style={{ overflow: 'hidden' }}
                                >
                                    {tabData?.map((tab, ind) => (
                                        <li key={ind}>{tab?.infocontent}</li>
                                    ))}
                                </motion.ul>
                            )}
                        </AnimatePresence>
                        
                        <TabContentTransition selectedIdx={selectedIdx}>
                            {renderTabPanel(tabconfig?.[selectedIdx])}
                        </TabContentTransition>
                    </div>

                    {/*
                     * Tab panel content area.
                     * TabContentTransition fades content in/out when the selected tab
                     * changes. When selectedIdx is null nothing is rendered so the space
                     * it would have occupied is fully released.
                     */}
                </div>
            ) : (
                <>
                    <ul
                        ref={ulRef2}
                        style={{ position: 'relative' }}
                        className={mapResTabberClasses(
                            `${className} ${dynamicTab} ${or ? 'or-tab' : ''} ${animate ? 'animate-tab' : ''} ${
                                isSlidingEnabled ? 'res-tab-sliding-enabled' : ''
                            }`,
                        )}
                    >
                        <RsTab {...tabProps} />
                        
                        {isSlidingEnabled && style2 && (
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
                                    {renderTabPanel(tabconfig?.[selectedIdx])}
                                </TabContentTransition>
                            </div>
                        </div>
                    ) : (
                        <div className={`${mapResTabberClasses('tabs-content')} ${componentClassName}`.trim()}>
                            <TabContentTransition selectedIdx={selectedIdx}>
                                {renderTabPanel(tabconfig?.[selectedIdx])}
                            </TabContentTransition>
                        </div>
                    )}
                </>
            )}
        </>
    );
};

export default memo(DefaultVariant);
