import { useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import RSTabbar from 'Components/RSTabber';
import { MESSAGING_TAB_CONFIG } from '../../constant';
import { updateTab } from 'Reducers/communication/createCommunication/Create/reducer';
import useQueryParams from 'Hooks/useQueryParams';
import { getChannelId } from 'Utils/modules/communicationChannels';

const MessagingTab = () => {
    const dispatch = useDispatch();
    const locationState = useQueryParams();
    const {
        tabsState: {
            messaging: { currentIndex },
        },
        isDirty,
    } = useSelector(({ createCommunicationReducer }) => createCommunicationReducer);


    useEffect(() => {
        return () => {
            dispatch(
                updateTab({
                    field: 'messaging',
                    data: {
                        tabName: 'sms',
                        currentIndex: 0,
                    },
                }),
            );
        };
    }, []);

    const finalMessagingTabConfig = useMemo(() => {
        if (locationState?.campaignType === 'T' && locationState?.eligibleChannelType?.[2]?.length) {
            const saveChannelListName = [];
            locationState?.eligibleChannelType?.[2]?.forEach((channels) => {
                const getChannelName = getChannelId(channels);
                saveChannelListName.push(getChannelName?.label?.toLowerCase() || '');
            });

            const updateMessagingConfig = MESSAGING_TAB_CONFIG.map((tab) => {
                if (saveChannelListName.includes(tab.id)) {
                    return { ...tab, disable: false };
                } else {
                    return { ...tab, disable: true };
                }
            });

            const defaultItem = updateMessagingConfig.find((tab) => !tab.disable);

            const editFlowMatchChannel = locationState?.eligibleChannelType?.[2]?.some((channels) =>  locationState?.channels?.includes(channels));
            if (defaultItem && !editFlowMatchChannel) {
                dispatch(
                    updateTab({
                        field: 'messaging',
                        data: {
                            tabName: 'sms',
                            currentIndex: updateMessagingConfig.findIndex((tab) => tab.id === defaultItem.id) ?? 0,
                        },
                    }),
                );
            }

            return updateMessagingConfig;
        } else {
            return MESSAGING_TAB_CONFIG;
        }
    }, [locationState]);


    return (
        <RSTabbar
            dynamicTab={`rs-sub-tabs rs-cc-sub-tabs`}
            activeClass={`active`}
            defaultTab={currentIndex}
            tabData={finalMessagingTabConfig}
            isTabChangeConfirmation={isDirty}
            callBack={(tabs, index) => {
                if (currentIndex !== index) {
                    dispatch(
                        updateTab({
                            field: 'messaging',
                            data: {
                                tabName: tabs.id ?? 'sms',
                                currentIndex: index,
                            },
                        }),
                    );
                }
            }}
        />
    );
};

export default MessagingTab;
