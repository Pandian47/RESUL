import { truncateTitle } from 'Utils/modules/displayCore';
import { arrow_left_mini, arrow_right_mini } from 'Constants/GlobalConstant/Glyphicons';
import { memo, useEffect, useState } from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import RSTooltip from 'Components/RSTooltip';

import { useHorizontalScroll } from '../hooks';
import { TAB_LABEL_MAX_LENGTH, mapResTabberClasses, renderTabPanel } from '../utils';

const SlideVariant = ({
    defaultTab = 0,
    callBack = () => {},
    componentClassName = '',
    tabData = [],
    activeClass = 'active',
    tabMaxLength = 0,
    customRender = false,
    renderItem = null,
    isBorderWhite = true,
    onTabClick = null,
    isDetailAnalytics = false,
    className = '',
    dynamicTab = '',
    or = false,
    animate = false,
    defaultClass = '',
}) => {
    const [selected, setSelected] = useState(defaultTab);
    const {
        tabsContainerRef,
        scrollControlsRef,
        hasPrev,
        hasNext,
        handleScrollLeft,
        handleScrollRight,
        updateScrollState,
    } = useHorizontalScroll([tabData.length]);

    const setSelectedIndex = (index) => {
        if (tabData[index] && !tabData[index]?.disable) {
            setSelected(index);
            callBack?.(tabData[index], index);
        }
    };

    useEffect(() => {
        setSelected(defaultTab);
    }, [defaultTab]);

    useEffect(() => {
        updateScrollState();
    }, [tabData.length, updateScrollState]);

    if (!Array.isArray(tabData) || tabData.length === 0) return null;

    return (
        <div>
            <div className={mapResTabberClasses('rs-scroll-tabbar')}>
                <Container className="px0">
                    <Row className="align-items-center">
                        <Col md={customRender ? 10 : 12}>
                            <div className="position-relative">
                                {tabData.length > tabMaxLength && (
                                    <div className="scroll-controls" ref={scrollControlsRef}>
                                        <div
                                            className={`scroll-left ${!hasPrev ? 'pe-none click-off' : ''}`}
                                            onClick={handleScrollLeft}
                                        >
                                            <i className={`${arrow_left_mini} icon-sm`} />
                                        </div>
                                        <div
                                            className={`scroll-right ${!hasNext ? 'pe-none click-off' : ''}`}
                                            onClick={handleScrollRight}
                                        >
                                            <i className={`${arrow_right_mini} icon-sm`} />
                                        </div>
                                    </div>
                                )}

                                <div
                                    ref={tabsContainerRef}
                                    className={mapResTabberClasses(
                                        `rs-scroll-container ${tabData.length > tabMaxLength ? '' : 'w-100'}`,
                                    )}
                                >
                                    <ul
                                        className={mapResTabberClasses(
                                            `rs-scrollTabList-container ${className} ${dynamicTab} ${
                                                or ? 'or-tab' : ''
                                            } ${animate ? 'animate-tab' : ''} ${
                                                isBorderWhite ? '' : 'rs-tab-custom-border'
                                            }`,
                                        )}
                                    >
                                        {tabData.map((item, index) => {
                                            const tabLabel = truncateTitle(item.text, TAB_LABEL_MAX_LENGTH);
                                            const isTruncated = tabLabel !== item.text;

                                            const tabInner = (
                                                <>
                                                    {item.icon && <i className={`${item.icon}`} />}
                                                    {item.image && <img src={item.image} alt={item.text} />}
                                                    <span>{tabLabel}</span>
                                                </>
                                            );

                                            return (
                                            <li
                                                key={item.id || index}
                                                className={mapResTabberClasses(
                                                    `tabDefault ${selected === index ? activeClass : ''} ${
                                                        item.activeTip ? 'active-arrow' : ''
                                                    } ${item.disable ? 'pe-none click-off' : ''} ${
                                                        item.noPoniter ? 'pointer-event-none' : ''
                                                    } ${
                                                        selected === index && isDetailAnalytics
                                                            ? 'pointer-event-none'
                                                            : ''
                                                    } ${defaultClass || ''}`,
                                                )}
                                            >
                                                {isDetailAnalytics && item.href ? (
                                                    isTruncated ? (
                                                        <RSTooltip text={item.text} position="top" innerContent={false}>
                                                            <a
                                                                href={item.href}
                                                                className={mapResTabberClasses(
                                                                    'tab-link color-secondary-black text-decoration-none',
                                                                )}
                                                                onClick={(e) => {
                                                                    if (selected === index) {
                                                                        e.preventDefault();
                                                                        return;
                                                                    }
                                                                    onTabClick?.(item, e);
                                                                    setSelectedIndex(index);
                                                                }}
                                                            >
                                                                {tabInner}
                                                            </a>
                                                        </RSTooltip>
                                                    ) : (
                                                        <a
                                                            href={item.href}
                                                            className={mapResTabberClasses(
                                                                'tab-link color-secondary-black text-decoration-none',
                                                            )}
                                                            onClick={(e) => {
                                                                if (selected === index) {
                                                                    e.preventDefault();
                                                                    return;
                                                                }
                                                                onTabClick?.(item, e);
                                                                setSelectedIndex(index);
                                                            }}
                                                        >
                                                            {tabInner}
                                                        </a>
                                                    )
                                                ) : isTruncated ? (
                                                    <RSTooltip text={item.text} position="top" innerContent={false}>
                                                        <div onClick={() => setSelectedIndex(index)}>{tabInner}</div>
                                                    </RSTooltip>
                                                ) : (
                                                    <div onClick={() => setSelectedIndex(index)}>{tabInner}</div>
                                                )}
                                            </li>
                                            );
                                        })}
                                    </ul>
                                </div>
                            </div>
                        </Col>

                        {customRender && (
                            <Col md={2} className="position-relative mt-7 ml-3">
                                {renderItem}
                            </Col>
                        )}
                    </Row>
                </Container>
            </div>

            <div className={componentClassName}>
                {typeof tabData === 'function'
                    ? tabData(selected)
                    : renderTabPanel(tabData[selected])}
            </div>
        </div>
    );
};

export default memo(SlideVariant);
