import { decryptWithAES } from 'Utils/modules/crypto';
import { safeParseJSON } from 'Utils/modules/stringUtils';
import { ENTER_VALID_DAYS, INSTANCE_NAME as INSTANCE_NAME_VALIDATION } from 'Constants/GlobalConstant/ValidationMessage';
import { ARE_YOU_SURE_WANT_TO_RESET, CANCEL, INSTANCE_NAME, SAVE, UPDATE, YES } from 'Constants/GlobalConstant/Placeholders';
import { restart_medium } from 'Constants/GlobalConstant/Glyphicons';
import { RSPrimaryButton, RSSecondaryButton } from 'Components/Buttons';
import RSInput from 'Components/FormFields/RSInput';
import RSTooltip from 'Components/RSTooltip';
import RSConfirmationModal from 'Components/ConfirmationModal';
import { updateIntegartedSytem } from 'Reducers/preferences/DataExchange/reducer';
import { Fragment, useEffect, useState } from 'react';
import { Col, Container, Row } from 'react-bootstrap';
import { FormProvider, useForm } from 'react-hook-form';
import _isEmpty from 'lodash/isEmpty';
import { useDispatch, useSelector } from 'react-redux';
import { connectFieldsLists } from './constants';
// import TableAttributes from './TableAttributes';
import RSTextarea from 'Components/FormFields/RSTextarea';
// import Subscribe from './Subscribe';
import RSCheckbox from 'Components/FormFields/RSCheckbox';
import RSKendoDropDown from 'Components/FormFields/RSKendoDropdown';
import { useNavigate } from 'react-router-dom';
import { getSessionId } from 'Reducers/globalState/selector';
import useApiLoader, { LOADER_TYPE } from 'Hooks/useApiLoader';
import { CommonSkeleton } from 'Components/Skeleton/Components/SkeletonOverall';
import {
    get_DigipopExtendedvalues,
    get_Extendedvalues,
    get_webhooknameExist,
    get_webhooknameSave,
    save_digipop_credentails,
    get_ConnectorDetails,
    get_BigqueryDetail,
    get_googleanalyticsaccountslists,
    getSocialMediaOauthUrl,
} from 'Reducers/preferences/DataExchange/request';
import {
    dataExchange_connection_exist,
    dataExchange_get_tables_from_DB,
    dataExchange_getColumnTables,
    getOrganizationList,
    getUpdateCycleFrequency,
    getWistiaMedia,Update_Zerobounce_Connection_details
} from 'Reducers/remoteDataSource/request';
import useOnlyDepChangeEffect from 'Hooks/useOnlyDepChangeEffect';
import {
    updateCycleFrequency,
    updateMatomoInsights,
    updateMatomoSites,
    updateWistiaMedia,
} from 'Reducers/RemoteDataSource/reducer';
import RSFileUpload from 'Components/FormFields/RSFileUpload';
import ListNameExists from 'Components/ListNameExists';
import { LIST_NAME_RULES } from 'Constants/GlobalConstant/Rules';
import RSDatePicker from 'Components/FormFields/RSDatePicker';
import { socialMediaAppKeys } from 'Reducers/communication/createCommunication/Create/request';
import useQueryParams from 'Hooks/useQueryParams';

import { parseAudienceJson, parseDecryptedAudienceQuery } from 'Pages/AuthenticationModule/Audience/audienceDefaults';


var existingListName = '';
const ConnectFields = () => {
    const navigate = useNavigate();
    const methods = useForm({
        mode: 'onTouched',
    });
    const queryState = useQueryParams('/preferences');
    
    const { control, setError, clearErrors, handleSubmit, reset, watch, setValue, getValues, formState: { isDirty } } = methods;
    const { departmentId, clientId, userId } = useSelector((state) => getSessionId(state));
    const {
        updateCycleList,
        organizationList,
        tableDropDown,
        tableColumns,
        updateWistiaMediaList,
        updateMatomoSiteList,
        updateMatomoInsightList,
    } = useSelector(({ remoteDataSourceReducer }) => remoteDataSourceReducer);
    const { integratedSystem, connectFields, addCard } = useSelector(({ dataExchangeReducer }) => dataExchangeReducer);
    const dispatch = useDispatch();
    const [eventUpdateCycle, setEventUpdateCycle] = useState([]);
    const [OrganizationList, setOrganizationList] = useState([]);
    const [TableList, setTableList] = useState([]);
    const [columnList, setColumnList] = useState([]);
    const [propertyList, setPropertyList] = useState([]);
    const [accountList, setAccountList] = useState([]);
    const [fileName, setFileName] = useState('');
    const [connectFlag, setConnectFlag] = useState({ show: false, msg: '' });
    const [showResetModal, setShowResetModal] = useState(false);
    const [forceUpdate, setForceUpdate] = useState(0);
    const extendedEditApi = useApiLoader({ autoFetch: false });
    const webhookSaveApi = useApiLoader({ autoFetch: false });
    const webhookNameCheckApi = useApiLoader({ autoFetch: false });

    const isExtendedChannel =
        connectFields?.remoteDataSourceID === 56 || connectFields?.remoteDataSourceID === 57;
    const isExtendedChannelEdit = isExtendedChannel && connectFields?.remoteSettingId > 0;
    const showExtendedEditSkeleton =
        isExtendedChannelEdit &&
        (extendedEditApi.isFetching || extendedEditApi.isIdle);
    const friendlyName = watch('instanceName');
    const uploadedURL = watch('jsonFilePath');
    const property = watch('property');
    const account = watch('account');
    const accessToken = watch('accesstoken');
    const domainUrl = watch('DomainName');
    const site = watch('sitename');

    const requestconnection = async (value, apiConnection, name) => {
        let payload = {};
        if (connectFields?.remoteDataSourceID === 54) {
            if (name === 'authToken') {
                payload = {
                    authToken: value,
                    departmentId,
                    clientId,
                    userId,
                    connectorName: connectFields?.sourceName,
                    connectorId: connectFields?.remoteDataSourceID,
                };
                const res = await dispatch(apiConnection({ payload }));
                if (!res?.status) {
                    setError('authToken', {
                        type: 'custom',
                        message: res?.message,
                    });
                } else {
                    clearErrors('authToken');
                }
                setValue('organizationName', '');
                return;
            }
        } else if (connectFields?.remoteDataSourceID === 161) {
            // if (name === 'friendlyName') {
            //     payload = {
            //         friendlyname: value,
            //         departmentId,
            //         clientId,
            //         userId,
            //         remoteDataSourceID: connectFields?.remoteDataSourceID,
            //     };
            // } else
            if (name === 'apiKey') {
                payload = {
                    apiKey: value,
                    connectorId: connectFields?.remoteDataSourceID,
                    connectorName: connectFields?.sourceName,
                };
            }
        } else if (
            connectFields?.remoteDataSourceID === 155 ||
            connectFields?.remoteDataSourceID === 54 ||
            connectFields?.remoteDataSourceID === 59
        ) {
            // if (name === 'friendlyName') {
            //     payload = {
            //         friendlyname: value,
            //         departmentId,
            //         clientId,
            //         userId,
            //         remoteDataSourceID: connectFields?.remoteDataSourceID,
            //     };
            // }
        } else if (connectFields?.remoteDataSourceID === 76) {
            if (name === 'accesstoken') {
                payload = {
                    apiToken: value,
                    connectorId: connectFields?.remoteDataSourceID,
                    connectorName: 'Wistia',
                };
            }
        } else if (connectFields?.remoteDataSourceID === 163) {
            if (name === 'accesstoken') {
                payload = {
                    domainUrl: domainUrl,
                    apiToken: value,
                    connectorId: connectFields?.remoteDataSourceID,
                    connectorName: 'Matomo',
                };
            } else if (name === 'sitename') {
                payload = {
                    domainUrl: domainUrl,
                    apiToken: accessToken,
                    connectorId: connectFields?.remoteDataSourceID,
                    connectorName: 'Matomo',
                    siteId: value,
                };
            }
        } else {
            payload = {
                webHookName: value,
                departmentId,
                clientId,
                userId,
                type: connectFields?.sourceName === 'Webhook' ? 'W' : 'C',
            };
        }
        const isWebhookNameCheck = isExtendedChannel && name === 'webHookName' && apiConnection === get_webhooknameExist;
        const res = isWebhookNameCheck
            ? await webhookNameCheckApi.refetch({
                  mode: 'create',
                  loaderConfig: { create: LOADER_TYPE.FIELD },
                  fetcher: () => dispatch(apiConnection(payload, false)),
              })
            : await dispatch(apiConnection(payload));
        if (res?.data) {
            if (connectFields?.remoteDataSourceID === 161 && name === 'apiKey') {
                const formattedTableData = res?.data?.map((item, index) => ({
                    id: index + 1,
                    name: item,
                }));
                setTableList(formattedTableData);
            }
            // else {
            //     setError(name, {
            //         type: 'custom',
            //         message: res?.message || 'Friendly name does not Exists',
            //     });
            // }
        } else {
            clearErrors();
        }
    };

    const handletablechange = async (event) => {
        const selectedItem = event.value;
        const { name } = selectedItem;
        const { apiKey } = getValues();
        const Payload_eventZilla_Column = {
            connectorId: connectFields?.remoteDataSourceID,
            connectorName: connectFields?.sourceName,
            apiKey: apiKey,
            tableName: name,
        };
        let connectionResult = await dispatch(dataExchange_getColumnTables({ payload: Payload_eventZilla_Column }));
        if (connectionResult?.status) {
            const formattedColumnData = connectionResult.data.map((item) => ({
                id: item.Id,
                name: item.name,
            }));
            setColumnList(formattedColumnData);
        }
    };

    const requestconnectionDigipop = async (value, apiConnection, name) => {
        const payloadDigipop = {
            friendlyname: value,
            departmentId,
            clientId,
            userId,
            remoteDataSourceID: connectFields?.remoteDataSourceID,
        };
        const res = await dispatch(apiConnection(payloadDigipop));
        if (res?.data) {
            setError(name, {
                type: 'custom',
                message: res?.message || 'Friendly name does not Exists',
            });
        } else {
            clearErrors();
        }
    };
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
    const handleConnect = async (params) => {
        const { remoteDataSourceID, remoteSettingId,sourceName  } = connectFields;
          const handleZeroBounce = async () => {
            console.log
            ('handleZeroBounce called', params,connectFields);
            const payload = {
                connectorId: remoteDataSourceID,
                connectorName: connectFields?.sourceName,
               apiKey: params?.apiKey,
friendlyName: params?.friendlyName,
 clientId,
            departmentId,
            userId, 
            };

            const ZeroBounceresult = await dispatch(Update_Zerobounce_Connection_details({ payload }));

            if (ZeroBounceresult?.status) {
                dispatch(updateIntegartedSytem({ field: 'connectFields', data: {} }));
            } else {
                setConnectFlag({ show: true, msg: ZeroBounceresult?.message });
            }
        };
        const handlemixpanel = async () => {
            const payload = {
                connectorId: remoteDataSourceID,
                connectorName: connectFields?.sourceName,
                domain: params?.DomainName,
                serviceAccountName: params?.Serviceaccountname,
                serviceAccountSecret: params?.ServiceAccountSecret,
                friendlyName: params?.instanceName,
                updateCycle: params?.updateCycle?.id,
            };

            const mixpanelresult = await dispatch(dataExchange_connection_exist({ payload }));

            if (mixpanelresult?.status) {
                dispatch(updateIntegartedSytem({ field: 'connectFields', data: {} }));
            } else {
                setConnectFlag({ show: true, msg: mixpanelresult?.message });
            }
        };
        const socialMediaOauth = async () => {
            payload = {
                socialMediaTypeID: socialMediaData[sourceName?.toLowerCase()]?.SocialMediaTypeID, // remoteDataSourceID === 85 ? 6 : 1,
                socialMediaTypeName: socialMediaData[sourceName?.toLowerCase()]?.Name ,//remoteDataSourceID === 85 ? 'Resulticks-Instagram' : 'Resulticks-Facebook',
                departmentId,
                socialmediaAttributeValue: {
                    appId: params.appId,
                    appSecret: params.appSecret,
                },
            };
            const socialMediaResult = await dispatch(socialMediaAppKeys(payload));
            if (socialMediaResult?.status) {
                let payload = {
                    socialMediaTypeId: socialMediaData[sourceName?.toLowerCase()]?.SocialMediaTypeID,
                    socialMediaTypeName: socialMediaData[sourceName?.toLowerCase()]?.Name,
                    redirectUrl: `${window.location.origin}${window.location.pathname}?socialpage=${sourceName?.toLowerCase()?.replace(/\s+/g, '')}`,
                    socialmediaUniqueID: socialMediaResult?.data?.socialmediaUniqueID,
                };
                const response = await dispatch(getSocialMediaOauthUrl({ payload }));
                if (response?.status) {
                    let url = response?.data;
                     window.location.href = url;
                   // window.open(url, '_blank', 'noopener,noreferrer');
                }
                localStorage.setItem('socialmediaUniqueID', socialMediaResult?.data?.socialmediaUniqueID);
                dispatch(updateIntegartedSytem({ field: 'connectFields', data: {} }));
            } else {
                setConnectFlag({ show: true, msg: socialMediaResult?.message });
            }
        };
        let payload;
        switch (connectFields?.remoteDataSourceID) {
            case 155:
                payload = {
                    clientId,
                    departmentId,
                    userId,
                    userName: params?.userName,
                    password: params?.password,
                    friendlyName: params?.instanceName,
                    connectorId: remoteDataSourceID,
                    remoteSettingId: remoteSettingId > 0 ? remoteSettingId : 0,
                };
                const digipopResult = await dispatch(save_digipop_credentails(payload));
                if (digipopResult?.status) {
                    dispatch(updateIntegartedSytem({ field: 'connectFields', data: {} }));
                } else {
                    setConnectFlag({ show: true, msg: digipopResult?.message });
                }
                break;
            case 54:
                payload = {
                    clientId,
                    departmentId,
                    userId,
                    authToken: params?.authToken,
                    updateCycle: params?.updateCycle?.id?.toString(),
                    friendlyName: params?.instanceName,
                    connectorId: remoteDataSourceID,
                    connectorName: connectFields?.sourceName,
                    remoteSettingId: remoteSettingId > 0 ? remoteSettingId : 0,
                    organizationName: params?.organizationName?.name,
                };
                const result = await dispatch(dataExchange_connection_exist({ payload }));
                if (result?.status) {
                    dispatch(updateIntegartedSytem({ field: 'connectFields', data: {} }));
                } else {
                    setConnectFlag({ show: true, msg: result?.message });
                }
                break;
            case 161:
                payload = {
                    apiKey: params?.apiKey,
                    friendlyName: params?.instanceName,
                    connectorId: remoteDataSourceID,
                    connectorName: connectFields?.sourceName,
                    eventName: params?.eventZillaColumn?.name,
                    eventId: params?.eventZillaColumn?.id?.toString(),
                    tableName: params?.eventZillaTable?.name,
                };
                const eventZillaresult = await dispatch(dataExchange_connection_exist({ payload }));
                if (eventZillaresult?.status) {
                    dispatch(updateIntegartedSytem({ field: 'connectFields', data: {} }));
                } else {
                    setConnectFlag({ show: true, msg: result?.message });
                }
                break;
            case 59:
                const selectedProperty = propertyList?.find((x) => x?.name === property?.name);
                if (selectedProperty) {
                    payload = {
                        propertyId: selectedProperty?.id,
                        jsonPath: uploadedURL,
                        connectorId: remoteDataSourceID,
                        connectorName: connectFields?.sourceName,
                        friendlyName: params?.instanceName,
                    };
                    const response = await dispatch(dataExchange_connection_exist({ payload }));
                    if (response?.status) {
                        dispatch(updateIntegartedSytem({ field: 'connectFields', data: {} }));
                    } else {
                        setConnectFlag({ show: true, msg: response?.message });
                    }
                    break;
                }
            case 69:
                const selectedAccount = accountList?.find((x) => x?.name === account?.name);
                if (selectedAccount) {
                    payload = {
                        jsonPath: uploadedURL,
                        connectorName: 'GoogleTagManager',
                        connectorId: remoteDataSourceID,
                        accountId: selectedAccount?.id,
                        friendlyName: params?.instanceName,
                    };
                    const response = await dispatch(dataExchange_connection_exist({ payload }));
                    if (response?.status) {
                        dispatch(updateIntegartedSytem({ field: 'connectFields', data: {} }));
                    } else {
                        setConnectFlag({ show: true, msg: response?.message });
                    }
                    break;
                }
            case 159:
                payload = {
                    host: params?.resource,
                    port: params?.portNumber,
                    user: params?.userName,
                    catalog: params?.catalog,
                    schema: params?.schema,
                    connectorId: remoteDataSourceID,
                    connectorName: connectFields?.sourceName,
                    friendlyName: params?.instanceName,
                };
                const prestoDbresult = await dispatch(dataExchange_connection_exist({ payload }));
                if (prestoDbresult?.status) {
                    dispatch(updateIntegartedSytem({ field: 'connectFields', data: {} }));
                } else {
                    setConnectFlag({ show: true, msg: result?.message });
                }
                break;
            case 65:
                handlemixpanel();
                break;
            case 162:
                handlemixpanel();
                break;
            case 171:
                handleZeroBounce();
                break;
            case 76:
                payload = {
                    apiToken: params?.accesstoken,
                    mediaId: params?.media?.id,
                    connectorId: remoteDataSourceID,
                    connectorName: connectFields?.sourceName,
                    friendlyName: params?.instanceName,
                    updateCycle: params?.updateCycle?.id,
                };
                const wistiaresult = await dispatch(dataExchange_connection_exist({ payload }));
                if (wistiaresult?.status) {
                    dispatch(updateIntegartedSytem({ field: 'connectFields', data: {} }));
                } else {
                    setConnectFlag({ show: true, msg: wistiaresult?.message });
                }
                break;
            case 75:
                payload = {
                    accessToken: params?.accesstoken,
                    connectorId: remoteDataSourceID,
                    connectorName: connectFields?.sourceName,
                    friendlyName: params?.instanceName,
                };
                const vimeoresult = await dispatch(dataExchange_connection_exist({ payload }));
                if (vimeoresult?.status) {
                    dispatch(updateIntegartedSytem({ field: 'connectFields', data: {} }));
                } else {
                    setConnectFlag({ show: true, msg: vimeoresult?.message });
                }
                break;
            case 24:
                await socialMediaOauth();
                break;
            case 157:
                await socialMediaOauth();
                break;
            case 85:
                socialMediaOauth();
                break;
            default:
                const { description, secretKey, webHookName, webHookURL } = params;
                payload = {
                    clientId,
                    departmentId,
                    userId,
                    webHookSettingId: remoteSettingId > 0 ? remoteSettingId : 0,
                    webHookName,
                    webHookURL,
                    secretKey,
                    description,
                    type: connectFields?.sourceName === 'Webhook' ? 'W' : 'C',
                };
                const webhookResult = isExtendedChannel
                    ? await webhookSaveApi.refetch({
                          mode: 'create',
                          loaderConfig: { create: LOADER_TYPE.NONE },
                          fetcher: () => dispatch(get_webhooknameSave(payload, false)),
                      })
                    : await dispatch(get_webhooknameSave(payload));
                if (webhookResult?.status) {
                    dispatch(updateIntegartedSytem({ field: 'connectFields', data: {} }));
                } else {
                    setConnectFlag({ show: true, msg: webhookResult?.message });
                }
                break;
        }
    };
    const handleExtendedSystem = async () => {
        let payload = {
            clientId,
            departmentId,
            userId,
            webHookSettingId: connectFields?.remoteSettingId,
            type: connectFields?.remoteDataSourceID === 56 ? 'W' : 'C',
        };
        const result = await extendedEditApi.refetch({
            mode: 'create',
            loaderConfig: { create: LOADER_TYPE.NONE },
            fetcher: () => dispatch(get_Extendedvalues(payload, false)),
        });
        if (result?.status) {
            reset((formState) => ({
                ...formState,
                webHookName: result?.data[0]?.webHookName,
                webHookURL: result?.data[0]?.webHookURL,
                secretKey: result?.data[0]?.secretKey,
                description: result?.data[0]?.description,
            }));
        }
    };
    const handleEventBriteExtendedSystem = async () => {
        let payload = {
            clientId,
            departmentId,
            userId,
            remotesettingId: connectFields?.remoteSettingId,
        };
        const result = await dispatch(get_ConnectorDetails(payload));

        if (result?.status) {
            const organizationList = await getEditOrganizationList(result?.data);
            let editOrgList = organizationList?.map((item, ind) => ({
                id: ind,
                name: item,
            }));
            reset((formState) => ({
                ...formState,
                instanceName: result?.data?.friendlyName,
                authToken: result?.data?.password,
                updateCycle: eventUpdateCycle?.find((e) => e?.id === result?.data?.scheduleFrequency),
                organizationName: editOrgList?.find((e) => e?.name === result?.data?.schemaName),
            }));
        }
    };

    const handleDigipopSystem = async () => {
        let payload = {
            clientId,
            departmentId,
            userId,
            connectorId: connectFields?.remoteDataSourceID,
            remoteSettingId: connectFields?.remoteSettingId,
        };
        const result = await dispatch(get_DigipopExtendedvalues(payload));
        if (result?.status) {
            const resultJson = parseAudienceJson(result?.data, {});
            reset((formState) => ({
                ...formState,
                instanceName: resultJson.friendlyName,
                userName: resultJson.userName,
                password: resultJson.password,
            }));
        }
    };

    const handleGoogleAnalytics = async () => {
        let payload = {
            clientId,
            departmentId,
            userId,
            remotesettingId: connectFields?.remoteSettingId,
        };
        const result = await dispatch(get_ConnectorDetails(payload));
        if (result?.status) {
            var resultJson = result?.data;
            if (resultJson.ipAddress) {
                setFileName(resultJson.ipAddress);
                const analyticsPayload = {
                    jsonPath: resultJson.ipAddress,
                    connectorName: 'googleanalytics',
                    connectorId: 59,
                    instanceName: resultJson.friendlyName,
                };
                const { status: response, data: responseData } = await dispatch(
                    get_googleanalyticsaccountslists(analyticsPayload),
                );
                let matchedProperty = {};
                if (response) {
                    if (responseData.accountSummaries.length) {
                        const mergedProperties = responseData?.accountSummaries?.flatMap(({ ...item }) =>
                            item?.propertySummaries?.map(({ property, displayName, ...rest }) => ({
                                ...rest,
                                name: displayName,
                                id: property,
                            })),
                        );
                        matchedProperty = mergedProperties.find((x) => x.id === resultJson.username);
                        setPropertyList(mergedProperties);
                    }
                }
                let selectedproperty = { id: matchedProperty.id, name: matchedProperty.name };
                await reset((formState) => ({
                    ...formState,
                    instanceName: resultJson.friendlyName,
                    jsonFilePath: resultJson.ipAddress,
                    property: selectedproperty,
                }));
            }
        }
    };

    const handleGoogleTagManager = async () => {
        let payload = {
            clientId,
            departmentId,
            userId,
            remotesettingId: connectFields?.remoteSettingId,
        };
        const result = await dispatch(get_ConnectorDetails(payload));
        if (result?.status) {
            var resultJson = result?.data;
            if (resultJson.ipAddress) {
                setFileName(resultJson.ipAddress);
                const analyticsPayload = {
                    jsonPath: resultJson.ipAddress,
                    connectorName: connectFields?.sourceName,
                    connectorId: connectFields?.remoteDataSourceID,
                    instanceName: resultJson.friendlyName,
                };
                const { status: response, data: responseData } = await dispatch(
                    get_googleanalyticsaccountslists(analyticsPayload),
                );
                let matchedAccount = {};
                if (response) {
                    if (responseData.account.length) {
                        const transformedArray = responseData?.account.map((item) => ({
                            id: item.accountId,
                            name: item.name,
                        }));
                        matchedAccount = transformedArray.find((x) => x.id === resultJson.username);
                        setAccountList(transformedArray);
                    }
                }
                let selectedAccount = { id: matchedAccount.id, name: matchedAccount.name };
                await reset((formState) => ({
                    ...formState,
                    instanceName: resultJson.friendlyName,
                    jsonFilePath: resultJson.ipAddress,
                    account: selectedAccount,
                }));
            }
        }
    };

    const handleConnectors = async () => {
        let payload = {
            clientId,
            departmentId,
            userId,
            remotesettingId: connectFields?.remoteSettingId,
        };
        const result = await dispatch(get_ConnectorDetails(payload));
        if (result?.status) {
            if (payload.remotesettingId === 63) {
                //Vimeo
                reset((formState) => ({
                    ...formState,
                    instanceName: result?.data?.friendlyName,
                    accesstoken: result?.data?.username,
                }));
            } else if (payload.remotesettingId === 62) {
                //Wistia
                payload = {
                    apiToken: result?.data?.password,
                    connectorId: connectFields?.remoteDataSourceID,
                    connectorName: 'Wistia',
                };
                const res = await dispatch(getWistiaMedia({ payload }));
                if (res?.data) {
                    const selectedMedia = res?.data?.find((x) => x?.id === result?.data?.username);
                    if (selectedMedia) {
                        reset((formState) => ({
                            ...formState,
                            media: selectedMedia,
                        }));
                    }
                }

                const selectedCycle = eventUpdateCycle?.find((x) => x?.id === result?.data?.scheduleFrequency);
                if (selectedCycle) {
                    reset((formState) => ({
                        ...formState,
                        updateCycle: selectedCycle,
                    }));
                }
                reset((formState) => ({
                    ...formState,
                    instanceName: result?.data?.friendlyName,
                    accesstoken: result?.data?.password,
                }));
            } else if (payload.remotesettingId === 162 || payload.remotesettingId === 65) {
                reset((formState) => ({
                    ...formState,
                    instanceName: result.friendlyName,
                    DomainName: result.DomainName,
                    Serviceaccountname: result.Serviceaccountname,
                    ServiceAccountSecret: result.ServiceAccountSecret,
                }));
            }
        }
    };

    const handleEventZilla = async () => {
        let payload = {
            clientId,
            departmentId,
            userId,
            remotesettingId: connectFields?.remoteSettingId,
        };
        const result = await dispatch(get_ConnectorDetails(payload));
        if (result?.status) {
            const tableid = tableDropDown?.findIndex((item) => item === result?.data?.databaseName);
            reset((formState) => ({
                ...formState,
                instanceName: result?.data?.friendlyName,
                apiKey: result?.data?.username,
                eventZillaTable: { name: result?.data?.databaseName, id: Number(tableid) },
                eventZillaColumn: { name: result?.data?.password, id: Number(result?.data?.schemaName) },
            }));

            if (result?.data?.username) {
                const table_payload = {
                    apiKey: result?.data?.username,
                    connectorId: connectFields?.remoteDataSourceID,
                    connectorName: connectFields?.sourceName,
                };
                const res = await dispatch(dataExchange_get_tables_from_DB({ payload: table_payload }));
                if (res?.status) {
                    const formattedTableData = res?.data?.map((item, index) => ({
                        id: index + 1,
                        name: item,
                    }));
                    setTableList(formattedTableData);
                    const event = {
                        name: 'eventZilla',
                        value: {
                            name: result?.data?.databaseName,
                            id: Number(tableid),
                        },
                    };
                    handletablechange(event);
                }
            }
        }
    };

    const audienceUploadValidation = (fileData) => {
        let reader = new FileReader();
        reader.readAsText(fileData);
        reader.onload = async function () {
            try {
                const jsonData = safeParseJSON(reader.result, null);
                if (!jsonData) return;
                const payload = { ...jsonData };
                const { status, data } = await dispatch(get_BigqueryDetail(payload));
                if (status) {
                    const { jsonFilePath } = data;
                    setValue('jsonFilePath', jsonFilePath);
                    setFileName(fileData?.name);
                    if (connectFields?.remoteDataSourceID === 59) {
                        const analyticsPayload = {
                            jsonPath: jsonFilePath,
                            connectorId: connectFields?.remoteDataSourceID,
                            connectorName: connectFields?.sourceName,
                            friendlyName,
                        };
                        const { status: response, data: responseData } = await dispatch(
                            get_googleanalyticsaccountslists(analyticsPayload),
                        );
                        if (response) {
                            if (responseData.accountSummaries.length) {
                                const mergedProperties = responseData?.accountSummaries?.flatMap(({ ...item }) =>
                                    item?.propertySummaries?.map(({ property, displayName, ...rest }) => ({
                                        ...rest,
                                        name: displayName,
                                        id: property,
                                    })),
                                );
                                setPropertyList(mergedProperties);
                            }
                        }
                    } else if (connectFields?.remoteDataSourceID === 69) {
                        const analyticsPayload = {
                            jsonPath: jsonFilePath,
                            connectorId: connectFields?.remoteDataSourceID,
                            connectorName: connectFields?.sourceName,
                            friendlyName,
                        };
                        const { status: response, data: responseData } = await dispatch(
                            get_googleanalyticsaccountslists(analyticsPayload),
                        );
                        if (response) {
                            if (responseData.account.length) {
                                const transformedArray = responseData?.account.map((item) => ({
                                    id: item.accountId,
                                    name: item.name,
                                }));
                                setAccountList(transformedArray);
                            }
                        }
                    }
                } else {
                    setValue('jsonFilePath', '');
                    setFileName('');
                }
            } catch (error) {
            }
        };

        reader.onerror = function (error) {
        };
    };

    useEffect(() => {
        if (Object.keys(connectFields)?.length > 0 && connectFields?.remoteSettingId > 0) {
            switch (connectFields?.remoteDataSourceID) {
                case 56:
                case 57:
                    extendedEditApi.reset();
                    handleExtendedSystem();
                    break;
                case 155:
                    handleDigipopSystem();
                    break;
                case 161:
                    handleEventZilla();
                case 59:
                    handleGoogleAnalytics();
                case 69:
                    handleGoogleTagManager();
                case 75:
                    handleConnectors();
                case 76:
                    if (eventUpdateCycle.length) handleConnectors();
                // case 65:
                //     handleMixPanel();
                // case 162:
                //     handleMixPanel();
            }
        }
    }, [connectFields, eventUpdateCycle]);
    useEffect(() => {
        if (Object.keys(connectFields)?.length > 0 && connectFields?.remoteSettingId > 0 && eventUpdateCycle?.length) {
            if (connectFields?.remoteDataSourceID === 54) {
                handleEventBriteExtendedSystem(eventUpdateCycle);
            }
        }
    }, [connectFields, eventUpdateCycle]);
    const getUpdateCycle = async () => {
        let payload = { clientId, userId, departmentId };
        dispatch(getUpdateCycleFrequency({ payload }));
    };
    const getEditOrganizationList = async (params) => {
        if (!_isEmpty(params)) {
            let payload = {
                authToken: params?.password,
                departmentId,
                clientId,
                userId,
                connectorName: connectFields?.sourceName,
                connectorId: connectFields?.remoteDataSourceID,
            };
            let res = await dispatch(getOrganizationList({ payload }));
            return res?.status ? res?.data : [];
        }
    };

    const checkFormHasValues = () => {
        const formValues = getValues();
        // Check if any field has a value (excluding empty strings, null, undefined, empty objects, empty arrays)
        return Object.values(formValues).some(value => {
            if (value === '' || value === null || value === undefined) {
                return false;
            }
            // Check for empty objects
            if (typeof value === 'object' && !Array.isArray(value)) {
                return Object.keys(value).length > 0;
            }
            // Check for empty arrays
            if (Array.isArray(value)) {
                return value.length > 0;
            }
            return true;
        });
    };

    const handleReset = () => {
                
        // Check if form has any values
        if (checkFormHasValues()) {
            setShowResetModal(true);
        } else {
            performReset();
        }
    };

    const performReset = () => {
        // Preserve webHookName in edit scenario (remoteSettingId > 0)
        const currentValues = getValues();
        const preserved = {};
        if (connectFields?.remoteSettingId > 0 && currentValues?.webHookName) {
            preserved.webHookName = currentValues.webHookName;
        }

        // Reset form, keeping preserved fields if any
        reset(preserved);
        setFileName('');
        setConnectFlag({ show: false, msg: '' });
        setShowResetModal(false);
        setForceUpdate((prev) => prev + 1); // Force re-render to update reset button visibility
    };

    useOnlyDepChangeEffect(() => {
        let updatedCycle = updateCycleList?.map((item) => ({
            id: item?.typeId,
            name: item?.type,
        }));
        setEventUpdateCycle(updatedCycle);
    }, [updateCycleList]);
    useEffect(() => {
        let updatedCycle = organizationList?.map((item, ind) => ({
            id: ind,
            name: item,
        }));
        setOrganizationList(updatedCycle);
    }, [organizationList]);
    useEffect(() => {
        if (
            connectFields?.sourceName === 'Eventbrite' ||
            connectFields?.remoteDataSourceID === 65 ||
            connectFields?.remoteDataSourceID === 162 ||
            connectFields?.remoteDataSourceID === 76
        ) {
            getUpdateCycle();
        }
        return () => {
            dispatch(updateCycleFrequency([]));
            dispatch(updateWistiaMedia([]));
            dispatch(updateMatomoSites([]));
            dispatch(updateMatomoInsights([]));
        };
    }, [connectFields?.sourceName]);

    const renderExtendedChannelEditSkeleton = () => (
        <Row>
            <Col sm={4} className="form-group">
                <CommonSkeleton box height={10} width={110} mainClass="" />
                <CommonSkeleton box height={20} />
            </Col>
            <Col sm={4} className="form-group">
                <CommonSkeleton box height={10} width={50} mainClass="" />
                <CommonSkeleton box height={20} />
            </Col>
            <Col sm={4} className="form-group">
                <CommonSkeleton box height={10} width={80} mainClass="" />
                <CommonSkeleton box height={20} />
            </Col>
            <Col sm={4}>
                <CommonSkeleton box height={10} width={90} mainClass="" />
                <CommonSkeleton box height={50} />
            </Col>
        </Row>
    );

    return (
        <FormProvider {...methods}>
            <Container className="dataExchangePageCSS">
                <div className="mt21">
                    <form onSubmit={handleSubmit(handleConnect)}>
                        <div className="box-design">
                            <Row>
                                <Col sm={12}>
                                    <div className="d-flex justify-content-between align-items-center mb21">
                                        <h4 className='mb0'>{connectFields?.sourceGroupName + ' - ' + connectFields?.sourceName}</h4>
                                        {checkFormHasValues() && forceUpdate >= 0 && (
                                            <RSTooltip position="top" text="Reset" className="lh0">
                                                <i
                                                    id="rs_data_reset"
                                                    className={`${restart_medium} icon-md color-primary-blue cursor-pointer`}
                                                    onClick={handleReset}
                                                ></i>
                                            </RSTooltip>
                                        )}
                                    </div>
                                </Col>

                                {showExtendedEditSkeleton
                                    ? renderExtendedChannelEditSkeleton()
                                    : connectFieldsLists[connectFields?.sourceName?.toLowerCase()]?.fields?.map(
                                    ({
                                        name,
                                        type,
                                        placeHolder,
                                        value,
                                        size,
                                        required,
                                        requiredMsg,
                                        rules,
                                        apiConnection,
                                        onkey,
                                    }) => {
                                        return (
                                            <Fragment key={name}>
                                                {type === 'friendlyName' && (
                                                    <Col sm={4} className="form-group">
                                                        <ListNameExists
                                                            name={`instanceName`}
                                                            control={control}
                                                            field="friendlyname"
                                                            apiCallback={apiConnection}
                                                            condition={(data) => {
                                                                const { status } = data;
                                                                // setLoading(status);
                                                                return !status;
                                                            }}
                                                            rules={LIST_NAME_RULES(INSTANCE_NAME_VALIDATION)}
                                                            placeholder={INSTANCE_NAME}
                                                            extraPayload={{
                                                                remoteDataSourceID: connectFields?.remoteDataSourceID,
                                                            }}
                                                            // disabled={disable}
                                                            callback={() => {
                                                                // setLoading(true);
                                                            }}
                                                        />
                                                    </Col>
                                                )}
                                                {type === 'text' && (
                                                    <Col sm={4} className={`form-group ${(connectFields?.remoteSettingId > 0  && name == 'webHookName') ? 'click-off' : ''}`}>
                                                        <RSInput
                                                            control={control}
                                                            name={name}
                                                            placeholder={placeHolder}
                                                            type={type}
                                                            defaultValue={value}
                                                            required={required}
                                                            onKeyDown={onkey}
                                                            isLoading={
                                                                name === 'webHookName' && webhookNameCheckApi.isLoading
                                                            }
                                                            rules={{
                                                                // required: error.ENTER_ATTRIBUTE,
                                                                ...rules,
                                                            }}
                                                            // rules={rules}
                                                            handleOnBlur={async ({ target: { value } }) => {
                                                                if (
                                                                    value.trim()?.length > 2 &&
                                                                    value !== existingListName
                                                                ) {
                                                                    existingListName = value;
                                                                    // if (
                                                                    //     connectFields?.remoteDataSourceID === 155 &&
                                                                    //     apiConnection !== ''
                                                                    // ) {
                                                                    //     requestconnectionDigipop(
                                                                    //         value,
                                                                    //         apiConnection,
                                                                    //         name,
                                                                    //     );
                                                                    // } else
                                                                    if (apiConnection !== '') {
                                                                        requestconnection(value, apiConnection, name);
                                                                    }
                                                                }
                                                            }}
                                                            disabled={
                                                                connectFields?.remoteDataSourceID === 163 &&
                                                                name === 'accesstoken'
                                                                    ? !domainUrl
                                                                    : name === 'DomainName'
                                                                    ? !friendlyName
                                                                    : (connectFields?.remoteSettingId > 0  && name == 'webHookName') ?
                                                                    true   : false
                                                            }
                                                        />
                                                    </Col>
                                                )}
                                                {type === 'password' && (
                                                    <Col sm={4} className="form-group">
                                                        <RSInput
                                                            control={control}
                                                            name={name}
                                                            placeholder={placeHolder}
                                                            type={type}
                                                            defaultValue={value}
                                                            required={required}
                                                            viewEye={true}
                                                            handleOnchange={() =>
                                                                setConnectFlag({ show: false, msg: '' })
                                                            }
                                                        />
                                                    </Col>
                                                )}
                                                {type === 'textArea' && (
                                                    <Col sm={4}>
                                                        <RSTextarea
                                                            control={control}
                                                            name={name}
                                                            placeholder={placeHolder}
                                                            defaultValue={value}
                                                            required={required}
                                                        />
                                                    </Col>
                                                )}
                                                {type === 'dropdown' && (
                                                    <Col sm={4} className="form-group">
                                                        <RSKendoDropDown
                                                            name={name}
                                                            control={control}
                                                            data={
                                                                connectFields?.sourceName === 'Eventbrite' &&
                                                                name === 'updateCycle'
                                                                    ? eventUpdateCycle
                                                                    : connectFields?.sourceName === 'Eventbrite' &&
                                                                      name === 'organizationName'
                                                                    ? OrganizationList
                                                                    : connectFields?.sourceName === 'Eventzilla' &&
                                                                      name === 'eventZillaTable'
                                                                    ? TableList
                                                                    : connectFields?.sourceName === 'Eventzilla' &&
                                                                      name === 'eventZillaColumn'
                                                                    ? columnList
                                                                    : connectFields?.sourceName ===
                                                                          'Google Analytics' && name === 'property'
                                                                    ? propertyList
                                                                    : connectFields?.sourceName ===
                                                                          'Google Tag Manager' && name === 'account'
                                                                    ? accountList
                                                                    : connectFields?.sourceName === 'Mixpanel'
                                                                    ? eventUpdateCycle
                                                                    : connectFields?.sourceName === 'Wistia' &&
                                                                      name === 'media'
                                                                    ? updateWistiaMediaList
                                                                    : connectFields?.sourceName === 'Wistia' &&
                                                                      name === 'updateCycle'
                                                                    ? eventUpdateCycle
                                                                    : connectFields?.sourceName === 'Matomo' &&
                                                                      name === 'sitename'
                                                                    ? updateMatomoSiteList
                                                                    : connectFields?.sourceName === 'Matomo' &&
                                                                      name === 'insights'
                                                                    ? updateMatomoInsightList
                                                                    : value
                                                            }
                                                            label={placeHolder}
                                                            textField="name"
                                                            // dataItemKey={`${
                                                            //     connectFields?.sourceName === 'Google Analytics' &&
                                                            //     name === 'property'
                                                            //         ? 'name'
                                                            //         : 'id'
                                                            // }`}

                                                            dataItemKey={`id`}
                                                            rules={{
                                                                required: requiredMsg,
                                                            }}
                                                            disabled={
                                                                (connectFields?.sourceName === 'Eventbrite' &&
                                                                    name === 'organizationName' &&
                                                                    (!OrganizationList || !OrganizationList.length)) ||
                                                                (connectFields?.sourceName === 'Eventzilla' &&
                                                                    name === 'eventZillaTable' &&
                                                                    (!TableList || !TableList.length)) ||
                                                                (connectFields?.sourceName === 'Eventzilla' &&
                                                                    name === 'eventZillaColumn' &&
                                                                    (!columnList || !columnList.length)) ||
                                                                (connectFields?.sourceName === 'Google Analytics' &&
                                                                    name === 'property' &&
                                                                    (!friendlyName || !uploadedURL)) ||
                                                                (connectFields?.sourceName === 'Google Tag Manager' &&
                                                                    name === 'account' &&
                                                                    (!friendlyName || !uploadedURL)) ||
                                                                (connectFields?.sourceName === 'Matomo' &&
                                                                    name === 'sitename' &&
                                                                    (!updateMatomoSiteList ||
                                                                        !updateMatomoSiteList.length)) ||
                                                                (connectFields?.sourceName === 'Matomo' &&
                                                                    name === 'insights' &&
                                                                    (!updateMatomoSiteList ||
                                                                        !updateMatomoSiteList.length))
                                                            }
                                                            required={required}
                                                            // handleChange={() => setConnectFlag({ show: false, msg: '' })
                                                            handleChange={
                                                                (event) =>
                                                                    connectFields?.sourceName === 'Eventzilla' &&
                                                                    name === 'eventZillaTable'
                                                                        ? handletablechange(event)
                                                                        : connectFields?.sourceName === 'Matomo' &&
                                                                          name === 'sitename'
                                                                        ? apiConnection !== '' &&
                                                                          requestconnection(
                                                                              event.value,
                                                                              apiConnection,
                                                                              name,
                                                                          )
                                                                        : () => setConnectFlag({ show: false, msg: '' }) // ✅ Pass as function
                                                            }
                                                            className={`${
                                                                connectFields?.sourceName === 'Google Analytics' &&
                                                                name === 'property' &&
                                                                (!uploadedURL || !propertyList.length)
                                                                    ? 'click-off'
                                                                    : ''
                                                            }`}
                                                        />
                                                    </Col>
                                                )}
                                                {type === 'checkbox' && (
                                                    <RSCheckbox
                                                        control={control}
                                                        name={name}
                                                        labelName={placeHolder}
                                                        required={required}
                                                    />
                                                )}
                                                {type === 'upload' && (
                                                    <>
                                                        <Col
                                                            sm={4}
                                                            className={`${
                                                                !friendlyName && !uploadedURL ? 'click-off' : ''
                                                            } form-group`}
                                                        >
                                                            <RSFileUpload
                                                                control={control}
                                                                name="jsonFilePath"
                                                                accept={'.json'}
                                                                clearErrors={clearErrors}
                                                                setError={setError}
                                                                required
                                                                disabled={!friendlyName}
                                                                handleChange={(e) => {
                                                                    audienceUploadValidation(e.target.files[0]);
                                                                }}
                                                                onClick={(event) => {
                                                                    event.target.value = null;
                                                                }}
                                                                watch={watch}
                                                                size={10485760}
                                                                placeholder={fileName}
                                                            />
                                                        </Col>
                                                    </>
                                                )}
                                                {type === 'date' && (
                                                    <Col sm={4}>
                                                        <RSDatePicker
                                                            required
                                                            type={'date'}
                                                            name={name}
                                                            placeholder={placeHolder}
                                                            control={control}
                                                            maxLength={5}
                                                            rules={{
                                                                required: required,
                                                                minLength: {
                                                                    value: 2,
                                                                    message: ENTER_VALID_DAYS,
                                                                },
                                                            }}
                                                            key={name}
                                                            disabled={!site}
                                                        />
                                                    </Col>
                                                )}
                                            </Fragment>
                                        );
                                    },
                                )}

                                {/* {connectFields?.sourceName === "Eventzilla"  && TableList.length > 0 &&(
                                <Col>
                                    <RSKendoDropDown
                                        name="eventZillaTable"
                                        control={control}
                                        data={TableList}
                                        textField="name"
                                        dataItemKey="id"
                                        handleChange={handletablechange}
                                    />
                                </Col>
                            )}

                            {connectFields?.sourceName === "Eventzilla" && columnList.length > 0 && (
                                <Col>
                                    <RSKendoDropDown
                                        name="eventZillaColumn"
                                        control={control}
                                        data={columnList}
                                        textField="name"
                                        dataItemKey="id"
                                    // handleChange={handletablechange}
                                    />
                                </Col>
                            )} */}
                            </Row>
                        </div>
                        {connectFlag.show && <p className="text-danger p-1"> {connectFlag.msg}</p>}

                        <div className="buttons-holder">
                            <RSSecondaryButton
                                onClick={() => {
                                    dispatch(updateIntegartedSytem({ field: 'connectFields', data: {} }));
                                    dispatch(updateIntegartedSytem({ field: 'integratedSystem', data: [] }));
                                    let socialPostQuery = localStorage.getItem('socialPostQuery');
                                        const quries = parseDecryptedAudienceQuery(socialPostQuery, decryptWithAES, null);
                                        if(quries?.fromCommunication){
                                            navigate('/communication/create-communication' + quries?.backPath || '');
                                            localStorage.removeItem('socialPostQuery')
                                        }
                                    // navigate(`/preferences`);
                                }}
                                id="rs_ConnectFields_Cancel"
                            >
                                {CANCEL}
                            </RSSecondaryButton>

                            <RSPrimaryButton
                                className={connectFlag.show ? 'click-off' : ''}
                                type="submit"
                                id="rs_ConnectFields_save"
                                isLoading={isExtendedChannel && webhookSaveApi.isFetching}
                                loadingText={
                                    connectFields?.remoteSettingId > 0 ? 'Updating...' : 'Saving...'
                                }
                                disabledClass={
                                    isExtendedChannel && webhookSaveApi.isFetching ? 'pe-none click-off' : ''
                                }
                            >
                                {connectFields?.remoteSettingId > 0 ? UPDATE : SAVE}
                            </RSPrimaryButton>
                        </div>
                    </form>
                </div>
            </Container>
            <RSConfirmationModal
                show={showResetModal}
                header="Reset Form"
                text={ARE_YOU_SURE_WANT_TO_RESET}
                primaryButtonText={YES}
                secondaryButtonText={CANCEL}
                handleClose={() => setShowResetModal(false)}
                handleConfirm={() => performReset()}
                isBorder
            />
        </FormProvider>
    );
};

export default ConnectFields;
