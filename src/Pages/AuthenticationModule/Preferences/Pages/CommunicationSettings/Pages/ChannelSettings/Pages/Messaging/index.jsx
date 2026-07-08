import RSTabbar from 'Components/RSTabber';
import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { MESSAGING_TABBER_CONFIG, resolveMessagingTabState, syncMessagingChannelTabQuery } from '../../constant';
import useQueryParams from 'Hooks/useQueryParams';

const Messaging = () => {
    const { state } = useLocation();
    const queryState = useQueryParams('/preferences/communication-settings');
    const [tabState, setTabState] = useState(() => resolveMessagingTabState({ ...queryState, ...state }));

    useEffect(() => {
        setTabState(resolveMessagingTabState({ ...queryState, ...state }));
    }, [state, queryState]);

    return (
        <RSTabbar
            dynamicTab={`rs-sub-tabs rs-cc-sub-tabs pref-tabber`}
            activeClass={`active`}
            defaultTab={tabState}
            tabData={MESSAGING_TABBER_CONFIG}
            callBack={(_, index) => {
                syncMessagingChannelTabQuery(index);
            }}
        />
    );
};

export default Messaging;
