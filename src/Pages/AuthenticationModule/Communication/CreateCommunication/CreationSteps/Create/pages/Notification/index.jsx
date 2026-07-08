import { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { get as _get,findIndex as _findIndex } from 'Utils/modules/lodashReplacements';

import RSTabbar from 'Components/RSTabber';

import { NOTIFICATION_TAB_CONFIG, resolveNotificationSubTabIndexFromSharedState, shouldShowAuthoringTabChangeConfirmation } from '../../constant';
import { updateTab } from 'Reducers/communication/createCommunication/Create/reducer';
import useQueryParams from 'Hooks/useQueryParams';

const Notification = () => {
    const dispatch = useDispatch();
    const location = useQueryParams('/communication');

    const {
        tabsState,
        verticalTab: { type: verticalType } = {},
        isDirty,
    } = useSelector(({ createCommunicationReducer }) => createCommunicationReducer);
    const currentIndex = tabsState?.notification?.currentIndex ?? 0;
    const notificationTabName = tabsState?.notification?.tabName;
    const [tabState, setTabState] = useState([]);
    const userPickedSubTabRef = useRef(false);
    const lastCampaignIdRef = useRef(_get(location, 'campaignId', null));

    useEffect(() => {
        const campaignId = _get(location, 'campaignId', null);
        if (lastCampaignIdRef.current !== campaignId) {
            lastCampaignIdRef.current = campaignId;
            userPickedSubTabRef.current = false;
        }

        let nTabAnalytics = _get(location, 'analyticsTypes', []);
        const resolved = resolveNotificationSubTabIndexFromSharedState({
            location,
            tabsState,
            notificationReduxIndex: currentIndex,
            verticalTabType: 'notification',
        });
        const fromIndex = userPickedSubTabRef.current ? currentIndex : resolved.fromIndex;
        const { rawLocationCurrentIndex, channelId, usedEditSource } = resolved;
        let defaultTab = 0;
        let notifyTabs = [...NOTIFICATION_TAB_CONFIG];

        if (nTabAnalytics?.length) {
            for (let i = 0; i < nTabAnalytics?.length; i++) {
                let webIndex = _findIndex(notifyTabs, (tab) => tab.notifyType === nTabAnalytics?.[i]);
                if (webIndex !== -1) {
                    notifyTabs[webIndex] = {
                        ...notifyTabs[webIndex],
                        disable: handleIsChannelPresent(notifyTabs[webIndex]) ? false : true,
                    };
                    if (fromIndex === null) defaultTab = webIndex;
                    else defaultTab = fromIndex;
                }
            }
        } else {
            if (fromIndex === null) defaultTab = 0;
            else defaultTab = fromIndex;
        }
        defaultTab = Math.max(0, Math.min(defaultTab, notifyTabs.length - 1));

        const enabledTabIndexes = notifyTabs.reduce((acc, tab, idx) => {
            if (!tab.disable) acc.push(idx);
            return acc;
        }, []);

        if (enabledTabIndexes.length === 1) {
            defaultTab = enabledTabIndexes[0];
        } else if (notifyTabs[defaultTab]?.disable && enabledTabIndexes.length > 0) {
            defaultTab = enabledTabIndexes[0];
        }

        let nextIndex = defaultTab;
        let nextTabName = notifyTabs[defaultTab]?.id;

        if (nTabAnalytics?.length === 2 && rawLocationCurrentIndex == null && !channelId && !usedEditSource) {
            const pickedTab = notifyTabs[defaultTab];
            const currentPickHasChannel = pickedTab && handleIsChannelPresent(pickedTab);
            if (!currentPickHasChannel) {
                const channelExistIndex = _findIndex(notifyTabs, (tab) => handleIsChannelPresent(tab) === true);
                nextIndex = channelExistIndex !== -1 ? channelExistIndex : 0;
                nextTabName = notifyTabs[nextIndex]?.id;
            }
        }

        setTabState(notifyTabs);

        if (currentIndex === nextIndex && notificationTabName === nextTabName) {
            return;
        }

        dispatch(
            updateTab({
                field: 'notification',
                data: {
                    tabName: nextTabName ?? 'web',
                    currentIndex: nextIndex,
                },
            }),
        );
    }, [location, verticalType, currentIndex, notificationTabName, dispatch]);

    const handleIsChannelPresent = (currentMatchChannel) => {
        if (location?.campaignType === 'T') {
            if (location?.eligibleChannelType?.[8]?.length || location?.eligibleChannelType?.[14]?.length) {
                const finalUniqueChannels = [
                    ...new Set([
                        ...(location?.eligibleChannelType?.[8] ?? []),
                        ...(location?.eligibleChannelType?.[14] ?? []),
                    ]),
                ];
                const isChannelExist =
                    currentMatchChannel?.id === 'web' ? 8 : currentMatchChannel?.id === 'mobile' ? 14 : 0;
                const isExist = finalUniqueChannels?.includes(isChannelExist);
                return isExist;
            } else {
                return true;
            }
        } else {
            return true;
        }
    };

    return (
        <RSTabbar
            dynamicTab={`rs-sub-tabs rs-cc-sub-tabs`}
            activeClass={`active`}
            defaultTab={currentIndex}
            tabData={tabState}
            isTabChangeConfirmation={shouldShowAuthoringTabChangeConfirmation(isDirty)}
            callBack={(tabs, index) => {
                if (currentIndex !== index) {
                    userPickedSubTabRef.current = true;
                    dispatch(
                        updateTab({
                            field: 'notification',
                            data: {
                                tabName: !!tabs?.id ? tabs?.id : 'web',
                                currentIndex: index,
                            },
                        }),
                    );
                }
            }}
        />
    );
};

export default Notification;
