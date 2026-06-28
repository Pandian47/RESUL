import { updateQueryParams } from 'Utils/modules/urlQuery';
import { encodeUrl } from 'Utils/modules/crypto';
import { numberWithCommas } from 'Utils/modules/formatters';
import { truncateTitle } from 'Utils/modules/displayCore';
import { onlyNumbers } from 'Utils/modules/inputValidators';
import { CHECK_UPDATE, ENTER_VOLUME, EXCEPTION_OCCURRED, SELECT_FOREIGN_KEY, SELECT_IMPORT_PREFERENCE, SELECT_PRIMARY_KEY, UPDATE_CYCLE as UPDATE_CYCLE_MSG, UPDATE_RECENCY } from 'Constants/GlobalConstant/ValidationMessage';
import { ARE_YOU_SURE_RESET, BRAND_ID_NOT_EXISTS, CANCEL, CATEGORY, CHECK_FOR_UPDATES, CONNECTIONTYPE, CREATE_TABLE_NAME, CRM_TABLE_NAME, DATA_SYNC_PROGRESS, DATA_SYNC_STATUS, ENTER_SELECTED_COL_ATT, FOREIGN_KEY_HELP_TEXT, IMPORT_PREFERENCE_LABEL, IMPORT_PREFERENCES, IMPORT_PRESERVE_PREFERENCE_LABEL, OK, POTENTIAL_AUDIENCE, PRIMARY_FOREIGN_KEY, PRIMARY_KEY_HELP_TEXT, REFINE_AUDIENCE_SELECTION, REQUIRED_VOLUME, UPDATE_CYCLE, UPLOAD, WARNING, YES } from 'Constants/GlobalConstant/Placeholders';
import { alert_medium, alert_xlarge, circle_question_mark_mini, circle_time_large, pencil_edit_medium, restart_medium } from 'Constants/GlobalConstant/Glyphicons';
import { useContext, useEffect, useMemo, useRef, useState } from 'react';
import { Col, Container, Row } from 'react-bootstrap';
import { useFormContext } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import _find from 'lodash/find';
import {
    mergeFilterBindSegments,
    getFilterBindCount,
    hasFilterBindSegments,
    parseLegacyJson,
} from 'Pages/AuthenticationModule/Audience/audienceDefaults';

import {
    saveFilterJSON_Versium,
    getBQDataSets,
    getBQTableColumn,
    getBQcolumns,
    getColumnTables1,
    dataExchange_getColumnTables1,
    getColumnTables_Versium1,
    getRecency_Versium,
    saveBaseCount_Versium,
    getUpdatedColumn_Versium,
    dataExchange_get_tables_from_DB1,
    GetCRM_Categories,
    GetCRM_TableColumns,
    GetCRM_Tables,
    Sync_CRM_Data,
    Sync_CRM_Custom_Data,
} from 'Reducers/remoteDataSource/request';
import { mySqlReset, getShowTableColumn } from 'Reducers/remoteDataSource/reducer';
import ListNameExists from 'Components/ListNameExists';

import RSTooltip from 'Components/RSTooltip';
import RSRadioButton from 'Components/FormFields/RSRadioButton';
import ResKendoDropdown from 'Pages/KendoDocs/CommonComponents/ResKendoDropdown';

import RSPPophover from 'Components/RSPPophover';
import { RSPrimaryButton, RSSecondaryButton } from 'Components/Buttons';
import useComponentWillUnmount from 'Hooks/useComponentWillUnMount';
import useApiLoader, { LOADER_TYPE } from 'Hooks/useApiLoader';

import { INTEGRATED_NOSQL_CONNECTOR_IDS, INTEGRATED_SQL_CONNECTOR_IDS, RDSContext, mutateAPIData, rightAttributes } from '../constants';
import { checkCustomTableColumnConfig, finalPayload_Versium, generateLeftAttributes, generateRightAttributes, getPreservedRightAttributes, isValidDateTimeType, createFilterRuleJson, getLeftAttributes, parseVersiumTableLabels } from './constant';
import { CommonSkeleton } from 'Components/Skeleton/Components/SkeletonOverall';
import AttributeListBox from './AttributeListBox';
import Preview from './Preview';
import { getSessionId } from 'Reducers/globalState/selector';
import RSConfirmationModal from 'Components/ConfirmationModal';
import RSInput from 'Components/FormFields/RSInput';
import { FormatEnum } from '../ConnectRDSInputs/constants';
import RSModal from 'Components/RSModal';
import ConfigureDedupeSettings from '../../../ConfigureDedupeSettings/ConfigureDedupeSettings';
import NewAttributeBtn from 'Pages/AuthenticationModule/Audience/Pages/AddImportAudience/Components/CustomHeaderColumn/NewAttributeBtn';
import { customTableNameExists } from 'Reducers/audience/addAudience/request';
import { LIST_NAME_RULES } from 'Pages/AuthenticationModule/Audience/audienceFormRules';

/** Versium (40) and Digipop (155). */
const VERSIUM_DIGIPOP_REMOTE_IDS = new Set([40, 155]);
const VERSIUM_RDS_ID = 40;

const CHECK_UPDATE_VISIBLE_REMOTE_IDS = new Set([1, 2, 3, 52, 53, 28, 45, 5]);

const TableAttributes = ({ pathState }) => {
    // --- Form, context & session ---
    const rdsId = pathState?.data?.remoteDataSourceID;

    const { industryId } = useSelector(({ globalstate }) => globalstate);
    const navigate = useNavigate();
    const {
        control,
        handleSubmit,
        watch,
        getValues,
        reset,
        trigger,
        clearErrors,
        setError,
        setValue,
        unregister,
        setFocus,
        formState: { errors },
    } = useFormContext();

    const dispatch = useDispatch();
    const { reducerState, dispatchState, isBiDirectionEnabled } = useContext(RDSContext);
    const { departmentId, clientId, userId } = useSelector((state) => getSessionId(state));

    const connectorDetails = {
        connectorId: rdsId,
        connectorName: pathState?.data?.sourceName,
    };
    const sessionDetails = {
        departmentId,
        clientId,
        userId,
    };
    const {
        showDropDownTableFlag,
        getAttributes,
        dedupeFlag,
        showAttributeError,
        tableMismatchError,
        primaryDropDown,
        firstCheck,
        confirmPopup,
        dataSyncModal,
        dataRemovePopup,
        tableColumnsData,
        finalConfig,
        crmTables,
        showCrmCreateTableName,
        connectorPayload,
        tableData,
        connectionType,
        apiErrorPopup,
        isEditLoading,
    } = reducerState;

    const isEdit = pathState?.mode === 'edit';

    const {
        bqProjectList,
        bgDataset,
        bgQueryConnectData,
        showBQTable,
        bqTableList,
        bqColumnLists,
        mySql,
        versiumData,
        updateCycleList,
        webinarsData,
        webexData,
    } = useSelector(({ remoteDataSourceReducer }) => remoteDataSourceReducer);

    const isTouched = watch('isTouched');

    const [attributes, setAttributes] = useState({
        leftAttributes: [],
        rightAttributes: [],
    });
    // --- Versium field loaders ---
    const tableColumnsApi = useApiLoader({ autoFetch: false });
    const crmUploadApi = useApiLoader({ autoFetch: false });
    const recencyVersiumApi = useApiLoader({ autoFetch: false });
    const updatedColumnVersiumApi = useApiLoader({ autoFetch: false });

    const fetchVersiumRecencyAndColumns = async (payload) => {
        const [res_recency, res_ColumnUpdate] = await Promise.all([
            recencyVersiumApi.refetch({
                mode: 'create',
                loaderConfig: { create: LOADER_TYPE.FIELD },
                fetcher: (params) => dispatch(getRecency_Versium({ payload: params, loading: false })),
                params: payload,
            }),
            updatedColumnVersiumApi.refetch({
                mode: 'create',
                loaderConfig: { create: LOADER_TYPE.FIELD },
                fetcher: (params) => dispatch(getUpdatedColumn_Versium({ payload: params, loading: false })),
                params: payload,
            }),
        ]);

        if (res_recency?.status) {
            setRecencyValue(res_recency?.data);
        }
        if (res_ColumnUpdate?.status) {
            setColumnUpdateValue(res_ColumnUpdate?.data);
        }

        return { res_recency, res_ColumnUpdate };
    };

    let [connection, table, versium_volume, primaryKey] = watch([
        'connection',
        'table',
        'versium_volume',
        'primaryKey',
    ]);
    let [tableWatch] = watch(['table']);

    /** When bi-direction applies: selected connection direction; otherwise defaults to CRM → RESUL (1). */
    const connectionTypeId = connection?.typeId;
    const isResulToCrmFlow = isBiDirectionEnabled && connectionTypeId === 2;
    const [primary_key_warningFlag, setPrimary_key_warningFlag] = useState(false);
    const [recencyValue, setRecencyValue] = useState([]);
    const [ColumnUpdateValue, setColumnUpdateValue] = useState([]);
    const [versiumModal, setVersiumModal] = useState(false);
    const [brandExist_flag, setBrandExist_flag] = useState(false);
    const [recencyModal, setrecencyModal] = useState(false);
    const [isReset, setIsReset] = useState(false);

    const resetAttributeFormFields = (extraFields = {}) => {
        setAttributes({ leftAttributes: [], rightAttributes: [] });
        reset((formState) => ({
            ...formState,
            primaryKey: '',
            foreignKey: '',
            table: '',
            checkUpdate: '',
            importPreference: '',
            updatedCycle: '',
            versium_volume: 0,
            ...extraFields,
        }));
        dispatch(mySqlReset());
    };
    const isEditCalled = useRef(false);
    const isVersiumEditCalled = useRef(false);
    useEffect(() => {
        dispatchState({ type: 'ATTRIBUTES_UPDATE', payload: { ...attributes } });
    }, [attributes]);
    useEffect(() => {
        if (bqProjectList?.length > 0) {
            const data = bqProjectList.map((el, key) => ({
                type: el.split(' ')[1],
                typeId: key,
            }));
            dispatchState({ type: 'UPDATE', field: 'projectList', payload: data });
        }
    }, [bqProjectList]);

    useEffect(() => {
        mutateAPIData(bgDataset, dispatchState, 2);
    }, [bgDataset]);

    // --- Versium edit hydration ---
    const handleVersiumtableById = async () => {
        dispatchState({ type: 'UPDATE', field: 'isEditLoading', payload: true });
        try {
            const rs = versiumData?.remotesetting?.[0];
            const partner = versiumData?.partnerremotesetting?.[0] || {};
            const versiumTableLabels = parseVersiumTableLabels(partner?.tableName);
            const versiumTableLabel = versiumTableLabels[0] || '';
            let versiumGroups = tableData?.versiumConfig?.groupAttributeName || [];
            versiumGroups =
                versiumGroups?.map((el) => ({
                    ...el,
                    type: el?.attributeGroupName,
                    typeId: el?.partnerAttributeGroupId,
                    uiLabelName: el?.attributeGroupName ?? '',
                })) ?? [];

            const matchedGroup = versiumGroups?.find((e) => versiumTableLabel === e?.attributeGroupName) || '';

            const payload_versiumRecency = {
                departmentId,
                clientId,
                userId,
                connectorName: pathState?.data?.sourceName,
                connectorId: rdsId,
            };
            dispatchState({ type: 'UPDATE', field: 'showDropDownTableFlag', payload: true });
            setValue('table', matchedGroup);

            for (const tableLabel of versiumTableLabels) {
                const group = versiumGroups.find((e) => tableLabel === e?.attributeGroupName);
                const payload_versium = {
                    userName: rs?.userName,
                    password: rs?.password,
                    departmentId,
                    url: rs?.url,
                    clientId,
                    userId,
                    connectorName: pathState?.data?.sourceName,
                    connectorId: rdsId,
                    groupAttributeId: group?.partnerAttributeGroupId,
                    groupAttributeName: tableLabel,
                    industryId,
                };
                await handleTableColumns(
                    { type: tableLabel, typeId: group?.partnerAttributeGroupId },
                    payload_versium,
                    true,
                );
            }

            const columnData = parseLegacyJson(partner.frontEndBind || '', {});

            dispatchState({
                type: 'UPDATE_FINAL_CONFIG',
                payload: columnData,
                mode: 'replace',
            });
            let rightAtt = (generateRightAttributes(columnData) || []).map((item) => ({
                ...item,
                selected: false,
            }));
            let allLeftAtts = getLeftAttributes(columnData) || [];

            const leftAttrs = generateLeftAttributes(allLeftAtts, rightAtt, versiumTableLabel);

            setAttributes({
                leftAttributes: leftAttrs,
                rightAttributes: rightAtt,
            });
            const { res_recency, res_ColumnUpdate } = await fetchVersiumRecencyAndColumns(payload_versiumRecency);
            setValue('versium_volume', partner?.rowLimit || '');
            if (!!res_recency?.data?.length) {
                let recency = res_recency?.data?.find((e) => e?.id === partner?.recency) || '';
                setValue('updatedCycle', recency);
            }
            if (!!res_ColumnUpdate?.data?.length) {
                let chUpd =
                    res_ColumnUpdate?.data?.find(
                        (e) => e?.partnerDataAttributeID === parseInt(partner?.fieldsUpdatedBy?.split('|')[0], 10),
                    ) || '';
                setValue('checkUpdate', chUpd);
            }
            if (pathState?.extConfig) {
                Object.entries(pathState?.extConfig || {}).forEach(([key, value]) => {
                    setValue(key, value);
                });
            }
        } finally {
            dispatchState({ type: 'UPDATE', field: 'isEditLoading', payload: false });
        }
    };
    useEffect(() => {
        if (showAttributeError) dispatchState({ type: 'UPDATE', field: 'showAttributeError', payload: false });
    }, [attributes.leftAttributes?.length, attributes.rightAttributes?.length]);

    useComponentWillUnmount(() => {
        dispatch(getShowTableColumn(false));
        handleRefresh();
    });

    const handleProjectDropdown = (e) => {
        const {
            target: {
                value: { type },
            },
        } = e;
        let payload = {
            departmentId: 1,
            projectid: type,
            path: bgQueryConnectData.path.trim(),
        };
        dispatch(
            getBQDataSets({
                payload,
            }),
        );
    };

    const handleBqTable = async () => {
        const payload = {
            departmentId: 1,
            datasetId: 'CommonDNC_dataset',
            path: '/home/res_appdev49/RESUL-Python/Audience/6e160d85-14ec-11ee-8477-42010acd0102_keyjson/GCSKey.json',
        };
        await dispatch(getBQcolumns({ payload }));
        if (showBQTable) {
            dispatchState({ type: 'UPDATE', field: 'showDropDownTableFlag', payload: true });
            mutateAPIData(bqTableList, dispatchState, 2);
        }
    };

    const handleBQTableCoulmn = async () => {
        const payload = {
            departmentId: 1,
            datasetId: 'CommonDNC_dataset',
            tableid: 'rptemail_hb_ae',
            path: '/home/res_appdev49/RESUL-Python/Audience/6e160d85-14ec-11ee-8477-42010acd0102_keyjson/GCSKey.json',
        };
        await dispatch(getBQTableColumn({ payload }));
        if (showBQTable) {
            dispatchState({ type: 'UPDATE', field: 'showDropDownTableFlag', payload: true });
            let data = [];
            bqColumnLists.forEach((el, key) => {
                for (let j = 0; j < el.split(' ')?.length; j++) {
                    data.push({ name: el.split(' ')[2], selected: key });
                    break;
                }
            });
            setAttributes({
                leftAttributes: data,
                rightAttributes: rightAttributes,
            });
            dispatchState({ type: 'UPDATE', field: 'primaryDropDown', payload: data });
        }
    };

    const mySqlLength = Object.keys(mySql)?.length || 0;
    const finalConfigLength = Object.keys(finalConfig)?.length || 0;
    const [foreignKeyDisable, setforeignKeyDisable] = useState(
        !isTouched ? true : mySqlLength === 0 || mySqlLength === 1,
    );

    const enableForeignKey = useMemo(
        () => !!primaryKey && !!tableWatch && primaryKey?.table !== tableWatch?.type,
        [primaryKey, tableWatch],
    );
    const disablePrimaryKey = useMemo(() => {
        if (!tableWatch) {
            return true;
        } else if (tableWatch && !!primaryKey && primaryKey?.table !== tableWatch?.type) {
            return true;
        } else return false;
    }, [primaryKey, tableWatch]);

    const checkTableAttributes = (event) => {
        if (event?.isEdit) {
            return true;
        }
        if (rdsId === 40) {
            return true;
        }
        if (rdsId === 168 && !!table && attributes.rightAttributes?.length > 0 && !event?.proceed) {
            dispatchState({
                type: 'UPDATE',
                field: 'dataRemovePopup',
                payload: { status: true, event: event },
            });
            reset((formState) => ({
                ...formState,
                table: formState.table,
            }));
            return false;
        }

        const checkTableConfig = () => {
            const { table, primaryKey, foreignKey, checkUpdate, checkValid_prime_date, isTouched } = getValues();
            const tmpAttrs = { ...attributes };
            let currTableRightAtts = tmpAttrs.rightAttributes.filter((attr) => attr.table === tableWatch.type);
            let rightAtts = tmpAttrs?.rightAttributes;

            if (INTEGRATED_NOSQL_CONNECTOR_IDS.has(rdsId) || INTEGRATED_SQL_CONNECTOR_IDS.has(rdsId)) {
                if (!!primaryKey && !rightAtts?.map((e) => e.table).includes(primaryKey.table)) {
                    setValue('primaryKey', '');
                } else if (!primaryKey && rightAtts?.length) {
                    trigger(['primaryKey'], { shouldFocus: true });
                    return false;
                } else if (!!foreignKey && !rightAtts?.map((e) => e.table).includes(foreignKey.table)) {
                    setValue('foreignKey', '');
                } else if (!foreignKey && !!currTableRightAtts?.length && enableForeignKey) {
                    trigger(['foreignKey'], { shouldFocus: true });
                    return false;
                } else if (
                    INTEGRATED_SQL_CONNECTOR_IDS.has(rdsId) &&
                    !checkUpdate &&
                    !!currTableRightAtts?.length &&
                    primaryDropDown?.filter((el) => isValidDateTimeType(el['dataType']))?.length > 0
                ) {
                    trigger(['checkUpdate'], { shouldFocus: true });
                    return false;
                }
                updateFinalConfig();
                clearErrors('primaryKey');
                clearErrors('foreignKey');
                return true;
            }
        };
        const res = checkTableConfig();

        if (!res) {
            reset((formState) => {
                return {
                    ...formState,
                    table: tableWatch,
                };
            });
            return false;
        }
        return true;
    };

    const convertToFinalConfig = (apiData = [], allRightAtts = [], columnDataMap = {}) => {
        const result = {};
        const isCustomTableConfig = checkCustomTableColumnConfig(rdsId);
        apiData.forEach((item) => {
            const tableName = item?.tableName;
            if (!tableName) return;
            let primary_Key = isCustomTableConfig ? (Object.values(item?.primaryKey)?.[0] ?? '') : item?.primaryKey;
            let foreign_Key = isCustomTableConfig ? (Object.values(item?.foreignKey)?.[0] ?? '') : item?.foreignKey;
            const tableColumns = allRightAtts.filter((col) => col?.table === tableName);
            const primaryKeyObj = tableColumns.find((col) => col?.name === primary_Key) || '';
            const foreignKeyObj = tableColumns.find((col) => col?.name === foreign_Key) || '';
            const check_update = _find(columnDataMap?.[tableName], { type: item?.updateDate });
            let rightAtt = tableColumns;
            let leftAtt = tableColumnsData?.[tableName] || [];

            const tmpAttrs = {};
            tmpAttrs.rightAttributes = rightAtt;
            tmpAttrs.leftAttributes = leftAtt;
            result[tableName] = {
                primaryKey: primaryKeyObj,
                foreignKey: foreignKeyObj,
                checkUpdate: check_update || '',
                attributes: tmpAttrs,
            };
        });

        return result;
    };
    const getEditData = async () => {
        if (!(INTEGRATED_NOSQL_CONNECTOR_IDS.has(rdsId) || INTEGRATED_SQL_CONNECTOR_IDS.has(rdsId)) || !isEdit) {
            return;
        }
        dispatchState({ type: 'UPDATE', field: 'isEditLoading', payload: true });
        try {
            const isCustomTableConfig = checkCustomTableColumnConfig(rdsId);
            let sConnection = pathState?.data?.selectedConnection;

            let selectedColumns = pathState?.data?.columnName;
            const allRightAtts = pathState?.data?.frontEndBind?.map((item) => ({
                ...item,
                selected: false,
            }));

            if (isBiDirectionEnabled) {
                sConnection = connectionType?.data?.find((item) => item?.type === sConnection) || {
                    type: sConnection,
                    typeId: 1,
                };
                setValue('connection', sConnection);
            }

            if (sConnection?.typeId === 2) {
                let catType = allRightAtts[0]?.table;

                let selCategory = tableData?.data?.find((item) => item.type === catType);
                setValue('table', selCategory);
                let categoryData = await getTableColumns(catType);
            } else {
                let primay_keyTable = selectedColumns?.find((item) => !!item?.primaryKey);
                let primary_Key = isCustomTableConfig
                    ? (Object.values(primay_keyTable?.primaryKey)?.[0] ?? '')
                    : primay_keyTable?.primaryKey;
                const tableVal = tableData?.data?.find((item) => item.type === primay_keyTable?.tableName) || {
                    type: primay_keyTable?.tableName,
                    typeId: 0,
                };
                setValue('table', tableVal);
                const columnDataMap = {};
                for (const item of selectedColumns || []) {
                    const table = item?.tableName;
                    const tableVal = tableData?.data?.find((t) => t.type === table) || {
                        type: table,
                        typeId: 0,
                    };
                    const event = {
                        target: {
                            name: 'table',
                            value: tableVal,
                        },
                    };
                    const columnData = await handleTable({ ...event, isEdit: true });
                    columnDataMap[table] = columnData;
                }
                const primary = columnDataMap?.[primay_keyTable?.tableName]?.find(
                    (item) => item?.name === primary_Key,
                ) || {
                    type: primary_Key,
                    typeId: 1,
                };
                setValue('primaryKey', primary);
                const check_update = _find(columnDataMap?.[primay_keyTable?.tableName], {
                    type: primay_keyTable?.updateDate,
                });
                setValue('checkUpdate', check_update);
                const finalConfig = convertToFinalConfig(selectedColumns, allRightAtts, columnDataMap);

                dispatchState({
                    type: 'UPDATE_FINAL_CONFIG',
                    payload: finalConfig,
                    mode: 'replace',
                });
            }

            setAttributes((prev) => ({
                ...prev,
                rightAttributes: allRightAtts,
            }));
        } finally {
            dispatchState({ type: 'UPDATE', field: 'isEditLoading', payload: false });
        }
    };

    useEffect(() => {
        if (isEditCalled.current) return;
        if (
            (INTEGRATED_NOSQL_CONNECTOR_IDS.has(rdsId) || INTEGRATED_SQL_CONNECTOR_IDS.has(rdsId)) &&
            pathState &&
            isEdit &&
            !!tableData?.data?.length
        ) {
            getEditData();
            isEditCalled.current = true;
        }
    }, [pathState, tableData?.data?.length]);
    useEffect(() => {
        if (
            (INTEGRATED_NOSQL_CONNECTOR_IDS.has(rdsId) || INTEGRATED_SQL_CONNECTOR_IDS.has(rdsId)) &&
            isEdit &&
            !!updateCycleList?.length
        ) {
            const updateCycle = updateCycleList?.find((e) => e?.typeId === pathState?.data?.scheduleFrequency);
            setValue('updatedCycle', updateCycle);
        }
    }, [pathState, updateCycleList]);
    useEffect(() => {
        if (isEdit && INTEGRATED_NOSQL_CONNECTOR_IDS.has(rdsId) && isBiDirectionEnabled && !!crmTables?.data?.length) {
            const allRightAtts = pathState?.data?.frontEndBind;
            let crmTable = allRightAtts[0]?.objectName;
            let selTable = crmTables?.data?.find((item) => item.type === crmTable);
            setValue('crmTables', selTable);
        }
    }, [pathState, crmTables?.data]);

    const handleTableColumns = async (e, payload, isEditMode = false) => {
        const { type } = e;
        let columnData = [];

        if ((tableColumnsData?.[type] || []).length > 0) {
            let tableColumns = tableColumnsData[type] || [];

            let rightAtt = getPreservedRightAttributes(attributes);
            setAttributes({
                leftAttributes: generateLeftAttributes(tableColumns, rightAtt), //data
                rightAttributes: rightAtt,
            });

            dispatchState({
                type: 'UPDATE_TABLE_COLUMNS',
                payload: { [type]: tableColumns },
            });
            dispatchState({ type: 'UPDATE', field: 'primaryDropDown', payload: tableColumns });
            columnData = tableColumns;
        } else if (INTEGRATED_NOSQL_CONNECTOR_IDS.has(rdsId) || INTEGRATED_SQL_CONNECTOR_IDS.has(rdsId)) {
            const fetchAPI = rdsId === 1 || rdsId === 2 ? getColumnTables1 : dataExchange_getColumnTables1;
            const fetchedColumns =
                (await tableColumnsApi.refetch({
                    mode: 'create',
                    fetcher: () => dispatch(fetchAPI({ payload, loading: false })),
                })) ?? {};

            let raw = fetchedColumns?.columns ?? fetchedColumns?.tableColumns ?? fetchedColumns?.data ?? fetchedColumns;
            raw = Array.isArray(raw) ? raw : [];
            let primaryData = [];

            if (raw.length > 0) {
                if (INTEGRATED_SQL_CONNECTOR_IDS.has(rdsId) && !isEditMode) {
                    let check_primary_key = raw?.filter((e) => e.key_value === 'primary_key' && e);
                    let check_foreign_key = raw?.filter((e) => e.key_value === 'foreign_key' && e);
                    let get_dateTime = raw?.filter((e) => isValidDateTimeType(e.datatype) && e);
                    if ((!check_primary_key?.length || !get_dateTime?.length) && foreignKeyDisable) {
                        setPrimary_key_warningFlag(true);
                        raw = [];
                    } else if (!check_primary_key?.length || !get_dateTime?.length) {
                        setPrimary_key_warningFlag(true);
                        raw = [];
                    } else if (
                        !!check_primary_key?.length &&
                        !!get_dateTime?.length &&
                        !check_foreign_key?.length &&
                        attributes?.rightAttributes[0]?.table !== type &&
                        attributes?.rightAttributes?.length > 0
                    ) {
                        setPrimary_key_warningFlag(true);
                        raw = [];
                    }
                }

                if (raw.length > 0) {
                    raw.forEach(
                        (
                            { name, datatype, isdatatype = '', uiLabelName = '', fieldName, key_value = '', ...rest },
                            key,
                        ) => {
                            const isCustom = checkCustomTableColumnConfig(rdsId);

                            let finalPrimaryKeyValue;
                            let tableKeyValue;

                            if (isCustom) {
                                finalPrimaryKeyValue = {
                                    value: uiLabelName,
                                    type: uiLabelName,
                                    columnFieldName: fieldName || '',
                                };
                                tableKeyValue = {
                                    name: uiLabelName,
                                    tableUiLabelName: e?.uiLabelName,
                                };
                            } else {
                                finalPrimaryKeyValue = {
                                    value: name,
                                    type: name,
                                    fieldName: '',
                                };
                                tableKeyValue = {
                                    name,
                                    tableUiLabelName: type,
                                };
                            }

                            primaryData.push({
                                typeId: key + 1,
                                dataType: datatype,
                                primeKey: key_value === 'primary_key' ? key_value : '',
                                table: type,
                                primaryKey: key_value === 'primary_key' ? !!key_value : '',
                                foreignKey: key_value === 'foreign_key' ? !!key_value : '',
                                columnFieldName: fieldName,
                                ...finalPrimaryKeyValue,
                                ...tableKeyValue,
                                ...rest,
                            });
                        },
                    );

                    let rightAtt = getPreservedRightAttributes(attributes);
                    setAttributes({
                        leftAttributes: generateLeftAttributes(primaryData, rightAtt),
                        rightAttributes: rightAtt,
                    });
                    dispatchState({
                        type: 'UPDATE_TABLE_COLUMNS',
                        payload: { [type]: primaryData },
                    });
                    dispatchState({ type: 'UPDATE', field: 'primaryDropDown', payload: primaryData });
                    columnData = primaryData;
                }
            }
        } else if (VERSIUM_DIGIPOP_REMOTE_IDS.has(rdsId)) {
            const fetchedColumns =
                (await tableColumnsApi.refetch({
                    mode: 'create',
                    fetcher: () => dispatch(getColumnTables_Versium1({ payload, loading: false })),
                })) ?? {};

            let data = [];
            let tableAlpha = fetchedColumns?.data || [];
            let tempData = tableAlpha.map((item, index) => ({ ...item, typeId: index + 1 }));
            tempData?.forEach(({ partnerDataAttributeID, uIPrintableName, sOLRFieldName }, key) => {
                let tempOne = {
                    name: uIPrintableName,
                    table: type,
                    id: partnerDataAttributeID,
                    fieldName: sOLRFieldName,
                };
                data.push(tempOne);
            });
            let rightAtt = getPreservedRightAttributes(attributes);
            if (type.toLowerCase() === 'contact') {
                let temprightAtt = data.filter((item) => versiumConfigContactData.includes(item.name));
                const mergedArray = temprightAtt.concat(rightAtt);
                rightAtt = mergedArray.filter((item, index, self) => index === self.findIndex((t) => t.id === item.id));
            }
            setAttributes({
                leftAttributes: generateLeftAttributes(data, rightAtt), //data
                rightAttributes: rightAtt,
            });

            dispatchState({
                type: 'UPDATE_TABLE_COLUMNS',
                payload: { [type]: data },
            });
            columnData = data;
        }
        if (INTEGRATED_NOSQL_CONNECTOR_IDS.has(rdsId) || INTEGRATED_SQL_CONNECTOR_IDS.has(rdsId)) {
            const existingTableConfig = finalConfig?.[type] || {};
            setValue('foreignKey', existingTableConfig?.foreignKey || '');
            setValue('checkUpdate', existingTableConfig?.checkUpdate || '');
        }
        return columnData;
    };

    useEffect(() => {
        if (isVersiumEditCalled.current) return;
        const versiumGroups = tableData?.versiumConfig?.groupAttributeName || [];
        if (versiumGroups?.length > 0 && Object.keys(versiumData)?.length > 0) {
            isVersiumEditCalled.current = true;
            handleVersiumtableById();
        }
    }, [versiumData, tableData?.versiumConfig]);

    const handleTable = async (event) => {
        const {
            target: {
                name,
                value: { type, typeId, uiLabelName = '', objectName = '' },
                value,
            },
        } = event;
        const isEditMode = event?.isEdit || false;
        if (checkTableAttributes(event)) {
            const {
                ipAddress,
                userName,
                password,
                databaseName,
                portNumber,
                instanceName,
                api,
                accesstoken,
                hubid,
                clientDomain,
                clientSecret,
                resource,
                tenantDomain,
                schema,
                accountName,
                shopName,
                securityToken,
                storehash,
                apiHost,
                accessKey,
                secretKey,
                authId,
                siteId,
                httpPath,
                projectInfo,
                datasetInfo,
                projectName,
                webinar,
                webex,
                catalog,
                spreadsheetId,
            } = getValues();

            //my-sql

            let payload_my_sql = {
                username: userName,
                password: password,
                host: ipAddress,
                port: portNumber,
                dbName: databaseName,
                departmentId: departmentId,
                friendlyName: instanceName,
                listType: 5,
                sourceType: FormatEnum[pathState?.type] || 2,
                connectionType: 'open',
                dbTypeName: pathState.type === 'mysql' ? 'mysql' : 'mssql', // 'mysql',
                scheduleFrequency: 1,
                tableName: type,
            };

            // crm

            let payload_mCRM = {
                departmentId: departmentId,
                friendlyName: instanceName,
                listType: 5,
                //  scheduleFrequency: 1,
                tenantDomain,
                clientDomain,
                clientSecret,
                resource,
                connectorId: 28,
                connectorName: pathState.data?.sourceName,
                table: type,
            };

            //hubspot

            let payload_hubSpot = {
                hubId: hubid,
                accessToken: accesstoken,
                connectorId: rdsId,
                table: type,
                connectorName: pathState.data?.sourceName,
                departmentId: departmentId,
                friendlyName: instanceName,
            };

            //versium

            let payload_versium = {
                userName: userName,
                password: password,
                departmentId: departmentId,
                url: resource,
                clientId,
                userId,
                connectorName: pathState?.data?.sourceName,
                connectorId: rdsId,
                groupAttributeId: event?.value?.typeId,
                groupAttributeName: event?.value?.type,
                industryId: industryId,
                //  scheduleFrequency: 1,
            };
            let payload_Digipop = {
                departmentId: departmentId,
                clientId,
                userId,
                connectorName: pathState?.data?.sourceName,
                connectorId: rdsId,
                groupAttributeName: event?.value?.type,
                industryId: 7,
                groupAttributeId: event?.value?.typeId,
                //  scheduleFrequency: 1,
            };

            //versiumRecency

            let payload_versiumRecency = {
                departmentId,
                clientId,
                userId,
                connectorName: pathState?.data?.sourceName,
                connectorId: rdsId,
            };

            // snowFlake

            let payload_snowFlake = {
                username: userName,
                password: password,
                connectorName: pathState?.data?.sourceName,
                connectorId: rdsId,
                departmentId,
                clientId,
                userId,
                database: databaseName,
                account: accountName,
                table: type,
                schema: schema,
            };

            //oracle

            let payload_oracle = {
                username: userName,
                password: password,
                connectorName: pathState?.data?.sourceName,
                connectorId: rdsId,
                table: type,
                schema: databaseName,
                host: ipAddress,
                port: portNumber,
            };

            //shopify
            let payload_shopify = {
                apiKey: resource,
                accessToken: accesstoken,
                shopName: shopName,
                connectorId: rdsId,
                connectorName: pathState?.data?.sourceName,
                table: type,
            };

            //Salesforce
            let payload_salesforce = {
                username: userName,
                password: password,
                securityToken: securityToken,
                connectorId: rdsId,
                connectorName: pathState?.data?.sourceName,
                table: objectName || type || '',
            };
            //pipedrive
            let payload_pipeDrive = {
                apiToken: resource,
                connectorId: rdsId,
                connectorName: pathState?.data?.sourceName,
                table: type,
                clientId,
                userId,
                departmentId,
            };

            //Cassandra
            let payload_cassandra = {
                username: userName,
                password: password,
                server: ipAddress,
                port: portNumber,
                keyspaces: databaseName,
                table: type,
                connectorId: rdsId,
                connectorName: pathState?.data?.sourceName,
                clientId,
                userId,
                departmentId,
            };

            //Aerospike
            let payload_aerospike = {
                username: userName,
                password: password,
                host: ipAddress,
                port: portNumber,
                namespace: databaseName,
                table: type,
                connectorId: rdsId,
                connectorName: pathState?.data?.sourceName,
                clientId,
                userId,
                departmentId,
            };

            //mongodb
            let payload_mongodb = {
                username: userName,
                password: password,
                server: ipAddress,
                port: portNumber,
                database: databaseName,
                table: type,
                connectorId: rdsId,
                connectorName: pathState?.data?.sourceName,
                clientId,
                userId,
                departmentId,
            };
            //Storehippo
            let payload_storehippo = {
                shopName: shopName,
                accessKey: accesstoken,
                connectorId: rdsId,
                connectorName: pathState?.data?.sourceName,
                clientId,
                userId,
                departmentId,
                table: type,
            };

      //postgresql
      let payload_postgresql = {
        username: userName,
        password: password,
        host: ipAddress,
        schema: schema,
        database: databaseName,
        port: portNumber,
        table: type,
        connectorId: pathState?.data?.remoteDataSourceID,
        connectorName: pathState?.data?.sourceName,
        clientId,
        userId,
        departmentId
      };
      //Eventbrite
      let payload_eventbrite = {
        authToken: accesstoken,
        connectorId: pathState?.data.remoteDataSourceID,
        connectorName: pathState?.data.sourceName,
        table: type,
        clientId,
        userId,
        departmentId
      };
      //Bigcommerce
      let payload_bigcommerce = {
        storeHash: storehash,
        accessToken: accesstoken,
        shopName: shopName,
        connectorId: pathState?.data.remoteDataSourceID,
        connectorName: pathState?.data.sourceName,
        table: type,
        clientId,
        userId,
        departmentId
      };
      //PrestaShop
      let payload_prestashop = {
        apiKey: resource,
        prestashopUrl: shopName,
        connectorId: pathState?.data.remoteDataSourceID,
        connectorName: pathState?.data.sourceName,
        table: type,
        clientId,
        userId,
        departmentId
      };
      //Leadsquared",
      let payload_leadsquared = {
        apiHost: apiHost,
        accessKey: accessKey,
        secretKey: secretKey,
        connectorId: pathState?.data?.remoteDataSourceID,
        connectorName: pathState?.data?.sourceName,
        TableName: type,
        clientId,
        userId,
        departmentId
      }; //blackbaud",
      let payload_blackbaud = {
        remoteSettingId: pathState?.data?.remoteSettingId,
        connectorId: pathState?.data?.remoteDataSourceID,
        connectorName: pathState?.data?.sourceName,
        friendlyName: instanceName,
        table: type,
        clientId,
        userId,
        departmentId
      }; //Magento",
      let payload_magento = {
        magentoUrl: resource,
        accessToken: accesstoken,
        connectorId: pathState?.data.remoteDataSourceID,
        connectorName: pathState?.data.sourceName,
        username: userName,
        password: password,
        table: type,
        clientId,
        userId,
        departmentId
      }; //Woocommerce,
      let payload_Woocommerce = {
        domainUrl: apiHost,
        consumerKey: accessKey,
        consumerSecret: secretKey,
        connectorId: pathState?.data.remoteDataSourceID,
        connectorName: pathState?.data.sourceName,
        table: type,
        clientId,
        userId,
        departmentId
      };
      //Wix,
      let payload_Wix = {
        authId: authId,
        siteId: siteId,
        connectorId: pathState?.data.remoteDataSourceID,
        connectorName: pathState?.data.sourceName,
        table: type,
        clientId,
        userId,
        departmentId
      };
      //Data Bricks
      let payload_DataBricks = {
        host: resource,
        httpPath: httpPath,
        accessToken: accesstoken,
        database: databaseName,
        schema: schema,
        friendlyName: instanceName,
        connectorId: pathState?.data.remoteDataSourceID,
        connectorName: pathState?.data.sourceName,
        table: type,
        clientId,
        userId,
        departmentId
      };
      //Google BigQuery
      let payload_GoogleBigQuery = {
        projectInfo: projectInfo,
        datasetInfo: datasetInfo,
        projectName: projectName,
        connectorName: pathState?.data.sourceName,
        connectorId: pathState?.data.remoteDataSourceID,
        table: type
      };
      //Insightly
      let payload_Insightly = {
        apiKey: resource,
        connectorName: pathState?.data.sourceName,
        connectorId: pathState?.data.remoteDataSourceID,
        table: type
      };
      //Webinar
      let payload_Webinar = {
        connectorName: pathState?.data.sourceName,
        connectorId: pathState?.data.remoteDataSourceID,
        table: type,
        remoteSettingId: pathState?.data.remoteSettingId,
        webinar: pathState?.data.schemaName || webinar?.name
      };
      //Webex
      let payload_Webex = {
        connectorName: pathState?.data.sourceName,
        connectorId: pathState?.data.remoteDataSourceID,
        table: type,
        remoteSettingId: pathState?.data.remoteSettingId,
        meeting: pathState?.data.schemaName || webex?.name
      };
      //Prestodb
      let payload_Prestodb = {
        host: resource,
        port: portNumber,
        user: userName,
        catalog: catalog,
        schema: schema,
        connectorId: pathState?.data.remoteDataSourceID,
        connectorName: pathState?.data.sourceName,
        table: type
      };
      let Payload_Commercetools = {
        clientId: clientDomain,
        clientSecret: clientSecret,
        projectKey: projectName,
        authHost: resource,
        connectorId: pathState?.data.remoteDataSourceID,
        connectorName: pathState?.data.sourceName,
        table: type
      };
      let payload_googleSheet = {
        spreadsheetId: spreadsheetId,
        connectorId: pathState?.data.remoteDataSourceID,
        connectorName: pathState?.data.sourceName,
        friendlyName: instanceName,
        clientId,
        departmentId,
        userId,
        table: type
      };
      let payload_cNl = {
          apiKey: accesstoken,
          connectorId: rdsId,
          connectorName: pathState?.data.sourceName,
          friendlyName: instanceName,
          clientId,
          departmentId,
          userId,
          table: type,
      };

      const dataSourceId = pathState?.data?.remoteDataSourceID;
      let customPayload;
      switch (dataSourceId) {
        case 3:
          customPayload = payload_oracle;
          break;
        case 5:
          customPayload = payload_salesforce;
          break;
        case 22:
          customPayload = payload_shopify;
          break;
        case 28:
          customPayload = payload_mCRM;
          break;
        case 39:
          customPayload = payload_snowFlake;
          break;
        case 45:
          customPayload = payload_hubSpot;
          break;
        case 50:
          customPayload = payload_pipeDrive;
          break;
        case 51:
          customPayload = payload_cassandra;
          break;
        case 48:
          customPayload = payload_aerospike;
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
          customPayload = payload_Woocommerce;
          break;
        case 46:
          customPayload = payload_Wix;
          break;
        case 53:
          customPayload = payload_DataBricks;
          break;
        case 43:
          customPayload = payload_GoogleBigQuery;
          break;
        case 160:
          customPayload = payload_Insightly;
          break;
        case 158:
          customPayload = payload_Webinar;
          break;
        case 106:
          customPayload = payload_Webex;
          break;
        case 159:
          customPayload = payload_Prestodb;
          break;
        case 166:
          customPayload = Payload_Commercetools;
          break;
        case 168:
          customPayload = payload_googleSheet;
          break;
        case 170:
          customPayload = payload_cNl;
          break;
      }
      // if (name === 'connection') {
      //     dispatchState({ type: 'UPDATE', field: 'connectionFlag', payload: true });
      //     dispatchState({ type: 'UPDATE', field: 'showDropDownTableFlag', payload: false });
      // }

            if (INTEGRATED_NOSQL_CONNECTOR_IDS.has(rdsId)) {
                if (!showDropDownTableFlag)
                    dispatchState({ type: 'UPDATE', field: 'showDropDownTableFlag', payload: true });
                const columnData = await handleTableColumns(value, customPayload, isEditMode);
                return columnData;
            } else if (VERSIUM_DIGIPOP_REMOTE_IDS.has(rdsId)) {
                dispatchState({ type: 'UPDATE', field: 'showDropDownTableFlag', payload: true });
                let payload = rdsId === 40 ? payload_versium : payload_Digipop;
                //let res = await dispatch(getColumnTables_Versium({ payload: payload }));
                const columnData = await handleTableColumns(value, payload, isEditMode);
                if (recencyValue?.length === 0) {
                    await fetchVersiumRecencyAndColumns(payload_versiumRecency);
                }
                // if (res?.status) {
                //     reset((formState) => ({ ...formState, table: value, foreignKey: '', checkUpdate: '' }));
                //     setValue('checkValid_prime_date', false);
                // }
            } else if (INTEGRATED_SQL_CONNECTOR_IDS.has(rdsId)) {
                if (!showDropDownTableFlag)
                    dispatchState({ type: 'UPDATE', field: 'showDropDownTableFlag', payload: true });
                const pay = rdsId === 3 || rdsId === 52 || rdsId === 53 ? customPayload : payload_my_sql;
                const columnData = await handleTableColumns(value, pay, isEditMode);
                return columnData;
                let res = {};
                // if (rdsId === 3 || rdsId === 52 || rdsId === 53) {
                //     //res = await dispatch(getColumnTables({ payload: customPayload }));
                //     res = await dispatch(dataExchange_getColumnTables1({ payload: customPayload }));
                // } else {
                //     res = await dispatch(getColumnTables({ payload: payload_my_sql })); //1&2
                // }
                // if (res?.status) {
                //     let check_primary_key = res?.data?.filter((e) => e.key_value === 'primary_key' && e);
                //     let check_foreign_key = res?.data?.filter((e) => e.key_value === 'foreign_key' && e);
                //     let get_dateTime = res?.data?.filter((e) => isValidDateTimeType(e.datatype) && e);
                //     if ((!check_primary_key?.length || !get_dateTime?.length) && foreignKeyDisable) {
                //         setPrimary_key_warningFlag(true);
                //     } else if (!check_primary_key?.length || !get_dateTime?.length) {
                //         setPrimary_key_warningFlag(true);
                //     } else if (
                //         !!check_primary_key?.length &&
                //         !!get_dateTime?.length &&
                //         !check_foreign_key?.length &&
                //         attributes?.rightAttributes[0]?.table !== type &&
                //         attributes?.rightAttributes?.length > 0
                //     ) {
                //         setPrimary_key_warningFlag(true);
                //     }
                // }
            }
            dispatchState({ type: 'UPDATE', field: 'tableMismatchError', payload: false });
            //setValue('isTouched', false);
        }
    };

    const handleWebinar = async (event) => {
        const selectedItem = event.value;
        const { name } = selectedItem;
        const Payload_Webinar_datas = {
            connectorId: rdsId,
            connectorName: pathState?.data.sourceName,
            remoteSettingId: pathState?.data.remoteSettingId,
            webinar: name,
        };
        let connectionResult = await dispatch(dataExchange_get_tables_from_DB1({ payload: Payload_Webinar_datas }));
    };

    const handleWebex = async (event) => {
        const selectedItem = event.value;
        const { name } = selectedItem;
        const Payload_Webex_datas = {
            connectorId: rdsId,
            connectorName: pathState?.data.sourceName,
            remoteSettingId: pathState?.data.remoteSettingId,
            meeting: name,
        };
        let connectionResult = await dispatch(dataExchange_get_tables_from_DB1({ payload: Payload_Webex_datas }));
    };

    // --- Reset, upload & Versium save ---
    const handleRefresh = () => {
        dispatchState({ type: 'RESET' });
        resetAttributeFormFields();
        setforeignKeyDisable(true);
    };

    const handleRefreshConnectionType = () => {
        resetAttributeFormFields({
            connection: '',
            category: '',
            crmTables: '',
        });
    };
    useEffect(() => {
        return () => {
            handleRefresh();
            handleRefreshConnectionType();
        };
    }, []);

    const handleUpload = async (formState) => {
        if (isBiDirectionEnabled && connection?.typeId === 2) {
            const { table, instanceName, crmTables, crmCreateTableName, updatedCycle, checkUpdate } = formState;
            if (attributes?.rightAttributes?.length === 0)
                return dispatchState({ type: 'UPDATE', field: 'showAttributeError', payload: true });
            let columns = (attributes?.rightAttributes || []).map((item) => ({
                dataAttributeId: item?.dataAttributeId,
                fieldTypeId: item?.fieldTypeId,
                solrFieldName: item?.solrFieldName,
                uiPrintableName: item?.uiPrintableName,
            }));
            let tempObj = (attributes?.rightAttributes || []).map((item) => ({
                ...item,
                objectName: showCrmCreateTableName ? crmCreateTableName || '' : crmTables?.type,
            }));
            const ddd = {
                ...connectorDetails,
                ...sessionDetails,
                ...connectorPayload,
                connectionType: connection.type,
                catTypeName: table?.type || '',
                objectName: showCrmCreateTableName ? crmCreateTableName || '' : crmTables?.type,
                scheduleFrequency: updatedCycle?.typeId,
                listType: 5,
                columnName: columns || [],
                temp: tempObj || [],
            };

            const syncFetcher = () =>
                dispatch(
                    showCrmCreateTableName
                        ? Sync_CRM_Custom_Data({ payload: ddd, loading: false })
                        : Sync_CRM_Data({ payload: ddd, loading: false }),
                );

            const res = await crmUploadApi.refetch({
                mode: 'create',
                loaderConfig: { create: LOADER_TYPE.NONE },
                fetcher: syncFetcher,
            });

            if (showCrmCreateTableName) {
                if (res?.status) {
                    let url = '/preferences/data-exchange';
                    navigate(`${url}`);
                }
            } else if (res?.status) {
                    let url = '/audience/add-import-audience';
                    const state = {
                        from: 'manual entry',
                        data: {
                            audienceData: {
                                arr: [],
                                data: {
                                    ...res,
                                    remoteSettingId: res?.data,
                                    connectorPayload: {
                                        ...connectorPayload,
                                        objectName: ddd?.objectName,
                                        connectionType: connection?.type,
                                        catTypeName: table?.type,
                                    },
                                    connectionMode: connection,
                                },
                            },
                            type: pathState,
                        },
                        isAudience: pathState?.isAudience,
                        isBiDirectionEnabled: isBiDirectionEnabled,
                        connectionType: pathState?.data?.connectionType,
                    };
                    const encryptState = encodeUrl(state);
                    navigate(`${url}?q=${encryptState}`, {
                        state,
                    });
            }

            return;
        }
        if (getAttributes?.rightAttributes.filter((attr) => attr.table === table.type)?.length === 0) {
            dispatchState({ type: 'UPDATE', field: 'showAttributeError', payload: true });
            setFocus('table');
            return;
        }
        if (rdsId === 40 && !pathState?.id) {
            const isSettingIdNA = true;
            const mysqlSnapshot = await handleVersiumBaseAudience(isSettingIdNA);
            if (mysqlSnapshot) {
                let res = await handleVersiumRedirect(isSettingIdNA, mysqlSnapshot);
                if (!res) {
                    return;
                }
            }
        }
        updateFinalConfig();
        dispatchState({ type: 'HANDLE_CONFIRM_POPUP' });
    };

    const handleVersiumBaseAudience = async (isSettingIdNA = false) => {
        if (getAttributes?.rightAttributes.filter((attr) => attr.table === table.type)?.length === 0) {
            dispatchState({ type: 'UPDATE', field: 'showAttributeError', payload: true });
            return undefined;
        }
        const tmpAttrs = { ...attributes };
        tmpAttrs.rightAttributes = tmpAttrs.rightAttributes.filter((attr) => attr.table === table.type);
        const data = {
            attributes: tmpAttrs,
        };
        const tablePayload = { ...data, id: table.id };
        const nxtFinalConfig = { ...finalConfig, [table.type]: tablePayload };
        if (!isSettingIdNA) {
            setVersiumModal(true);
        }
        return nxtFinalConfig;
    };

    const handleVersiumRedirect = async (
        isSettingIdNA = false,
        nxtFinalConfig = null,
        isDirectUpload = true,
        isFilterRedirect = false,
    ) => {
        const allValues = getValues();

        const { checkUpdate = '', versium_volume = '', updatedCycle = '' } = allValues;
        let payload = {};
        const finalConfigState = nxtFinalConfig ?? finalConfig;
        setVersiumModal(false);
        payload = finalPayload_Versium(finalConfigState, getValues, pathState);
        payload = {
            ...payload,
            departmentId,
            clientId,
            userId,
            remotesettingID: pathState?.id?.remoteSettingId !== undefined ? pathState?.id?.remoteSettingId : 0,
        };

        let res = await dispatch(saveBaseCount_Versium({ payload: payload }));
        if (res?.status) {
            if (isDirectUpload && !isFilterRedirect) {
                let makeRuleFilterJSON = createFilterRuleJson(tableData?.versiumConfig);
                const attribute = tableData?.versiumConfig?.filterAttributes[0];
                const ruleJSONPayload = {
                    finalAudienceCount:
                        `${tableData?.versiumConfig.filterCount}||` +
                        `[{"id":0,"name":"${attribute.pVUIPrintableName}","value":"${attribute.pVAttributeValue}"}]||[]||[]`,
                    connectorId: payload?.connectorId,
                    connectorName: payload?.connectorName,
                    remotesettingID: res?.data?.remoteSettingId,
                    premotesettingId: res?.data?.premoteSettingId,
                    departmentId,
                    clientId,
                    userId,
                    ...makeRuleFilterJSON,
                };
                const res_filterJSON = await dispatch(saveFilterJSON_Versium({ payload: ruleJSONPayload }));
                if (res_filterJSON?.status) {
                    if (isSettingIdNA) {
                        const state = {
                            id: res?.data,
                        };
                        await updateQueryParams(state);
                        return true;
                    }
                }
            } else {
                if (isSettingIdNA) {
                    const state = {
                        id: res?.data,
                    };
                    await updateQueryParams(state);
                    return true;
                }
                let url = '/audience/create-target-list';
                let extConfig = { checkUpdate, versium_volume, updatedCycle };
                const state = {
                    from: pathState,
                    // from: Object.assign(pathState, res?.data),
                    data: res?.data,
                    tableDropDown: tableData?.versiumConfig,
                    ruleJSON:
                        Object.keys(versiumData)?.length > 0
                            ? versiumData?.partnerremotesetting[0]?.filterRuleJson
                            : {},
                    ruleJSONCount:
                        Object.keys(versiumData)?.length > 0
                            ? versiumData?.partnerremotesetting[0]?.filterFrontEndBind
                            : '',
                    redirect: window.location.search,
                    extConfig,
                };
                const encryptState = encodeUrl(state);
                navigate(`${url}?q=${encryptState}`, {
                    state,
                });
            }
        } else {
            return false;
        }
    };

    const handleDataItemKeyField = () => {
        const isCustomTableConfig = checkCustomTableColumnConfig(rdsId);
        if (isCustomTableConfig) {
            return {
                textField: 'uiLabelName',
                dataItemKey: 'objectName',
            };
        } else {
            return {
                textField: 'type',
                dataItemKey: 'typeId',
            };
        }
    };

    const dataKeyPropsInTable = handleDataItemKeyField();

    // --- Final config sync & CRM column fetch ---
    const updateFinalConfig = () => {
        const allValues = getValues();
        const { table, primaryKey = '', foreignKey = '', checkUpdate = '' } = allValues;

        const selectedTableKey = typeof tableWatch === 'string' ? tableWatch : tableWatch?.type;

        const tmpAttrs = { ...attributes };
        tmpAttrs.rightAttributes = (tmpAttrs?.rightAttributes || []).filter(
            (attr) => attr?.table && selectedTableKey && attr.table === selectedTableKey,
        );
        if (selectedTableKey) {
            if (tmpAttrs?.rightAttributes?.length > 0) {
                const data = {
                    attributes: tmpAttrs,
                    primaryKey: selectedTableKey === primaryKey?.table ? primaryKey : '',
                    foreignKey: selectedTableKey === primaryKey?.table ? '' : foreignKey,
                    checkUpdate,
                };
                dispatchState({
                    type: 'UPDATE_FINAL_CONFIG',
                    payload: { [selectedTableKey]: data },
                });
            } else {
                const data = { ...finalConfig };
                delete data?.[selectedTableKey];
                dispatchState({
                    type: 'UPDATE_FINAL_CONFIG',
                    payload: data,
                    mode: 'replace',
                });
            }
        }
    };
    useEffect(() => {
        updateFinalConfig();
    }, [attributes.rightAttributes.length]);

    const getTableColumns = async (value) => {
        if (tableColumnsData[value] || []?.length > 0) {
            let CRMColums = tableColumnsData[value] || [];

            let rightAtt = getPreservedRightAttributes(attributes);
            setAttributes({
                leftAttributes: generateLeftAttributes(CRMColums, rightAtt),
                rightAttributes: rightAtt,
            });
            return CRMColums;
        }

        const fetchedColumns = await tableColumnsApi.refetch({
            mode: 'create',
            loaderConfig: isResulToCrmFlow ? { create: LOADER_TYPE.FIELD } : undefined,
            fetcher: async () => {
                const res = await dispatch(
                    GetCRM_TableColumns({
                        payload: {
                            ...connectorDetails,
                            connectionType: connection?.type || pathState?.data?.selectedConnection,
                            catTypeName: value,
                        },
                        dispatchState,
                        loading: false,
                    }),
                );
                if (!res) {
                    return [];
                }

                if (!showDropDownTableFlag) {
                    dispatchState({ type: 'UPDATE', field: 'showDropDownTableFlag', payload: true });
                }

                const data = res?.status ? (res?.data ?? []) : [];
                let CRMColums = (data || []).map((item) => ({
                    ...item,
                    name: item?.uiPrintableName,
                    table: value,
                }));

                dispatchState({
                    type: 'UPDATE_TABLE_COLUMNS',
                    payload: { [value]: CRMColums },
                });
                let rightAtt = getPreservedRightAttributes(attributes);
                setAttributes({
                    leftAttributes: generateLeftAttributes(CRMColums, rightAtt),
                    rightAttributes: rightAtt,
                });
                return CRMColums;
            },
        });
        return fetchedColumns ?? [];
    };
    const isListboxLoading = isEditLoading || tableColumnsApi.isLoading;
    const isCrmUploadLoading = isResulToCrmFlow && crmUploadApi.isFetching;
    const listboxLoadingMode = isEditLoading ? 'full' : 'left';

    const resolvedBiDirectionTypeId =
        connectionTypeId ??
        (isEditLoading
            ? connectionType?.data?.find((item) => item?.type === pathState?.data?.selectedConnection)?.typeId
            : undefined);

    const renderBiDirectionConnectionSkeleton = () => (
        <Row className="d-flex justify-content-center">
            <Col sm={3}>
                <CommonSkeleton box height={10} width={140} mainClass="" />
                <CommonSkeleton box height={18} />
            </Col>
        </Row>
    );

    const renderTableControlsSkeleton = () => (
        <Row>
            <Col sm={VERSIUM_DIGIPOP_REMOTE_IDS.has(rdsId) ? 4 : 3}>
                <CommonSkeleton box height={14} width={140} mainClass="" />
                <CommonSkeleton box height={20} />
            </Col>
            {!VERSIUM_DIGIPOP_REMOTE_IDS.has(rdsId) && (
                <>
                    <Col sm={3}>
                        <CommonSkeleton box height={14} width={140} mainClass="" />
                        <CommonSkeleton box height={20} />
                    </Col>
                    {enableForeignKey && (
                        <Col sm={3}>
                            <CommonSkeleton box height={14} width={140} mainClass="" />
                            <CommonSkeleton box height={20} />
                        </Col>
                    )}
                </>
            )}
            <Col className="text-right">
                <CommonSkeleton circle width={24} height={24} />
            </Col>
        </Row>
    );

    const renderImportPreferenceSkeleton = () => (
        <div className="form-group">
            <Col sm={12}>
                <div className="d-flex align-items-center gap-2 mt3">
                    <CommonSkeleton box width={160} height={20} />
                    <CommonSkeleton circle width={20} height={20} />
                </div>
            </Col>
            <Col sm={12} className="mt20">
                <div className="d-flex align-items-center gap-2 mt3">
                    <CommonSkeleton circle width={20} height={20} />
                    <CommonSkeleton box width={240} height={20} />
                </div>
            </Col>
            <Col sm={12} className="mt10">
                <div className="d-flex align-items-center gap-2 mt3">
                    <CommonSkeleton circle width={20} height={20} />
                    <CommonSkeleton box width={240} height={20} />
                </div>
            </Col>
        </div>
    );

    // --- Render sections ---
    const CRM_TO_RESUL = () => (
        <>
            <div className="form-group pt21">
                {isEditLoading ? (
                    renderTableControlsSkeleton()
                ) : (
                    <Row>
                        {rdsId === 158 && (
                            <Col sm={2}>
                                <>
                                    <ResKendoDropdown
                                        control={control}
                                        name="webinar"
                                        data={webinarsData}
                                        required
                                        // defaultValue={tabledd[0]}
                                        textField="name"
                                        dataItemKey="id"
                                        label={'Select'}
                                        handleChange={handleWebinar}
                                        popupSettings={{
                                            popupClass: `addImportAudienceDropdownListContainer`,
                                        }}
                                    />
                                </>
                            </Col>
                        )}

                        {rdsId === 106 && (
                            <Col sm={2}>
                                <>
                                    <ResKendoDropdown
                                        control={control}
                                        name="webex"
                                        data={webexData}
                                        required
                                        // defaultValue={tabledd[0]}
                                        textField="name"
                                        dataItemKey="id"
                                        label={'Select'}
                                        handleChange={handleWebex}
                                        popupSettings={{
                                            popupClass: `addImportAudienceDropdownListContainer`,
                                        }}
                                    />
                                </>
                            </Col>
                        )}

                        <Col sm={VERSIUM_DIGIPOP_REMOTE_IDS.has(rdsId) ? { span: 4 } : { span: 3 }} className="">
                            <div className="CARET w-100" id="">
                                <ResKendoDropdown
                                    control={control}
                                    name="table"
                                    data={tableData?.data}
                                    required
                                    isLoading={tableData?.loading}
                                    label={VERSIUM_DIGIPOP_REMOTE_IDS.has(rdsId) ? 'Attribute category' : 'Table'}
                                    handleChange={(e) => {
                                        handleTable(e);
                                    }}
                                    {...dataKeyPropsInTable}
                                />
                            </div>
                        </Col>
                        {!VERSIUM_DIGIPOP_REMOTE_IDS.has(rdsId) && (
                            <>
                                <Col sm={3} className={`position-relative`}>
                                    {/* <label className='w-auto'>Primary key</label> */}

                                    <ResKendoDropdown
                                        name="primaryKey"
                                        control={control}
                                        disabled={disablePrimaryKey}
                                        data={
                                            INTEGRATED_NOSQL_CONNECTOR_IDS.has(rdsId)
                                                ? primaryDropDown
                                                : primaryDropDown.filter((e) => e.primeKey && e)
                                        }
                                        textField="type"
                                        dataItemKey="typeId"
                                        label="Primary key"
                                        required={!mySqlLength}
                                        rules={{
                                            required: SELECT_PRIMARY_KEY,
                                        }}
                                        //label={'Select primary key'}
                                        handleChange={() => {
                                            setTimeout(() => {
                                                updateFinalConfig();
                                            }, 100);
                                        }}
                                    />

                                    {!!primaryKey?.table && (
                                        <span className="click-off position-absolute">
                                            Table:{' '}
                                            {primaryKey?.table > 15 ? (
                                                <RSTooltip>{truncateTitle(primaryKey?.table, 15)}</RSTooltip>
                                            ) : (
                                                primaryKey?.table
                                            )}
                                        </span>
                                    )}
                                    <div className="lh0 position-absolute right15">
                                        <RSPPophover position="top" text={PRIMARY_KEY_HELP_TEXT}>
                                            <i
                                                className={`${circle_question_mark_mini} icon-xs color-primary-blue position-relative top5`}
                                                id="circle_question_mark"
                                            ></i>
                                        </RSPPophover>
                                    </div>
                                </Col>
                                {enableForeignKey && (
                                    <Col sm={3} className={` position-relative`}>
                                        {/* <label className='w-auto'>Foreign key</label> */}

                                        <ResKendoDropdown
                                            name="foreignKey"
                                            control={control}
                                            //disabled={foreignKeyDisable}
                                            data={
                                                INTEGRATED_NOSQL_CONNECTOR_IDS.has(rdsId)
                                                    ? primaryDropDown
                                                    : primaryDropDown.filter((e) => e.foreignKey && e)
                                            }
                                            // data={primaryDropDown.filter((e) => e.primeKey && e)}
                                            textField="type"
                                            dataItemKey="typeId"
                                            label="Foreign key"
                                            required={mySqlLength > 0}
                                            rules={{
                                                required: SELECT_FOREIGN_KEY,
                                            }}
                                            //label={'Select foreign key'}
                                            handleChange={() => {
                                                setTimeout(() => {
                                                    updateFinalConfig();
                                                }, 100);
                                            }}
                                        />

                                        <div className="lh0 position-absolute right15">
                                            <RSPPophover position="top" text={FOREIGN_KEY_HELP_TEXT}>
                                                <i
                                                    className={`${circle_question_mark_mini} icon-xs color-primary-blue position-absolute right-0 top5`}
                                                    id="circle_question_mark"
                                                ></i>
                                            </RSPPophover>
                                        </div>
                                    </Col>
                                )}
                            </>
                        )}
                        {tableWatch && (
                            <Col className={`text-right`}>
                                <RSTooltip
                                    position="top"
                                    text="Reset"
                                    className={`lh0  d-inline-block text-right position-relative top6`}
                                >
                                    <i
                                        id="rs_data_refresh"
                                        className={`${restart_medium} icon-md color-primary-blue ${
                                            !table && 'click-off'
                                        }`}
                                        onClick={() => setIsReset(true)}
                                    ></i>
                                </RSTooltip>
                            </Col>
                        )}
                    </Row>
                )}
                {(table || isListboxLoading) && (
                    <>
                        <Row className="form-group mb0 mt20">
                            <Col>
                                {showAttributeError && (
                                    <p style={{ color: 'red' }}>{ENTER_SELECTED_COL_ATT}</p>
                                )}
                                {tableMismatchError && <p style={{ color: 'red' }}>{'Table mismatch'}</p>}
                                <AttributeListBox
                                    attributes={attributes}
                                    setAttributes={setAttributes}
                                    dispatchState={dispatchState}
                                    loading={isListboxLoading}
                                    loadingMode={listboxLoadingMode}
                                />
                            </Col>
                        </Row>{' '}
                    </>
                )}
            </div>
        </>
    );
    const RESUL_TO_CRM = () => (
        <div className="form-group" id="rs_TableAttributes_biDirection_crm_to_resul">
            {isEditLoading ? (
                <Row className="d-flex justify-content-center mt10">
                    <Col sm={3}>
                        <CommonSkeleton box height={10} width={80} mainClass="" />
                        <CommonSkeleton box height={20} />
                    </Col>
                </Row>
            ) : (
                <Row className="d-flex justify-content-center mt30">
                    <Col sm={3}>
                        <ResKendoDropdown
                            control={control}
                            name="table"
                            data={tableData?.data || []}
                            label={CATEGORY}
                            isLoading={tableData?.loading || tableColumnsApi.isLoading}
                            textField="type"
                            dataItemKey="typeId"
                            handleChange={async (e) => {
                                let value = e.value;
                                await getTableColumns(value?.type);
                            }}
                        />
                    </Col>
                    <Col sm={1}>
                        {tableWatch && (
                            <Col>
                                <RSTooltip
                                    position="top"
                                    text="Reset"
                                    className={`lh0  d-inline-block text-right position-relative top6`}
                                >
                                    <i
                                        id="rs_data_refresh"
                                        className={`${restart_medium} icon-md color-primary-blue ${
                                            !table && 'click-off'
                                        }`}
                                        onClick={() => setIsReset(true)}
                                    ></i>
                                </RSTooltip>
                            </Col>
                        )}
                    </Col>
                </Row>
            )}
            {(table || isListboxLoading) &&
                (!!attributes?.leftAttributes?.length || !!attributes?.rightAttributes?.length || isListboxLoading) && (
                    <>
                        <Row className="form-group mb0 mt20">
                            <Col>
                                {showAttributeError && (
                                    <p style={{ color: 'red' }}>{ENTER_SELECTED_COL_ATT}</p>
                                )}
                                {tableMismatchError && <p style={{ color: 'red' }}>{'Table mismatch'}</p>}
                                <AttributeListBox
                                    attributes={attributes}
                                    setAttributes={setAttributes}
                                    dispatchState={dispatchState}
                                    loading={isListboxLoading}
                                    loadingMode={listboxLoadingMode}
                                />
                            </Col>
                        </Row>{' '}
                    </>
                )}
        </div>
    );

    const DEDUPE_BLOCK = () => (
        <div className="form-group">
            <Col sm={12}>
                <div className="d-flex align-items-center gap-2 mt3">
                    <h4 className="mt15 mb5">{IMPORT_PREFERENCES}</h4>
                    <ConfigureDedupeSettings />
                </div>
            </Col>
            <Col sm={12} className="mt20 Error-Label-Block">
                <RSRadioButton
                    control={control}
                    name="isImportPreference"
                    id="rs_AddAudience_importpreference_new"
                    labelName={IMPORT_PREFERENCE_LABEL}
                    rules={{
                        required: SELECT_IMPORT_PREFERENCE,
                    }}
                />

                <RSRadioButton
                    control={control}
                    name="isImportPreference"
                    id="rs_AddAudience_importpreference_old"
                    labelName={IMPORT_PRESERVE_PREFERENCE_LABEL}
                    rules={{
                        required: SELECT_IMPORT_PREFERENCE,
                    }}
                />
            </Col>
        </div>
    );
    const VersiumDigipopAudienceSection = () => {
        const versiumConfig = rdsId === VERSIUM_RDS_ID && tableData?.versiumConfig ? tableData?.versiumConfig : {};
        const isVersium = rdsId === VERSIUM_RDS_ID;
        const isEditVersium = Object.keys(versiumData || {})?.length > 0;

        const rs = versiumData?.remotesetting?.[0];
        const partner = versiumData?.partnerremotesetting?.[0] || {};
        const filterBind = partner?.filterFrontEndBind || '';
        const potentialAudienceCount =
            isEditVersium && hasFilterBindSegments(filterBind)
                ? getFilterBindCount(filterBind, versiumConfig?.filterCount ?? 0)
                : (versiumConfig?.filterCount ?? 0);
        const minVolumeLimit = isEditVersium ? getFilterBindCount(filterBind, 0) : (versiumConfig?.filterCount ?? 0);
        const filterSegJson = isEditVersium
            ? mergeFilterBindSegments(partner?.filterFrontEndBind) || []
            : (versiumConfig?.filterAttributes || []).map((item) => ({
                  ...item,
                  name: item?.pVUIPrintableName || '',
                  value: item?.pVAttributeValue || '',
              }));
        console.log('filterSegJson: ', filterSegJson);

        const renderFilterAttributes = () => {
            return filterSegJson.map((item, index) => (
                <li
                    key={index}
                    className={
                        item.segment === 2 ? 'inclusionColor' : item.segment === 3 ? 'exclusionColor' : undefined
                    }
                >
                    <span>{item.name}</span>
                    <span className="label-value">{item.value}</span>
                </li>
            ));
        };

        return (
            <>
                <div className="form-group">
                    <Row>
                        {isVersium && (
                            <Col sm={2}>
                                <h4 className="d-flex align-items-center mb10">{POTENTIAL_AUDIENCE}</h4>
                            </Col>
                        )}
                        <Col sm={6}>
                            <Row className="flex-column">
                                {isVersium && (
                                    <Col className="d-flex mb15">
                                        <p className="font-bold font-md pr5 mt-9">
                                            {numberWithCommas(potentialAudienceCount)}
                                        </p>
                                        <i
                                            onClick={() => handleVersiumBaseAudience()}
                                            className={`${pencil_edit_medium} icon-md color-primary-blue mt-5 cp`}
                                            id="rs_TableAttributes_penciledit"
                                        />
                                    </Col>
                                )}
                                <Col sm={6}>
                                    <h4 className="mb0 d-flex align-items-center">
                                        Base audience:{' '}
                                        <span className="font-bold font-md ml5">
                                            {numberWithCommas(versiumConfig?.baseCount ?? 0)}
                                        </span>
                                    </h4>
                                    {isVersium && (
                                        <ul className="target-audience-list mt15">{renderFilterAttributes()}</ul>
                                    )}
                                </Col>
                            </Row>
                        </Col>
                    </Row>
                </div>
                <div className="form-group">
                    <Row className="align-items-baseline">
                        <Col sm={2}>
                            <h4>Required volume</h4>
                        </Col>
                        <Col sm={3} className="d-flex">
                            <RSInput
                                name="versium_volume"
                                placeholder="Volume"
                                onKeyDown={onlyNumbers}
                                id="rs_TableAttributes_versiumvolume"
                                required
                                rules={{
                                    required: ENTER_VOLUME,
                                    validate: (data) => (data !== 0 ? true : false),
                                }}
                                handleOnBlur={(e) => {
                                    const volume = parseInt(e.target.value, 10);
                                    if (volume > minVolumeLimit) {
                                        setTimeout(() => {
                                            setError('versium_volume', {
                                                type: 'custom',
                                                message: `Enter min. volume of  ${numberWithCommas(minVolumeLimit)} `,
                                            });
                                        }, 100);
                                        return;
                                    }
                                    clearErrors('versium_volume');
                                }}
                            />
                            <RSPPophover
                                position="top"
                                pophover="The entered audience count will be extracted form the potential audience."
                            >
                                <i
                                    className={`${circle_question_mark_mini} color-primary-blue icon-xs mt13 ml5`}
                                    id="rs_TableAttributes_circlequestionmark"
                                />
                            </RSPPophover>
                        </Col>
                        {versium_volume > 0 && (
                            <>
                                <Col sm={1}>
                                    <h4 className="text-center">Recency</h4>
                                </Col>
                                <Col sm={3} id="rs_TableAttributes_updatedcycle" className="updated_tablecycle">
                                    <ResKendoDropdown
                                        control={control}
                                        name="updatedCycle"
                                        data={recencyValue}
                                        textField="recency"
                                        label="Select the days"
                                        isLoading={recencyVersiumApi.isLoading}
                                        required
                                        dataItemKey="id"
                                        rules={{
                                            required: UPDATE_RECENCY,
                                            validate: (data) => (data.id !== 0 ? true : false),
                                        }}
                                        handleChange={() => setrecencyModal(true)}
                                    />
                                </Col>
                            </>
                        )}
                    </Row>
                </div>
                {isVersium && (
                    <div className="form-group">
                        <Row>
                            <Col sm={2}>
                                <h4>{CHECK_FOR_UPDATES}</h4>
                            </Col>
                            <Col sm={3} id="rs_TableAttributes_checkUpdate">
                                <ResKendoDropdown
                                    control={control}
                                    name="checkUpdate"
                                    label="Select update column"
                                    data={ColumnUpdateValue}
                                    textField="uIPrintableName"
                                    dataItemKey="partnerDataAttributeID"
                                    isLoading={updatedColumnVersiumApi.isLoading}
                                    required
                                    rules={{
                                        required: CHECK_UPDATE,
                                        validate: (data) => (data.id !== 0 ? true : false),
                                    }}
                                    handleChange={() => {}}
                                />
                            </Col>
                        </Row>
                    </div>
                )}
            </>
        );
    };

    return (
        <Container className="px0">
            <form className="card-header center" onSubmit={handleSubmit(handleUpload)}>
                <div className="box-design my21">
                    {isBiDirectionEnabled &&
                        (isEditLoading ? (
                            renderBiDirectionConnectionSkeleton()
                        ) : (
                            <Row className="d-flex justify-content-center mt20">
                                <Col sm={3}>
                                    <ResKendoDropdown
                                        control={control}
                                        name="connection"
                                        data={connectionType?.data}
                                        label={CONNECTIONTYPE}
                                        isLoading={connectionType?.loading}
                                        textField="type"
                                        dataItemKey="typeId"
                                        disabled={!!tableWatch}
                                        handleChange={(e) => {
                                            let value = e.value;
                                            if (value?.typeId === 2) {
                                                const payload = {
                                                    ...connectorDetails,
                                                    connectionType: value?.type,
                                                };
                                                dispatch(
                                                    GetCRM_Categories({
                                                        payload,
                                                        dispatchState,
                                                        isLoading: false,
                                                    }),
                                                );
                                                const payload1 = { ...payload, ...connectorPayload };
                                                dispatch(
                                                    GetCRM_Tables({
                                                        payload: payload1,
                                                        dispatchState,
                                                        loading: false,
                                                    }),
                                                );
                                            } else {
                                                dispatch(
                                                    dataExchange_get_tables_from_DB1({
                                                        payload: connectorPayload,
                                                        dispatchState,
                                                    }),
                                                );
                                            }
                                        }}
                                    />
                                </Col>
                                <Col sm={1} className={`d-flex align-items-center`} />
                            </Row>
                        ))}
                    {isBiDirectionEnabled &&
                        (isEditLoading
                            ? resolvedBiDirectionTypeId === 2
                                ? RESUL_TO_CRM()
                                : CRM_TO_RESUL()
                            : connectionTypeId &&
                              (connectionTypeId === 2 ? RESUL_TO_CRM() : CRM_TO_RESUL()))}
                    {!isBiDirectionEnabled && CRM_TO_RESUL()}
                </div>
                {showDropDownTableFlag && (
                    <>
                        {connection?.typeId !== 2 &&
                            (isEditLoading ? renderImportPreferenceSkeleton() : DEDUPE_BLOCK())}
                        {!isEditLoading && VERSIUM_DIGIPOP_REMOTE_IDS.has(rdsId) && <VersiumDigipopAudienceSection />}
                        {!isEditLoading && !VERSIUM_DIGIPOP_REMOTE_IDS.has(rdsId) && (
                            <>
                                {connection?.typeId === 2 && (
                                    <Row className="form-group align-items-center">
                                        <Col sm={2} className="">
                                            <label className="control-label-left">{CRM_TABLE_NAME}</label>
                                        </Col>
                                        <Col sm={3}>
                                            <ResKendoDropdown
                                                control={control}
                                                name="crmTables"
                                                data={crmTables?.data || []}
                                                isLoading={crmTables?.loading}
                                                textField="type"
                                                dataItemKey="typeId"
                                                required={!showCrmCreateTableName}
                                                rules={showCrmCreateTableName ? {} : { required: 'Select CRM table' }}
                                                handleChange={(e) => {
                                                    if (e?.value) {
                                                        dispatchState({
                                                            type: 'UPDATE',
                                                            field: 'showCrmCreateTableName',
                                                            payload: false,
                                                        });
                                                        setValue('crmCreateTableName', '');
                                                        clearErrors('crmCreateTableName');
                                                    }
                                                }}
                                                footer={
                                                    <NewAttributeBtn
                                                        title="New table type"
                                                        handleModalAttribute={() => {
                                                            unregister('crmTables');
                                                            setValue('crmTables', '');
                                                            clearErrors('crmTables');
                                                            clearErrors('crmCreateTableName');
                                                            dispatchState({
                                                                type: 'UPDATE',
                                                                field: 'showCrmCreateTableName',
                                                                payload: true,
                                                            });
                                                            setValue('crmCreateTableName', '');
                                                        }}
                                                    />
                                                }
                                            />
                                        </Col>
                                        {showCrmCreateTableName && (
                                            <>
                                                <Col sm={{ offset: 0, span: 2 }} className="">
                                                    <label className="control-label-left">
                                                        {CREATE_TABLE_NAME}
                                                    </label>
                                                </Col>
                                                <Col sm={{ span: 4, offset: 1 }}>
                                                    <ListNameExists
                                                        name={`crmCreateTableName`}
                                                        control={control}
                                                        field="objectName"
                                                        apiCallback={customTableNameExists}
                                                        condition={(data) => {
                                                            const { status } = data;
                                                            return status;
                                                        }}
                                                        rules={LIST_NAME_RULES('Enter table name')}
                                                        placeholder={'Table name'}
                                                        extraPayload={{
                                                            ...connectorPayload,
                                                            remoteDataSourceID: rdsId,
                                                            connectionType: connection?.type,
                                                        }}
                                                    />
                                                </Col>
                                            </>
                                        )}
                                    </Row>
                                )}
                                <Row className="form-group">
                                    <Col sm={2} className="">
                                        <label className="control-label-left">{UPDATE_CYCLE}</label>
                                    </Col>
                                    <Col sm={3}>
                                        <ResKendoDropdown
                                            control={control}
                                            name="updatedCycle"
                                            data={updateCycleList}
                                            //label={`Update cycle`}
                                            textField="type"
                                            required
                                            dataItemKey="typeId"
                                            rules={{
                                                required: UPDATE_CYCLE_MSG,
                                                //validate: (data) => (data.typeId !== 0 ? true : false),
                                            }}
                                        />
                                    </Col>
                                    {CHECK_UPDATE_VISIBLE_REMOTE_IDS.has(rdsId) &&
                                        primaryDropDown?.filter((el) => isValidDateTimeType(el['dataType']))?.length >
                                            0 && (
                                            <>
                                                <Col sm={3}>
                                                    <label className="control-label-left">
                                                        {CHECK_FOR_UPDATES}
                                                    </label>
                                                </Col>
                                                <Col sm={4}>
                                                    <ResKendoDropdown
                                                        control={control}
                                                        name="checkUpdate"
                                                        data={primaryDropDown?.filter((el) =>
                                                            isValidDateTimeType(el['dataType']),
                                                        )}
                                                        textField="type"
                                                        dataItemKey="typeId"
                                                        //label={`Check for updates`}
                                                        required={rdsId === 45 ? false : true}
                                                        rules={rdsId === 45 ? {} : { required: CHECK_UPDATE }}
                                                        handleChange={() => {
                                                            dispatchState({
                                                                type: 'UPDATE',
                                                                field: 'firstCheck',
                                                                payload: false,
                                                            });
                                                            setValue('isTouched', true);
                                                        }}
                                                    />
                                                </Col>
                                            </>
                                        )}
                                </Row>
                            </>
                        )}

                        {!isEditLoading && (
                            <div
                                className={`d-flex ${
                                    isEdit && !pathState?.isBack ? 'justify-content-between' : 'justify-content-end'
                                } align-items-center mb30`}
                            >
                                {isEdit && !pathState?.isBack && (
                                    <div className="me-auto">
                                        <small>
                                            <strong>Data notice:</strong> For additional changes/modification of the
                                            existing scheduled job, kindly contact Resul support team.
                                        </small>
                                    </div>
                                )}

                                <div className="d-flex align-items-center">
                                    <RSSecondaryButton
                                        className="me-3"
                                        blockInteraction={isCrmUploadLoading}
                                        onClick={() => {
                                            if (pathState?.isAudience) {
                                                const stateRedirect = {
                                                    from: 'master-data',
                                                    mode: 'add',
                                                    type: 'remote data source',
                                                };
                                                const stateredirectEncode = encodeUrl(stateRedirect);
                                                navigate(`/audience/add-audience?q=${stateredirectEncode}`, {
                                                    state: stateRedirect,
                                                });
                                            } else {
                                                navigate('/preferences/data-exchange');
                                            }
                                        }}
                                    >
                                        {CANCEL}
                                    </RSSecondaryButton>

                                    <RSPrimaryButton
                                        type="submit"
                                        isLoading={isCrmUploadLoading}
                                        blockBodyPointerEvents={isCrmUploadLoading}
                                        disabledClass={
                                            Object.keys(errors)?.length > 0 ||
                                            (isEdit && !pathState?.isBack) ||
                                            isCrmUploadLoading
                                                ? 'pe-none click-off'
                                                : ''
                                        }
                                    >
                                        {UPLOAD}
                                    </RSPrimaryButton>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </form>
            {/* <DedupeModal
           show={dedupeFlag}
           handleClose={(status) => {
               if (!status) {
                   dispatchState({ type: 'UPDATE', field: 'dedupeFlag', payload: false });
               }
           }}
           columnData={COLUMN_DATA_DEDUPE}
        /> */}
            {confirmPopup && (
                <Preview
                    show={confirmPopup}
                    type={pathState}
                    handleClose={() => {
                        dispatchState({ type: 'UPDATE', field: 'confirmPopup', payload: false });
                    }}
                    dispatchState={dispatchState}
                    primaryDropDown={primaryDropDown}
                />
            )}
            <RSConfirmationModal
                show={primary_key_warningFlag}
                text={PRIMARY_FOREIGN_KEY}
                primaryButtonText={OK}
                secondaryButton={false}
                handleClose={() => {
                    setPrimary_key_warningFlag(false);
                }}
                handleConfirm={() => {
                    // setValue('checkValid_prime_date', true);
                    // dispatchState({ type: 'UPDATE', field: 'firstCheck', payload: true });
                    // setAttributes({
                    //     leftAttributes: [],
                    //     rightAttributes: generateRightAttributes(mySql),
                    // });
                    setPrimary_key_warningFlag(false);
                }}
                isCloseButton={false}
            />

            <RSModal
                show={brandExist_flag}
                size={'md'}
                noBottomBorder
                className="border-0"
                header={WARNING}
                handleClose={() => {
                    setBrandExist_flag(false);
                }}
                body={
                    <div className="d-flex flex-column align-items-center">
                        <i className={`${alert_xlarge}  color-primary-yellow fs75 cursor-normal`} />
                        <div className="mt10">{BRAND_ID_NOT_EXISTS} </div>
                    </div>
                }
            />

            {versiumModal && (
                <RSConfirmationModal
                    show={versiumModal}
                    text={REFINE_AUDIENCE_SELECTION}
                    primaryButtonText={OK}
                    secondaryButton={CANCEL}
                    handleClose={async () => {
                        setVersiumModal(false);
                    }}
                    handleConfirm={() => {
                        handleVersiumRedirect(false, null, !pathState.id, true);
                    }}
                />
            )}
            {dataRemovePopup?.status && (
                <RSConfirmationModal
                    show={dataRemovePopup?.status}
                    text={'Selected data will be removed if table is changed, Do you wish to continue?'}
                    primaryButtonText={OK}
                    secondaryButton={CANCEL}
                    handleClose={async () => {
                        dispatchState({
                            type: 'UPDATE',
                            field: 'dataRemovePopup',
                            payload: { status: false, event: null },
                        });
                    }}
                    handleConfirm={() => {
                        setAttributes({
                            leftAttributes: [],
                            rightAttributes: [],
                        });
                        const value = dataRemovePopup?.event?.value;
                        const event = {
                            target: {
                                name: 'table',
                                value: value,
                            },
                        };
                        handleTable({ ...event, proceed: true });
                        dispatchState({
                            type: 'UPDATE',
                            field: 'dataRemovePopup',
                            payload: { status: false, event: null },
                        });
                    }}
                />
            )}
            {dataSyncModal && (
                <RSConfirmationModal
                    show={dataSyncModal}
                    htmlContent={
                        <>
                            <div className="d-flex justify-content-center">
                                <i className={`${circle_time_large} font-xxl`} />
                            </div>
                            <div className="d-flex justify-content-center mt15 text-center">
                                {DATA_SYNC_PROGRESS}
                            </div>
                        </>
                    }
                    primaryButtonText={OK}
                    header={DATA_SYNC_STATUS}
                    secondaryButton={false}
                    handleClose={async () => {
                        dispatchState({ type: 'UPDATE', field: 'dataSyncModal', payload: false });
                        navigate(`/preferences/data-exchange`);
                    }}
                    handleConfirm={() => {
                        dispatchState({ type: 'UPDATE', field: 'dataSyncModal', payload: false });
                        navigate(`/preferences/data-exchange`);
                    }}
                />
            )}
            {apiErrorPopup?.show && (
                <RSConfirmationModal
                    show={apiErrorPopup?.show}
                    header={'Error'}
                    htmlContent={
                        <>
                            <div className="d-flex flex-column align-items-center">
                                <i className={`${alert_medium}  color-primary-red fs75 cursor-normal`} />
                                <div className="mt10">{apiErrorPopup?.message || EXCEPTION_OCCURRED}</div>
                            </div>
                        </>
                    }
                    secondaryButton={false}
                    primaryButton={false}
                    handleClose={() => {
                        dispatchState({
                            type: 'UPDATE',
                            field: 'apiErrorPopup',
                            payload: { show: false, message: '' },
                        });
                    }}
                    handleConfirm={() => {
                        dispatchState({
                            type: 'UPDATE',
                            field: 'apiErrorPopup',
                            payload: { show: false, message: '' },
                        });
                    }}
                />
            )}
            {recencyModal && (
                <RSConfirmationModal
                    show={recencyModal}
                    text={REQUIRED_VOLUME}
                    primaryButtonText={OK}
                    secondaryButton={CANCEL}
                    handleClose={async () => {
                        setrecencyModal(false);
                    }}
                    handleConfirm={() => {
                        setrecencyModal(false);
                    }}
                />
            )}
            <RSConfirmationModal
                show={isReset}
                text={ARE_YOU_SURE_RESET}
                primaryButtonText={YES}
                handleConfirm={() => {
                    handleRefresh();
                    setIsReset(false);
                }}
                handleClose={() => setIsReset(false)}
            />
        </Container>
    );
};

export default TableAttributes;
