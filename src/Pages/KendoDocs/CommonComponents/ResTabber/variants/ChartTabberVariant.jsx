import { analytics_large, arrow_left_mini, arrow_right_mini, circle_list_large } from 'Constants/GlobalConstant/Glyphicons';
import { memo, useEffect, useState } from 'react';
import RSTooltip from 'Components/RSTooltip';

import { useTabState } from '../hooks';
import { mapResTabberClasses } from '../utils';

const ChartTabberVariant = ({
    defaultTab = 0,
    tabData = [],
    chartHeading = '',
    callBack = () => {},
    defaultClass = '',
    className = '',
    activeClass = 'active',
    smallText = '',
    footer = false,
    headerIcon = null,
    autoHeight = false,
    expandView = false,
    gridView = null,
    expandIcon = null,
    hideTabs = false,
    containerClass = '',
    dynamicTab = '',
}) => {
    const { selectedIdx, tabconfig, setSelectedIndex } = useTabState({
        defaultTab,
        tabData,
        callBack,
    });

    const [chartExpand, setChartExpand] = useState(false);
    const [gridCompo, setGridCompo] = useState(false);

    useEffect(() => {
        setTimeout(() => window.dispatchEvent(new Event('resize')), 600);
    }, [chartExpand]);

    const tabListClassName = mapResTabberClasses(`${className} ${dynamicTab}`.trim());

    return (
        <div
            className={`portlet-container
                ${autoHeight ? '' : 'portlet-md'}
                ${footer ? 'pfooter' : ''}
                ${expandView ? 'expanded-view' : ''}
                ${chartExpand ? 'chart-expanded' : 'chart-collpase'}
                ${containerClass}
            `}
        >
            <div className="portlet-header">
                <h4>{chartHeading}</h4>
                <div className="align-items-center d-flex float-end">
                    {gridView && (
                        <RSTooltip
                            position="top"
                            text={gridCompo ? 'Chart View' : 'Grid View'}
                            className="lh0 mr10"
                        >
                            <i
                                className={`${
                                    gridCompo ? analytics_large : circle_list_large
                                } color-primary-blue icon-lg`}
                                onClick={() => setGridCompo(!gridCompo)}
                            />
                        </RSTooltip>
                    )}
                    {!hideTabs && (
                        <ul className={tabListClassName}>
                            {tabconfig?.map((item, index) => (
                                <li
                                    key={item?.id ?? index}
                                    className={mapResTabberClasses(
                                        `tabDefault ${
                                            selectedIdx === index ? activeClass : ''
                                        } ${item.activeTip ? 'active-arrow' : ''} ${defaultClass} ${
                                            item.disable === true ? 'click-off' : ''
                                        }`.trim(),
                                    )}
                                    onClick={() => setSelectedIndex(index)}
                                >
                                    {item.text && (
                                        <span className={item.textClass}>{item.text}</span>
                                    )}
                                </li>
                            ))}
                        </ul>
                    )}
                    {headerIcon ?? null}
                </div>
            </div>
            <div className="portlet-body">
                {gridView && gridCompo ? gridView : tabconfig[selectedIdx]?.component?.()}
                {smallText && <small className="portlet-info-text">{smallText}</small>}
            </div>

            {footer && tabconfig[selectedIdx]?.footer}

            {expandView && (
                <div
                    className="expand-icon cp"
                    onClick={() => {
                        setChartExpand(!chartExpand);
                        if (expandIcon && typeof expandIcon === 'function') {
                            expandIcon();
                        }
                    }}
                >
                    <i
                        className={`${
                            chartExpand ? arrow_left_mini : arrow_right_mini
                        } white icon-xs`}
                    />
                </div>
            )}
        </div>
    );
};

export default memo(ChartTabberVariant);
