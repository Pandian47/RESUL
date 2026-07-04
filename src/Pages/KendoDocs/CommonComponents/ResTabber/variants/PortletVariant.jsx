import { memo } from 'react';
import Icon from 'Components/Icon/Icon';
import RSTooltip from 'Components/RSTooltip';
import { useTabState } from '../hooks';
import { renderTabPanel } from '../utils';
import TabContentTransition from './TabContentTransition';

const PortletVariant = ({
    defaultTab = 0,
    tabData = [],
    callBack = () => {},
    defaultClass = '',
    className = '',
    children,
    activeClass = 'active',
    dynamicTab = '',
}) => {
    const { selectedIdx, tabconfig, setSelectedIndex } = useTabState({
        defaultTab,
        tabData,
        callBack,
    });

    return (
        <div className="rsp-tab-container">
            <div className="d-flex align-items-center justify-content-between">
                <ul className={`${className} ${dynamicTab}`}>
                    {tabconfig.map((item, index) => (
                        <li
                            key={item?.id ?? index}
                            className={`
                                ${selectedIdx === index ? activeClass : ''}
                                ${defaultClass}
                                ${item.disable ? 'click-off' : ''}
                            `}
                            onClick={() => {
                                if (selectedIdx !== index) setSelectedIndex(index);
                            }}
                        >
                            {item.icon && (
                                item?.tooltip ? (
                                    <RSTooltip position="top" text={item.tooltip}>
                                        <Icon icon={item.icon} size="md" />
                                    </RSTooltip>
                                ) : (
                                    <Icon icon={item.icon} size="md" />
                                )
                            )}
                        </li>
                    ))}
                </ul>
                {children}
            </div>
            <div className="portlet-body">
                <TabContentTransition selectedIdx={selectedIdx}>
                    {renderTabPanel(tabconfig[selectedIdx])}
                </TabContentTransition>
            </div>
        </div>
    );
};

export default memo(PortletVariant);
