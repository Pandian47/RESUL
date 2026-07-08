import { useEffect, useMemo, useState } from 'react';
import RSTabbar from 'Components/RSTabber';
import { useLocation } from 'react-router-dom';

import { getMobileTabConfig, MOBILE_FORM_ACTIONS_PORTAL_ID } from './constant';
import { resolveMobileInnerTabState, syncMobileInnerTabQuery } from '../../../../constant';
import { getQuietHoursTabEntry } from '../../../Mail/Tabs/QuietHours/quietHoursTabEntry';
import { QUIET_HOURS_CHANNEL_KEYS } from '../../../Mail/Tabs/QuietHours/constant';
import useQueryParams from 'Hooks/useQueryParams';

const Mobile = () => {
    const { state } = useLocation();
    const queryState = useQueryParams('/preferences/communication-settings');
    const navState = { ...queryState, ...state };
    const [tabState, setTabState] = useState(() => resolveMobileInnerTabState(navState));

    useEffect(() => {
        setTabState(resolveMobileInnerTabState({ ...queryState, ...state }));
    }, [queryState, state]);

    const tabConfig = useMemo(() => getMobileTabConfig(), []);

    const tabData = useMemo(() => {
        const lifetimeCapTab = tabConfig.find((tab) => tab.id === 'lifetimeCap');
        const tabsBeforeQuietHours = tabConfig.filter((tab) => tab.id !== 'lifetimeCap');

        return [
            ...tabsBeforeQuietHours,
            ...getQuietHoursTabEntry(QUIET_HOURS_CHANNEL_KEYS.MOBILE),
            lifetimeCapTab,
        ].filter(Boolean);
    }, [tabConfig]);

    return (
        <div className="rsv-tabs-content">
            <div className="box-design bd-top-border">
                <div className="tabs-right-align pageSub_tab pref-cs-notification-subtabs">
                    <RSTabbar
                        defaultClass={`col-md-2 tabTransparent `}
                        dynamicTab={`mb0 mini`}
                        activeClass={`active`}
                        tabData={tabData}
                        className="rs-tabs row"
                        componentClassName="mt20"
                        defaultTab={tabState}
                        callBack={(tab) => {
                            syncMobileInnerTabQuery(tab.id);
                        }}
                    />
                </div>
            </div>
            <div id={MOBILE_FORM_ACTIONS_PORTAL_ID} />
        </div>
    );
};

export default Mobile;
