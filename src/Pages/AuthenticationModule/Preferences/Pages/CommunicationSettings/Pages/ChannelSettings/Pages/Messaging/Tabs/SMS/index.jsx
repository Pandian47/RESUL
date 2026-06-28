import { useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';

import RSTabbar from 'Components/RSTabber';
import { getCSSMSGrid } from 'Reducers/preferences/CommunicationSettings/selector';
import { getSMPPTabConfig, SMS_VENDOR_FORM_ACTIONS_PORTAL_ID } from './constant';
import { getUserDetails } from 'Utils/modules/crypto';
import { getQuietHoursTabEntry } from '../../../Mail/Tabs/QuietHours/quietHoursTabEntry';
import { QUIET_HOURS_CHANNEL_KEYS } from '../../../Mail/Tabs/QuietHours/constant';

const SMS = () => {
    const smsGrid = useSelector((state) => getCSSMSGrid(state));
    const { clientCountryId } = getUserDetails() ?? {};
    const isKeywordCountryEligible = Number(clientCountryId) === 2; // USA
    const [isKeywordManagementEnabled, setIsKeywordManagementEnabled] = useState(false);

    useEffect(() => {
        if (isKeywordCountryEligible && smsGrid?.length > 0) {
            setIsKeywordManagementEnabled(true);
        }
    }, [smsGrid, isKeywordCountryEligible]);

    const tabConfig = useMemo(() => getSMPPTabConfig(isKeywordManagementEnabled), [isKeywordManagementEnabled]);

    return (
        <div className="rsv-tabs-content">
            <div className="box-design bd-top-border">
                <div className="tabs-right-align pageSub_tab">
                    <RSTabbar
                        defaultClass={`col-md-2 tabTransparent `}
                        dynamicTab={`mb0 mini`}
                        activeClass={`active`}
                        tabData={[
                            ...tabConfig.slice(0, -1),
                            ...getQuietHoursTabEntry(QUIET_HOURS_CHANNEL_KEYS.SMS),
                            tabConfig[tabConfig.length - 1],
                        ]}
                        className="rs-tabs row"
                        componentClassName={'mt20'}
                    />
                </div>
            </div>
            <div id={SMS_VENDOR_FORM_ACTIONS_PORTAL_ID} />
        </div>
    );
};

export default SMS;
