import { encodeUrl } from 'Utils/modules/crypto';
import { maskStringRandomlyNew } from 'Utils/modules/masking';
import { ARE_YOU_SURE_WANT_TO_RESET, CANCEL, CONNECT, OK, SAVE, YES } from 'Constants/GlobalConstant/Placeholders';
import { restart_medium } from 'Constants/GlobalConstant/Glyphicons';
import { useEffect, useState } from 'react';
import { Col, Container, Row } from 'react-bootstrap';
import { useLocation, useNavigate } from 'react-router-dom';
import { useForm, FormProvider } from 'react-hook-form';

import { RSPrimaryButton } from 'Components/Buttons';
import RSPageHeader from 'Components/RSPageHeader';
import RSTooltip from 'Components/RSTooltip';
import { ODBC_MYSQL_STATE } from './constants';
import ConnectRDSInputs from './ConnectRDSInputs';
import TableAttributes from './TableAttributes';
import { useDispatch, useSelector } from 'react-redux';
import { db_connection_exist, getBQprojectList, get_tables_from_DB, dataExchange_connection_exist, dataExchange_get_tables_from_DB, db_connection_Versium, get_Versium_databyID, getUpdateCycleFrequency, dataExchange_get_Webinar, dataExchange_get_Webex, get_Partner_Connection_details, Update_Partner_Connection_details } from 'Reducers/remoteDataSource/request';
import { getSessionId } from 'Reducers/globalState/selector';
import { FormatEnum } from './ConnectRDSInputs/constants';
import useQueryParams from 'Hooks/useQueryParams';
import { getTableDropDown, setWebexData, setWebinarsData } from 'Reducers/RemoteDataSource/reducer';
import VersiumModal from './ConnectRDSInputs/VersiumModal';

import {
    get_DigipopGroupAttributes,
    get_IsDigipopEnabled,
    save_digipop_credentails,
} from 'Reducers/preferences/DataExchange/request';
import RSConfirmationModal from 'Components/ConfirmationModal';

const AddAudienceDataExchange = (props) => {
    const { state } = useLocation();
    const location = useQueryParams('/audience');
    // console.log('location@@: ', location);
    const methods = useForm({
        defaultValues: ODBC_MYSQL_STATE,
        mode: 'onTouched',
    });
    const navigate = useNavigate();
    const isOneTime =
        location?.isOneTime
    const isEdit = location?.mode === 'edit';
    const [fileName, setFileName] = useState('');
    const { csvFiles } = useSelector(({ addAudienceReducer }) => addAudienceReducer);
    const { bqConnected, bqProjectList } = useSelector(({ remoteDataSourceReducer }) => remoteDataSourceReducer);
    const {
        handleSubmit,
        control,
        watch,
        getValues,
        formState: { isValid, isDirty, errors },
        setValue,
    } = methods;
    const [showTableFlag, setShowTableFlag] = useState(false);
    const [showVersiumFlag, setShowVersiumFlag] = useState(false);
    const [showDigipopFlag, setShowDigipopFlag] = useState({
        show: false,
        data: {},
    });
    const [successMessage, setSuccessMessage] = useState({ msg: '', type: 'success' });
    const [loading, setLoading] = useState(false);
    const [versiumCreds, setVersiumCreds] = useState({
        status: false,
        data: [],
        isNewCred: false,
    });
    const [showResetModal, setShowResetModal] = useState(false);
    const dispatch = useDispatch();

    useEffect(() => {
        if (successMessage.msg) {
            setTimeout(() => {
                setSuccessMessage({ msg: '', type: '' });
            }, 10000);
        }
    }, [successMessage]);

    useEffect(() => {
        if (bqConnected) {
            let payload = { clientId, userId, departmentId: 1, path: bqConnected.path.trim() };
            dispatch(getBQprojectList({ payload }));
        }
    }, [bqConnected]);
    const { departmentId, clientId, userId } = useSelector((state) => getSessionId(state));
    const getUpdateCycle = async () => {
        let payload = { clientId, userId, departmentId };
        dispatch(getUpdateCycleFrequency({ payload }));
    };
    const handleConnect = async (params, source) => {
        // debugger
        const {
            ipAddress,
            portNumber,
            databaseName,
            userName,
            password,
            instanceName,
            schema,
            api,
            hubid,
            accesstoken,
            tenantDomain,
            resource,
            clientSecret,
            clientDomain,
            accountName,
            shopName,
            securityToken,
            storehash,
            accessKey,
            apiHost,
            secretKey,
            authId,
            siteId,
            httpPath,
            jsonFilePath,
            projectInfo,
            datasetInfo,
            projectName,
            catalog,
            spreadsheetId,
            credentials,
        } = source === 'versium' ? getValues() : params;

        let payload = {
            server: ipAddress,
            userName: userName,
            password: password,
            databaseName: databaseName,
            port: portNumber,
        };

        // hubspot

        let payloadHubspot = {
            hubId: hubid,
            accessToken: accesstoken,
            connectorId: location?.data.remoteDataSourceID,
            connectorName: location?.data.sourceName,
            friendlyName: instanceName,
            remoteSettingId: location?.data?.remoteSettingId || 0,
        };

        //bigquery

        let payload_bg = {
            jsonPath: jsonFilePath,
            projectInfo: projectInfo,
            datasetInfo: datasetInfo,
            projectName: projectName,
            connectorId: location?.data?.remoteDataSourceID,
            connectorName: location?.data?.sourceName,
            friendlyName: instanceName,
            remoteSettingId: location?.data?.remoteSettingId || 0,
            // friendlyName: instanceName,
        };
        //mysql

        let payload_my_sql = {
            username: userName,
            password: password,
            host: ipAddress,
            port: portNumber,
            departmentId,
            friendlyName: instanceName,
            listType: 5,
            sourceType: FormatEnum[location?.type] || 2,
            connectionType: 'open',
            dbTypeName: location?.type === 'mysql' ? 'mysql' : 'mssql',
            dbName: databaseName,
            clientId,
            userId,
            remoteSettingId: location?.data?.remoteSettingId || 0,
            //  scheduleFrequency: 1,
        };

        //crm

        let payload_mCRM = {
            tenantDomain,
            resource, // : 'https://resulticks.api.crm8.dynamics.com',
            clientSecret,
            clientDomain,
            // username: userName,
            // password: password,
            departmentId: departmentId,
            friendlyName: instanceName,
            listType: 5,
            // url: api,
            clientId,
            userId,
            connectorName: location?.data?.sourceName,
            connectorId: location?.data?.remoteDataSourceID,
            remoteSettingId: location?.data?.remoteSettingId || 0,
            //  scheduleFrequency: 1,
        };

        //versium
        // let payload_versium = {
        //     userName: versiumConfigData[0]?.userName, // userName,
        //     password: versiumConfigData[0]?.password, //password,
        //     departmentId: departmentId,
        //     url: versiumConfigData[0]?.url, //resource,
        //     clientId,
        //     userId,
        //     connectorName: location?.data?.sourceName,
        //     connectorId: location?.data?.remoteDataSourceID,
        //     //  scheduleFrequency: 1,
        // };

        let payload_versium = {
            userName: credentials?.UserName || userName,
            password: credentials?.Password || password,
            departmentId: departmentId,
            url: versiumCreds?.isNewCred ? versiumConfigData[0]?.url : credentials?.ConnectionUrl || resource,
            clientId,
            userId,
            connectorName: location?.data?.sourceName,
            connectorId: location?.data?.remoteDataSourceID,
            remoteSettingId: location?.data?.remoteSettingId || 0,
            //  scheduleFrequency: 1,
        };

        //snowflake

        let payload_Snowflake = {
            username: userName,
            password: password,
            account: accountName,
            database: databaseName,
            schema: schema,
            clientId,
            userId,
            departmentId,
            connectorName: location?.data?.sourceName,
            connectorId: location?.data?.remoteDataSourceID,
            friendlyName: instanceName,
            remoteSettingId: location?.data?.remoteSettingId || 0,
        };

        //Oracle

        let payload_Oracle = {
            host: ipAddress,
            schema: databaseName,
            username: userName,
            password: password,
            port: portNumber,
            connectorId: location?.data?.remoteDataSourceID,
            connectorName: location?.data?.sourceName,
            friendlyName: instanceName,
            clientId,
            userId,
            departmentId,
            remoteSettingId: location?.data?.remoteSettingId || 0,
        };
        //blackbaud",
        let payload_blackbaud = {
            remoteSettingId: location?.data?.remoteSettingId,
            connectorId: location?.data?.remoteDataSourceID,
            connectorName: location?.data?.sourceName,
            friendlyName: instanceName,
            clientId,
            userId,
            departmentId,
            remoteSettingId: location?.data?.remoteSettingId || 0,
        };
        //Leadsquared",
        let payload_leadsquared = {
            apiHost: apiHost,
            accessKey: accessKey,
            secretKey: secretKey,
            connectorId: location?.data?.remoteDataSourceID,
            connectorName: location?.data?.sourceName,
            friendlyName: instanceName,
            clientId,
            userId,
            departmentId,
            remoteSettingId: location?.data?.remoteSettingId || 0,
        };

        //Shopify
        let payload_shopify = {
            apiKey: resource,
            accessToken: accesstoken,
            shopName: shopName,
            connectorId: location?.data?.remoteDataSourceID,
            connectorName: location?.data?.sourceName,
            friendlyName: instanceName,
            clientId,
            userId,
            departmentId,
            remoteSettingId: location?.data?.remoteSettingId || 0,
        };

        //Salesforce
        let payload_salesforce = {
            username: userName,
            password: password,
            securityToken: securityToken,
            connectorId: location?.data?.remoteDataSourceID,
            connectorName: location?.data?.sourceName,
            friendlyName: instanceName,
            clientId,
            userId,
            departmentId,
            remoteSettingId: location?.data?.remoteSettingId || 0,
        };

        //Pipedrive
        let payload_pipedrive = {
            apiToken: resource,
            friendlyName: instanceName,
            connectorId: location?.data?.remoteDataSourceID,
            connectorName: location?.data?.sourceName,
            clientId,
            userId,
            departmentId,
            remoteSettingId: location?.data?.remoteSettingId || 0,
        };

        //Cassandra
        let payload_cassandra = {
            username: userName,
            password: password,
            server: ipAddress,
            port: portNumber,
            keyspaces: databaseName,
            connectorId: location?.data?.remoteDataSourceID,
            connectorName: location?.data?.sourceName,
            friendlyName: instanceName,
            clientId,
            userId,
            departmentId,
            remoteSettingId: location?.data?.remoteSettingId || 0,
        };

        //Areospike
        let payload_aerospike = {
            username: userName,
            password: password,
            host: ipAddress,
            port: portNumber,
            namespace: databaseName,
            connectorId: location?.data?.remoteDataSourceID,
            connectorName: location?.data?.sourceName,
            friendlyName: instanceName,
            clientId,
            userId,
            departmentId,
            remoteSettingId: location?.data?.remoteSettingId || 0,
        };

        //Mongodb
        let payload_mongodb = {
            username: userName,
            password: password,
            server: ipAddress,
            port: portNumber,
            database: databaseName,
            connectorId: location?.data?.remoteDataSourceID,
            connectorName: location?.data?.sourceName,
            friendlyName: instanceName,
            clientId,
            userId,
            departmentId,
            remoteSettingId: location?.data?.remoteSettingId || 0,
        };

        //Storehippo
        let payload_storehippo = {
            friendlyName: instanceName,
            shopName: shopName,
            accessKey: accesstoken,
            connectorId: location?.data?.remoteDataSourceID,
            connectorName: location?.data?.sourceName,
            clientId,
            userId,
            departmentId,
            remoteSettingId: location?.data?.remoteSettingId || 0,
        };

        //postgresql
        let payload_postgresql = {
            username: userName,
            password: password,
            host: ipAddress,
            schema: schema,
            database: databaseName,
            port: portNumber,
            friendlyName: instanceName,
            connectorId: location?.data?.remoteDataSourceID,
            connectorName: location?.data?.sourceName,
            clientId,
            userId,
            departmentId,
            remoteSettingId: location?.data?.remoteSettingId || 0,
        };

        //Eventbrite
        let payload_eventbrite = {
            authToken: accesstoken,
            connectorId: location?.data.remoteDataSourceID,
            connectorName: location?.data.sourceName,
            friendlyName: instanceName,
            clientId,
            userId,
            departmentId,
            remoteSettingId: location?.data?.remoteSettingId || 0,
        };
        //bigcommerce
        let payload_bigcommerce = {
            storeHash: storehash,
            accessToken: accesstoken,
            shopName: shopName,
            friendlyName: instanceName,
            connectorId: location?.data.remoteDataSourceID,
            connectorName: location?.data.sourceName,
            clientId,
            userId,
            departmentId,
            remoteSettingId: location?.data?.remoteSettingId || 0,
        };
        //PrestaShop
        let payload_prestashop = {
            apiKey: resource,
            prestashopUrl: shopName,
            friendlyName: instanceName,
            connectorId: location?.data.remoteDataSourceID,
            connectorName: location?.data.sourceName,
            clientId,
            userId,
            departmentId,
            remoteSettingId: location?.data?.remoteSettingId || 0,
        };
        //Magento
        let payload_magento = {
            magentoUrl: resource,
            accessToken: accesstoken,
            friendlyName: instanceName,
            username: userName,
            password: password,
            connectorId: location?.data.remoteDataSourceID,
            connectorName: location?.data.sourceName,
            clientId,
            userId,
            departmentId,
            remoteSettingId: location?.data?.remoteSettingId || 0,
        };
        //Woocommerce
        let payload_WooCommerce = {
            domainUrl: apiHost,
            consumerKey: accessKey,
            friendlyName: instanceName,
            consumerSecret: secretKey,
            connectorId: location?.data.remoteDataSourceID,
            connectorName: location?.data.sourceName,
            clientId,
            userId,
            departmentId,
            remoteSettingId: location?.data?.remoteSettingId || 0,
        };
        //Wix
        let payload_Wix = {
            authId: authId,
            siteId: siteId,
            friendlyName: instanceName,
            connectorId: location?.data.remoteDataSourceID,
            connectorName: location?.data.sourceName,
            clientId,
            userId,
            departmentId,
            remoteSettingId: location?.data?.remoteSettingId || 0,
        };
        //Data Bricks
        let payload_DataBricks = {
            host: resource,
            httpPath: httpPath,
            accessToken: accesstoken,
            database: databaseName,
            schema: schema,
            connectorId: location?.data.remoteDataSourceID,
            connectorName: location?.data.sourceName,
            friendlyName: instanceName,
            clientId,
            userId,
            departmentId,
            remoteSettingId: location?.data?.remoteSettingId || 0,
        };
        //Insightly
        let payload_Insightly = {
            apiKey: resource,
            friendlyName: instanceName,
            connectorId: location?.data.remoteDataSourceID,
            connectorName: location?.data.sourceName,
            clientId,
            userId,
            departmentId,
            remoteSettingId: location?.data?.remoteSettingId || 0,
        };
        //Webinar
        let Payload_Webinar = {
            friendlyName: instanceName,
            connectorId: location?.data.remoteDataSourceID,
            connectorName: location?.data.sourceName,
            remoteSettingId: location?.data.remoteSettingId,
        };
        let Payload_Webinar_datas = {
            connectorId: location?.data.remoteDataSourceID,
            connectorName: location?.data.sourceName,
            remoteSettingId: location?.data.remoteSettingId,
        };
        //Webex
        let Payload_Webex = {
            friendlyName: instanceName,
            connectorId: location?.data.remoteDataSourceID,
            connectorName: location?.data.sourceName,
            remoteSettingId: location?.data.remoteSettingId,
        };
        let Payload_PresToDb = {
            host: resource,
            port: portNumber,
            user: userName,
            catalog: catalog,
            schema: schema,
            connectorId: location?.data.remoteDataSourceID,
            connectorName: location?.data.sourceName,
            friendlyName: instanceName,
            remoteSettingId: location?.data?.remoteSettingId || 0,
        };
        let Payload_Commercetools = {
            clientId: clientDomain,
            clientSecret: clientSecret,
            projectKey: projectName,
            authHost: resource,
            connectorId: location?.data.remoteDataSourceID,
            connectorName: location?.data.sourceName,
            friendlyName: instanceName,
            remoteSettingId: location?.data?.remoteSettingId || 0,
        };
        let payload_Digipop = {
            userName: userName,
            password: btoa(password),
            connectorId: location?.data.remoteDataSourceID,
            connectorName: location?.data.sourceName,
            friendlyName: instanceName,
            clientId,
            departmentId,
            userId,
            remoteSettingId: location?.data?.remoteSettingId || 0,
        };
        let payload_googleSheet = {
            credentialsPath: jsonFilePath,
            spreadsheetId: spreadsheetId,
            connectorId: location?.data.remoteDataSourceID,
            connectorName: location?.data.sourceName,
            friendlyName: instanceName,
            clientId,
            departmentId,
            userId,
            remoteSettingId: location?.data?.remoteSettingId || 0,
        };
        const dataSourceId = location?.data?.remoteDataSourceID;
        let customPayload;
        switch (location?.type?.toLowerCase()) {
            case 'bigquery':
            case 'crm':
            case 'hubspot':
            case 'shopify':
            case 'snowflake':
            case 'oracle':
            case 'salesforce':
            case 'pipedrive':
            case 'cassandra':
            case 'aerospike':
            case 'mongodb':
            case 'storehippo':
            case 'postgresql':
            case 'eventbrite':
            case 'bigcommerce':
            case 'prestashop':
            case 'leadsquaredcrm':
            case 'blackbaud':
            case 'dynamic crm':
            case 'magento':
            case 'woocommerce':
            case 'wix':
            case 'databricks':
            case 'insightly':
            case 'gotowebinar':
            case 'webex':
            case 'prestodb':
            case 'commercetools':
            case 'google sheets':
                switch (dataSourceId) {
                    case 3:
                        customPayload = payload_Oracle;
                        break;
                    case 39:
                        customPayload = payload_Snowflake;
                        break;
                    case 28:
                        customPayload = payload_mCRM;
                        break;
                    case 45:
                        customPayload = payloadHubspot;
                        break;
                    case 22:
                        customPayload = payload_shopify;
                        break;
                    case 5:
                        customPayload = payload_salesforce;
                        break;
                    case 48:
                        customPayload = payload_aerospike;
                        break;
                    case 50:
                        customPayload = payload_pipedrive;
                        break;
                    case 51:
                        customPayload = payload_cassandra;
                        break;
                    case 41:
                        customPayload = payload_mongodb;
                        break;
                    case 49:
                        customPayload = payload_storehippo;
                        break;
                    case 52:
                        customPayload = payload_postgresql;
                        break;
                    case 54:
                        customPayload = payload_eventbrite;
                        break;
                    case 23:
                        customPayload = payload_bigcommerce;
                        break;
                    case 29:
                        customPayload = payload_prestashop;
                        break;
                    case 156:
                        customPayload = payload_leadsquared;
                        break;
                    case 55:
                        customPayload = payload_blackbaud;
                        break;
                    case 21:
                        customPayload = payload_magento;
                        break;
                    case 47:
                        customPayload = payload_WooCommerce;
                        break;
                    case 46:
                        customPayload = payload_Wix;
                        break;
                    case 53:
                        customPayload = payload_DataBricks;
                        break;
                    case 43:
                        customPayload = payload_bg;
                        break;
                    case 160:
                        customPayload = payload_Insightly;
                        break;
                    case 158:
                        customPayload = Payload_Webinar;
                        break;
                    case 106:
                        customPayload = Payload_Webex;
                        break;
                    case 159:
                        customPayload = Payload_PresToDb;
                        break;
                    case 166:
                        customPayload = Payload_Commercetools;
                        break;
                    case 168:
                        customPayload = payload_googleSheet;
                        break;
                }
                let result = await dispatch(dataExchange_connection_exist({ payload: customPayload }));
                if (result.status) {
                    getUpdateCycle();
                    if (dataSourceId === 158) {
                        let webinarResult = await dispatch(
                            dataExchange_get_Webinar({ payload: Payload_Webinar_datas }),
                        );
                        if (webinarResult?.status) {
                            let webinarsData = webinarResult?.data?.webinars ?? [];
                            let formattedWebinarsData = webinarsData.map((item, index) => ({
                                id: index + 1,
                                name: item,
                            }));
                            // console.log(webinarsData);
                            dispatch(setWebinarsData(formattedWebinarsData));
                            if (isEdit) {
                                let finalPayload = {
                                    ...Payload_Webinar,
                                    webinar: location?.data?.schemaName,
                                };
                                let connectionResult = await dispatch(
                                    dataExchange_get_tables_from_DB({ payload: finalPayload }),
                                );
                            } else {
                                dispatch(getTableDropDown([]));
                            }
                            setShowTableFlag(true);
                        }
                        setSuccessMessage({ msg: 'Successfully connected', type: 'success' });
                    } else if (dataSourceId === 106) {
                        let webexResult = await dispatch(dataExchange_get_Webex({ payload: Payload_Webex }));
                        if (webexResult?.status) {
                            let meetingData = webexResult?.data?.meetings ?? [];
                            let formattedMeetingData = meetingData.map((item, index) => ({
                                id: index + 1,
                                name: item,
                            }));
                            // console.log(webinarsData);
                            dispatch(setWebexData(formattedMeetingData));
                            if (isEdit) {
                                let finalPayload = {
                                    ...Payload_Webex,
                                    meeting: location?.data?.schemaName,
                                };

                                let connectionResult = await dispatch(
                                    dataExchange_get_tables_from_DB({ payload: finalPayload }),
                                );
                            }

                            setShowTableFlag(true);
                        }
                        setSuccessMessage({ msg: 'Successfully connected', type: 'success' });
                    } else {
                        let connectionResult = await dispatch(
                            dataExchange_get_tables_from_DB({ payload: customPayload }),
                        );
                        if (connectionResult?.status) {
                            setShowTableFlag(true);
                        }
                        setSuccessMessage({ msg: 'Successfully connected', type: 'success' });
                    }
                } else {
                    setSuccessMessage({
                        msg: result?.message || 'Please enter valid credentials to proceed',
                        type: '',
                    });
                }
                break;
            case 'versium':
                if (versiumCreds?.isNewCred) {
                    const updatedPayload = {
                        ...payload_versium,
                        connectionUrl: payload_versium?.url,
                        FriendlyName: instanceName || '',
                        expiryDate: null,
                        PartnerConfigId: 0,
                    };
                    const updateStatus = await dispatch(Update_Partner_Connection_details({ payload: updatedPayload }));
                    if (updateStatus?.status) {
                        const allCredentialsList = await getConnectionDetails();
                        const partnerSetting = Number(updateStatus?.data) || 0;
                        let credential =
                            allCredentialsList?.find(
                                (item) => item?.PartnerConfigId === partnerSetting,
                            ) || '';
                        if(credential){
                            setTimeout(() => {
                                setVersiumCreds((prev) => ({ ...prev, isNewCred: false }));
                                setValue('credentials', credential);
                            },100)
                        }
                        
                    }
                    if (!updateStatus?.status) {
                        setSuccessMessage({
                            msg: updateStatus?.message || 'Failed to save credentials',
                            type: '',
                        });
                        return;
                    }
                }
                let resultVersium = await dispatch(db_connection_Versium({ payload: payload_versium }));
                if (resultVersium?.status) {
                    setSuccessMessage({ msg: 'Successfully connected', type: 'success' });
                    dispatch(getTableDropDown(resultVersium?.data));
                    setShowTableFlag(true);
                } else {
                    setSuccessMessage({
                        msg: resultVersium?.message || 'Please enter valid credentials to proceed',
                        type: '',
                    });
                }
                break;
            case 'digipop':
                let resultDigipop = await dispatch(get_IsDigipopEnabled({ payload: payload_Digipop }));
                if (resultDigipop?.status) {
                    if (resultDigipop?.data?.isEnrichEnabled) {
                        setShowDigipopFlag({
                            show: true,
                            data: resultDigipop?.data,
                        });
                    } else {
                        const payload = {
                            clientId,
                            departmentId,
                            userId,
                            userName: userName,
                            password: password,
                            friendlyName: instanceName,
                            connectorId: location?.data.remoteDataSourceID,
                            remoteSettingId: 0,
                        };
                        const digipopResult = await dispatch(save_digipop_credentails(payload));
                        if (digipopResult?.status) {
                            navigate('/preferences/data-exchange');
                        }
                    }
                    setSuccessMessage({ msg: 'Successfully connected', type: 'success' });
                    // dispatch(getTableDropDown(resultVersium?.data));
                    //setShowTableFlag(true);
                } else {
                    setSuccessMessage({
                        msg: resultVersium?.message || 'Please enter valid credentials to proceed',
                        type: '',
                    });
                }
                break;
            default:
                // case 'my-sql':
                const { status, message = 'Please enter valid credentials to proceed' } = await dispatch(
                    db_connection_exist({ payload: payload_my_sql }),
                );
                if (status) {
                    getUpdateCycle();
                    const res = await dispatch(get_tables_from_DB({ payload: payload_my_sql }));
                    setSuccessMessage({ msg: 'Successfully connected', type: 'success' });
                    if (res?.status) {
                        setShowTableFlag(true);
                    }
                } else {
                    setSuccessMessage({ msg: message, type: '' });
                }
        }
    };

    const errorFinder = () => {
        let className = 'click-off';
        if (location?.data?.remoteDataSourceID === 40) {
            return '';
        } else if (!isValid) {
            return className;
        } else if (!isDirty) {
            return className;
        } else {
            return ' ';
        }
    };
    const getConnectionDetails = async () => {
        const payload = {
            departmentId,
            clientId,
            userId,
            connectorId: location?.data.remoteDataSourceID,
            connectorName: location?.data.sourceName,
        };
        let result = await dispatch(get_Partner_Connection_details({ payload: payload }));

        if (result?.status) {
            const data = result?.data || [];
            setVersiumCreds((prev) => ({ ...prev, status: true, data: data }));
            return data;
        } else {
            setVersiumCreds((prev) => ({ ...prev, status: false, data: [] }));
            return [];
        }
    };
    const handleVersiumById = async () => {
        const payload = {
            departmentId,
            clientId,
            userId,
            connectorId: location?.data.remoteDataSourceID,
            connectorName: location?.data.sourceName,
            remoteSettingId: location?.id?.remoteSettingId,
            mode: location?.mode,
        };
        let result = await dispatch(get_Versium_databyID({ payload: payload }));
        // console.log('result: ', result);
        if (result?.status) {
            const allCredentialsList = await getConnectionDetails();
            const partnerSetting = result?.data?.partnerremotesetting?.[0] || {};

            let credential =
                allCredentialsList?.find((item) => item?.PartnerConfigId === partnerSetting?.partnerConfigId) || '';

            const creds = result?.data?.remotesetting?.[0];
            let tempresource = maskStringRandomlyNew(creds?.url);
            let tempuserName = maskStringRandomlyNew(creds?.userName);
            let tempuserpassword = maskStringRandomlyNew(creds?.password);
            setValue('resource', tempresource);
            setValue('userName', tempuserName);
            setValue('password', tempuserpassword);
            setValue('credentials', credential);
            handleConnect(getValues, 'versium');
            //setShowTableFlag(true);
        }
    };

    const handleEditData = async () => {
        handleConnect(getValues(), '');
    };

    const checkFormHasValues = () => {
        const formValues = getValues();
        // Check if any field has a value (excluding empty strings, null, undefined)
        return Object.values(formValues).some((value) => value !== '' && value !== null && value !== undefined);
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
        // if (isEdit) {
        //     // In edit mode, reset to the original values from location data
        //     handleEditData();
        // }
        // In add mode, reset to default empty state
        methods.reset(ODBC_MYSQL_STATE);
        setShowTableFlag(false);
        setSuccessMessage({ msg: '', type: '' });
        setShowResetModal(false);
        setFileName('');
    };
    useEffect(() => {
        if (location?.data.remoteDataSourceID === 40 && location?.from === 'data_exchange') {
            setShowVersiumFlag(true);
            getConnectionDetails();
        } else if (location?.data.remoteDataSourceID === 40 && location?.from === 'targetlist') {
            handleVersiumById();
        }

        if (
            isEdit &&
            (location?.data.remoteDataSourceID === 28 ||
                location?.data.remoteDataSourceID === 1 ||
                location?.data.remoteDataSourceID === 2 ||
                location?.data.remoteDataSourceID === 3 ||
                location?.data?.remoteDataSourceID === 23 ||
                location?.data?.remoteDataSourceID === 29 ||
                location?.data?.remoteDataSourceID === 45 ||
                location?.data?.remoteDataSourceID === 22 ||
                //location?.data?.remoteDataSourceID === 54 ||
                location?.data?.remoteDataSourceID === 52 ||
                location?.data?.remoteDataSourceID === 39 ||
                location?.data?.remoteDataSourceID === 5 ||
                location?.data?.remoteDataSourceID === 50 ||
                location?.data?.remoteDataSourceID === 51 ||
                location?.data?.remoteDataSourceID === 48 ||
                location?.data?.remoteDataSourceID === 41 ||
                location?.data?.remoteDataSourceID === 49 ||
                location?.data?.remoteDataSourceID === 156 ||
                location?.data?.remoteDataSourceID === 55 ||
                location?.data?.remoteDataSourceID === 21 ||
                location?.data?.remoteDataSourceID === 47 ||
                location?.data?.remoteDataSourceID === 46 ||
                location?.data?.remoteDataSourceID === 53 ||
                location?.data?.remoteDataSourceID === 43 ||
                location?.data?.remoteDataSourceID === 160 ||
                location?.data?.remoteDataSourceID === 158 ||
                location?.data?.remoteDataSourceID === 106 ||
                location?.data?.remoteDataSourceID === 159 ||
                location?.data?.remoteDataSourceID === 166 ||
                location?.data?.remoteDataSourceID === 168)
        ) {
            handleEditData();
        }

        //  handleVersiumById();
    }, [location?.from]);

    const inputProps = {
        disable: showTableFlag,
        setLoading,
        loading: loading,
        fileName,
        setFileName,
        setVersiumCreds,
        versiumCreds: versiumCreds,
        showTableFlag: showTableFlag,
    };

    return (
        <FormProvider {...methods}>
            <div className="">
                <RSPageHeader
                    title="Data exchange"
                    isBack
                    backPath={
                        state?.isAudience
                            ? `/audience/add-audience?q=${encodeUrl({
                                  from: 'master-data',
                                  mode: 'add',
                                  type: 'remote data source',
                              })}`
                            : '/preferences/data-exchange'
                    }
                    isTabber
                    isHeaderLine
                    rightCommonMenus
                />
                <Container fluid>
                    <div className="page-content">
                        <Container className="dataExchangePageCSS px0">
                            <div className="mt21">
                                <form onSubmit={handleSubmit(handleConnect)}>
                                    <div className="box-design">
                                        <Row>
                                            <Col sm={12}>
                                                <div className="d-flex justify-content-between align-items-center mb21">
                                                    <h4 className='mb0'>
                                                        {
                                                            location?.type === 'mysql'
                                                                ? 'ODBC - MySQL'
                                                                : location?.type === 'mssql'
                                                                ? 'ODBC - SQL Server'
                                                                : // : location?.type + ' - ' + location?.data.sourceName
                                                                  location?.data?.sourceGroupName +
                                                                  ' - ' +
                                                                  location?.data.sourceName
                                                            // : 'CRM - MSCRM'
                                                        }
                                                    </h4>
                                                    {isDirty && !showTableFlag && !isOneTime && (
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
                                            <Col
                                                sm={12}
                                                className={location?.data?.remoteDataSourceID === 168 ? 'mt15' : ''}
                                            >
                                                <ConnectRDSInputs {...inputProps} />
                                            </Col>
                                        </Row>
                                    </div>
                                    <Row>
                                        <Col className={`text-right`}>
                                            <div className="buttons-holder">
                                                {successMessage?.msg && (
                                                    <span
                                                        className="mr15"
                                                        style={{
                                                            color: successMessage?.type === 'success' ? 'green' : 'red',
                                                        }}
                                                    >
                                                        {successMessage?.msg}
                                                    </span>
                                                )}
                                                <span className={showTableFlag ? 'click-off' : ''}>
                                                    <RSPrimaryButton
                                                        disabledClass={`${errorFinder()} ${
                                                            loading ? 'pe-none click-off' : ''
                                                        }`}
                                                        type="submit"
                                                        id="rs_AddAudienceDataExchange_connect"
                                                        isLoading={loading}
                                                        blockBodyPointerEvents={loading}
                                                    >
                                                        {versiumCreds?.isNewCred && !showTableFlag
                                                            ? SAVE
                                                            : CONNECT}
                                                    </RSPrimaryButton>
                                                </span>
                                            </div>
                                        </Col>
                                        {/* <Col className="text-left d-flex align-items-center">
                                    {successMessage?.msg && (
                                        <p
                                            style={{
                                                color: successMessage?.type === 'success' ? 'green' : 'red',
                                            }}
                                        >
                                            {successMessage?.msg}
                                        </p>
                                    )}
                                </Col>
                                <Col className={`text-right ${showTableFlag ? 'click-off' : ''}`}>
                                    <RSPrimaryButton
                                        className={`${errorFinder()} ${loading ? 'click-off' : ''}`}
                                        // disabled={errorFinder()}
                                        type="submit"
                                        id="rs_AddAudienceDataExchange_connect"
                                    >
                                        {CONNECT}
                                    </RSPrimaryButton>
                                </Col> */}
                                    </Row>
                                </form>
                            </div>
                            {showTableFlag && <TableAttributes pathState={location} from={'data_exchange'} />}
                        </Container>
                    </div>
                </Container>
                {showVersiumFlag && (
                    <VersiumModal
                        show={showVersiumFlag}
                        type={location}
                        handleClose={() => {
                            setShowVersiumFlag(false);
                        }}
                    />
                )}
                {showDigipopFlag?.show && (
                    <RSConfirmationModal
                        show={showDigipopFlag?.show}
                        text={'You have MAID in your attribute, Do you want to augment the data?'}
                        primaryButtonText={OK}
                        isBorder
                        handleClose={async () => {
                            setShowDigipopFlag({
                                show: false,
                                data: {},
                            });
                            const { userName, password, instanceName } = getValues();
                            const payload = {
                                clientId,
                                departmentId,
                                userId,
                                userName: userName,
                                password: password,
                                friendlyName: instanceName,
                                connectorId: location?.data.remoteDataSourceID,
                                remoteSettingId: 0,
                            };
                            const digipopResult = await dispatch(save_digipop_credentails(payload));
                            if (digipopResult?.status) {
                                navigate('/preferences/data-exchange');
                            }
                        }}
                        handleConfirm={async (status) => {
                            if (status) {
                                setShowDigipopFlag({
                                    show: false,
                                    data: {},
                                });
                                let payload = {
                                    connectorId: location?.data.remoteDataSourceID,
                                    connectorName: location?.data.sourceName,
                                    clientId,
                                    departmentId: departmentId,
                                    userId,
                                    token: showDigipopFlag?.data?.token,
                                };
                                let resultDigipop = await dispatch(get_DigipopGroupAttributes({ payload: payload }));
                                if (resultDigipop?.status) {
                                    setShowTableFlag(true);
                                    dispatch(getTableDropDown(resultDigipop?.data));
                                }
                            }
                        }}
                    />
                )}
                <RSConfirmationModal
                    show={showResetModal}
                    header="Confirmation"
                    text={ARE_YOU_SURE_WANT_TO_RESET}
                    primaryButtonText={YES}
                    secondaryButtonText={CANCEL}
                    handleClose={() => setShowResetModal(false)}
                    handleConfirm={() => performReset()}
                    isBorder
                />
            </div>
        </FormProvider>
    );
};

export default AddAudienceDataExchange;
