import { useEffect, useState } from 'react';
import RSTabbar from 'Components/RSTabber';
import { useLocation } from 'react-router-dom';
import { TABBER_CONFIG, WEB_FORM_ACTIONS_PORTAL_ID } from './constant';
import { get as _get } from 'Utils/modules/lodashReplacements';
import { getQuietHoursTabEntry } from '../../../Mail/Tabs/QuietHours/quietHoursTabEntry';
import { QUIET_HOURS_CHANNEL_KEYS } from '../../../Mail/Tabs/QuietHours/constant';
import { useSelector } from 'react-redux';

const Web = () => {
    const { state } = useLocation();
    const { webDomainCount } = useSelector(({ communicationSettingsReducer }) => communicationSettingsReducer || {});

    const [tabState, setTabState] = useState(_get(state, 'innerTab', 0));
    useEffect(() => {
        setTabState(state?.innerTab);
    }, [state?.innerTab]);

    return (
        <div className="rsv-tabs-content">
            <div className="box-design bd-top-border">
                <div className="tabs-right-align pageSub_tab pref-cs-notification-subtabs">
                    <RSTabbar
                        defaultClass={`col-md-2 tabTransparent `}
                        dynamicTab={`mb0 mini`}
                        activeClass={`active`}
                        tabData={[
                            TABBER_CONFIG[0],
                            ...getQuietHoursTabEntry(QUIET_HOURS_CHANNEL_KEYS.WEB),
                            TABBER_CONFIG[1],
                             { ...TABBER_CONFIG[2], disable: webDomainCount === 0 },
                        ]}
                        defaultTab={tabState}
                        className="rs-tabs row"
                        componentClassName="mt20"
                    />
                </div>
            </div>
            <div id={WEB_FORM_ACTIONS_PORTAL_ID} />
        </div>
    );
};

export default Web;
