import { getChannelId } from 'Utils/modules/communicationChannels';
import { useEffect, useState } from 'react';
import { map as _map } from 'Utils/modules/lodashReplacements';
import { useDispatch, useSelector } from 'react-redux';

import RSTabbar from 'Components/RSTabber';

import { ignoreList } from './constant';

import { ANALYTICS_TAB_CONFIG, areAllChannelAudiencesAdhoc, shouldShowAuthoringTabChangeConfirmation } from '../../constant';
import { updateTab } from 'Reducers/communication/createCommunication/Create/reducer';
import { useNavigate } from 'react-router-dom';
import useQueryParams from 'Hooks/useQueryParams';

const Analytics = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    // const { state } = useLocation();
    const state = useQueryParams('/communication');
    const {
        isDirty,
        tabsState: {
            analytics: { currentTab },
        },
    } = useSelector(({ createCommunicationReducer }) => createCommunicationReducer);
    const { channelAudiences = {} } = useSelector(({ communicationPlanReducer }) => communicationPlanReducer);
    const [tabs, setTabs] = useState([]);

    useEffect(() => {
        if (state) {
            let { analyticsTypes = [] , analyticsTabIndex } = state;
            let analytics = _map(analyticsTypes, (id) => {
                const { label } = getChannelId(id);
                const normalizedLabel = label.toLowerCase();
                if (normalizedLabel === 'app analytics') return 'app';
                if (normalizedLabel === 'webinar') return 'events';
                return normalizedLabel;
            });
            if (state?.offlineConversion) analytics.push('offlineconversion');
            // console.log('analytics: ', analytics);
            let defaultTab;
            const allAudiencesAdhoc = areAllChannelAudiencesAdhoc(channelAudiences);
            const tempTabs = [...ANALYTICS_TAB_CONFIG].map((tab, index) => {
                const id = tab.id.toLowerCase();
                // console.log('id: ', id);

                if (ignoreList.has(id) || !analytics.includes(id)) {
                    tab.disable = true;
                } else if (id === 'offlineconversion' && allAudiencesAdhoc) {
                    tab.disable = true;
                } else {
                    if (defaultTab === undefined)
                        defaultTab = {
                            tabName:  ANALYTICS_TAB_CONFIG[analyticsTabIndex]?.id ??  tab.id,
                            currentTab: analyticsTabIndex ?? index,
                        };
                    tab.disable = false;
                    dispatch(
                        updateTab({
                            field: 'analytics',
                            data: defaultTab,
                        }),
                    );
                }
                return tab;
            });
            setTabs(tempTabs);
        }
        // else {
        //     navigate('/communication', { state: { index: 0 } });
        // }
    }, [state, channelAudiences]);
    // console.log('tabs::', tabs);
    return (
        <RSTabbar
            dynamicTab={`rs-sub-tabs rs-cc-sub-tabs`}
            activeClass={`active`}
            defaultTab={currentTab}
            tabData={tabs}
            isTabChangeConfirmation={shouldShowAuthoringTabChangeConfirmation(isDirty)}
            callBack={(tabs, index) => {
                if (currentTab !== index) {
                    dispatch(
                        updateTab({
                            field: 'analytics',
                            data: {
                                tabName: tabs?.id ?? 'web',
                                currentTab: index,
                            },
                        }),
                    );
                }
            }}
        />
    );
};

export default Analytics;
