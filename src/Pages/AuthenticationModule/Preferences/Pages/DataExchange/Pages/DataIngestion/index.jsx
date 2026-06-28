import { encodeUrl, getUserDetails } from 'Utils/modules/crypto';
import { getWarningPopupMessage } from 'Utils/modules/warningPopup';
import { SELECT_BU } from 'Constants/GlobalConstant/Placeholders';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import RSTabbar from 'Components/RSTabber';
import { getTabData } from '../constant';
import { useDispatch, useSelector } from 'react-redux';
import { getSessionId } from 'Reducers/globalState/selector';
import {
    getAccessTokens_Twitter,
    getDataExchangeElements,
    getSocialMediaOauthUrl,
    get_connectorsList,
} from 'Reducers/preferences/DataExchange/request';
import { DataExchangeTabContentSkeletonGate } from 'Components/Skeleton/Components/PreferencesSubPageRouteSkeleton';
import { dataExchange_connection_blackbaud_Token } from 'Reducers/remoteDataSource/request';

import { reset_failures_API_Errors } from 'Reducers/globalState/reducer';
import { updateIntegartedSytem } from 'Reducers/preferences/DataExchange/reducer';
import RSConfirmationModal from 'Components/ConfirmationModal';
import useQueryParams from 'Hooks/useQueryParams';
import useApiLoader, { API_STATUS } from 'Hooks/useApiLoader';

import { FIELD_BOTH_LOADER_CONFIG as fieldLoaderConfig } from 'Hooks/loaderTypes';



const DataIngestion = () => {
    const dispatch = useDispatch();
    const connectorsAPI = useApiLoader();
    const { clientId, departmentId, userId, departmentName } = useSelector((state) => getSessionId(state));
    const { licenseTypeId } = getUserDetails();
    const [confirmationModal, setConfimrationModal] = useState(false);
    const queryState = useQueryParams('/preferences');

    const { connectorList } = useSelector(({ dataExchangeReducer }) => dataExchangeReducer);
    const [tabData, setTabData] = useState([]);
    const { failureApiErrors } = useSelector(({ globalstate }) => globalstate);
    const navigate = useNavigate();

    const hasConnectors = Boolean(connectorList?.length);
    const isConnectorsLoading =
        connectorsAPI.isFetching ||
        (!hasConnectors && connectorsAPI.status !== API_STATUS.ERROR);
    const showDepartmentBlock = departmentName?.toLowerCase() === 'all' && licenseTypeId === '3';

    useEffect(() => {
        const payload = {
            departmentId,
            clientId,
            userId,
            dataexchangemodelid: 1,
        };
        connectorsAPI.refetch({
            fetcher: ({ payload: requestPayload }) =>
                dispatch(get_connectorsList({ payload: requestPayload, loading: false })),
            mode: 'create',
            loaderConfig: fieldLoaderConfig,
            params: { payload },
        });
        dispatch(getDataExchangeElements(payload, false, [], false));
    }, [departmentId, clientId]);

    useEffect(() => {
        if (connectorList) {
            const tabData = getTabData(connectorList);
            setTabData(tabData);
        }
    }, [connectorList]);
    const handleBlackbaudTokenValidation = async () => {
        const payload = {
            clientId,
            departmentId,
            userId,
            connectorId: '55',
            connectorName: 'Blackbaud',
            redirectUrl: window.location.href,
        };
        const response = await dispatch(dataExchange_connection_blackbaud_Token({ payload }));
        if (response?.status) {
            //remoteSettingId: 649
            let ele = {
                sourceGroupName: 'CRM',
                remoteDataSourceID: 55,
                sourceName: 'Blackbaud',
                imagePath: 'logo-blackbaud.jpg',
                connectionType: 0,
                type: 'CRM',
                emailId: response?.data?.emailId || '',
                remoteSettingId: response?.data?.remoteSettingId || 0,
            };
            const stateBlackbaud = { from: 'data_exchange', type: 'blackbaud', data: ele };
            const encryptStateBlackbaud = encodeUrl(stateBlackbaud);
            navigate(`/audience/add-audience?q=${encryptStateBlackbaud}`, {
                state: stateBlackbaud,
            });
        }
    };

    useEffect(() => {
        if (
            new URLSearchParams(window.location.search).get('crm') === 'blackbaud' &&
            new URLSearchParams(window.location.search).get('code') !== ''
        ) {
            handleBlackbaudTokenValidation();
        }
    }, []);
    useEffect(() => {
        return () => {
            dispatch(updateIntegartedSytem({ field: 'connectorList', data: [] }));
            dispatch(updateIntegartedSytem({ field: 'GetAPIConnectionActive', data: [] }));
            dispatch(reset_failures_API_Errors());
        };
    }, []);
    useEffect(() => {
        if (departmentName?.toLowerCase() === 'all' && licenseTypeId === '3') {
            setConfimrationModal(true);
        } else {
            setConfimrationModal(false);
        }
    }, [departmentName]);

    const socialMediaData = {
        facebook: { Name: 'Resulticks-Facebook', SocialMediaTypeID: 1 },
        twitter: { Name: 'Resulticks-Twitter', SocialMediaTypeID: 3 },
        linkedin: { Name: 'Resulticks-Linkedin', SocialMediaTypeID: 8 },
        instagram: { Name: 'Resulticks-Instagram', SocialMediaTypeID: 6 },
        pinterest: { Name: 'Resulticks-Pinterest', SocialMediaTypeID: 5 },
        'facebook ads': { Name: 'Resulticks-FacebookAds', SocialMediaTypeID: 10 },
        'google ads': { Name: 'Resulticks-GoogleAds', SocialMediaTypeID: 11 },
        youtube: { Name: 'Resulticks-Youtube', SocialMediaTypeID: 13 },
    };
    const openInNewTab = (url) => {
        window.location.href = url;
    };
    const socialMediaLogin = async (ele) => {
        if (ele?.remoteDataSourceID === 24) {
            let payload = {
                socialMediaTypeId: socialMediaData[ele?.sourceName?.toLowerCase()]?.SocialMediaTypeID,
                socialMediaTypeName: socialMediaData[ele?.sourceName?.toLowerCase()]?.Name,
                redirectUrl:
                    window.location.origin + window.location.pathname + `?socialpage=${ele?.sourceName?.toLowerCase()}`,
            };
            const response = await dispatch(getSocialMediaOauthUrl({ payload }));
            if (response?.status) {
                let url = response?.data;
                openInNewTab(url);
            }
        }  else if (ele?.remoteDataSourceID === 26) {
            let payload = {
                socialMediaTypeId: socialMediaData[ele?.sourceName?.toLowerCase()]?.SocialMediaTypeID,
                redirectUrl:
                    window.location.origin + window.location.pathname + `?socialpage=${ele?.sourceName?.toLowerCase()}`,
            };
            const response = await dispatch(getAccessTokens_Twitter(payload));

            if (response?.status) {
                let url = response?.data?.authTokenUrl;
                openInNewTab(url);
            }
        } else if (ele?.remoteDataSourceID === 82) {
            let payload = {
                socialMediaTypeId: socialMediaData[ele?.sourceName?.toLowerCase()]?.SocialMediaTypeID,
                socialMediaTypeName: socialMediaData[ele?.sourceName?.toLowerCase()]?.Name,
                redirectUrl: window.location.origin + window.location.pathname + `-${ele?.sourceName?.toLowerCase()}`,
            };
            const response = await dispatch(getSocialMediaOauthUrl({ payload }));
            if (response?.status) {
                let url = response?.data;

                openInNewTab(url);
            }
        } else if (ele?.remoteDataSourceID === 83) {
            let payload = {
                socialMediaTypeId: socialMediaData[ele?.sourceName?.toLowerCase()]?.SocialMediaTypeID,
                socialMediaTypeName: socialMediaData[ele?.sourceName?.toLowerCase()]?.Name,
                redirectUrl:
                    window.location.origin + window.location.pathname + `?socialpage=${ele?.sourceName?.toLowerCase()}`,
            };
            const response = await dispatch(getSocialMediaOauthUrl({ payload }));
            if (response?.status) {
                let url = response?.data;
                openInNewTab(url);
            }
        } else if (ele?.remoteDataSourceID === 85) {
            let payload = {
                socialMediaTypeId: socialMediaData[ele?.sourceName?.toLowerCase()]?.SocialMediaTypeID,
                socialMediaTypeName: socialMediaData[ele?.sourceName?.toLowerCase()]?.Name,
                redirectUrl:
                    window.location.origin + window.location.pathname + `?socialpage=${ele?.sourceName?.toLowerCase()}`,
            };
            const response = await dispatch(getSocialMediaOauthUrl({ payload }));
            if (response?.status) {
                let url = response?.data;
                openInNewTab(url);
            }
        } else if (ele?.remoteDataSourceID === 89) {
            let payload = {
                socialMediaTypeId: socialMediaData[ele?.sourceName?.toLowerCase()]?.SocialMediaTypeID,
                socialMediaTypeName: socialMediaData[ele?.sourceName?.toLowerCase()]?.Name,
                redirectUrl: window.location.origin + window.location.pathname + `?paidmedia=googleads`,
            };
            const response = await dispatch(getSocialMediaOauthUrl({ payload }));
            if (response?.status) {
                let url = response?.data;
                openInNewTab(url);
            }
        } else if (ele?.remoteDataSourceID === 84) {
            let payload = {
                socialMediaTypeId: socialMediaData[ele?.sourceName?.toLowerCase()]?.SocialMediaTypeID,
                socialMediaTypeName: socialMediaData[ele?.sourceName?.toLowerCase()]?.Name,
                redirectUrl: window.location.origin + window.location.pathname + `?socialpage=youtube`,
            };
            const response = await dispatch(getSocialMediaOauthUrl({ payload }));
            if (response?.status) {
                let url = response?.data;
                openInNewTab(url);
            }
        }
    };

    const handleCardAdd = (ele) => {
         if (ele?.remoteDataSourceID === 89 || ele?.remoteDataSourceID === 84) {
                socialMediaLogin(ele);
                return;
            }
            dispatch(updateIntegartedSytem({ field: 'addCard', data: ele }));
            let sourceName = ele.sourceName;
            const encryptState = encodeUrl(queryState);
            switch (sourceName) {
                case 'facebook':
                case 'Facebook':
                    // socialMediaLogin(ele);
                    navigate(`/preferences/data-exchange?q=${encryptState}`, {
                        state: { from: 'data_exchange', type: 'Facebook' },
                    });
                    dispatch(updateIntegartedSytem({ field: 'connectFields', data: ele }));
                    break;
                case 'twitter':
                case 'Twitter':
                    socialMediaLogin(ele);
                    break;
                case 'pinterest':
                case 'Pinterest':
                    socialMediaLogin(ele);
                    break;
                case 'instagram':
                case 'Instagram':
                    navigate(`/preferences/data-exchange?q=${encryptState}`, {
                        state: { from: 'data_exchange', type: 'Instagram' },
                    });
                    dispatch(updateIntegartedSytem({ field: 'connectFields', data: ele }));
                    break;
                case 'Linkedin':
                    socialMediaLogin(ele);
                    break;
            }
        };
    useEffect(() => {
        if( queryState?.fromCommunication && connectorList?.length){
            const currSource = connectorList?.find((item) => item?.remoteDataSourceID === queryState?.remoteDataSourceID);
            if(currSource){
                handleCardAdd(currSource)
                localStorage.setItem('socialPostQuery', encodeUrl(queryState));
                navigate('.');
            }    
        } 
    },[connectorList, queryState])
    useEffect(() => {
        return () => {
            if(!window.location.pathname?.includes('data-exchange')){
            localStorage.removeItem('socialPostQuery')
            }
        }
    },[])


    return (
        <>
            {showDepartmentBlock ? (
                <div className="mt20 box-design p21">
                    <DataExchangeTabContentSkeletonGate isLoading tab="ingestion" />
                </div>
            ) : (
                <DataExchangeTabContentSkeletonGate isLoading={isConnectorsLoading} tab="ingestion">
                    <div className="mt21 dataExchangePageCSS">
                        <div className="rs-vertical-tabs-wrapper pref-de-live-tabs">
                            <RSTabbar
                                dynamicTab="vertical-tabs rsv-tabs-list"
                                activeClass="active"
                                tabData={tabData}
                                defaultTab={0}
                            />
                        </div>
                    </div>
                </DataExchangeTabContentSkeletonGate>
            )}
            <RSConfirmationModal
                show={confirmationModal}
                text={SELECT_BU}
                handleClose={() => {
                    setConfimrationModal(false);
                }}
                handleConfirm={() => {
                    setConfimrationModal(false);
                }}
                secondaryButton={false}
            />
            {getWarningPopupMessage(failureApiErrors, dispatch)}
        </>
    );
};

export default DataIngestion;
