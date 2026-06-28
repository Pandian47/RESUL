import { getChannelId } from 'Utils/modules/communicationChannels';
import { formatName } from 'Utils/modules/formatters';
import RSTabbar from 'Components/RSTabber';

import { Container } from 'react-bootstrap';
import RSPageHeader from 'Components/RSPageHeader';
import { LANDING_TAB_CONFIG } from './AnalyticsTabConfig';
import { createContext, useEffect, useState } from 'react';
import useQueryParams from 'Hooks/useQueryParams';

export const ConfigureAnalyticsProvider = createContext({});
const ConfigureAnalytics = () => {
    const [defaultTabIndex, setDefaultTabIndex] = useState(0);
    const contextValue = {
        setDefaultTabIndex,
    };
    const locationState = useQueryParams('/communication');
    const [tabData, setTabData] = useState(LANDING_TAB_CONFIG);

    useEffect(() => {
        if (!locationState) return;

        const { analyticsTypes = [] } = locationState;
        const userTabs = analyticsTypes.map((id) => {
            const { label } = getChannelId(id === 1001 ? 'offline conversion' : id);
            return formatName(label.toLowerCase());
        });

        const updateTabData = tabData?.map((data, index) => {
            return {
                ...data,
                disable: index !== 0 && !userTabs?.filter((tabs) => tabs !== 'app')?.includes(data?.id),
            };
        });
        setTabData(updateTabData);
    }, [locationState]);

    return (
        <ConfigureAnalyticsProvider.Provider value={contextValue}>
            <div className="page-content-holder">
                {/* Main page heading block starts */}
                <RSPageHeader title="Landing page preferences" />
                {/* Main page heading block ends */}

                {/* Main page content block starts */}
                <Container className="page-content px0">
                    <RSTabbar
                        dynamicTab={`rs-sub-tabs rs-cc-sub-tabs`}
                        activeClass={`active`}
                        defaultTab={defaultTabIndex}
                        tabData={tabData}
                        callBack={(tabs, index) => {}}
                    />
                </Container>
            </div>
        </ConfigureAnalyticsProvider.Provider>
    );
};

export default ConfigureAnalytics;
