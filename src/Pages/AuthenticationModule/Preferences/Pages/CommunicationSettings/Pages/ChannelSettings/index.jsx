import { useEffect, useLayoutEffect, useState } from 'react';
import RSTabbar from 'Components/RSTabber';

import useQueryParams from 'Hooks/useQueryParams';
import { VERTICAL_TAB_CONFIG, resolveVerticalTabState } from './constant';
import { useLocation } from 'react-router-dom';
import { update_isBUEnablePush, update_isBUEnableAds } from 'Reducers/preferences/CommunicationSettings/reducer';
import { useDispatch } from 'react-redux';
import { endCommunicationSettingsRouteSkeletonBootstrap } from 'Components/Skeleton/Components/PreferencesSubPageRouteSkeleton';

const ChannelSettings = () => {
    const dispatch = useDispatch();
    const { state } = useLocation();
    const queryState = useQueryParams('/preferences/communication-settings');
    const [tabState, setTabState] = useState(() =>
        resolveVerticalTabState({ ...queryState, ...state }),
    );

    useLayoutEffect(() => {
        endCommunicationSettingsRouteSkeletonBootstrap();
    }, []);

    useEffect(() => {
        setTabState(resolveVerticalTabState({ ...queryState, ...state }));
    }, [queryState, state]);
    return (
        <div className="mt30">
            <div className="rs-vertical-tabs-wrapper">
                <RSTabbar
                    dynamicTab="vertical-tabs rsv-tabs-list mt87"
                    activeClass="active"
                    tabData={VERTICAL_TAB_CONFIG}
                    //  defaultTab={0}
                    defaultTab={tabState}
                    callBack={(_, index) => {
                        dispatch(update_isBUEnablePush(index));
                        dispatch(update_isBUEnableAds(index));
                    }}
                />
            </div>
        </div>
    );
};

export default ChannelSettings;
