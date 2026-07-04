import { encodeUrl } from 'Utils/modules/crypto';
import { useEffect, useState } from 'react';
import { Container } from 'react-bootstrap';
import RSPageHeader from 'Components/RSPageHeader';
import RSTabbarFluid from 'Components/RSTabberFluid';
import { useLocation, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { getSessionId } from 'Reducers/globalState/selector';
import { ANALYTICS_TAB_CONFIG } from './constants';

import { get as _get } from 'Utils/modules/lodashReplacements';
import useQueryParams from 'Hooks/useQueryParams';

const Analytics = () => {
    const navigate = useNavigate();
    const { state } = useLocation();
    const locationQuery = useQueryParams('/analytics');
    const { departmentName } = useSelector((state) => getSessionId(state));

    const [config_Tab, setConfig_tab] = useState(ANALYTICS_TAB_CONFIG);
    const [activeTab, setActiveTab] = useState(locationQuery ? locationQuery.index : 0);

    // Disable logic based on department & license
    const getDisable = (cond) => {
        const temp = ANALYTICS_TAB_CONFIG.map((e) => ({
            ...e,
            disable: !!cond,
        }));
        setConfig_tab(temp);
    };

    useEffect(() => {
        if (departmentName?.toLowerCase() === 'all' && licenseTypeId === '3') {
            getDisable(1);
        } else {
            getDisable(0);
        }
    }, [departmentName]);

    // Sync tab from state or query param
    useEffect(() => {
        if (typeof state === 'object' && state !== null) {
            setActiveTab(_get(state, 'index', 0));
        } else if (typeof locationQuery === 'object' && locationQuery !== null) {
            setActiveTab(_get(locationQuery, 'index', 0));
        }
    }, [
        state && typeof state === 'object' ? state : null,
        locationQuery && typeof locationQuery === 'object' ? locationQuery : null,
    ]);

    return (
        <div className="page-content-holder">
            <RSPageHeader title={config_Tab?.[activeTab]?.text || 'Analytics'} isTabber rightCommonMenus />

            <div className="pc-tabs-wrapper">
                <div className="page-content pc-analytics">
                    <Container fluid>
                        <div className="page-content">
                            <RSTabbarFluid
                                defaultClass="col-md-4"
                                dynamicTab="mb0 mini rst-left-space"
                                activeClass="active"
                                tabData={config_Tab}
                                className="rs-tabs row"
                                defaultTab={activeTab}
                                callBack={(_, index) => {
                                    const stateData = { index: Number(index) };
                                    const encrypted = encodeUrl(stateData);

                                    navigate(`/analyticsTwins?q=${encrypted}`, {
                                        state: { index },
                                    });
                                    setActiveTab(index);
                                }}
                            />
                        </div>
                    </Container>
                </div>
            </div>
        </div>
    );
};

export default Analytics;
