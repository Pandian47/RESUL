import { encodeUrl, getUserDetails } from 'Utils/modules/crypto';
import { useCallback, useMemo } from 'react';
import { Container } from 'react-bootstrap';
import { useLocation, useNavigate } from 'react-router-dom';
import RSTabbarFluid from 'Components/RSTabberFluid';
import RSPageHeader from 'Components/RSPageHeader';

import { getSessionId } from 'Reducers/globalState/selector';
import { useSelector } from 'react-redux';
import { tabData, tabDataTwins } from './constants';
import useQueryParams from 'Hooks/useQueryParams';
import _get from 'lodash/get';
const CommunicationListGallery = () => {
    const navigate = useNavigate();
    const { pathname, state } = useLocation();
    const location = useQueryParams('/communication');
    const { licenseTypeId } = getUserDetails();
    const { departmentName } = useSelector((state) => getSessionId(state) ?? {});

    const isTwinsPath = pathname?.includes('twins');
    const isTabDisabled = departmentName?.toLowerCase() === 'all' && licenseTypeId === '3';

    const config_Tab = useMemo(() => {
        const base = isTwinsPath ? tabDataTwins : tabData;
        return base.map((tab) => ({ ...tab, disable: !!isTabDisabled }));
    }, [isTwinsPath, isTabDisabled]);

    const stateIndex = typeof state === 'object' && state !== null ? _get(state, 'index', null) : null;
    const locationIndex = typeof location === 'object' && location !== null ? _get(location, 'index', null) : null;
    const config_TabURL = stateIndex ?? locationIndex ?? 0;

    const handleTabChange = useCallback(
        (_, index) => {
            const url = isTwinsPath ? '/communicationTwins' : '/communication';
            const encryptState = encodeUrl({ index: Number(index) });
            navigate(`${url}?q=${encryptState}`, { state: { index } });
        },

        [navigate, isTwinsPath]
    );

    return (
        <div className="page-content-holder">
            <RSPageHeader title="Communication" isTabber rightCommonMenus />

            <div className="pc-tabs-wrapper">
                <div className="page-content pc-communication-plan">
                    <Container fluid>
                        <div className="page-content">
                            <RSTabbarFluid
                                defaultClass={`col-md-4`}
                                dynamicTab={`mb0 mini rst-left-space`}
                                activeClass={`active`}
                                tabData={config_Tab}
                                className="rs-tabs row"
                                defaultTab={config_TabURL}
                                callBack={handleTabChange}
                            />
                        </div>
                    </Container>
                </div>
            </div>
            {/* Main page content block ends */}
        </div>
        // Content holder ends
    );
};

export default CommunicationListGallery;
