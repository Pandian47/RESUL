import { useEffect, useState } from 'react';
import RSTabbar from 'Components/RSTabber';
import { useLocation } from 'react-router-dom';
import { SUB_UNSUB_TABBER_CONFIG } from './constants.jsx';
import { resolveSubUnsubInnerTabState, syncSubUnsubInnerTabQuery } from '../../../../constant';
import { update_isBUEnableSub } from 'Reducers/preferences/CommunicationSettings/reducer.js';
import { useDispatch } from 'react-redux';
import useQueryParams from 'Hooks/useQueryParams';

const SubscriptionUnsubscription = () => {
    const { state } = useLocation();
    const queryState = useQueryParams('/preferences/communication-settings');
    const dispatch = useDispatch();
    const navState = { ...queryState, ...state };
    const [tabState, setTabState] = useState(() => resolveSubUnsubInnerTabState(navState));

    useEffect(() => {
        setTabState(resolveSubUnsubInnerTabState({ ...queryState, ...state }));
    }, [queryState, state]);

    useEffect(() => {
        return () => {
            dispatch(update_isBUEnableSub(0));
        };
    }, []);

    return (
        <div className="rsv-tabs-content">
            <div className="box-design bd-top-border">
                <div className="tabs-right-align pageSub_tab">
                    <RSTabbar
                        defaultClass={`col-md-2 tabTransparent `}
                        dynamicTab={`mb0 mini`}
                        activeClass={`active`}
                        tabData={SUB_UNSUB_TABBER_CONFIG}
                        className="rs-tabs row"
                        componentClassName={'mt20'}
                        defaultTab={tabState}
                        callBack={(tab) => {
                            syncSubUnsubInnerTabQuery(tab.id);
                        }}
                    />
                </div>
            </div>
        </div>
    );
};

export default SubscriptionUnsubscription;
