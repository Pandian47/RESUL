import { useEffect, useState } from 'react';
import RSTabbar from 'Components/RSTabber';
import { MAIL_TABBER_CONFIG, resolveMailTabState, syncMailChannelTabQuery } from '../../constant';
import { useLocation } from 'react-router-dom';
import { update_isBUEnableSub } from 'Reducers/preferences/CommunicationSettings/reducer';
import { useDispatch } from 'react-redux';
import useQueryParams from 'Hooks/useQueryParams';

const Mail = () => {
    const { state } = useLocation();
    const queryState = useQueryParams('/preferences/communication-settings');
    const dispatch = useDispatch();
    const [tabState, setTabState] = useState(() => resolveMailTabState({ ...queryState, ...state }));

    useEffect(() => {
        setTabState(resolveMailTabState({ ...queryState, ...state }));
    }, [state, queryState]);

    return (
        <RSTabbar
            dynamicTab={`rs-sub-tabs rs-cc-sub-tabs`}
            activeClass={`active`}
            defaultTab={tabState}
            tabData={MAIL_TABBER_CONFIG}
            callBack={(_, index) => {
                syncMailChannelTabQuery(index);
                dispatch(update_isBUEnableSub(index));
            }}
        />
    );
};

export default Mail;
