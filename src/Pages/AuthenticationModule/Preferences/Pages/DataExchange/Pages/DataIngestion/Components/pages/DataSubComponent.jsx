import { encodeUrl, decryptWithAES } from 'Utils/modules/crypto';
import { getUserCurrentFormat, convertToUserTimezone, convertUTCtoUserTimezone, getDateWithDaynoFormat } from 'Utils/modules/dateTime';
import { ALREADY_INTEGRATED, EDIT, INFO, OK, VIEW } from 'Constants/GlobalConstant/Placeholders';
import { circle_arrow_up_fill_large, circle_plus_fill_medium, eye_medium, pencil_edit_medium, user_call_center_xlarge, webhook_xlarge } from 'Constants/GlobalConstant/Glyphicons';
import { Fragment, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Card, Col, ListGroup, Row } from 'react-bootstrap';
import OneLineSDKModal from '../OneLineSDK/OnelineSDKModal';
import { useDispatch, useSelector } from 'react-redux';
import { updateIntegartedSytem } from 'Reducers/preferences/DataExchange/reducer';
import ViewDataComponent from './ViewDataComponent';
import GenerateCodeModal from '../DataExchangeModals/Common/GenerateCodeModal';
import RSTooltip from 'Components/RSTooltip';
// import ViewDataComponent from './ViewDataComponent';
import { getSessionId, getUtcTimeData } from 'Reducers/globalState/selector';
import Image_placeholder from 'Assets/Images/data_exchange/image-placeholder.svg';
import { CustomSkeleton } from 'Components/Skeleton/Components/SkeletonOverall';
import {
    getDataExchangeElements,
    getAccessTokens,
    get_ConnectorDetails,
    get_FacebookPages,
    get_TwitterUserDetails,
    save_SocialUserSetup,
    get_LinkedinAccessToken,
    get_LinkedinPages,
    get_InstagramAccounts,
    get_PinterestAccessToken,
    get_PinterestBoardsList,
    GetFacebookAdsList,
    RenxtTokenValidation,
    GetGoogleAdsList,
    GetYoutubeAccountsList,
} from 'Reducers/preferences/DataExchange/request';
import { uniq as _uniq } from 'Utils/modules/lodashReplacements';


import { parseDecryptedAudienceQuery } from 'Pages/AuthenticationModule/Audience/audienceDefaults';
import { navigateBackToCommunicationSocialPostAsync } from 'Pages/AuthenticationModule/Communication/CreateCommunication/communicationDefaults';
import SocialMedia from '../DataExchangeModals/SocialMedia';
import { DataExchangeIntegratedSystemsGridSkeleton } from 'Components/Skeleton/Components/PreferencesSubPageRouteSkeleton';

import AdobeAnalyticsModal from '../DataExchangeModals/Analytics/AdobeAnalitycs';
import ResulAnalyticsModal from '../DataExchangeModals/Analytics/ResulWebAnalytics';
import RSConfirmationModal from 'Components/ConfirmationModal';
import RSAdvanceSearch from 'Components/AdvanceSearch';
import { LAST30DAYS_DATEFILTER } from 'Constants/GlobalConstant/Regex';
import IntegratedSystemsConnectionsModal from '../DataExchangeModals/Common/IntegratedSystemsConnectionsModal';
import {
    INTEGRATED_NOSQL_CONNECTOR_IDS,
    INTEGRATED_SQL_CONNECTOR_IDS,
} from '../../../../../../../Audience/Pages/AddAudience/Components/RemoteDataSourceNew/Components/constants';

const groupConnectionsByRemoteDataSourceId = (items) => {
    if (!items?.length) return [];
    const map = new Map();
    items.forEach((item, index) => {
        const id = item?.remoteDataSourceID;
        const key =
            id === undefined || id === null ? `__single_${item?.remoteSettingId ?? `idx_${index}`}` : String(id);
        if (!map.has(key)) map.set(key, []);
        map.get(key).push(item);
    });
    return Array.from(map.values()).map((connections) => ({
        remoteDataSourceID: connections[0]?.remoteDataSourceID,
        connections,
    }));
};

const DataSubComponent = ({ subTab, type, isAudience }) => {
    const navigate = useNavigate();
    const itemRef = useRef(null);
    const {
        integratedSystem,
        socialMediaFlag_insta,
        socialMediaFlag_twitter,
        socialMediaFlag_linkedin,
        socialMediaFlag_fb,
        alreadyIntegrated,
        connectorList,
        GetRemoteConnectionActive = [],
        integratedSysLoading,
    } = useSelector(({ dataExchangeReducer }) => dataExchangeReducer);

    const utcTimeData = useSelector((state) => getUtcTimeData(state));
    const currentUTCdateTime = utcTimeData.utcTime ? new Date(utcTimeData.utcTime.replace('Z', '')) : new Date();
    const getTimezoneAdjustedStartDate = () => {
        let baseDate;
        if (utcTimeData.utcTime) {
            baseDate = new Date(currentUTCdateTime);
            baseDate.setDate(baseDate.getDate() + LAST30DAYS_DATEFILTER); // Adding -29 is same as subtracting 29
        } else {
            baseDate = new Date(getDateWithDaynoFormat(LAST30DAYS_DATEFILTER));
        }

        if (utcTimeData.utcTime) {
            return convertUTCtoUserTimezone(baseDate);
        }
        return convertToUserTimezone(baseDate, { formatAsString: false });
    };

    const getTimezoneAdjustedEndDate = () => {
        if (utcTimeData.utcTime) {
            return convertUTCtoUserTimezone(currentUTCdateTime);
        }
        const systemEndDate = new Date();
        return convertToUserTimezone(systemEndDate, { formatAsString: false });
    };

    const { clientId, departmentId, userId } = useSelector((state) => getSessionId(state));
    const [oneLineSDKFlag, setOneLineSDKFlag] = useState(false);
    const [activeConnection, setActiveConnection] = useState([]);
    const groupedActiveConnection = useMemo(
        () => groupConnectionsByRemoteDataSourceId(activeConnection || []),
        [activeConnection],
    );

    const [integratedSystemsModal, setIntegratedSystemsModal] = useState({
        show: false,
        connections: [],
        title: '',
        editingRowKey: null,
    });
    const [dateRange, setDateRange] = useState({
        startDate: getTimezoneAdjustedStartDate(),
        endDate: getTimezoneAdjustedEndDate(),
    });

    const [searchCriteria, setSearchCriteria] = useState({ type: 'Friendly name', text: '' });
    const [generateCodeFlag, setGenerateCodeFlage] = useState(false);
    const [isClearSearchText, setIsClearSearchText] = useState(false);
    const openOneLineSDK = () => {
        setOneLineSDKFlag(true);
    };
    const dispatch = useDispatch();
    const location = useLocation();
    const pathName = location?.pathname?.split('/')?.pop();

    const originalSubTabRef = useRef(subTab);
    const [filteredSubTab, setFilteredSubTab] = useState(subTab);

    useEffect(() => {
        originalSubTabRef.current = subTab;
        if (!searchCriteria?.text || searchCriteria.text.trim() === '') {
            setFilteredSubTab(subTab);
        }
    }, [subTab]);

    const viewData = Object.keys(filteredSubTab);
    const hasMounted = useRef(false);
    useEffect(() => {
        if (hasMounted.current) {
            if (itemRef.current) {
                const offset = 50;
                const scrollToPosition = itemRef.current.getBoundingClientRect().top + window.scrollY - offset;
                window.scrollTo({
                    top: scrollToPosition,
                    behavior: 'smooth',
                });
            }
        } else {
            setTimeout(() => {
                hasMounted.current = true;
            }, 1000);
        }
        setIsClearSearchText(true);
    }, [type]);
    const latestConnectionsRef = useRef([]);
    useEffect(() => {
        if (GetRemoteConnectionActive?.length > 0 || Object.keys(filteredSubTab || {}).length > 0) {
            const filtered = applyFilters(dateRange, searchCriteria);
            latestConnectionsRef.current = filtered || [];
        }
    }, [type, filteredSubTab, GetRemoteConnectionActive]);

    // useEffect(() => {
    //     latestConnectionsRef.current = GetRemoteConnectionActive || [];
    // }, [GetRemoteConnectionActive]);
    const [showBackToTop, setShowBackToTop] = useState(false);

    const handleScroll = () => {
        const scrolledY = window.scrollY;
        const viewportHeight = window.innerHeight;
        const documentHeight = document.documentElement.scrollHeight;
        const scrollPercent = (scrolledY / (documentHeight - viewportHeight)) * 100;
        setShowBackToTop(scrollPercent > 30);
    };
    useEffect(() => {
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);
    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth',
        });
    };

    const handleRemove = (ind) => {
        let _integratedSystem = [...integratedSystem];
        _integratedSystem.splice(ind, 1);
        dispatch(updateIntegartedSytem({ field: 'integratedSystem', data: _integratedSystem }));
    };

    const handleSocialMedia = async (params, socialPage) => {
        let socialmediaUniqueID = localStorage.getItem('socialmediaUniqueID');
        if (socialPage === 'facebook' && !!params.get('access_token')) {
            const accessToken = params.get('access_token');
            const payload = {
                socialMediaTypeId: 1,
                shortLivedToken: accessToken,
                departmentId,
                socialmediaUniqueID,
            };
            let res = await dispatch(getAccessTokens(payload));
            if (res?.status) {
                const { status, data } = await dispatch(get_FacebookPages({ accessToken: res?.data?.access_token }));
                if (status) {
                    localStorage.removeItem('socialmediaUniqueID');
                    dispatch(updateIntegartedSytem({ field: 'socialMediaFlag_fb', data: true }));
                    dispatch(updateIntegartedSytem({ field: 'socialMediaFlag', data: true }));
                    dispatch(updateIntegartedSytem({ field: 'getFBPages', data: data }));
                } else {
                    localStorage.removeItem('socialmediaUniqueID');
                    navigate('.');
                    localStorage.removeItem('socialPostQuery');
                }
            } else {
                localStorage.removeItem('socialmediaUniqueID');
                navigate('.');
                localStorage.removeItem('socialPostQuery');
            }
        } else if (socialPage === 'facebookads' && !!params.get('access_token')) {
            const accessToken = params.get('access_token');
            const payload = {
                socialMediaTypeId: 10,
                departmentId,
                shortLivedToken: accessToken,
                socialmediaUniqueID,
            };
            let res = await dispatch(getAccessTokens(payload));
            if (res?.status) {
                const { status, data } = await dispatch(GetFacebookAdsList({ accessToken: res?.data?.access_token }));
                if (status) {
                    dispatch(updateIntegartedSytem({ field: 'socialMediaFlag_fbads', data: true }));
                    dispatch(updateIntegartedSytem({ field: 'socialMediaFlag', data: true }));
                    dispatch(
                        updateIntegartedSytem({
                            field: 'getFBads',
                            data: { pages: data, token: res?.data?.access_token },
                        }),
                    );
                    localStorage.removeItem('socialmediaUniqueID');
                } else {
                    localStorage.removeItem('socialmediaUniqueID');
                    navigate('.');
                }
            } else {
                localStorage.removeItem('socialmediaUniqueID');
                navigate('.');
            }
        } else if (socialPage === 'twitter' && !!params.get('oauth_token') && !!params.get('oauth_verifier')) {
            const oauthToken = params.get('oauth_token');
            const oauthVerifier = params.get('oauth_verifier');
            const payload = {
                socialMediaTypeId: 3,
                oauthVerifier: oauthVerifier,
                oauthToken: oauthToken,
                departmentId: departmentId,
            };
            const res = await dispatch(get_TwitterUserDetails(payload));

            if (res?.status) {
                const payload = {
                    departmentId,
                    socialMediaSetupList: res?.data?.socialMediaSetupList,
                };
                const { status, data } = await dispatch(save_SocialUserSetup(payload));
                if (status) {
                    dispatch(getDataExchangeElements({ departmentId, clientId, userId }));
                    let socialPostQuery = localStorage.getItem('socialPostQuery');
                    const quries = parseDecryptedAudienceQuery(socialPostQuery, decryptWithAES, null);
                    if (quries?.fromCommunication) {
                        navigateBackToCommunicationSocialPostAsync(dispatch, navigate, quries);
                    } else {
                        navigate('.');
                    }
                } else {
                    navigate('.');
                    localStorage.removeItem('socialPostQuery');
                }
            } else {
                navigate('.');
                localStorage.removeItem('socialPostQuery');
            }
        } else if (socialPage === 'linkedin' && !!params.get('code')) {
            const accessToken = params.get('code');
            const payload = {
                socialMediaTypeId: 8,
                shortLivedToken: accessToken,
                redirectUrl: window.location.origin + window.location.pathname + `?socialpage=linkedin`,
            };
            let res = await dispatch(get_LinkedinAccessToken(payload));

            if (res?.status) {
                const { status, data } = await dispatch(get_LinkedinPages({ accessToken: res?.data?.accessToken }));
                if (status) {
                    dispatch(updateIntegartedSytem({ field: 'socialMediaFlag_linkedin', data: true }));
                    dispatch(updateIntegartedSytem({ field: 'socialMediaFlag', data: true }));
                    dispatch(
                        updateIntegartedSytem({
                            field: 'getLinkedinPages',
                            data: { pages: data?.pages, token: data?.token },
                        }),
                    );
                } else {
                    navigate('.');
                    localStorage.removeItem('socialPostQuery');
                }
            } else {
                navigate('.');
                localStorage.removeItem('socialPostQuery');
            }
        } else if (socialPage === 'instagram' && !!params.get('access_token')) {
            const accessToken = params.get('access_token');
            const payload = {
                socialMediaTypeId: 6,
                shortLivedToken: accessToken,
                departmentId,
                socialmediaUniqueID,
            };
            let res = await dispatch(getAccessTokens(payload));
            if (res?.status) {
                const { status, data } = await dispatch(
                    get_InstagramAccounts({ accessToken: res?.data?.access_token }),
                );

                if (status) {
                    const filteredData = data?.accounts?.data?.filter((item) => item?.instagram_business_account);
                    dispatch(updateIntegartedSytem({ field: 'socialMediaFlag_insta', data: true }));
                    dispatch(updateIntegartedSytem({ field: 'socialMediaFlag', data: true }));
                    dispatch(
                        updateIntegartedSytem({
                            field: 'getInstaPages',
                            data: { pages: filteredData, token: res?.data?.access_token },
                        }),
                    );
                } else {
                    navigate('.');
                    localStorage.removeItem('socialPostQuery');
                }
            } else {
                navigate('.');
                localStorage.removeItem('socialPostQuery');
            }
        } else if (socialPage === 'pinterest' && !!params.get('code')) {
            const code = params.get('code');
            const payload = {
                socialMediaTypeId: 5,
                code: code,
                grantType: 'authorization_code',
                redirectUrl: window.location.origin + window.location.pathname,
            };
            let res = await dispatch(get_PinterestAccessToken(payload));
            if (res?.status) {
                const { status, data } = await dispatch(
                    get_PinterestBoardsList({ accessToken: res?.data[0]?.accessToken }),
                );

                if (status) {
                    dispatch(updateIntegartedSytem({ field: 'socialMediaFlag_pinterest', data: true }));
                    dispatch(updateIntegartedSytem({ field: 'socialMediaFlag', data: true }));
                    dispatch(
                        updateIntegartedSytem({
                            field: 'getPinterestPages',
                            data: {
                                pages: data[0]?.items,
                                token: res?.data[0]?.accessToken,
                                refreshToken: res?.data[0]?.refreshToken,
                            },
                        }),
                    );
                } else {
                    navigate('/preferences/data-exchange');
                    localStorage.removeItem('socialPostQuery');
                }
            } else {
                navigate('/preferences/data-exchange');
                localStorage.removeItem('socialPostQuery');
            }
        } else if (socialPage === 'googleads' && !!params.get('code')) {
            const accessToken = params.get('code');
            const payload = {
                socialMediaTypeId: 11,
                code: accessToken,
                redirectUrl: window.location.origin + window.location.pathname + `?paidmedia=googleads`,
                grantType: 'authorization_code',
            };
            let res = await dispatch(getAccessTokens(payload));
            if (res?.status) {
                const { status, data } = await dispatch(
                    GetGoogleAdsList({ socialMediaTypeId: '11', accessToken: res?.data[0]?.token }),
                );
                if (status) {
                    dispatch(updateIntegartedSytem({ field: 'socialMediaFlag_Gads', data: true }));
                    dispatch(updateIntegartedSytem({ field: 'socialMediaFlag', data: true }));
                    dispatch(
                        updateIntegartedSytem({
                            field: 'getGads',
                            data: { pages: data, token: res?.data[0]?.token, apiRes: res },
                        }),
                    );
                } else {
                    navigate('.');
                }
            } else {
                navigate('.');
            }
        } else if (socialPage === 'youtube' && !!params.get('code')) {
            const accessToken = params.get('code');
            const payload = {
                socialMediaTypeId: 13,
                code: accessToken,
                redirectUrl: window.location.origin + window.location.pathname + `?socialpage=youtube`,
                grantType: 'authorization_code',
            };
            let res = await dispatch(getAccessTokens(payload));
            if (res?.status) {
                const { status, data } = await dispatch(
                    GetYoutubeAccountsList({
                        connectorId: '84',
                        connectorName: 'Youtube',
                        accessToken: res?.data[0]?.token,
                    }),
                );
                if (status) {
                    dispatch(updateIntegartedSytem({ field: 'socialMediaFlag_Youtube', data: true }));
                    dispatch(updateIntegartedSytem({ field: 'socialMediaFlag', data: true }));
                    dispatch(
                        updateIntegartedSytem({
                            field: 'getYoutube',
                            data: { pages: data, token: res?.data[0]?.token, apiRes: res },
                        }),
                    );
                } else {
                    navigate('.');
                }
            } else {
                navigate('.');
            }
        } else {
            navigate('.');
        }
    };

    const handleWebinar = async (params) => {
        const code = params.get('code');
        const payload = {
            connectorId: 158,
            connectorName: 'gotowebinar',
            redirectUrl: window.location.origin + window.location.pathname + '?webinar=gotowebinar',
            // redirectUrl: "https://reacuix.resul.io/preferences/data-exchange?webinar=gotowebinar",
            code: code,
        };
        let res = await dispatch(RenxtTokenValidation(payload));
        if (res?.status) {
            let ele = {
                sourceGroupName: 'Webinar',
                remoteDataSourceID: 158,
                sourceName: 'gotoWebinar',
                imagePath: '',
                connectionType: 0,
                type: 'Webinar',
                emailId: res?.data?.emailId || '',
                remoteSettingId: res?.data?.remoteSettingId || 0,
            };

            const stateWebuinar = { from: 'data_exchange', type: 'gotowebinar', data: ele };
            const encryptStateBlackbaud = encodeUrl(stateWebuinar);
            navigate(`/audience/add-audience?q=${encryptStateBlackbaud}`, {
                state: stateWebuinar,
            });
        } else {
            navigate('.');
        }
    };
    const handleWebex = async (params) => {
        const code = params.get('code');
        const payload = {
            connectorId: 106,
            connectorName: 'Webex',
            redirectUrl: window.location.origin + window.location.pathname + '?webinar=webex',
            // redirectUrl: "https://reacuix.resul.io/preferences/data-exchange?webinar=webex",
            code: code,
        };
        let res = await dispatch(RenxtTokenValidation(payload));
        if (res?.status) {
            let ele = {
                sourceGroupName: 'webex',
                remoteDataSourceID: 106,
                sourceName: 'webex',
                imagePath: '',
                connectionType: 0,
                type: 'webex',
                // emailId: res?.data?.emailId || '',
                remoteSettingId: res?.data?.remoteSettingId || 0,
            };

            const stateWebex = { from: 'data_exchange', type: 'webex', data: ele };
            const encryptStateBlackbaud = encodeUrl(stateWebex);
            navigate(`/audience/add-audience?q=${encryptStateBlackbaud}`, {
                state: stateWebex,
            });
        }
    };

    useEffect(() => {
        //facebook
        if (
            new URLSearchParams(window.location.search).get('socialpage') === 'facebook?' ||
            new URLSearchParams(window.location.search).get('socialpage') === 'facebook' ||
            new URLSearchParams(window.location.search).get('socialpage') === 'facebook??'
        ) {
            const fragment = window.location.hash?.slice(1);
            const fragmentParams = new URLSearchParams(fragment);
            handleSocialMedia(fragmentParams, 'facebook');
        }
        if (
            new URLSearchParams(window.location.search).get('socialpage') === 'facebookads??' ||
            new URLSearchParams(window.location.search).get('socialpage') === 'facebookads?' ||
            new URLSearchParams(window.location.search).get('socialpage') === 'facebookads'
        ) {
            const fragment = window.location.hash?.slice(1);
            const fragmentParams = new URLSearchParams(fragment);
            handleSocialMedia(fragmentParams, 'facebookads');
        }
        if (new URLSearchParams(window.location.search).get('socialpage') === 'twitter') {
            handleSocialMedia(new URLSearchParams(window.location.search), 'twitter');
        }
        //Insta
        if (
            new URLSearchParams(window.location.search).get('socialpage') === 'instagram?' ||
            new URLSearchParams(window.location.search).get('socialpage') === 'instagram' ||
            new URLSearchParams(window.location.search).get('socialpage') === 'instagram??'
        ) {
            const fragment = window.location.hash?.slice(1);
            const fragmentParams = new URLSearchParams(fragment);
            handleSocialMedia(fragmentParams, 'instagram');
        }
        //Linkedin
        if (new URLSearchParams(window.location.search).get('socialpage') === 'linkedin') {
            handleSocialMedia(new URLSearchParams(window.location.search), 'linkedin');
        }
        //pinterest
        if (window.location.pathname === '/preferences/data-exchange-pinterest') {
            handleSocialMedia(new URLSearchParams(window.location.search), 'pinterest');
        }
        //Webinar
        if (new URLSearchParams(window.location.search).get('webinar') === 'gotowebinar') {
            handleWebinar(new URLSearchParams(window.location.search));
        }
        //Webex
        if (new URLSearchParams(window.location.search).get('webinar') === 'webex') {
            handleWebex(new URLSearchParams(window.location.search));
        }
        if (new URLSearchParams(window.location.search).get('paidmedia') === 'googleads') {
            handleSocialMedia(new URLSearchParams(window.location.search), 'googleads');
        }
        if (new URLSearchParams(window.location.search).get('socialpage') === 'youtube') {
            handleSocialMedia(new URLSearchParams(window.location.search), 'youtube');
        }
    }, []);

    useEffect(() => {
        const payload = {
            departmentId,
            clientId,
            userId,
            dataexchangemodelid: 1,
        };

        //  dispatch(get_connectorsList(payload));
        // dispatch(getDataExchangeElements(payload));
    }, [departmentId, clientId]);
    // console.log('subTab[item]', viewData, integratedSystem);
    const getEditConnectorData = async (id, ele, loading = true) => {
        const payload = {
            departmentId,
            clientId,
            userId,
            remotesettingId: id,
        };
        const { data, status } = await dispatch(get_ConnectorDetails(payload, loading));
        if (status) {      
            let connectorDetails = connectorList?.find((item) => item.remoteDataSourceID === ele?.remoteDataSourceID);
            const isOneTime =
                ele?.scheduleFrequency?.toString()?.toLowerCase() === 'one time';
            const state = {
                isAudience: pathName === 'add-audience',
                from: 'data_exchange',
                type: data?.databaseType?.toLowerCase(),
                data: {
                    ...data,
                    ...connectorDetails,
                    remoteSettingId: id || 0,
                    sourceGroupName: ele?.sourceGroupName,
                    sourceName: ele?.sourceName,
                    webinar: ele?.schemaName,
                    selectedConnection: data?.connectionType,
                },
                mode: 'edit',
                isOneTime: isOneTime,
            };
            const encryptState = encodeUrl(state);
            navigate(`/audience/add-audience?q=${encryptState}`, {
                state: state,
            });
            return true;
        }
        return false;
    };

    const handleIntegratedSystemConnectionEdit = async (ele) => {
        if (ele?.remoteDataSourceID === 40) {
            setIntegratedSystemsModal((m) => ({ ...m, show: false, editingRowKey: null }));
            const isOneTime = ele?.scheduleFrequency?.toString()?.toLowerCase() === 'one time';
            const stateversim = {
                from: 'targetlist',
                mode: 'edit',
                isOneTime: isOneTime,
                type: 'versium',
                id: {
                    remoteSettingId: ele?.remoteSettingId,
                },
                data: {
                    remoteDataSourceID: ele?.remoteDataSourceID,
                    sourceName: ele?.sourceName,
                    type: ele?.sourceGroupName,
                    sourceGroupName: ele?.sourceGroupName,
                },
            };
            const encryptstateversim = encodeUrl(stateversim);
            navigate(`/audience/add-audience?q=${encryptstateversim}`, {
                state: stateversim,
            });
            return;
        }

        if (
            INTEGRATED_NOSQL_CONNECTOR_IDS.has(ele?.remoteDataSourceID) ||
            INTEGRATED_SQL_CONNECTOR_IDS.has(ele?.remoteDataSourceID)
        ) {
            const editingRowKey = ele?.remoteSettingId ?? ele?._gridRowKey;
            setIntegratedSystemsModal((m) => ({ ...m, editingRowKey }));
            const success = await getEditConnectorData(ele?.remoteSettingId, ele, false);
            if (success) {
                setIntegratedSystemsModal((m) => ({ ...m, show: false, editingRowKey: null }));
            } else {
                setIntegratedSystemsModal((m) => ({ ...m, editingRowKey: null }));
            }
            return;
        }
        setIntegratedSystemsModal((m) => ({ ...m, show: false, editingRowKey: null }));
        navigate(`/preferences/data-exchange`, {
            state: {
                from: 'data_exchange',
                type: 'mysql',
            },
        });
        dispatch(
            updateIntegartedSytem({
                field: 'connectFields',
                data: ele,
            }),
        );
    };

    const hideIntegratedSystemsConnectionsModal = useCallback(
        () => setIntegratedSystemsModal((m) => ({ ...m, show: false, editingRowKey: null })),
        [],
    );

    const handleSocialConnectionsView = (group) => {
        const connections = group?.connections?.length ? group.connections : [];
        const first = connections[0];
        setIntegratedSystemsModal({
            show: true,
            connections: [...connections].reverse(),
            title: [first?.sourceGroupName, first?.sourceName].filter(Boolean).join(' - ') || 'Connections',
        });
    };

    const handleTextOnChange = async (data) => {
        if (!data?.text || data.text.length < 3) return [];
        const search = data.text.toLowerCase();

        switch (data?.type) {
            case 'Friendly name': {
                return _uniq(
                    latestConnectionsRef.current
                        .filter((item) => item?.friendlyName?.toLowerCase().includes(search))
                        .map((item) => item.friendlyName),
                );
            }

            case 'Source name': {
                const combinedSubTabData = [];
                const currentSubTab = originalSubTabRef.current || filteredSubTab || {};

                Object.keys(currentSubTab).forEach((groupName) => {
                    const groupItems = currentSubTab[groupName] || [];
                    combinedSubTabData.push(...groupItems);
                });

                return _uniq(
                    combinedSubTabData
                        .filter((item) => item?.sourceName?.toLowerCase().includes(search))
                        .map((item) => item.sourceName),
                );
            }

            default:
                return [];
        }
    };
    const applyFilters = (currentDateRange, currentSearch) => {
        const allowedSourceGroupNames = new Set(Object.keys(filteredSubTab || {}));

        let filtered =
            GetRemoteConnectionActive?.filter((item) => allowedSourceGroupNames.has(item.sourceGroupName)) || [];

        const fileterSocialMedia = filtered.filter((item) => item?.sourceGroupName === 'Social media');
        const filterDuplicateSocialMedia = fileterSocialMedia.filter(
            (item, index, self) => index === self.findIndex((t) => t.sourceName === item.sourceName),
        );

        if (currentDateRange.startDate && currentDateRange.endDate && false) {
            const start = new Date(currentDateRange.startDate);
            start.setHours(0, 0, 0, 0);
            const startTime = start.getTime();

            const end = new Date(currentDateRange.endDate);
            end.setHours(23, 59, 59, 999);
            const endTime = end.getTime();
            const allowedChannelIds = [1, 3, 5, 6, 8, 10]; // socialMediaChannelId

            filtered = filtered.filter((item) => {
                const { lastGeneratedDate, socialMediaChannelId } = item;

                // If no date AND not in allowed channels → exclude
                if (!lastGeneratedDate && !allowedChannelIds.includes(socialMediaChannelId)) {
                    return false;
                }

                // If no date but channel is allowed → keep it
                // if (!lastGeneratedDate) {
                //     return true;
                // }

                const itemTime = new Date(lastGeneratedDate).getTime();

                return itemTime >= startTime && itemTime <= endTime;
            });
        }

        if (currentSearch.text) {
            const searchText = currentSearch.text.toLowerCase();
            const key = currentSearch.type === 'Friendly name' ? 'friendlyName' : 'sourceName';

            filtered = filtered.filter((item) => item[key]?.toLowerCase().includes(searchText));
        }

        setActiveConnection(filtered);
        return filtered;
    };
    const handleDatePickerChange = ({ startDate, endDate }) => {
        const newDates = { startDate, endDate };
        setDateRange(newDates);
        applyFilters(newDates, searchCriteria);
    };

    const handleSearch = ({ type, text }) => {
        const newSearch = { type, text: text || '' };
        setSearchCriteria(newSearch);

        if (text && text.trim()) {
            if (type === 'Friendly name') {
                setFilteredSubTab(originalSubTabRef.current || {});
            } else {
                const searchText = text.trim().toLowerCase();
                const originalSubTab = originalSubTabRef.current || {};
                const filtered = {};

                Object.keys(originalSubTab).forEach((groupName) => {
                    const groupItems = originalSubTab[groupName] || [];
                    const matchingItems = groupItems.filter((item) => {
                        return item?.sourceName?.toLowerCase().includes(searchText);
                    });

                    if (matchingItems.length > 0) {
                        filtered[groupName] = matchingItems;
                    }
                });

                setFilteredSubTab(filtered);
            }
        } else {
            setFilteredSubTab(originalSubTabRef.current || {});
        }

        applyFilters(dateRange, newSearch);
    };

    const handleClear = () => {
        const resetSearch = { ...searchCriteria, text: '' };
        setSearchCriteria(resetSearch);

        setFilteredSubTab(originalSubTabRef.current || {});

        applyFilters(dateRange, resetSearch);
    };
    return (
        <div className="tabs-content">
            <Row className="ml15">
                <Col className=" p0">
                    <div className="d-flex align-items-center justify-content-between">
                        <h3 className="mb-0">Integrated systems</h3>

                        <div className="flex-row justify-content-end top-sub-heading advanceSearchContainer">
                            <ul className={` rs-list-group-horizontal`}>
                                {/* <li>
                                    <RSDateRangePicker isTemplate onDatePickerClosed={handleDatePickerChange} />
                                </li> */}
                                <li className="advanceSearchBlock">
                                    {/* <RSTooltip text={'Search'} position="top" className="advanceSearchBlock"> */}
                                    <RSAdvanceSearch
                                        advanceSearchOptions={['Source name', 'Friendly name']}
                                        seachTextOnChange={handleTextOnChange}
                                        searchText={handleSearch}
                                        advanceSearchText={handleSearch}
                                        allClearField={handleClear}
                                        searchClearField={handleClear}
                                        isClearSearchText={isClearSearchText}
                                        setIsClearSearchText={setIsClearSearchText}
                                    />
                                </li>
                            </ul>
                        </div>
                    </div>
                </Col>

                <GenerateCodeModal />
                {/* <AddImportAudience /> */}
                <Card className="mb15 p0">
                    {/* {integratedSystem?.length === 0 && ( */}
                    {GetRemoteConnectionActive?.length === 0 && (
                        <div className="card-body border-primary text-center">
                            <p className="d-flex align-items-center justify-content-center py81 color-primary-grey">
                                Click{' '}
                                <i
                                    className={`${circle_plus_fill_medium} icon-md px5 color-primary-blue`}
                                    id="rs_data_circle_plus_fill"
                                ></i>{' '}
                                to connect RESUL to an external system.
                            </p>
                        </div>
                    )}
                    <Row>
                        {activeConnection?.length === 0 && GetRemoteConnectionActive?.length > 0 && integratedSysLoading ? (
                            <Col sm={12} className="px0">
                                <DataExchangeIntegratedSystemsGridSkeleton />
                            </Col>
                        ) : (
                            <>
                                {groupedActiveConnection?.map((group, ind) => {
                                    const ele = group.connections[0];
                                    const isMulti = group.connections.length > 1;
                                    const cardKey = `g_${group?.remoteDataSourceID ?? 'x'}_${ind}`;
                                    const lastSyncDate =  ele?.lastGeneratedDate;
                                    const scheduleLabel = ele?.scheduleFrequency;
                                    const modalTitle =
                                        [ele?.sourceGroupName, ele?.sourceName].filter(Boolean).join(' - ') ||
                                        'Connections';
                                    const cardTitle = isMulti
                                        ? [ele?.sourceGroupName, ele?.sourceName].filter(Boolean).join(' - ')
                                        : ele?.friendlyName || ele?.sourceName || 'XXXX';
                                    return (
                                        <Fragment key={cardKey}>
                                            <Col sm="4" className="py15 topSmallCard">
                                                <Card>
                                                    <ListGroup variant="flush">
                                                        <ListGroup.Item>
                                                            {!!ele?.imagePath ? (
                                                                <img
                                                                    variant="top"
                                                                    src={
                                                                        `/src/Assets/Images/data_exchange/` +
                                                                        ele.sourceGroupName
                                                                            .toLowerCase()
                                                                            .replaceAll(/ /g, '_') +
                                                                        `/` +
                                                                        ele?.imagePath
                                                                    }
                                                                    onError={(e) => {
                                                                        e.target.onerror = null;
                                                                        e.target.src = Image_placeholder;
                                                                    }}
                                                                />
                                                            ) : ele?.sourceName === 'Webhook' ? (
                                                                <i
                                                                    className={`${webhook_xlarge} icon-xlg fs80`}
                                                                ></i>
                                                            ) : ele?.sourceName === 'Callcenter' ? (
                                                                <i
                                                                    className={`${user_call_center_xlarge} icon-xlg fs80`}
                                                                ></i>
                                                            ) : (
                                                                <h2>{ele?.sourceName}</h2>
                                                            )}
                                                        </ListGroup.Item>
                                                        <ListGroup.Item
                                                            className={`${
                                                                ele?.sourceGroupName === 'Social media'
                                                                    ? 'border-bottom-0 list-group-radius-bottom'
                                                                    : ''
                                                            }`}
                                                        >
                                                            {ele?.sourceGroupName === 'Social media'
                                                                ? modalTitle
                                                                : cardTitle}
                                                        </ListGroup.Item>
                                                        <ListGroup.Item
                                                            className={`bg-tertiary-blue  data-exchange-bottomtext`}
                                                        >
                                                            <div
                                                                className={
                                                                    ele?.sourceGroupName === 'Social media' || isMulti
                                                                        ? 'd-none'
                                                                        : ''
                                                                }
                                                            >
                                                                <small>{`Last sync: ${
                                                                    getUserCurrentFormat(lastSyncDate)?.dateFormat
                                                                }`}</small>
                                                                {ele?.remoteDataSourceID !== 56 && !!scheduleLabel && (
                                                                    <small>{`Update cycle: ${scheduleLabel}`}</small>
                                                                )}
                                                            </div>
                                                        </ListGroup.Item>
                                                    </ListGroup>
                                                    <ul className="iconList">
                                                        {ele?.sourceGroupName === 'Social media' ? (
                                                            <li>
                                                                <RSTooltip text={VIEW} position="top">
                                                                    <i
                                                                        id={`rs_data_social_view_${cardKey}`}
                                                                        className={`${eye_medium} color-primary-blue icon-md cp`}
                                                                        onClick={() => handleSocialConnectionsView(group)}
                                                                    />
                                                                </RSTooltip>
                                                            </li>
                                                        ) : (
                                                            <li>
                                                                <RSTooltip text={EDIT} position="top">
                                                                    <i
                                                                        id={`rs_data_pencil_edit_${cardKey}`}
                                                                        className={`${pencil_edit_medium} color-primary-blue icon-md cp`}
                                                                        onClick={() => {
                                                                            setIntegratedSystemsModal({
                                                                                show: true,
                                                                                connections: isMulti
                                                                                    ? [...group.connections].reverse()
                                                                                    : group.connections,
                                                                                title: modalTitle,
                                                                            });
                                                                        }}
                                                                    />
                                                                </RSTooltip>
                                                            </li>
                                                        )}
                                                    </ul>
                                                </Card>
                                            </Col>
                                        </Fragment>
                                    );
                                })}
                            </>
                        )}
                    </Row>
                </Card>
                <Col className="mb15 p0">
                    <h3 className="float-start" ref={itemRef}>
                        Available systems
                    </h3>
                    {/* {!isAudience && (
                        <a href="javascript:;" onClick={openOneLineSDK} className="float-end text-decoration-none">
                            <h3 className="color-primary-blue">One-line SDK</h3>
                        </a>
                    )} */}
                </Col>
            </Row>
            {viewData?.some((category) => filteredSubTab?.[category]?.length > 0) ? (
                viewData.map((category, index) => {
                    const categoryData = filteredSubTab?.[category];

                    if (!categoryData?.length) return null;

                    return (
                        <div className="sourceCategory mb30" key={index}>
                            <h4>{category}</h4>
                            <Row>
                                <ViewDataComponent dataExchange={categoryData} />
                            </Row>
                        </div>
                    );
                })
            ) : (
                <Row>
                    <Col className="mt20 mb20 box-design ml15">
                        <CustomSkeleton isError={true} count={8} height={35} />
                    </Col>
                </Row>
            )}

            {oneLineSDKFlag && (
                <OneLineSDKModal
                    handleCloseOnleLine={(status) => {
                        if (!status) {
                            setOneLineSDKFlag(false);
                        }
                    }}
                    show={oneLineSDKFlag}
                    setOneLineSDKFlag={setOneLineSDKFlag}
                />
            )}
            <GenerateCodeModal />
            <SocialMedia />
            <ResulAnalyticsModal />
            <AdobeAnalyticsModal />
            {integratedSystemsModal.show && <IntegratedSystemsConnectionsModal
                show={integratedSystemsModal.show}
                onHide={hideIntegratedSystemsConnectionsModal}
                title={integratedSystemsModal.title}
                connections={integratedSystemsModal.connections}
                editingRowKey={integratedSystemsModal.editingRowKey}
                onEditRow={handleIntegratedSystemConnectionEdit}
            /> }
            <RSTooltip text={'Back to top'} position="top" className="lh0 position-fixed">
                <i
                    className={`${circle_arrow_up_fill_large} icon-lg color-primary-blue back-to-top ${
                        showBackToTop ? 'visible' : ''
                    }`}
                    onClick={scrollToTop}
                />
            </RSTooltip>
            {alreadyIntegrated && (
                <RSConfirmationModal
                    show={alreadyIntegrated}
                    text={ALREADY_INTEGRATED}
                    primaryButtonText={OK}
                    handleConfirm={() => {
                        let socialPostQuery = localStorage.getItem('socialPostQuery');
                        const quries = parseDecryptedAudienceQuery(socialPostQuery, decryptWithAES, null);
                        if (quries?.fromCommunication) {
                            navigateBackToCommunicationSocialPostAsync(dispatch, navigate, quries);
                        } else {
                            navigate('/preferences/data-exchange');
                        }
                        dispatch(updateIntegartedSytem({ field: 'alreadyIntegrated', data: false }));
                    }}
                    isCloseButton={false}
                    handleClose={() => {
                        dispatch(updateIntegartedSytem({ field: 'alreadyIntegrated', data: false }));
                    }}
                    secondaryButton={false}
                    header={INFO}
                />
            )}
        </div>
    );
};

export default DataSubComponent;
