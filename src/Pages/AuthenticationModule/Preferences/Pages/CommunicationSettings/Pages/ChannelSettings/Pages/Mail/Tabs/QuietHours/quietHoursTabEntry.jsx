import { useEffect } from 'react';
import { useDispatch } from 'react-redux';

import { QUIET_HOURS } from 'Constants/GlobalConstant/Placeholders';
import { update_isBUEnableSub } from 'Reducers/preferences/CommunicationSettings/reducer';

import QuietHours from './index';
import { QUIET_HOURS_CHANNEL_KEYS } from './constant';

const QuietHoursTabPanel = ({ channelKey }) => {
    const dispatch = useDispatch();
    const isEmbedded = channelKey !== QUIET_HOURS_CHANNEL_KEYS.EMAIL;

    useEffect(() => {
        if (!isEmbedded) return undefined;
        dispatch(update_isBUEnableSub(1));
        return () => {
            dispatch(update_isBUEnableSub(0));
        };
    }, [dispatch, isEmbedded]);

    return <QuietHours channelKey={channelKey} />;
};

export const getQuietHoursTabEntry = (channelKey) => {
    const resolvedKey = channelKey || QUIET_HOURS_CHANNEL_KEYS.EMAIL;

    return [
        {
            id: `quiet-hours-${resolvedKey}`,
            text: QUIET_HOURS,
            disable: false,
            component: () => <QuietHoursTabPanel channelKey={resolvedKey} />,
        },
    ];
};
