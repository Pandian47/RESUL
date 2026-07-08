import { useEffect, useMemo, useState } from 'react';
import RSTabbar from 'Components/RSTabber';
import { useLocation } from 'react-router-dom';
import { getWebTabConfig, WEB_FORM_ACTIONS_PORTAL_ID } from './constant';
import { resolveWebInnerTabState, syncWebInnerTabQuery } from '../../../../constant';
import { getQuietHoursTabEntry } from '../../../Mail/Tabs/QuietHours/quietHoursTabEntry';
import { QUIET_HOURS_CHANNEL_KEYS } from '../../../Mail/Tabs/QuietHours/constant';
import { useSelector } from 'react-redux';
import useQueryParams from 'Hooks/useQueryParams';

const Web = () => {
    const { state } = useLocation();
    const queryState = useQueryParams('/preferences/communication-settings');
    const navState = { ...queryState, ...state };
    const { webDomainCount } = useSelector(({ communicationSettingsReducer }) => communicationSettingsReducer || {});

    const [tabState, setTabState] = useState(() => resolveWebInnerTabState(navState));

    useEffect(() => {
        setTabState(resolveWebInnerTabState({ ...queryState, ...state }));
    }, [queryState, state]);

    const tabConfig = useMemo(() => getWebTabConfig(), []);

    const tabData = useMemo(() => {
        const lifetimeCapTab = tabConfig.find((tab) => tab.id === 'lifetimeCap');
        const customEventsTab = tabConfig.find((tab) => tab.id === 'customEvents');
        const tabsBeforeQuietHours = tabConfig.filter(
            (tab) => tab.id !== 'lifetimeCap' && tab.id !== 'customEvents',
        );

        return [
            ...tabsBeforeQuietHours,
            ...getQuietHoursTabEntry(QUIET_HOURS_CHANNEL_KEYS.WEB),
            lifetimeCapTab,
            customEventsTab ? { ...customEventsTab, disable: webDomainCount === 0 } : null,
        ].filter(Boolean);
    }, [tabConfig, webDomainCount]);

    return (
        <div className="rsv-tabs-content">
            <div className="box-design bd-top-border">
                <div className="tabs-right-align pageSub_tab pref-cs-notification-subtabs">
                    <RSTabbar
                        defaultClass={`col-md-2 tabTransparent `}
                        dynamicTab={`mb0 mini`}
                        activeClass={`active`}
                        tabData={tabData}
                        defaultTab={tabState}
                        className="rs-tabs row"
                        componentClassName="mt20"
                        callBack={(tab) => {
                            syncWebInnerTabQuery(tab.id);
                        }}
                    />
                </div>
            </div>
            <div id={WEB_FORM_ACTIONS_PORTAL_ID} />
        </div>
    );
};

export default Web;
