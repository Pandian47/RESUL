import { encodeUrl } from 'Utils/modules/crypto';
import { useEffect, useLayoutEffect, useState } from 'react';
import _get from 'lodash/get';
import { Container } from 'react-bootstrap';
import { useLocation, useNavigate } from 'react-router-dom';
import RSPageHeader from 'Components/RSPageHeader';
import RSTabbarFluid from 'Components/RSTabberFluid';
import ChannelSettings from './Pages/ChannelSettings';
import FrequencyCap from './Pages/FrequencyCap';
import GoalsAndBenchmark from '../../Pages/GoalsAndBenchmark';
import { useDispatch, useSelector } from 'react-redux';
import {
    resetCommunicationSettings,
    update_isBUEnablePush,
    update_isBUEnableSub,
    update_isBUEnableAds,
} from 'Reducers/preferences/CommunicationSettings/reducer';
import useQueryParams from 'Hooks/useQueryParams';

import {
    endCommunicationSettingsRouteSkeletonBootstrap,
} from 'Components/Skeleton/Components/PreferencesSubPageRouteSkeleton';
import { communicationSettingsSkeletonCriticalCss } from 'Components/Skeleton/Components/preferencesSkeletonCriticalCss';

const CommunicationSettings = () => {
    const dispatch = useDispatch();
    const { pathname, state } = useLocation();
    const location = useQueryParams('/preferences/communication-settings');
    const { isBUEnableSub = 0, isBUEnablePush = 0, disableBU = false, isBUEnableAds = 0 } = useSelector(
        (state) => state.communicationSettingsReducer ?? {},
    );

    const [tabConfig, setTabConfig] = useState(location?.tab ?? 0);

    useLayoutEffect(() => {
        endCommunicationSettingsRouteSkeletonBootstrap();
    }, []);

    useEffect(() => {
        if (state?.from === 'benchmark' || new URLSearchParams(window.location.search).get('isBenchMark')) {
            setTabConfig(2);
        }
        return () => {
            dispatch(update_isBUEnablePush(0));
            dispatch(update_isBUEnableSub(0));
            dispatch(update_isBUEnableAds(0));
        };
    }, [pathname, state?.from]);
    const navigate = useNavigate();
    useEffect(() => {
        return () => {
            dispatch(resetCommunicationSettings());
        };
    }, []);

    // if (location && state) {
    //     return useEffect(() => {
    //         if (typeof state === 'object' && state !== null) {
    //             setTabConfig(_get(state, 'tab', 0));
    //         } else if (typeof location === 'object' && location !== null) {
    //             setTabConfig(_get(location, 'tab', 0));
    //         } else if (!state && !location && pathname === '/preferences/communication-settings') {
    //             setTabConfig(_get(state, 'tab', 0));
    //             setTabConfig(_get(location, 'tab', 0));
    //         }
    //     }, [
    //         state && typeof state === 'object' ? state : null,
    //         location && typeof location === 'object' ? location : null,
    //     ]);
    // }

    useEffect(() => {
        if (state && typeof state === 'object' && _get(state, 'tab') !== undefined) {
            setTabConfig((prevTab) => (prevTab !== _get(state, 'tab', 0) ? _get(state, 'tab', 0) : prevTab));
        } else if (location && typeof location === 'object' && _get(location, 'tab') !== undefined) {
            setTabConfig((prevTab) => (prevTab !== _get(location, 'tab', 0) ? _get(location, 'tab', 0) : prevTab));
        } else if (pathname === '/preferences/communication-settings' && tabConfig === null) {
            setTabConfig(0);
        }
    }, [state, location, pathname, tabConfig]);

    return (
        // Contend holder starts
        <div className="page-content-holder">
            {/* Main page heading block starts */}
            <RSPageHeader
                title="Communication settings"
                isBack
                backPath="/preferences"
                isTabber
                rightCommonMenus={tabConfig !== 0 || isBUEnableSub === 0 || isBUEnableSub === 1 ||
                     isBUEnableSub === 2 || isBUEnableSub === 4 || isBUEnablePush === 2 || isBUEnableAds === 3}
                //isHeaderLine
                isBuDisabled={disableBU}
                isAgencyDisabled={disableBU}
            />
            {/* Main page heading block ends */}

            {/* Main page content block starts */}
            <Container fluid>
                <div className="page-content pc-communication-settings isVerticalTabbar">
                    <style>{communicationSettingsSkeletonCriticalCss}</style>
                    <RSTabbarFluid
                        defaultClass={`col-sm-4`}
                        dynamicTab={`mb0 mini`}
                        activeClass={`active`}
                        className="rs-tabs row rst-left-space"
                        // defaultTab={0}
                        defaultTab={tabConfig ?? 0}
                        callBack={(_, index) => {
                            let url = '/preferences/communication-settings';
                            const state1 = { tab: Number(index) };
                            const encryptState = encodeUrl(state1);
                            navigate(`${url}?q=${encryptState}`, {
                                state1,
                            });
                        }}
                        tabData={[
                            {
                                id: 'ChannelSettings',
                                text: 'Communication settings',
                                component: () => <ChannelSettings />,
                            },
                            {
                                id: 'FrequencyCap',
                                text: 'Frequency cap',
                                component: () => <FrequencyCap />,
                            },
                            {
                                id: 'GoalsAndBenchmark',
                                text: 'Goals & benchmark',
                                component: () => <GoalsAndBenchmark />,
                            },
                        ]}
                    />
                </div>
            </Container>
            {/* Main page content block ends */}
        </div>
        // Content holder ends
    );
};

export default CommunicationSettings;
