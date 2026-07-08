import { useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';

import RSTabbar from 'Components/RSTabber';
import { getCSSMSGrid } from 'Reducers/preferences/CommunicationSettings/selector';
import { getSMPPTabConfig, SMS_VENDOR_FORM_ACTIONS_PORTAL_ID } from './constant';
import { getUserDetails } from 'Utils/modules/crypto';
import { getQuietHoursTabEntry } from '../../../Mail/Tabs/QuietHours/quietHoursTabEntry';
import { QUIET_HOURS_CHANNEL_KEYS } from '../../../Mail/Tabs/QuietHours/constant';
import { resolveSmsInnerTabState, syncSmsInnerTabQuery } from '../../../../constant';
import useQueryParams from 'Hooks/useQueryParams';

const SMS = () => {
    const { state } = useLocation();
    const queryState = useQueryParams('/preferences/communication-settings');
    const navState = { ...queryState, ...state };
    const smsGrid = useSelector((state) => getCSSMSGrid(state));
    const { clientCountryId } = getUserDetails() ?? {};
    const [isKeywordManagementEnabled, setIsKeywordManagementEnabled] = useState(false);
    const [tabState, setTabState] = useState(() => resolveSmsInnerTabState(navState));
    const isKeywordCountryEligible = Number(clientCountryId) === 2; // USA

    useEffect(() => {
        if (isKeywordCountryEligible && smsGrid?.length > 0) {
            setIsKeywordManagementEnabled(true);
        }
    }, [smsGrid, isKeywordCountryEligible]);

    useEffect(() => {
        setTabState(resolveSmsInnerTabState({ ...queryState, ...state }));
    }, [queryState, state]);

    const tabConfig = useMemo(() => getSMPPTabConfig(isKeywordManagementEnabled), [isKeywordManagementEnabled]);

    const tabData = useMemo(() => {
        const lifetimeCapTab = tabConfig.find((tab) => tab.id === 'lifetimeCap');
        const tabsBeforeQuietHours = tabConfig.filter((tab) => tab.id !== 'lifetimeCap');
        return [...tabsBeforeQuietHours, ...getQuietHoursTabEntry(QUIET_HOURS_CHANNEL_KEYS.SMS), lifetimeCapTab].filter(
            Boolean,
        );
    }, [tabConfig]);

    return (
        <div className="rsv-tabs-content">
            <div className="box-design bd-top-border">
                <div className="tabs-right-align pageSub_tab">
                    <RSTabbar
                        defaultClass={`col-md-2 tabTransparent `}
                        dynamicTab={`mb0 mini`}
                        activeClass={`active`}
                        tabData={tabData}
                        className="rs-tabs row"
                        componentClassName={'mt20'}
                        defaultTab={tabState}
                        callBack={(tab) => {
                            syncSmsInnerTabQuery(tab.id);
                        }}
                    />
                </div>
            </div>
            <div id={SMS_VENDOR_FORM_ACTIONS_PORTAL_ID} />
        </div>
    );
};

export default SMS;
