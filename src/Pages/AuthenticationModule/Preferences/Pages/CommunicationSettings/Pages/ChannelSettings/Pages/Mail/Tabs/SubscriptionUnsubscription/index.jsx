import { useEffect, useState } from 'react';
import RSTabbar from 'Components/RSTabber';
import { useLocation } from 'react-router-dom';
import { SUB_UNSUB_TABBER_CONFIG } from './constants.jsx';
import { update_isBUEnableSub } from 'Reducers/preferences/CommunicationSettings/reducer.js';
import { useDispatch } from 'react-redux';

const SubscriptionUnsubscription = () => {
    const { state } = useLocation();
    const dispatch = useDispatch();
    const [tabState, setTabState] = useState(0);
    useEffect(() => {
        if (state !== null)
            if(state?.tab === 0){
                setTabState(0)
            }
            else if (state?.subTab) setTabState(0);
            else if (!state?.subTab) setTabState(1);
            else setTabState(0);
    }, [state]);
    useEffect(() => {
        return (() => {
            dispatch(update_isBUEnableSub(0));
        })
    },[])
    return (
        <div className="rsv-tabs-content">
            <div className="box-design bd-top-border">
                {/* Content starts */}
                <div className="tabs-right-align pageSub_tab">
                    <RSTabbar
                        defaultClass={`col-md-2 tabTransparent `}
                        dynamicTab={`mb0 mini`}
                        activeClass={`active`}
                        tabData={SUB_UNSUB_TABBER_CONFIG}
                        className="rs-tabs row"
                        componentClassName={'mt20'}
                        // defaultTab={0}
                        defaultTab={tabState}
                    />
                </div>
                {/* /Content ends */}
            </div>
        </div>
    );
};

export default SubscriptionUnsubscription;
