import { encodeUrl } from 'Utils/modules/crypto';
import { maskStringRandomlyNew } from 'Utils/modules/masking';
import { ARE_YOU_SURE_WANT_TO_RESET, CANCEL, CONNECT, CONNECTED, OK, SAVE, YES } from 'Constants/GlobalConstant/Placeholders';
import { restart_medium } from 'Constants/GlobalConstant/Glyphicons';
import { useEffect, useMemo, useReducer, useState } from 'react';
import { Col, Container, Row } from 'react-bootstrap';
import { useLocation, useNavigate } from 'react-router-dom';
import { FormProvider, useForm } from 'react-hook-form';
import { RSPrimaryButton } from 'Components/Buttons';
import RSPageHeader from 'Components/RSPageHeader';
import RSTooltip from 'Components/RSTooltip';
import { INTEGRATED_NOSQL_CONNECTOR_IDS, INTEGRATED_SQL_CONNECTOR_IDS, ODBC_MYSQL_STATE, RDSContext } from './constants';
import ConnectRDSInputs from './ConnectRDSInputs';
import TableAttributes from './TableAttributes';
import { useDispatch, useSelector } from 'react-redux';
import { db_connection_exist, getBQprojectList, get_tables_from_DB1, dataExchange_connection_exist, dataExchange_get_tables_from_DB1, db_connection_Versium1, get_Versium_databyID, getUpdateCycleFrequency, dataExchange_get_Webinar, dataExchange_get_Webex, get_Partner_Connection_details, Update_Partner_Connection_details, getConnectionType, GetCRM_Categories, GetCRM_Tables } from 'Reducers/remoteDataSource/request';
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
import { INITIAL_STATE, MYSQL_STATE_REDUCER } from './TableAttributes/constant';
import useApiLoader from 'Hooks/useApiLoader';

import { CommonSkeleton } from 'Components/Skeleton/Components/SkeletonOverall';
import { FIELD_LOADER_CONFIG } from 'Hooks/loaderTypes';

const AddAudienceDataExchange = () => {
    const { state } = useLocation();
    const location = useQueryParams('/audience');

    const methods = useForm({
        defaultValues: ODBC_MYSQL_STATE,
        mode: 'onTouched',
    });
    const [reducerState, dispatchState] = useReducer(MYSQL_STATE_REDUCER, INITIAL_STATE);
    const {isEditLoading = false} = reducerState;

    const navigate = useNavigate();
    const DBConnectionAPI = useApiLoader({ autoFetch: false });
    const GetTablesFromDBAPI = useApiLoader({ autoFetch: false });
    const isOneTime =
        location?.isOneTime;
    const isEdit = location?.mode === 'edit';
    const isBiDirectionEnabled = location?.data?.connectionType == 1;
    const [fileName, setFileName] = useState('');
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
    const getUpdateCycle = async (loading = false) => {
        let payload = { clientId, userId, departmentId };
        dispatch(getUpdateCycleFrequency({ payload, loading }));
    };
    const handleConnect = async (params, source, isEdit = false) => {
        const {
            ipAddress,
            portNumber,
            databaseName,
            userName,
            password,
            instanceName,
            schema,
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
        } = params;

        const loc = location?.data;
        const connectorBase = (friendlyName) => ({
            connectorId: loc?.remoteDataSourceID,
            connectorName: loc?.sourceName,
            friendlyName,
            clientId,
            userId,
            departmentId,
            remoteSettingId: loc?.remoteSettingId || 0,
        });
        const remoteListMeta = {
            connectorId: loc?.remoteDataSourceID,
            connectorName: loc?.sourceName,
            remoteSettingId: loc?.remoteSettingId,
        };

        let payloadHubspot = {
            hubId: hubid,
            accessToken: accesstoken,
            ...connectorBase(instanceName),
        };

        let payload_bg = {
            jsonPath: jsonFilePath,
            projectInfo: projectInfo,
            datasetInfo: datasetInfo,
            projectName: projectName,
            ...connectorBase(instanceName),
        };
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
        };

        let payload_mCRM = {
            tenantDomain,
            resource,
            clientSecret,
            clientDomain,
            listType: 5,
            departmentId,
            ...connectorBase(instanceName),
        };

        let payload_versium = {
            userName: credentials?.UserName || userName,
            password: credentials?.Password || password,
            departmentId: departmentId,
            url: versiumCreds?.isNewCred ? versiumConfigData[0]?.url : credentials?.ConnectionUrl || resource,
            clientId,
            userId,
            connectorName: loc?.sourceName,
            connectorId: loc?.remoteDataSourceID,
        };

        let payload_Snowflake = {
            username: userName,
            password: password,
            account: accountName,
            database: databaseName,
            schema: schema,
            ...connectorBase(instanceName),
        };

        let payload_Oracle = {
            host: ipAddress,
            schema: databaseName,
            username: userName,
            password: password,
            port: portNumber,
            ...connectorBase(instanceName),
        };
        let payload_blackbaud = {
            remoteSettingId: loc?.remoteSettingId,
            ...connectorBase(instanceName),
        };
        let payload_leadsquared = {
            apiHost: apiHost,
            accessKey: accessKey,
            secretKey: secretKey,
            ...connectorBase(instanceName),
        };

        let payload_shopify = {
            apiKey: resource,
            accessToken: accesstoken,
            shopName: shopName,
            ...connectorBase(instanceName),
        };

        let payload_salesforce = {
            username: userName,
            password: password,
            securityToken: securityToken,
            ...connectorBase(instanceName),
        };

        let payload_pipedrive = {
            apiToken: resource,
            ...connectorBase(instanceName),
        };

        let payload_cassandra = {
            username: userName,
            password: password,
            server: ipAddress,
            port: portNumber,
            keyspaces: databaseName,
            ...connectorBase(instanceName),
        };

        let payload_aerospike = {
            username: userName,
            password: password,
            host: ipAddress,
            port: portNumber,
            namespace: databaseName,
            ...connectorBase(instanceName),
        };

        let payload_mongodb = {
            username: userName,
            password: password,
            server: ipAddress,
            port: portNumber,
            database: databaseName,
            ...connectorBase(instanceName),
        };

        let payload_storehippo = {
            shopName: shopName,
            accessKey: accesstoken,
            ...connectorBase(instanceName),
        };

        let payload_postgresql = {
            username: userName,
            password: password,
            host: ipAddress,
            schema: schema,
            database: databaseName,
            port: portNumber,
            ...connectorBase(instanceName),
        };

        let payload_eventbrite = {
            authToken: accesstoken,
            ...connectorBase(instanceName),
        };
        let payload_bigcommerce = {
            storeHash: storehash,
            accessToken: accesstoken,
            shopName: shopName,
            ...connectorBase(instanceName),
        };
        let payload_prestashop = {
            apiKey: resource,
            prestashopUrl: shopName,
            ...connectorBase(instanceName),
        };
        let payload_magento = {
            magentoUrl: resource,
            accessToken: accesstoken,
            username: userName,
            password: password,
            ...connectorBase(instanceName),
        };
        let payload_WooCommerce = {
            domainUrl: apiHost,
            consumerKey: accessKey,
            consumerSecret: secretKey,
            ...connectorBase(instanceName),
        };
        let payload_Wix = {
            authId: authId,
            siteId: siteId,
            ...connectorBase(instanceName),
        };
        let payload_DataBricks = {
            host: resource,
            httpPath: httpPath,
            accessToken: accesstoken,
            database: databaseName,
            schema: schema,
            ...connectorBase(instanceName),
        };
        let payload_Insightly = {
            apiKey: resource,
            ...connectorBase(instanceName),
        };
        let Payload_Webinar = {
            friendlyName: instanceName,
            ...remoteListMeta,
        };
        let Payload_Webinar_datas = { ...remoteListMeta };
        let Payload_Webex = {
            friendlyName: instanceName,
            ...remoteListMeta,
        };
        let Payload_PresToDb = {
            host: resource,
            port: portNumber,
            user: userName,
            catalog: catalog,
            schema: schema,
            ...connectorBase(instanceName),
        };
        let Payload_Commercetools = {
            clientId: clientDomain,
            clientSecret: clientSecret,
            projectKey: projectName,
            authHost: resource,
            ...connectorBase(instanceName),
        };
        let payload_Digipop = {
            userName: userName,
            password: btoa(password),
            ...connectorBase(instanceName),
        };
        let payload_googleSheet = {
            credentialsPath: jsonFilePath,
            spreadsheetId: spreadsheetId,
            ...connectorBase(instanceName),
        };
        let payload_cNl = {
            apiKey: accesstoken,
            ...connectorBase(instanceName),
        };
    const dataSourceId = loc?.remoteDataSourceID;
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
            case 'c&l': {
                const payloadByDataSourceId = {
                    3: payload_Oracle,
                    39: payload_Snowflake,
                    28: payload_mCRM,
                    45: payloadHubspot,
                    22: payload_shopify,
                    5: payload_salesforce,
                    48: payload_aerospike,
                    50: payload_pipedrive,
                    51: payload_cassandra,
                    41: payload_mongodb,
                    49: payload_storehippo,
                    52: payload_postgresql,
                    54: payload_eventbrite,
                    23: payload_bigcommerce,
                    29: payload_prestashop,
                    156: payload_leadsquared,
                    55: payload_blackbaud,
                    21: payload_magento,
                    47: payload_WooCommerce,
                    46: payload_Wix,
                    53: payload_DataBricks,
                    43: payload_bg,
                    160: payload_Insightly,
                    158: Payload_Webinar,
                    106: Payload_Webex,
                    159: Payload_PresToDb,
                    166: Payload_Commercetools,
                    168: payload_googleSheet,
                    170: payload_cNl,
                };
                customPayload = payloadByDataSourceId[dataSourceId];

                const afterExchangeLoadSelectableList = async ({
                    fetchAction,
                    listFetchPayload,
                    itemsKey,
                    listActionCreator,
                    connectPayloadForEdit,
                    schemaFieldName,
                    clearDropdownWhenAdd,
                }) => {
                    const listResult = await dispatch(fetchAction({ payload: listFetchPayload }));
                    if (listResult?.status) {
                        const items = listResult.data[itemsKey];
                        const formatted = items.map((item, index) => ({
                            id: index + 1,
                            name: item,
                        }));
                        dispatch(listActionCreator(formatted));
                        if (isEdit) {
                            await dispatch(
                                dataExchange_get_tables_from_DB1({
                                    payload: {
                                        ...connectPayloadForEdit,
                                        [schemaFieldName]: location?.data?.schemaName,
                                    },
                                }),
                            );
                        } else if (clearDropdownWhenAdd) {
                            dispatch(getTableDropDown([]));
                        }
                        setShowTableFlag(true);
                    }
                    setSuccessMessage({ msg: 'Successfully connected', type: 'success' });
                };

                let result = isEdit
                    ? { status: true }
                    : await DBConnectionAPI.refetch({
                          fetcher: () =>
                              dispatch(dataExchange_connection_exist({ payload: customPayload, loading: false })),
                          mode: 'create',
                          loaderConfig: FIELD_LOADER_CONFIG,
                      });
                if (result.status) {
                    setShowTableFlag(true);
                    getUpdateCycle(false);
                    if (isBiDirectionEnabled) {
                        await dispatch(
                            getConnectionType({ payload: connectorBase(), dispatchState, isLoading: false }),
                        );

                        dispatchState({ type: 'UPDATE', field: 'connectorPayload', payload: customPayload });
                        if (!isEdit) {
                            setSuccessMessage({ msg: 'Successfully connected', type: 'success' });
                            setShowTableFlag(true);
                            return;
                        }
                        if (
                            isEdit &&
                            (location?.data?.selectedConnection == 'Resulticks to Hubspot' ||
                                location?.data?.selectedConnection == 'Resulticks to DynamicCrm' ||
                                location?.data?.selectedConnection == 'Resulticks to SalesForce')
                        ) {
                            const payload = {
                                ...connectorBase(),
                                connectionType: location?.data?.selectedConnection,
                            };

                            const payload1 = { ...payload, ...customPayload };
                            dispatch(GetCRM_Tables({ payload: payload1, dispatchState, loading: false }));
                            let res = await dispatch(
                                GetCRM_Categories({ payload, dispatchState, isLoading: false }),
                            );
                            if (res?.status) setShowTableFlag(true);

                            return;
                        }
                    }

                    if (dataSourceId === 158) {
                        await afterExchangeLoadSelectableList({
                            fetchAction: dataExchange_get_Webinar,
                            listFetchPayload: Payload_Webinar_datas,
                            itemsKey: 'webinars',
                            listActionCreator: setWebinarsData,
                            connectPayloadForEdit: Payload_Webinar,
                            schemaFieldName: 'webinar',
                            clearDropdownWhenAdd: true,
                        });
                    } else if (dataSourceId === 106) {
                        await afterExchangeLoadSelectableList({
                            fetchAction: dataExchange_get_Webex,
                            listFetchPayload: Payload_Webex,
                            itemsKey: 'meetings',
                            listActionCreator: setWebexData,
                            connectPayloadForEdit: Payload_Webex,
                            schemaFieldName: 'meeting',
                            clearDropdownWhenAdd: false,
                        });
                    } else {
                        dispatch(dataExchange_get_tables_from_DB1({ payload: customPayload, dispatchState }));

                        !isEdit && setSuccessMessage({ msg: 'Successfully connected', type: 'success' });
                    }
                } else {
                    setSuccessMessage({
                        msg: result?.message || 'Please enter valid credentials to proceed',
                        type: '',
                    });
                }
                break;
            }
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
                            allCredentialsList?.find((item) => item?.PartnerConfigId === partnerSetting) || '';
                        if (credential) {
                            setTimeout(() => {
                                setVersiumCreds((prev) => ({ ...prev, isNewCred: false }));
                                setValue('credentials', credential);
                            }, 100);
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

                let resultVersium = await DBConnectionAPI.refetch({
                    fetcher: () => dispatch(db_connection_Versium1({ payload: payload_versium, loading: false })),
                    mode: 'create',
                    loaderConfig: FIELD_LOADER_CONFIG,
                });
                if (resultVersium?.status) {
                    !isEdit && location?.from !== 'targetlist' && setSuccessMessage({ msg: 'Successfully connected', type: 'success' });
                    const { data = {} } = resultVersium;
                    dispatch(getTableDropDown(data));
                    const updatedTable =
                        data?.groupAttributeName?.map((el) => ({
                            ...el,
                            type: el?.attributeGroupName,
                            typeId: el?.partnerAttributeGroupId,
                            uiLabelName: el?.attributeGroupName ?? '',
                        })) ?? [];

                    dispatchState({
                        type: 'UPDATE',
                        field: 'tableData',
                        payload: { loading: false, data: updatedTable || [], versiumConfig: data },
                    });
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
                } else {
                    setSuccessMessage({
                        msg: resultDigipop?.message || 'Please enter valid credentials to proceed',
                        type: '',
                    });
                }
                break;
            default:
                let result = isEdit
                    ? { status: true }
                    : await DBConnectionAPI.refetch({
                          fetcher: () => dispatch(db_connection_exist({ payload: payload_my_sql, loading: false })),
                          mode: 'create',
                          loaderConfig: FIELD_LOADER_CONFIG,
                      });
                if (result?.status) {
                    setShowTableFlag(true);
                    !isEdit && setSuccessMessage({ msg: 'Successfully connected', type: 'success' });
                    getUpdateCycle();
                    GetTablesFromDBAPI.refetch({
                        fetcher: () =>
                            dispatch(get_tables_from_DB1({ payload: payload_my_sql, loading: false, dispatchState })),
                        mode: 'create',
                        loaderConfig: FIELD_LOADER_CONFIG,
                    });
                } else {
                    setSuccessMessage({
                        msg: result?.message || 'Please enter valid credentials to proceed',
                        type: '',
                    });
                }
        }
    };

    const errorFinder = () => {
        if (location?.data?.remoteDataSourceID === 40) return '';
        if (!isValid || !isDirty) return 'pe-none click-off';
        return ' ';
    };
    const getConnectionDetails = async () => {
        const payload = {
            departmentId,
            clientId,
            userId,
            connectorId: location?.data.remoteDataSourceID,
            connectorName: location?.data.sourceName,
        };
        let result = await dispatch(get_Partner_Connection_details({ payload: payload, loading: false }));

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
         dispatchState({ type: 'UPDATE', field: 'isEditLoading', payload: true });
        try {
            const payload = {
                departmentId,
                clientId,
                userId,
                connectorId: location?.data.remoteDataSourceID,
                connectorName: location?.data.sourceName,
                remoteSettingId: location?.id?.remoteSettingId,
                mode: location?.mode,
            };
            const result = await dispatch(get_Versium_databyID({ payload, loading: false }));
            if (result?.status) {
                const allCredentialsList = await getConnectionDetails();
                const partnerSetting = result?.data?.partnerremotesetting?.[0] || {};

                const credential =
                    allCredentialsList?.find((item) => item?.PartnerConfigId === partnerSetting?.partnerConfigId) || '';

                const creds = result?.data?.remotesetting?.[0];
                const tempresource = maskStringRandomlyNew(creds?.url);
                const tempuserName = maskStringRandomlyNew(creds?.userName);
                const tempuserpassword = maskStringRandomlyNew(creds?.password);
                setValue('resource', tempresource);
                setValue('userName', tempuserName);
                setValue('password', tempuserpassword);
                setValue('credentials', credential);
                await handleConnect(getValues(), 'versium');
            }
        } finally {
            dispatchState({ type: 'UPDATE', field: 'isEditLoading', payload: false });
        }
    };

    const handleEditData = async () => {
        dispatchState({ type: 'UPDATE', field: 'isEditLoading', payload: true });
        await handleConnect(getValues(), '', isEdit);
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
        const clearedValues = Object.fromEntries(
            Object.entries(getValues()).map(([key, value]) => [
                key,
                ODBC_MYSQL_STATE[key] ?? (typeof value === 'boolean' ? false : ''),
            ]),
        );
        methods.reset(clearedValues);
        setShowTableFlag(false);
        setSuccessMessage({ msg: '', type: '' });
        setShowResetModal(false);
        setFileName('');
        setVersiumCreds((prev) => ({ ...prev, isNewCred: false }));
    };
    useEffect(() => {
        const remoteId = location?.data?.remoteDataSourceID;
        if (remoteId === 40 && location?.from === 'data_exchange') {
            setShowVersiumFlag(true);
            getConnectionDetails();
            return
        } else if (remoteId === 40 && location?.from === 'targetlist') {
            handleVersiumById();
            return
        }

        if ((INTEGRATED_NOSQL_CONNECTOR_IDS.has(remoteId) || INTEGRATED_SQL_CONNECTOR_IDS.has(remoteId)) && isEdit) {
            handleEditData();
        }
    }, [location?.from]);

    const inputColSpan = state === 'CRM' ? 3 : 4;

    const inputProps = {
        disable: showTableFlag,
        setLoading,
        loading,
        fileName,
        setFileName,
        setVersiumCreds,
        versiumCreds,
        showTableFlag,
    };

    const contextValue = useMemo(
        () => ({
            reducerState,
            dispatchState,
            isBiDirectionEnabled,
            handleConnect,
        }),
        [reducerState, isBiDirectionEnabled, handleConnect],
    );

    const buttonText =
        versiumCreds?.isNewCred && !showTableFlag
            ? SAVE
            : showTableFlag
              ? CONNECTED
              : CONNECT;
    return (
        <RDSContext.Provider value={contextValue}>
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
                        isAgencyDisabled
                        isBuDisabled
                    />

                    <Container fluid>
                        <div className="page-content">
                            <Container className="dataExchangePageCSS px0">
                                <div className="mt21">
                                    <form onSubmit={handleSubmit(handleConnect)}>
                                        <div className="box-design">
                                            {isEditLoading && !showTableFlag ? (
                                                <Row className="mt12">
                                                    {Array.from({ length: 6 }).map((_, index) => (
                                                        <Col
                                                            sm={inputColSpan}
                                                            className="p-2"
                                                            key={`rds-input-skeleton-${index}`}
                                                        >
                                                            <CommonSkeleton box height={28} />
                                                        </Col>
                                                    ))}
                                                </Row>
                                            ) : (
                                                <Row>
                                                    <Col sm={12}>
                                                        <div className="d-flex justify-content-between align-items-center mb21">
                                                            <h4 className='mb0'>
                                                                {location?.type === 'mysql'
                                                                    ? 'ODBC - MySQL'
                                                                    : location?.type === 'mssql'
                                                                      ? 'ODBC - SQL Server'
                                                                      : location?.data?.sourceGroupName +
                                                                        ' - ' +
                                                                        location?.data.sourceName}
                                                            </h4>
                                                            {isDirty && !showTableFlag && !isOneTime && (
                                                                <RSTooltip position="top" text="Reset" className="lh0">
                                                                    <i
                                                                        id="rs_data_reset"
                                                                        className={`${restart_medium} ${loading ? 'pe-none' : ''} icon-md color-primary-blue cursor-pointer`}
                                                                        onClick={handleReset}
                                                                    ></i>
                                                                </RSTooltip>
                                                            )}
                                                        </div>
                                                    </Col>
                                                    <Col
                                                        sm={12}
                                                        className={
                                                            location?.data?.remoteDataSourceID === 168 ? 'mt15' : ''
                                                        }
                                                    >
                                                        <ConnectRDSInputs {...inputProps} />
                                                    </Col>
                                                </Row>
                                            )}
                                        </div>

                                        <Row>
                                            <Col className={`text-right`}>
                                                <div className="buttons-holder">
                                                    {successMessage?.msg && (
                                                        <span
                                                            className="mr15"
                                                            style={{
                                                                color:
                                                                    successMessage?.type === 'success'
                                                                        ? 'green'
                                                                        : 'red',
                                                            }}
                                                        >
                                                            {successMessage?.msg}
                                                        </span>
                                                    )}
                                                    <span className={showTableFlag ? 'click-off' : ''}>
                                                        {isEditLoading && !showTableFlag  ? (
                                                            <CommonSkeleton box width={100} height={40} />
                                                        ) : (
                                                            <RSPrimaryButton
                                                                disabledClass={`${errorFinder()} ${
                                                                    loading || DBConnectionAPI?.isLoading
                                                                        ? 'pe-none click-off'
                                                                        : ''
                                                                }`}
                                                                type="submit"
                                                                id="rs_AddAudienceDataExchange_connect"
                                                                isLoading={DBConnectionAPI?.isLoading}
                                                                blockBodyPointerEvents={DBConnectionAPI?.isLoading}
                                                            >
                                                                {buttonText}
                                                            </RSPrimaryButton>
                                                        )}
                                                    </span>
                                                </div>
                                            </Col>
                                        </Row>
                                    </form>
                                </div>
                                {showTableFlag && <TableAttributes pathState={location} />}
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
                                    let resultDigipop = await dispatch(
                                        get_DigipopGroupAttributes({ payload: payload }),
                                    );
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
        </RDSContext.Provider>
    );
};

export default AddAudienceDataExchange;
