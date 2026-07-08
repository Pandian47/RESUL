import { useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import RSTabbar from 'Components/RSTabber';
import { MAIL_TAB_CONFIG, shouldShowAuthoringTabChangeConfirmation } from '../../constant';
import { updateTab } from 'Reducers/communication/createCommunication/Create/reducer';
import useQueryParams from 'Hooks/useQueryParams';
import { getChannelId } from 'Utils/modules/communicationChannels';
import { getEnvironment } from 'Utils/modules/environment';

const Mail = () => {
    const dispatch = useDispatch();
    const locationState = useQueryParams();
    const {
        tabsState: {
            email: { currentIndex },
        },
        isDirty,
    } = useSelector(({ createCommunicationReducer }) => createCommunicationReducer);

    useEffect(() => {
        return () => {
            dispatch(
                updateTab({
                    field: 'email',
                    data: {
                        tabName: 'email',
                        currentIndex: 0,
                    },
                }),
            );
        };
    }, []);

    const finalMailTabConfig = useMemo(() => {
        const excludeDirectMailInRun = (config) =>
            getEnvironment() === 'RUN' ? config.filter((tab) => tab.id !== 'directMail') : config;

        if (locationState?.campaignType === 'T') {
            if (locationState?.eligibleChannelType?.[0]?.length) {
                const saveChannelListName = [];
                locationState?.eligibleChannelType?.[0]?.forEach((channels) => {
                    const getChannelName = getChannelId(channels);
                    // Map channel IDs to tab IDs: 1 -> 'email', 33 -> 'directMail'
                    let tabId = '';
                    if (channels === 33) {
                        tabId = 'directMail';
                    } else if (getChannelName?.tabName) {
                        tabId = getChannelName.tabName;
                    } else {
                        tabId = getChannelName?.label?.toLowerCase() || '';
                    }
                    saveChannelListName.push(tabId);
                });

                const updateMailConfig = MAIL_TAB_CONFIG.map((tab) => {
                    if (saveChannelListName.includes(tab.id)) {
                        return { ...tab, disable: false };
                    } else {
                        return { ...tab, disable: true };
                    }
                });

                const defaultItem = updateMailConfig.find((tab) => !tab.disable);

                const editFlowMatchChannel = locationState?.eligibleChannelType?.[0]?.some((channels) =>
                    locationState?.channels?.includes(channels),
                );
                if (defaultItem && !editFlowMatchChannel) {
                    dispatch(
                        updateTab({
                            field: 'email',
                            data: {
                                tabName: 'email',
                                currentIndex: updateMailConfig.findIndex((tab) => tab.id === defaultItem.id) ?? 0,
                            },
                        }),
                    );
                }

                return excludeDirectMailInRun(updateMailConfig);
            } else {
                // For Event Trigger campaigns without eligibleChannelType, remove Direct Mail tab
                return excludeDirectMailInRun(MAIL_TAB_CONFIG.filter((tab) => tab.id !== 'directMail'));
            }
        } else {
            return excludeDirectMailInRun(MAIL_TAB_CONFIG);
        }
    }, [locationState]);

    return (
        <RSTabbar
            dynamicTab={`rs-sub-tabs rs-cc-sub-tabs`}
            activeClass={`active`}
            defaultTab={currentIndex}
            tabData={finalMailTabConfig}
            isTabChangeConfirmation={shouldShowAuthoringTabChangeConfirmation(isDirty)}
            callBack={(tabs, index) => {
                if (currentIndex !== index) {
                    dispatch(
                        updateTab({
                            field: 'email',
                            data: {
                                tabName: tabs.id ?? 'email',
                                currentIndex: index,
                            },
                        }),
                    );
                }
            }}
        />
    );
};

export default Mail;
