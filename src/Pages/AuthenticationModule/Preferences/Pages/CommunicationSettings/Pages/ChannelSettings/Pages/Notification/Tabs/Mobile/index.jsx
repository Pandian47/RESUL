
import RSTabbar from 'Components/RSTabber';

import { MOBILE_TABBER_CONFIG, MOBILE_FORM_ACTIONS_PORTAL_ID } from './constant';
import { getQuietHoursTabEntry } from '../../../Mail/Tabs/QuietHours/quietHoursTabEntry';
import { QUIET_HOURS_CHANNEL_KEYS } from '../../../Mail/Tabs/QuietHours/constant';

const Mobile = () => {
    return (
        <div className="rsv-tabs-content">
            <div className="box-design bd-top-border">
                <div className="tabs-right-align pageSub_tab pref-cs-notification-subtabs">
                    <RSTabbar
                        defaultClass={`col-md-2 tabTransparent `}
                        dynamicTab={`mb0 mini`}
                        activeClass={`active`}
                        tabData={[
                            ...MOBILE_TABBER_CONFIG.slice(0, -1),
                            ...getQuietHoursTabEntry(QUIET_HOURS_CHANNEL_KEYS.MOBILE),
                            MOBILE_TABBER_CONFIG[MOBILE_TABBER_CONFIG.length - 1],
                        ]}
                        className="rs-tabs row"
                        componentClassName="mt20"
                        defaultTab={0}
                    />
                </div>
            </div>
            <div id={MOBILE_FORM_ACTIONS_PORTAL_ID} />
        </div>
    );
};

export default Mobile;
