import { truncateTitle } from 'Utils/modules/displayCore';
import { CustomSkeleton } from 'Components/Skeleton/Components/SkeletonOverall';
import { justify_dropdown_mini } from 'Constants/GlobalConstant/Glyphicons';
import { memo, useEffect, useLayoutEffect, useState } from 'react';
import _findIndex from 'lodash/findIndex';
import { Container, Row } from 'react-bootstrap';
import { BootstrapDropdown } from 'Components/RSBootstrapDropDown';
import RSTooltip from 'Components/RSTooltip';

import { normalizeTabIndex } from '../hooks';
import { TAB_LABEL_MAX_LENGTH, mapResTabberClasses } from '../utils';
import TabContentTransition from './TabContentTransition';

const FluidVariant = ({
    defaultTab = 0,
    callBack = () => {},
    componentClassName = '',
    tabData,
    count,
    remTabs,
    activeClass = '',
    className = '',
    dynamicTab = '',
    or = false,
    animate = false,
    arrow = false,
    subText = false,
    defaultClass = '',
}) => {
    const [selected, setSelected] = useState(() => normalizeTabIndex(defaultTab));
    const [tabs, setTabs] = useState(() => tabData ?? []);
    const [options, setOptions] = useState([]);
    const [isDDl, setIsDDL] = useState(false);

    const setSelectedIndex = (index, temptabs) => {
        const nextTabs = temptabs ?? tabs;
        if (!nextTabs?.length || index < 0 || index >= nextTabs.length) return;
        setSelected(index);
        callBack(nextTabs[index], index);
    };

    useLayoutEffect(() => {
        if (!isDDl) {
            if (tabData?.length > (count ?? 7)) {
                const tempTab = [...tabData];
                const remainingTabs = tempTab?.splice(count ?? 10, remTabs);
                const nextOptions = remainingTabs?.map((tab) => ({
                    id: tab.id,
                    name: tab.text,
                }));
                setOptions(nextOptions);
                setTabs(tempTab);
            } else {
                setTabs(tabData);
            }
            setIsDDL(false);
        }
    }, [tabData, count, remTabs, isDDl]);

    useLayoutEffect(() => {
        setSelected(normalizeTabIndex(defaultTab));
    }, [defaultTab]);

    useEffect(() => {
        if (!tabs?.length) return;
        if (selected >= tabs.length) {
            setSelected(0);
        }
    }, [tabs, selected]);

    const handleTabChange = ({ name }, index) => {
        const findTabIndex = _findIndex(tabData, (tab) => tab.text === name);
        const tempTabs = [...tabs];
        const remainOptions = [...options];
        remainOptions.splice(index, 1);
        if (tabs?.length >= (count ?? 8)) {
            const lastTab = tempTabs.splice(tempTabs?.length - 1, 1)[0];
            tempTabs.push(tabData[findTabIndex]);
            remainOptions.push({
                id: lastTab.id,
                name: lastTab.text,
            });
        } else {
            tempTabs.push(tabData[findTabIndex]);
        }
        setTabs(tempTabs);
        setSelected(tempTabs?.length - 1);
        setOptions(remainOptions);
        setSelectedIndex(tempTabs?.length - 1, tempTabs);
        setIsDDL(true);
    };

    if (selected === '' || selected === null || selected === undefined) {
        return (
            <Container>
                <div className="box-design mt21">
                    <CustomSkeleton count={7} height={35} isError />
                </div>
            </Container>
        );
    }

    return (
        <>
            <div className="fullWhiteBackground">
                <Container>
                    <Row>
                        <ul
                            className={mapResTabberClasses(
                                `${className} ${dynamicTab} ${or ? 'or-tab' : ''} ${animate ? 'animate-tab' : ''}`,
                            )}
                        >
                            {tabs?.map((item, index) => (
                                <li
                                    className={mapResTabberClasses(
                                        `tabDefault ${selected === index ? activeClass : ''} ${
                                            item.activeTip ? 'active-arrow' : ''
                                        } ${item.disable === true ? 'pe-none click-off' : ''} ${
                                            item.noPoniter ? 'pointer-event-none' : ''
                                        } ${defaultClass}`,
                                    )}
                                    key={item?.id + index + item?.text}
                                    onClick={() => {
                                        if (!item.disable) {
                                            setSelectedIndex(index, tabs);
                                        }
                                    }}
                                >
                                    {item.image && <img src={item.image} alt={item.image} />}
                                    {item.icon && <i className={`${item.icon}`} />}
                                    {item.iconLeft && <i className={`${item.iconLeft}`} />}
                                    {item?.text &&
                                        (item?.text?.length < TAB_LABEL_MAX_LENGTH ? (
                                            <span>{item.text}</span>
                                        ) : (
                                            <RSTooltip text={item?.text} position="top">
                                                <span>{truncateTitle(item?.text, TAB_LABEL_MAX_LENGTH)}</span>
                                            </RSTooltip>
                                        ))}
                                    {arrow && <div className={mapResTabberClasses('arrowBar')} />}
                                    {subText && <h3>{`${item?.text2}`}</h3>}
                                    {or && <span className={mapResTabberClasses('or-divider user-select-none')} />}
                                </li>
                            ))}
                            {animate && <span className={mapResTabberClasses('animate-key')} />}
                            {tabData?.length >= count + 1 && (
                                <li>
                                    <BootstrapDropdown
                                        data={options}
                                        fieldKey="name"
                                        flatIcon
                                        defaultItem={
                                            <i
                                                className={`${justify_dropdown_mini} position-relative right7`}
                                            />
                                        }
                                        isObject
                                        showUpdate={false}
                                        className="no_caret"
                                        onSelect={handleTabChange}
                                    />
                                </li>
                            )}
                        </ul>
                    </Row>
                </Container>
            </div>
            <Container className="px0">
                <div className={componentClassName}>
                    <TabContentTransition selectedIdx={selected}>
                        {tabs?.length && typeof tabs[selected]?.component === 'function'
                            ? tabs[selected].component()
                            : null}
                    </TabContentTransition>
                </div>
            </Container>
        </>
    );
};

export default memo(FluidVariant);
