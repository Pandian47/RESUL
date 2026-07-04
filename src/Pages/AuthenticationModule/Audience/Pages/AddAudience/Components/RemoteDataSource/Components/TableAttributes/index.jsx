import { find as _find } from 'Utils/modules/lodashReplacements';
import { updateQueryParams } from 'Utils/modules/urlQuery';
import { getBrandName } from 'Utils/modules/brandStorage';
import { encodeUrl } from 'Utils/modules/crypto';
import { numberWithCommas } from 'Utils/modules/formatters';
import { truncateTitle } from 'Utils/modules/displayCore';
import { onlyNumbers } from 'Utils/modules/inputValidators';
import { CHECK_UPDATE, ENTER_VOLUME, EXCEPTION_OCCURRED, SELECT_FOREIGN_KEY, SELECT_IMPORT_PREFERENCE, SELECT_PRIMARY_KEY, UPDATE_CYCLE as UPDATE_CYCLE_MSG, UPDATE_RECENCY } from 'Constants/GlobalConstant/ValidationMessage';
import { ARE_YOU_SURE_RESET, BARND_NAME_DOESNT_EXISTS, BRAND_ID_NOT_EXISTS, CANCEL, CHECK_FOR_UPDATES, CONNECTIONTYPE, DATA_SYNC_PROGRESS, DATA_SYNC_STATUS, ENTER_SELECTED_COL_ATT, FOREIGN_KEY_HELP_TEXT, IMPORT_PREFERENCE_LABEL, IMPORT_PREFERENCES, IMPORT_PRESERVE_PREFERENCE_LABEL, OK, POTENTIAL_AUDIENCE, PRIMARY_FOREIGN_KEY, PRIMARY_KEY_HELP_TEXT, REFINE_AUDIENCE_SELECTION, REQUIRED_VOLUME, UPDATE_CYCLE, UPLOAD, WARNING, YES } from 'Constants/GlobalConstant/Placeholders';
import { alert_medium, alert_xlarge, circle_question_mark_medium, circle_question_mark_mini, circle_time_large, pencil_edit_medium, refresh_large, restart_medium } from 'Constants/GlobalConstant/Glyphicons';
import { useEffect, useReducer, useState } from 'react';
import { Col, Container, Row } from 'react-bootstrap';
import { useFormContext } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

import {
    mergeFilterBindSegments,
    parseAudienceJsonArray,
    parseFilterBindSegment,
    getFilterBindCount,
    hasFilterBindSegments,
} from 'Pages/AuthenticationModule/Audience/audienceDefaults';

import {
    saveFilterJSON_Versium,
    getBQDataSets,
    getBQTableColumn,
    getBQcolumns,
    getColumnTables,
    dataExchange_getColumnTables,
    getColumnTables_Versium,
    getRecency_Versium,
    saveBaseCount_Versium,
    getUpdatedColumn_Versium,
    dataExchange_get_tables_from_DB,
} from 'Reducers/remoteDataSource/request';
import { mySqlReset, getShowTableColumn, mySqlUpdate, getTableColumnDetails } from 'Reducers/remoteDataSource/reducer';

import RSTooltip from 'Components/RSTooltip';
import RSRadioButton from 'Components/FormFields/RSRadioButton';
import RSKendoDropDown from 'Components/FormFields/RSKendoDropdown';
import RSPPophover from 'Components/RSPPophover';
import { RSPrimaryButton, RSSecondaryButton } from 'Components/Buttons';
import useComponentWillUnmount from 'Hooks/useComponentWillUnMount';

import { leftAttributes, rightAttributes, mutateAPIData, CONNECTION_TYPE } from '../constants';
import {
    INITIAL_STATE,
    MYSQL_STATE_REDUCER,
    checkCustomTableColumnConfig,
    checkTableChange,
    createFilterRuleJson,
    finalPayload_Versium,
    generateLeftAttributes,
    generateRightAttributes,
    isValidDateTimeType,
} from './constant';
import AttributeListBox from './AttributeListBox';
import Preview from './Preview';
import { getSessionId } from 'Reducers/globalState/selector';
import RSConfirmationModal from 'Components/ConfirmationModal';
import RSInput from 'Components/FormFields/RSInput';
import { FormatEnum } from '../ConnectRDSInputs/constants';
import RSModal from 'Components/RSModal';
import ConfigureDedupeSettings from '../../../ConfigureDedupeSettings/ConfigureDedupeSettings';

const TableAttributes = ({ pathState, from = '' }) => {
    // console.log('from@@@@: ', from);
    // const { industryId } = getUserDetails();
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
        formState: { errors },
    } = useFormContext();
    const dispatch = useDispatch();
    const [state, dispatchState] = useReducer(MYSQL_STATE_REDUCER, INITIAL_STATE);
    const {
        showDropDownTableFlag,
        getAttributes,
        dedupeFlag,
        showAttributeError,
        connectionFlag,
        tabledd,
        primaryDropDown,
        foreignDropDown,
        projectList,
        dataSetList,
        bqColumnList,
        firstCheck,
        confirmPopup,
        apiErrorPopup,
        dataSyncModal,
        dataRemovePopup,
    } = state;
    const isEdit = pathState?.mode === 'edit';
    const [modal, setModal] = useState({
        show: false,
        type: null,
    });
    let tableValue = watch('table');
    const {
        tableDropDown,
        tableColumns,
        showColumns,
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
    const { departmentId, clientId, userId, ...rest } = useSelector((state) => getSessionId(state));

    const [attributes, setAttributes] = useState({
        leftAttributes: [],
        rightAttributes: [],
    });
    // console.log('attributes', attributes);

    const [updateTabledd, setUpdateTabledd] = useState(tabledd ?? []);
    const [err, setErr] = useState(false);
    let [connection, table, versium_volume] = watch(['connection', 'table', 'versium_volume']);
    const [primary_key_warningFlag, setPrimary_key_warningFlag] = useState(false);
    const [recencyValue, setRecencyValue] = useState([]);
    const [ColumnUpdateValue, setColumnUpdateValue] = useState([]);
    const [versiumModal, setVersiumModal] = useState(false);
    const [brandExist_flag, setBrandExist_flag] = useState(false);
    const [filterJSON, setfilterJSON] = useState([]);
    const [recencyModal, setrecencyModal] = useState(false);
    const [connectionTypeData, setConnectionTypeData] = useState([]);
    const [connectionTypeDisable, setConnectionTypeDisable] = useState(false);
    const [isReset, setIsReset] = useState(false);

    useEffect(() => {
        let attr = { ...attributes };
        dispatchState({ type: 'ATTRIBUTES_UPDATE', payload: attr });
    }, [attributes]);
    useEffect(() => {
        if (bqProjectList?.length > 0) {
            let data = [];
            bqProjectList?.forEach((el, key) => {
                for (let j = 0; j < el.split(' ')?.length; j++) {
                    data.push({ type: el.split(' ')[1], typeId: key });
                    break;
                }
            });
            dispatchState({ type: 'UPDATE', field: 'projectList', payload: data });
        }
    }, [bqProjectList]);

    useEffect(() => {
        mutateAPIData(bgDataset, dispatchState, 2);
    }, [bgDataset]);

    useEffect(() => {
        if (tableDropDown?.length > 0) {
            if (pathState.type === 'CRM') {
                let tableAlpha;
                if (pathState?.data?.remoteDataSourceID === 45) {
                    tableAlpha = tableDropDown;
                } else if (pathState?.data?.remoteDataSourceID === 28) {
                    tableAlpha = tableDropDown;
                } else {
                    tableAlpha = tableDropDown?.split(',');
                }
                // let tableAlpha = tableDropDown?.split(',');
                let data = tableAlpha && tableAlpha?.map((el, key) => ({ type: el, typeId: key }));
                dispatchState({ type: 'UPDATE', field: 'tabledd', payload: data });
            } else {
                let tableAlpha = [...tableDropDown].sort();
                let data = tableAlpha && tableAlpha?.map((el, key) => ({ type: el, typeId: key }));
                dispatchState({ type: 'UPDATE', field: 'tabledd', payload: data });
            }
        } else if (
            (pathState?.data?.remoteDataSourceID === 40 || pathState?.data?.remoteDataSourceID === 155) &&
            pathState?.id?.remoteSettingId === undefined
        ) {
            let tableAlpha = [...tableDropDown?.groupAttributeName].sort();
            if (tableAlpha?.length > 0) {
                let data =
                    tableAlpha &&
                    tableAlpha?.map((el, key) => ({
                        type: el?.attributeGroupName,
                        typeId: el?.partnerAttributeGroupId,
                    }));
                dispatchState({ type: 'UPDATE', field: 'tabledd', payload: data });
            }
        }
        // return () => {
        //     dispatch(getShowTableColumn(false));
        //     handleRefresh(pathState.type.toLowerCase());
        // };
    }, [tableDropDown]);

    useEffect(() => {
        const connectiontypes = [
            { type: 'Select', typeId: 0 },
            { type: `${pathState?.data?.sourceName} to RESUL`, typeId: 1 },
            { type: `RESUL to ${pathState?.data?.sourceName}`, typeId: 2 },
        ];
        setConnectionTypeData(connectiontypes);
    }, [pathState]);

    useEffect(() => {
        if (tableDropDown.groupAttributeName?.length > 0 && Object.keys(versiumData)?.length > 0) {
            let tableAlpha = [...tableDropDown?.groupAttributeName].sort();
            if (tableAlpha?.length > 0) {
                let data =
                    tableAlpha &&
                    tableAlpha?.map((el, key) => ({
                        type: el?.attributeGroupName,
                        typeId: el?.partnerAttributeGroupId,
                    }));
                dispatchState({ type: 'UPDATE', field: 'tabledd', payload: data });

                handleVersiumtableById();
            }
        }
    }, [versiumData, tableDropDown]);

    useEffect(() => {
        if (tabledd?.length) {
            const updateTable = tabledd?.map((table) => {
                return {
                    ...table,
                    type: table?.type?.objectName ?? table?.type,
                    objectName: table?.type?.objectName ?? table?.type,
                    uiLabelName: table?.type?.uiLabelName ?? table?.type,
                };
            });
            setUpdateTabledd(updateTable);
        }
    }, [JSON.stringify(tabledd)]);
    useEffect(() => {
        if (
            updateTabledd?.length &&
            Object.keys(pathState) &&
            checkCustomTableColumnConfig(pathState?.data?.remoteDataSourceID)
        ) {
            const findTableObject = updateTabledd?.find((updateTable) => updateTable?.objectName === table?.type);
            setValue('table', {
                ...table,
                ...findTableObject,
            });
        }
    }, [JSON.stringify(updateTabledd), pathState]);

    const handleVersiumtableById = async () => {
        let payload_versium = {
            userName: versiumData?.remotesetting[0]?.userName,
            password: versiumData?.remotesetting[0]?.password,
            departmentId: departmentId,
            url: versiumData?.remotesetting[0]?.url,
            clientId,
            userId,
            connectorName: pathState?.data?.sourceName,
            connectorId: pathState?.data?.remoteDataSourceID,
            groupAttributeId: tableDropDown?.groupAttributeName?.filter(
                // (e) => versiumData?.partnerremotesetting[0]?.tableName.split(',')[0] === e?.attributeGroupName,
                (e) =>
                    versiumData?.partnerremotesetting[0]?.tableName?.split(',')[0]?.replaceAll('!', ',') ===
                    e?.attributeGroupName,
            )[0]?.partnerAttributeGroupId,
            groupAttributeName: versiumData?.partnerremotesetting[0]?.tableName?.split(',')[0]?.replaceAll('!', ','),
            industryId: industryId,
            //  scheduleFrequency: 1,
        };
        let payload_versiumRecency = {
            departmentId,
            clientId,
            userId,
            connectorName: pathState?.data?.sourceName,
            connectorId: pathState?.data?.remoteDataSourceID,
        };
        dispatchState({ type: 'UPDATE', field: 'showDropDownTableFlag', payload: true });
        reset((formState) => ({
            ...formState,
            // table: versiumData?.partnerremotesetting[0]?.tableName.split(',')[0],
            table: {
                type: versiumData?.partnerremotesetting[0]?.tableName?.split(',')[0]?.replaceAll('!', ','),
                typeId: tableDropDown?.groupAttributeName?.filter(
                    (e) =>
                        versiumData?.partnerremotesetting[0]?.tableName?.split(',')[0]?.replaceAll('!', ',') ===
                        e?.attributeGroupName,
                )[0]?.partnerAttributeGroupId,
            },
            foreignKey: '',
            checkUpdate: '',
        }));
        setValue('checkValid_prime_date', false);
        let res = await dispatch(getColumnTables_Versium({ payload: payload_versium }));
        // if (recencyValue?.length === 0) {
        let res_recency = await dispatch(getRecency_Versium({ payload: payload_versiumRecency }));
        let res_ColumnUpdate = await dispatch(getUpdatedColumn_Versium({ payload: payload_versiumRecency }));
        if (res_recency?.status) {
            setRecencyValue(res_recency?.data);
        }
        if (res_ColumnUpdate?.status) {
            setColumnUpdateValue(res_ColumnUpdate?.data);
            // setColumnUpdateValue([
            //     {
            //         partnerDataAttributeID: 83,
            //         uIPrintableName: 'Last Updated Date',
            //         sOLRFieldName: 'v_lastupdateddate_dt',
            //     },
            // ]);
        }
        //}
        if (res_ColumnUpdate?.status && res_ColumnUpdate?.data?.length > 0) {
            let columnData = (versiumData.partnerremotesetting[0].frontEndBind || '')
                .toString()
                .replace(/True/g, 'false');
            let columnJSONData = (versiumData.partnerremotesetting[0].filterRuleJson || '')
                .toString()
                .replace(/True/g, 'true');

            columnJSONData = columnJSONData.replace(/False/g, 'false');
            columnData = columnData.replace(/False/g, 'false');
            setfilterJSON(mergeFilterBindSegments(versiumData.partnerremotesetting[0]?.filterFrontEndBind));
            reset((formState) => ({
                ...formState,
                versium_volume: versiumData?.partnerremotesetting[0]?.rowLimit,
                checkUpdate: res_ColumnUpdate?.data?.filter(
                    (e) =>
                        e?.partnerDataAttributeID ===
                        parseInt(versiumData?.partnerremotesetting[0]?.fieldsUpdatedBy?.split('|')[0], 10),
                )[0],
                importPreference: 'Update new data - if a match is found, overwrite the older record',
                updatedCycle: res_recency?.data?.filter(
                    (e) => e?.id === versiumData?.partnerremotesetting[0]?.recency,
                )[0],
            }));

            let data = [];
            let tempOne = { name: '', table: table?.type };
            data.push(tempOne);
            const parsedColumnData = parseAudienceJsonArray(columnData, []);
            dispatch(mySqlUpdate(parsedColumnData));
            let rightAtt = generateRightAttributes(parsedColumnData);
            // setAttributes({
            //     leftAttributes: generateLeftAttributes({}, rightAtt), //data
            //     rightAttributes: rightAtt,
            // });
        }
    };
    useEffect(() => {
        if (showAttributeError) dispatchState({ type: 'UPDATE', field: 'showAttributeError', payload: false });
    }, [leftAttributes, rightAttributes]);

    // console.log('table?.type', table?.type);
    const [val, setVal] = useState(false);

    useEffect(() => {
        if (!isEdit) {
            setVal(true);
        } else {
            setVal(isTouched);
        }
    }, [isEdit, isTouched]);
    useEffect(() => {
        if (val || pathState?.data?.remoteDataSourceID === 40 || pathState?.data?.remoteDataSourceID === 155) {
            if (showColumns) {
                // if (pathState?.type.toLowerCase() === 'crm' && pathState?.data.remoteDataSourceID === 28) {
                //     if (tableColumns?.length > 0 && tableColumns?.split(',')?.length > 0) {
                //         let data = [];
                //         let primaryData = [];
                //         let tableAlpha = tableColumns.split(',');
                //         let tempData = tableAlpha && tableAlpha?.map((el, key) => ({ typeName: el, typeId: key }));
                //         tempData?.forEach(({ typeName, datatype, key_value }, key) => {
                //             let tempOne = { name: typeName, table: table?.type };
                //             data.push(tempOne);
                //         });
                //         let rightAtt = generateRightAttributes(mySql);
                //         setAttributes({
                //             leftAttributes: generateLeftAttributes(data, rightAtt), //data
                //             rightAttributes: rightAtt,
                //         });
                //     }
                // } else
                if (
                    pathState?.data?.remoteDataSourceID === 45 ||
                    pathState?.data.remoteDataSourceID === 28 ||
                    pathState?.data.remoteDataSourceID === 5 ||
                    pathState?.data.remoteDataSourceID === 22 ||
                    pathState?.data.remoteDataSourceID === 50 ||
                    pathState?.data.remoteDataSourceID === 51 ||
                    pathState?.data.remoteDataSourceID === 48 ||
                    pathState?.data.remoteDataSourceID === 41 ||
                    pathState?.data.remoteDataSourceID === 49 ||
                    pathState?.data.remoteDataSourceID === 54 ||
                    pathState?.data.remoteDataSourceID === 23 ||
                    pathState?.data.remoteDataSourceID === 29 ||
                    pathState?.data.remoteDataSourceID === 156 ||
                    pathState?.data.remoteDataSourceID === 55 ||
                    pathState?.data.remoteDataSourceID === 21 ||
                    pathState?.data.remoteDataSourceID === 47 ||
                    pathState?.data.remoteDataSourceID === 46 ||
                    pathState?.data.remoteDataSourceID === 43 ||
                    pathState?.data?.remoteDataSourceID === 160 ||
                    pathState?.data?.remoteDataSourceID === 158 ||
                    pathState?.data?.remoteDataSourceID === 106 ||
                    pathState?.data?.remoteDataSourceID === 159 ||
                    pathState?.data?.remoteDataSourceID === 166 ||
                    pathState?.data?.remoteDataSourceID === 39 ||
                    pathState?.data?.remoteDataSourceID === 168
                ) {
                    if (tableColumns?.length > 0) {
                        let data = [];
                        let primaryData = [];
                        let tableAlpha = tableColumns;
                        let tempData = tableAlpha.map((item, index) => ({ ...item, typeId: index + 1 })); //tableAlpha && tableAlpha?.map((el, key) => ({ typeName: el, typeId: key }));
                        tempData?.forEach(
                            ({ name, datatype, key_value, isdatatype, uiLabelName = '', fieldName }, key) => {
                                const isCustomTableConfig = checkCustomTableColumnConfig(
                                    pathState?.data?.remoteDataSourceID,
                                );
                                let finalPrimaryKeyValue;
                                let tableKeyValue;
                                if (isCustomTableConfig) {
                                    finalPrimaryKeyValue = {
                                        value: uiLabelName,
                                        type: uiLabelName,
                                        columnFieldName: fieldName || '',
                                    };
                                    tableKeyValue = {
                                        name: uiLabelName,
                                        tableUiLabelName: table?.uiLabelName,
                                    };
                                } else {
                                    finalPrimaryKeyValue = {
                                        value: name,
                                        type: name,
                                        fieldName: '',
                                    };

                                    tableKeyValue = {
                                        name: name,
                                        tableUiLabelName: table?.type,
                                    };
                                }
                                primaryData.push({
                                    typeId: key,
                                    dataType: datatype,
                                    primeKey: isdatatype, //!!key_value,
                                    ...finalPrimaryKeyValue,
                                });
                                let tempOne = {
                                    table: table?.type,
                                    columnFieldName: fieldName,
                                    ...tableKeyValue,
                                };
                                data.push(tempOne);
                            },
                        );
                        let rightAtt = generateRightAttributes(mySql);
                        setAttributes({
                            leftAttributes: generateLeftAttributes(data, rightAtt), //data
                            rightAttributes: rightAtt,
                        });
                        dispatchState({ type: 'UPDATE', field: 'primaryDropDown', payload: primaryData });
                    } else {
                        let rightAtt = generateRightAttributes(mySql);
                        setAttributes({
                            leftAttributes: [],
                            rightAttributes: rightAtt,
                        });
                        dispatchState({ type: 'UPDATE', field: 'primaryDropDown', payload: [] });
                    }
                } else if (pathState?.data?.remoteDataSourceID === 40 || pathState?.data?.remoteDataSourceID === 155) {
                    if (tableColumns?.length > 0) {
                        let data = [];
                        let tableAlpha = tableColumns;
                        let tempData = tableAlpha.map((item, index) => ({ ...item, typeId: index + 1 })); //tableAlpha && tableAlpha?.map((el, key) => ({ typeName: el, typeId: key }));
                        tempData?.forEach(({ partnerDataAttributeID, uIPrintableName, sOLRFieldName }, key) => {
                            let tempOne = {
                                name: uIPrintableName,
                                // table: pathState?.id?.remoteSettingId !== undefined ? table : table?.type,
                                table: table?.type,
                                id: partnerDataAttributeID,
                                fieldName: sOLRFieldName,
                            };
                            data.push(tempOne);
                        });
                        let rightAtt = [],
                            columnData = [];

                        if (Object.keys(versiumData)?.length !== 0 && Object.keys(mySql)?.length === 0) {
                            columnData = versiumData?.partnerremotesetting[0]?.frontEndBind.replace(/True/g, 'true');
                            columnData = columnData.replace(/False/g, 'false');
                            const versiumColumnData = parseAudienceJsonArray(columnData, []);
                            dispatch(mySqlUpdate(versiumColumnData));
                            rightAtt = generateRightAttributes(versiumColumnData);
                        } else {
                            rightAtt = generateRightAttributes(mySql);
                        }
                        if (table?.type.toLowerCase() === 'contact') {
                            let temprightAtt = data.filter((item) => versiumConfigContactData.includes(item.name));
                            const mergedArray = temprightAtt.concat(rightAtt);
                            rightAtt = mergedArray.filter(
                                (item, index, self) => index === self.findIndex((t) => t.id === item.id),
                            );
                            // rightAtt = removeDuplicateArrayofObject(rightAtt, temprightAtt, 'name');
                        }
                        // let rightAtt = generateRightAttributes(mySql);
                        setAttributes({
                            leftAttributes: generateLeftAttributes(data, rightAtt), //data
                            rightAttributes: rightAtt,
                        });
                        reset((formState) => ({
                            ...formState,
                            importPreference: 'Update new data - if a match is found, overwrite the older record',
                        }));
                    }
                } else {
                    if (tableColumns?.length > 0) {
                        let data = [];
                        let primaryData = [];
                        tableColumns?.forEach(({ name, datatype, key_value }, key) => {
                            // let tempOne = { name: name, dataType: datatype, primaryKey: !!key_value, table: table?.type };
                            let tempOne = {
                                name: name,
                                dataType: datatype,
                                primaryKey: key_value === 'primary_key' ? !!key_value : '',
                                foreignKey: key_value === 'foreign_key' ? !!key_value : '',
                                // primaryKey: !!key_value,
                                table: table?.type,
                            };
                            primaryData.push({
                                type: name,
                                typeId: key,
                                value: name,
                                dataType: datatype,
                                // primeKey: !!key_value,
                                primeKey: key_value === 'primary_key' ? key_value : '',
                                foreignKey: key_value === 'foreign_key' ? key_value : '',
                            });
                            data.push(tempOne);
                        });
                        let rightAtt = generateRightAttributes(mySql);
                        setAttributes({
                            leftAttributes: generateLeftAttributes(data, rightAtt), //data
                            rightAttributes: rightAtt,
                        });
                        // data={primaryDropDown?.filter((el) => el['dataType'] === 'DATETIME')}
                        dispatchState({ type: 'UPDATE', field: 'primaryDropDown', payload: primaryData });
                    } else {
                        let rightAtt = generateRightAttributes(mySql);
                        setAttributes({
                            leftAttributes: [],
                            rightAttributes: rightAtt,
                        });
                        dispatchState({ type: 'UPDATE', field: 'primaryDropDown', payload: [] });
                    }
                }
            }
        }
    }, [showColumns, tableColumns, table?.type]);

    useComponentWillUnmount(() => {
        dispatch(getShowTableColumn(false));
        handleRefresh(pathState.type.toLowerCase());
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
    const primaryKeyDisable = mySqlLength >= 1 || !table;
    const [foreignKeyDisable, setforeignKeyDisable] = useState(
        !isTouched ? true : mySqlLength === 0 || mySqlLength === 1,
    );
    //let foreignKeyDisable = !isTouched ? true : mySqlLength === 0 || mySqlLength === 1;

    // if(mySql?.[table?.type]?.foreignKey === ''){
    //     foreignKeyDisable = true;
    // }
    //console.log('foreignKeyDisable: ', foreignKeyDisable);
    const findPrimaryTable = (obj) => {
        for (const key in obj) {
            const foreignKey = obj[key]?.foreignKey;
            if (!foreignKey || foreignKey?.type === '') {
                return key;
            }
        }
        return null;
    };
    useEffect(() => {
        if (pathState?.data?.remoteDataSourceID !== 40 && pathState?.data?.remoteDataSourceID !== 155) {
            const primaryTable = findPrimaryTable(mySql);
            // console.log('primaryTable: ', primaryTable);
            if (primaryTable === table?.type) {
                //foreignKeyDisable = true;
                setforeignKeyDisable(true);
            }
            if (attributes?.rightAttributes?.length > 0) {
                if (attributes?.rightAttributes[0]?.table !== table?.type && attributes?.rightAttributes?.length > 0) {
                    //foreignKeyDisable = false;
                    setforeignKeyDisable(false);
                }
            }
        }
    }, [mySql, tableColumns, table?.type]);
    const checkTableAttributes = (event) => {
        if (
            pathState?.data?.remoteDataSourceID === 168 &&
            !!tableValue &&
            attributes.rightAttributes?.length > 0 &&
            !event?.proceed
        ) {
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
        if (
            pathState?.data?.remoteDataSourceID !== 40 &&
            pathState?.data?.remoteDataSourceID !== 155 &&
            attributes.rightAttributes?.length > 0 &&
            attributes.rightAttributes?.map((e) => e.table).includes(table.type)
        ) {
            dispatchState({
                type: 'UPDATE',
                field: 'firstCheck',
                payload: false,
            });
            setValue('isTouched', true);
        }
        const data = checkTableChange(
            getValues,
            attributes,
            mySql,
            trigger,
            firstCheck,
            dispatchState,
            dispatch,
            pathState,
            event,
            reset,
            event?.proceed && pathState?.data?.remoteDataSourceID === 168,
            primaryDropDown,
        );
        if (!data) {
            reset((formState) => ({
                ...formState,
                table: formState.table,
            }));
            return false;
        }
        return true;
    };
    useEffect(() => {
        const { table, primaryKey, foreignKey, checkUpdate, checkValid_prime_date, isTouched } = getValues();
        if (isEdit && pathState?.data?.remoteDataSourceID !== 40 && pathState?.data?.remoteDataSourceID !== 155) {
            const WebniartypeId = webinarsData?.findIndex((item) => item.name === pathState?.data?.schemaName);
            const WebexId = webexData?.findIndex((item) => item.name === pathState?.data?.schemaName);
            const primaryKeyTable = pathState?.data?.columnName?.filter((item) => item?.primaryKey !== '')[0];
            const typeId = tableDropDown?.findIndex((item) => item === primaryKeyTable?.tableName);
            if (pathState?.data?.remoteDataSourceID === 158) {
                reset((formState) => ({
                    ...formState,
                    webinar: { name: pathState?.data?.schemaName, id: WebniartypeId },
                }));
            }
            if (pathState?.data?.remoteDataSourceID === 106) {
                reset((formState) => ({
                    ...formState,
                    webex: { name: pathState?.data?.schemaName, id: WebexId },
                }));
            }
            reset((formState) => ({
                ...formState,
                table: { type: primaryKeyTable?.tableName, typeId: typeId },
            }));
            const event = {
                target: {
                    name: 'table',
                    value: {
                        type: primaryKeyTable?.tableName,
                        typeId: typeId,
                    },
                },
            };
            handleTable(event);
        }
    }, [pathState]);

    useEffect(() => {
        if (isEdit && pathState?.data?.remoteDataSourceID !== 40 && pathState?.data?.remoteDataSourceID !== 155) {
            if (!isTouched) {
                const { table, primaryKey, foreignKey, checkUpdate, checkValid_prime_date, isTouched } = getValues();

                // const rightAtt = allColumns
                if (tableColumns?.length > 0) {
                    const data = [];
                    let primaryData = [];
                    if (
                        pathState?.data?.remoteDataSourceID === 28 ||
                        pathState?.data?.remoteDataSourceID === 23 ||
                        pathState?.data?.remoteDataSourceID === 29 ||
                        pathState?.data?.remoteDataSourceID === 45 ||
                        pathState?.data?.remoteDataSourceID === 22 ||
                        pathState?.data?.remoteDataSourceID === 5 ||
                        pathState?.data?.remoteDataSourceID === 50 ||
                        pathState?.data?.remoteDataSourceID === 51 ||
                        pathState?.data?.remoteDataSourceID === 48 ||
                        pathState?.data?.remoteDataSourceID === 41 ||
                        pathState?.data?.remoteDataSourceID === 49 ||
                        pathState?.data?.remoteDataSourceID === 54 ||
                        pathState?.data?.remoteDataSourceID === 156 ||
                        pathState?.data?.remoteDataSourceID === 55 ||
                        pathState?.data?.remoteDataSourceID === 21 ||
                        pathState?.data?.remoteDataSourceID === 47 ||
                        pathState?.data?.remoteDataSourceID === 46 ||
                        pathState?.data?.remoteDataSourceID === 43 ||
                        pathState?.data?.remoteDataSourceID === 160 ||
                        pathState?.data?.remoteDataSourceID === 158 ||
                        pathState?.data?.remoteDataSourceID === 106 ||
                        pathState?.data?.remoteDataSourceID === 159 ||
                        pathState?.data?.remoteDataSourceID === 166 ||
                        pathState?.data?.remoteDataSourceID === 39 ||
                        pathState?.data?.remoteDataSourceID === 168
                    ) {
                        const isCustomTableConfig = checkCustomTableColumnConfig(pathState?.data?.remoteDataSourceID);
                        let rightAtt;
                        if (isCustomTableConfig) {
                            rightAtt = pathState?.data?.frontEndBind;
                        } else {
                            rightAtt = pathState?.data?.frontEndBind?.map((item) => ({
                                name: item?.name,
                                table: item?.table,
                            }));
                        }
                        let tableAlpha = tableColumns;
                        let tempData = tableAlpha.map((item, index) => ({ ...item, typeId: index + 1 })); //tableAlpha && tableAlpha?.map((el, key) => ({ typeName: el, typeId: key }));

                        let finalPrimaryKeyValue;
                        let tableKeyValue;

                        tempData?.forEach(({ name, datatype, key_value, isdatatype, uiLabelName, fieldName }, key) => {
                            if (isCustomTableConfig) {
                                finalPrimaryKeyValue = {
                                    value: uiLabelName,
                                    type: uiLabelName,
                                    columnFieldName: fieldName || '',
                                };
                                tableKeyValue = {
                                    name: uiLabelName,
                                    tableUiLabelName: table?.uiLabelName,
                                };
                            } else {
                                finalPrimaryKeyValue = {
                                    value: name,
                                    type: name,
                                    fieldName: '',
                                };

                                tableKeyValue = {
                                    name: name,
                                    tableUiLabelName: table?.type,
                                };
                            }

                            primaryData.push({
                                typeId: key,
                                dataType: datatype,
                                primeKey: isdatatype, //!!key_value,
                                ...finalPrimaryKeyValue,
                            });

                            let tempOne = {
                                table: table?.type,
                                columnFieldName: fieldName,
                                ...tableKeyValue,
                            };

                            data.push(tempOne);
                        });
                        setAttributes({
                            leftAttributes: generateLeftAttributes(data, rightAtt), //data
                            rightAttributes: rightAtt,
                        });
                    }
                    if (
                        pathState?.data?.remoteDataSourceID === 1 ||
                        pathState?.data?.remoteDataSourceID === 2 ||
                        pathState?.data?.remoteDataSourceID === 3 ||
                        pathState?.data?.remoteDataSourceID === 52 ||
                        pathState?.data?.remoteDataSourceID === 53
                    ) {
                        const rightAtt = pathState?.data?.frontEndBind?.map((item) => ({
                            ...item,
                            selected: false,
                        }));
                        tableColumns?.forEach(({ name, datatype, key_value }, key) => {
                            // let tempOne = { name: name, dataType: datatype, primaryKey: !!key_value, table: table?.type };
                            let tempOne = {
                                name: name,
                                dataType: datatype,
                                primaryKey: key_value === 'primary_key' ? !!key_value : '',
                                foreignKey: key_value === 'foreign_key' ? !!key_value : '',
                                // primaryKey: !!key_value,
                                table: table?.type,
                            };
                            primaryData.push({
                                type: name,
                                typeId: key,
                                value: name,
                                dataType: datatype,
                                // primeKey: !!key_value,
                                primeKey: key_value === 'primary_key' ? key_value : '',
                                foreignKey: key_value === 'foreign_key' ? key_value : '',
                            });
                            data.push(tempOne);
                        });

                        setAttributes({
                            leftAttributes: generateLeftAttributes(data, rightAtt), //data
                            rightAttributes: rightAtt,
                        });
                    }

                    dispatchState({ type: 'UPDATE', field: 'primaryDropDown', payload: primaryData });
                    const primaryKey = pathState?.data?.columnName?.filter((item) => item?.primaryKey !== '')[0]
                        ?.primaryKey;
                    const foreignKey = pathState?.data?.columnName?.filter((item) => item?.foreignKey !== '')[0]
                        ?.foreignKey;

                    const isCustomTableConfig = checkCustomTableColumnConfig(pathState?.data?.remoteDataSourceID);

                    let filterPrimaryData;
                    let filterForeignData;
                    let restFormState;

                    if (isCustomTableConfig) {
                        filterPrimaryData = primaryKey
                            ? primaryData.find((item) => item.type === Object?.values(primaryKey)?.[0])
                            : {};
                        filterForeignData = foreignKey
                            ? primaryData.find((item) => item.type === Object?.values(foreignKey)?.[0])
                            : {};
                    } else {
                        filterPrimaryData = primaryData.find((item) => item.type === primaryKey);
                    }

                    if (isCustomTableConfig) {
                        restFormState = {
                            primaryKey: {
                                type: filterPrimaryData?.value,
                                typeId: filterPrimaryData?.typeId,
                                value: filterPrimaryData?.value,
                                primeKey: true,
                                columnFieldName: filterPrimaryData?.columnFieldName,
                            },
                            foreignKey: {
                                columnFieldName: filterForeignData?.columnFieldName,
                                dataType: '',
                                primeKey: false,
                                type: filterForeignData?.value,
                                typeId: filterForeignData?.typeId,
                                value: filterForeignData?.value,
                            },
                        };
                    } else {
                        restFormState = {
                            primaryKey: {
                                type: filterPrimaryData?.value,
                                typeId: filterPrimaryData?.typeId,
                                value: filterPrimaryData?.value,
                                primeKey: true,
                            },
                        };
                    }

                    const filterData = updateCycleList?.filter((e) => e?.typeId === pathState?.data?.scheduleFrequency);
                    const checkUpdate = pathState?.data?.columnName?.filter((item) => item?.tableName === table?.type);
                    reset((formState) => ({
                        ...formState,
                        ...restFormState,
                        importPreference: 'Update new data - if a match is found, overwrite the older record',
                        updatedCycle: filterData[0],
                        checkUpdate: _find(primaryData, { type: checkUpdate?.[0]?.updateDate }),
                    }));
                }
            } else if (isTouched) {
                //debugger
                // const filteredTable = pathState?.columnName?.filter(item => item?.tableName === table?.type);

                const foreignKeyTable = mySql?.[table?.type];
                reset((formState) => ({
                    ...formState,
                    foreignKey: foreignKeyTable === undefined ? '' : foreignKeyTable?.foreignKey,
                    checkUpdate: foreignKeyTable === undefined ? '' : foreignKeyTable?.checkUpdate,
                }));
            }
        } else if (!isEdit) {
            const foreignKeyTable = mySql?.[table?.type];
            // console.log('foreignKeyTable: ', foreignKeyTable);
            reset((formState) => ({
                ...formState,
                foreignKey: foreignKeyTable === undefined ? '' : foreignKeyTable?.foreignKey,
                checkUpdate: foreignKeyTable === undefined ? '' : foreignKeyTable?.checkUpdate,
            }));
        }
    }, [tableColumns]);

    useEffect(() => {
        const { table, primaryKey, foreignKey, checkUpdate, checkValid_prime_date, isTouched } = getValues();

        if (isEdit && pathState?.data?.remoteDataSourceID !== 40 && pathState?.data?.remoteDataSourceID !== 155) {
            if (!isTouched) {
                if (attributes && tableColumns?.length > 0) {
                    const tmpAttrs = { ...attributes };
                    pathState?.data?.columnName?.forEach((item, ind) => {
                        const filteredRightAttributes = tmpAttrs.rightAttributes.filter(
                            (attr) => attr.table === item?.tableName,
                        );
                        const isCustomTableConfig = checkCustomTableColumnConfig(pathState?.data?.remoteDataSourceID);
                        let restFormState;
                        if (isCustomTableConfig) {
                            restFormState = {
                                primaryKey: !item?.primaryKey ? undefined : primaryKey,
                                foreignKey: item?.foreignKey === '' ? undefined : foreignKey,
                            };
                        } else {
                            restFormState = {
                                primaryKey: primaryKey,
                                foreignKey:
                                    item?.foreignKey === ''
                                        ? undefined
                                        : { type: item?.foreignKey, typeId: ind, value: item?.foreignKey },
                            };
                        }
                        const datas = {
                            checkUpdate: {
                                type: item?.updateDate,
                                typeId: ind,
                                value: item?.updateDate,
                                ...restFormState,
                            },
                            attributes: { ...tmpAttrs, rightAttributes: filteredRightAttributes },
                        };
                        dispatch(mySqlUpdate({ [item?.tableName]: { ...datas, id: table.id } }));
                    });
                }
            }
        }
    }, [attributes]);
    const handleTable = async (event) => {
        const {
            target: {
                name,
                value: { type, typeId, uiLabelName = '', objectName = '' },
                value,
            },
        } = event;
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
                connectorId: pathState?.data?.remoteDataSourceID,
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
                connectorId: pathState?.data?.remoteDataSourceID,
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
                connectorId: pathState?.data?.remoteDataSourceID,
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
                connectorId: pathState?.data?.remoteDataSourceID,
            };

            // snowFlake

            let payload_snowFlake = {
                username: userName,
                password: password,
                connectorName: pathState?.data?.sourceName,
                connectorId: pathState?.data?.remoteDataSourceID,
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
                connectorId: pathState?.data?.remoteDataSourceID,
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
                connectorId: pathState?.data?.remoteDataSourceID,
                connectorName: pathState?.data?.sourceName,
                table: type,
            };

            //Salesforce
            let payload_salesforce = {
                username: userName,
                password: password,
                securityToken: securityToken,
                connectorId: pathState?.data?.remoteDataSourceID,
                connectorName: pathState?.data?.sourceName,
                table: objectName || type || '',
            };
            //pipedrive
            let payload_pipeDrive = {
                apiToken: resource,
                connectorId: pathState?.data?.remoteDataSourceID,
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
                connectorId: pathState?.data?.remoteDataSourceID,
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
                connectorId: pathState?.data?.remoteDataSourceID,
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
                connectorId: pathState?.data?.remoteDataSourceID,
                connectorName: pathState?.data?.sourceName,
                clientId,
                userId,
                departmentId,
            };
            //Storehippo
            let payload_storehippo = {
                shopName: shopName,
                accessKey: accesstoken,
                connectorId: pathState?.data?.remoteDataSourceID,
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
                departmentId,
            };
            //Eventbrite
            let payload_eventbrite = {
                authToken: accesstoken,
                connectorId: pathState?.data.remoteDataSourceID,
                connectorName: pathState?.data.sourceName,
                table: type,
                clientId,
                userId,
                departmentId,
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
                departmentId,
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
                departmentId,
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
                departmentId,
            }; //blackbaud",
            let payload_blackbaud = {
                remoteSettingId: pathState?.data?.remoteSettingId,
                connectorId: pathState?.data?.remoteDataSourceID,
                connectorName: pathState?.data?.sourceName,
                friendlyName: instanceName,
                table: type,
                clientId,
                userId,
                departmentId,
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
                departmentId,
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
                departmentId,
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
                departmentId,
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
                departmentId,
            };
            //Google BigQuery
            let payload_GoogleBigQuery = {
                projectInfo: projectInfo,
                datasetInfo: datasetInfo,
                projectName: projectName,
                connectorName: pathState?.data.sourceName,
                connectorId: pathState?.data.remoteDataSourceID,
                table: type,
            };
            //Insightly
            let payload_Insightly = {
                apiKey: resource,
                connectorName: pathState?.data.sourceName,
                connectorId: pathState?.data.remoteDataSourceID,
                table: type,
            };
            //Webinar
            let payload_Webinar = {
                connectorName: pathState?.data.sourceName,
                connectorId: pathState?.data.remoteDataSourceID,
                table: type,
                remoteSettingId: pathState?.data.remoteSettingId,
                webinar: pathState?.data.schemaName || webinar?.name,
            };
            //Webex
            let payload_Webex = {
                connectorName: pathState?.data.sourceName,
                connectorId: pathState?.data.remoteDataSourceID,
                table: type,
                remoteSettingId: pathState?.data.remoteSettingId,
                meeting: pathState?.data.schemaName || webex?.name,
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
                table: type,
            };
            let Payload_Commercetools = {
                clientId: clientDomain,
                clientSecret: clientSecret,
                projectKey: projectName,
                authHost: resource,
                connectorId: pathState?.data.remoteDataSourceID,
                connectorName: pathState?.data.sourceName,
                table: type,
            };
            let payload_googleSheet = {
                spreadsheetId: spreadsheetId,
                connectorId: pathState?.data.remoteDataSourceID,
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
            }
            if (name === 'connection') {
                dispatchState({ type: 'UPDATE', field: 'connectionFlag', payload: true });
                dispatchState({ type: 'UPDATE', field: 'showDropDownTableFlag', payload: false });
            }
            if (
                (name === 'table' && dataSourceId === 22) ||
                dataSourceId === 45 ||
                dataSourceId === 28 ||
                dataSourceId === 5 ||
                dataSourceId === 50 ||
                dataSourceId === 51 ||
                dataSourceId === 48 ||
                dataSourceId === 41 ||
                dataSourceId === 49 ||
                dataSourceId === 54 ||
                dataSourceId === 23 ||
                dataSourceId === 29 ||
                dataSourceId === 156 ||
                dataSourceId === 55 ||
                dataSourceId === 21 ||
                dataSourceId === 47 ||
                dataSourceId === 46 ||
                dataSourceId === 43 ||
                dataSourceId === 160 ||
                dataSourceId === 158 ||
                dataSourceId === 106 ||
                dataSourceId === 159 ||
                dataSourceId === 166 ||
                dataSourceId === 39 ||
                dataSourceId === 168
            ) {
                if (!showDropDownTableFlag)
                    dispatchState({ type: 'UPDATE', field: 'showDropDownTableFlag', payload: true });

                // if (pathState?.data?.remoteDataSourceID === 45) {
                let res = await dispatch(dataExchange_getColumnTables({ payload: customPayload }));
                if (res?.status) {
                    const isCustomTableConfig = checkCustomTableColumnConfig(pathState?.data?.remoteDataSourceID);

                    let addTableValue;
                    if (isCustomTableConfig) {
                        addTableValue = {};
                    } else {
                        addTableValue = {
                            table: value,
                        };
                    }
                    reset((formState) => ({
                        ...formState,
                        //foreignKey: '',
                        //checkUpdate: '',
                        ...addTableValue,
                    }));
                    // }
                    setValue('checkValid_prime_date', false);
                } else {
                    dispatch(getTableColumnDetails([]));
                }
                // } else {
                //     let res = await dispatch(dataExchange_getColumnTables({ payload: payload_mCRM }));
                //     if (res?.status) {
                //         reset((formState) => ({ ...formState, table: value, foreignKey: '', checkUpdate: '' }));
                //         setValue('checkValid_prime_date', false);
                //     }
                // }
                // let res = await dispatch(crm_getColumnTables({ payload: payload_mCRM }));
            } else if (pathState?.data?.remoteDataSourceID === 40 || pathState?.data?.remoteDataSourceID === 155) {
                dispatchState({ type: 'UPDATE', field: 'showDropDownTableFlag', payload: true });
                let payload = pathState?.data?.remoteDataSourceID === 40 ? payload_versium : payload_Digipop;
                let res = await dispatch(getColumnTables_Versium({ payload: payload }));
                if (recencyValue?.length === 0) {
                    let res_recency = await dispatch(getRecency_Versium({ payload: payload_versiumRecency }));
                    let res_ColumnUpdate = await dispatch(
                        getUpdatedColumn_Versium({ payload: payload_versiumRecency }),
                    );
                    if (res_recency?.status) {
                        setRecencyValue(res_recency?.data);
                    }
                    if (res_ColumnUpdate?.status) {
                        setColumnUpdateValue(res_ColumnUpdate?.data);
                        // setColumnUpdateValue([
                        //     {
                        //         partnerDataAttributeID: 83,
                        //         uIPrintableName: 'Last Updated Date',
                        //         sOLRFieldName: 'v_lastupdateddate_dt',
                        //     },
                        // ]);
                    }
                }
                if (res?.status) {
                    reset((formState) => ({ ...formState, table: value, foreignKey: '', checkUpdate: '' }));
                    setValue('checkValid_prime_date', false);
                }
            } else if (name === 'table' && pathState.type != 'CRM') {
                if (!showDropDownTableFlag)
                    // dispatch(getColumnDetails({ payload }));
                    dispatchState({ type: 'UPDATE', field: 'showDropDownTableFlag', payload: true });
                let res = {};
                if (dataSourceId === 3 || dataSourceId === 52 || dataSourceId === 53) {
                    //res = await dispatch(getColumnTables({ payload: customPayload }));
                    res = await dispatch(dataExchange_getColumnTables({ payload: customPayload }));
                } else {
                    res = await dispatch(getColumnTables({ payload: payload_my_sql })); //1&2
                }
                if (res?.status) {
                    let check_primary_key = res?.data?.filter((e) => e.key_value === 'primary_key' && e);
                    let check_foreign_key = res?.data?.filter((e) => e.key_value === 'foreign_key' && e);
                    let get_dateTime = res?.data?.filter((e) => isValidDateTimeType(e.datatype) && e);
                    if ((!check_primary_key?.length || !get_dateTime?.length) && foreignKeyDisable) {
                        setPrimary_key_warningFlag(true);
                    } else if (!check_primary_key?.length || !get_dateTime?.length) {
                        setPrimary_key_warningFlag(true);
                    } else if (
                        !!check_primary_key?.length &&
                        !!get_dateTime?.length &&
                        !check_foreign_key?.length &&
                        attributes?.rightAttributes[0]?.table !== type &&
                        attributes?.rightAttributes?.length > 0
                    ) {
                        setPrimary_key_warningFlag(true);
                    } else {
                        reset((formState) => ({
                            ...formState,
                            table: value,
                            //foreignKey: '',
                            //checkUpdate: ''
                        }));
                        setValue('checkValid_prime_date', false);
                    }
                }
            }
            setErr(false);
            //setValue('isTouched', false);
        }
    };

    const handleWebinar = async (event) => {
        const selectedItem = event.value;
        const { name } = selectedItem;
        const Payload_Webinar_datas = {
            connectorId: pathState?.data.remoteDataSourceID,
            connectorName: pathState?.data.sourceName,
            remoteSettingId: pathState?.data.remoteSettingId,
            webinar: name,
        };
        let connectionResult = await dispatch(dataExchange_get_tables_from_DB({ payload: Payload_Webinar_datas }));
        // if(connectionResult.status){
        //     dispatch(getTableDropDown(connectionResult?.data.tables));
        // }
    };

    const handleWebex = async (event) => {
        const selectedItem = event.value;
        const { name } = selectedItem;
        const Payload_Webex_datas = {
            connectorId: pathState?.data.remoteDataSourceID,
            connectorName: pathState?.data.sourceName,
            remoteSettingId: pathState?.data.remoteSettingId,
            meeting: name,
        };
        let connectionResult = await dispatch(dataExchange_get_tables_from_DB({ payload: Payload_Webex_datas }));
    };

    const handleRefresh = (type) => {
        dispatchState({ type: 'RESET' });
        //  if (type === 'mysql') {
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
        }));
        dispatch(mySqlReset());
        setforeignKeyDisable(true);
        //   }
    };
    const handleRefreshConnectionType = (type) => {
        dispatchState({ type: 'RESET' });
        setConnectionTypeDisable(true);
        //  if (type === 'mysql') {
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
        }));
        dispatch(mySqlReset());
        //   }
    };

    useEffect(() => {
        return () => {
            handleRefresh();
            handleRefreshConnectionType();
        };
    }, []);

    const handleUpload = async () => {
        if (pathState?.data?.remoteDataSourceID === 40 && !pathState?.id) {
            const isSettingIdNA = true;
            const mysqlSnapshot = await handleVersiumBaseAudience(isSettingIdNA);
            if (mysqlSnapshot) {
                let res = await handleVersiumRedirect(isSettingIdNA, mysqlSnapshot, !pathState.id);
                if (!res) {
                    return;
                }
            }
        }
        if (getAttributes?.rightAttributes.filter((attr) => attr.table === table.type)?.length === 0) {
            dispatchState({ type: 'UPDATE', field: 'showAttributeError', payload: true });
            return;
        } else {
            let brandName = getBrandName(departmentId)?.toLowerCase() || '';
            // let getRightVal = { ...attributes }.rightAttributes?.map((e) => e.name && e.name?.toLowerCase());
            if (
                pathState.type.toLowerCase() === 'crm' ||
                pathState?.data?.remoteDataSourceID === 40 ||
                pathState?.data?.remoteDataSourceID === 155 ||
                pathState?.data?.remoteDataSourceID === 5 ||
                pathState?.data?.remoteDataSourceID === 28 ||
                pathState?.data?.remoteDataSourceID === 45 ||
                pathState?.data?.remoteDataSourceID === 22 ||
                pathState?.data?.remoteDataSourceID === 50 ||
                pathState?.data?.remoteDataSourceID === 51 ||
                pathState?.data?.remoteDataSourceID === 48 ||
                pathState?.data?.remoteDataSourceID === 41 ||
                pathState?.data?.remoteDataSourceID === 49 ||
                pathState?.data?.remoteDataSourceID === 54 ||
                pathState?.data?.remoteDataSourceID === 23 ||
                pathState?.data?.remoteDataSourceID === 29 ||
                pathState?.data?.remoteDataSourceID === 55 ||
                pathState?.data?.remoteDataSourceID === 156 ||
                pathState?.data?.remoteDataSourceID === 21 ||
                pathState?.data?.remoteDataSourceID === 47 ||
                pathState?.data?.remoteDataSourceID === 46 ||
                pathState?.data?.remoteDataSourceID === 43 ||
                pathState?.data?.remoteDataSourceID === 160 ||
                pathState?.data?.remoteDataSourceID === 158 ||
                pathState?.data?.remoteDataSourceID === 106 ||
                pathState?.data?.remoteDataSourceID === 159 ||
                pathState?.data?.remoteDataSourceID === 166 ||
                pathState?.data?.remoteDataSourceID === 39 ||
                pathState?.data?.remoteDataSourceID === 168
            ) {
                const tmpAttrs = { ...attributes };
                tmpAttrs.rightAttributes = tmpAttrs.rightAttributes.filter((attr) => attr.table === table.type);
                const data = {
                    attributes: tmpAttrs,
                };
                dispatch(mySqlUpdate({ [table.type]: { ...data, id: table.id } }));
                //TODO {Vennila}: Brand id check for CRM need to validate
                if (true) {
                    dispatchState({ type: 'HANDLE_CONFIRM_POPUP' });
                } else {
                    if (
                        pathState?.data?.remoteDataSourceID === 45 ||
                        pathState?.data?.remoteDataSourceID === 28 ||
                        pathState?.data?.remoteDataSourceID === 40 ||
                        pathState?.data?.remoteDataSourceID === 155 ||
                        pathState?.data?.remoteDataSourceID === 5 ||
                        pathState?.data?.remoteDataSourceID === 22 ||
                        pathState?.data?.remoteDataSourceID === 50 ||
                        pathState?.data?.remoteDataSourceID === 51 ||
                        pathState?.data?.remoteDataSourceID === 48 ||
                        pathState?.data?.remoteDataSourceID === 41 ||
                        pathState?.data?.remoteDataSourceID === 49 ||
                        pathState?.data?.remoteDataSourceID === 54 ||
                        pathState?.data?.remoteDataSourceID === 23 ||
                        pathState?.data?.remoteDataSourceID === 29 ||
                        pathState?.data?.remoteDataSourceID === 55 ||
                        pathState?.data?.remoteDataSourceID === 156 ||
                        pathState?.data?.remoteDataSourceID === 21 ||
                        pathState?.data?.remoteDataSourceID === 47 ||
                        pathState?.data?.remoteDataSourceID === 46 ||
                        pathState?.data?.remoteDataSourceID === 43 ||
                        pathState?.data?.remoteDataSourceID === 160 ||
                        pathState?.data?.remoteDataSourceID === 158 ||
                        pathState?.data?.remoteDataSourceID === 106 ||
                        pathState?.data?.remoteDataSourceID === 159 ||
                        pathState?.data?.remoteDataSourceID === 166 ||
                        pathState?.data?.remoteDataSourceID === 39
                    ) {
                        dispatchState({ type: 'HANDLE_CONFIRM_POPUP' });
                    } else {
                        setBrandExist_flag(true);
                    }
                }
                //  dispatchState({ type: 'HANDLE_CONFIRM_POPUP' });
                //TODO {Vennila}: Brand id check for CRM need to validate
            } else {
                if (checkTableAttributes()) {
                    if (true) {
                        dispatchState({ type: 'HANDLE_CONFIRM_POPUP' });
                    } else {
                        setBrandExist_flag(true);
                    }
                }
            }
        }
    };

    // console.log(attributes);

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
        dispatch(mySqlUpdate({ [table.type]: tablePayload }));
        const nextMySql = { ...mySql, [table.type]: tablePayload };
        if (!isSettingIdNA) {
            setVersiumModal(true);
        }
        return nextMySql;
    };
    const handleVersiumRedirect = async (isSettingIdNA = false, mysqlForPayload = null, isDirectUpload = true, isFilterRedirect = false) => {
        let payload = {};
        const mysqlState = mysqlForPayload ?? mySql;
        setVersiumModal(false);
        payload = finalPayload_Versium(mysqlState, getValues, pathState);
        payload = {
            ...payload,
            departmentId,
            clientId,
            userId,
            remotesettingID: pathState?.id?.remoteSettingId !== undefined ? pathState?.id?.remoteSettingId : 0,
        };

        let res = await dispatch(saveBaseCount_Versium({ payload: payload }));
        if (res?.status) {
            // if(isSettingIdNA){
            //     const state = {
            //         id: res?.data,
            //     };
            // await updateQueryParams(state)
            // return true
            // }
            if (isDirectUpload && !isFilterRedirect) {
                let makeRuleFilterJSON = createFilterRuleJson(tableDropDown);
                const attribute = tableDropDown.filterAttributes[0];
                const ruleJSONPayload = {
                    finalAudienceCount:
                        `${tableDropDown.filterCount}||` +
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
                console.log(ruleJSONPayload, 'ruleJSONPayload');
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
                const state = {
                    from: pathState,
                    // from: Object.assign(pathState, res?.data),
                    data: res?.data,
                    tableDropDown,
                    ruleJSON:
                        Object.keys(versiumData)?.length > 0
                            ? versiumData?.partnerremotesetting[0]?.filterRuleJson
                            : {},
                    ruleJSONCount:
                        Object.keys(versiumData)?.length > 0
                            ? versiumData?.partnerremotesetting[0]?.filterFrontEndBind
                            : '',
                    redirect: window.location.search,
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
        const isCustomTableConfig = checkCustomTableColumnConfig(pathState?.data?.remoteDataSourceID);
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
    // useEffect(() => {
    //     return () => {
    //         dispatch(updateCycleFrequency([]));
    //     };
    // }, []);
    return (
        <Container className="px0">
            <form className="card-header center" onSubmit={handleSubmit(handleUpload)}>
                <div className="box-design my21">
                    {/* {pathState.type === 'google bigquery' && (
                        <>
                            <Row className="d-flex justify-content-center">
                                <Col sm={2}>
                                    <label>Project name</label>
                                    <RSKendoDropDown
                                        control={control}
                                        name="projectName"
                                        data={projectList}
                                        defaultValue={projectList[0]}
                                        textField="type"
                                        dataItemKey="typeId"
                                        handleChange={handleProjectDropdown}
                                    />
                                </Col>
                                <Col sm={2}>
                                    <label>Data sets</label>

                                    <RSKendoDropDown
                                        control={control}
                                        name="dataSets"
                                        data={dataSetList}
                                        defaultValue={dataSetList[0]}
                                        textField="type"
                                        dataItemKey="typeId"
                                        handleChange={handleBqTable}
                                    />
                                </Col>
                            </Row>
                            {showBQTable && (
                                <Row className="d-flex justify-content-center">
                                    <Col sm={2}>
                                        <label>Table list</label>

                                        <RSKendoDropDown
                                            control={control}
                                            name="tableLists"
                                            data={bqColumnList}
                                            defaultValue={bqColumnList[0]}
                                            textField="type"
                                            dataItemKey="typeId"
                                            handleChange={handleBQTableCoulmn}
                                        />
                                    </Col>
                                    <Col sm={2}>
                                        <label>Primary key</label>
                                    </Col>
                                    <Col sm={2}>
                                        <RSKendoDropDown
                                            name="primaryKey"
                                            control={control}
                                            //   disabled
                                            data={primaryDropDown}
                                            textField="type"
                                            dataItemKey="typeId"
                                        />
                                    </Col>
                                    <Col sm={2}>
                                        <label>Foreign key</label>
                                    </Col>
                                    <Col sm={2}>
                                        <RSKendoDropDown
                                            name="foreignKey"
                                            control={control}
                                            required
                                            disabled
                                            data={TABLE_DETAILS}
                                            textField="type"
                                            dataItemKey="typeId"
                                        />
                                    </Col>
                                    <Col>
                                        <i
                                            className={refresh_large}
                                            onClick={handleRefresh}
                                            id="rs_data_refresh"
                                        ></i>
                                    </Col>
                                </Row>
                            )}
                        </>
                    )} */}
                    {(pathState.data?.connectionType || pathState.data?.connectionType === 1) && (
                        <Row className="d-flex justify-content-center">
                            <Col sm={2}>
                                <label>{CONNECTIONTYPE}</label>
                            </Col>
                            <Col sm={2}>
                                <RSKendoDropDown
                                    control={control}
                                    name="connection"
                                    data={connectionTypeData}
                                    defaultValue={CONNECTION_TYPE[0]}
                                    textField="type"
                                    dataItemKey="typeId"
                                    disabled={connectionTypeDisable}
                                    // handleChange={handleTableConnection}
                                />
                            </Col>
                            <Col
                                sm={1}
                                className={`d-flex align-items-center ${connectionTypeDisable ? '' : 'click-off'}`}
                            >
                                <RSTooltip position="top" text="Reset" className="lh0">
                                    <i
                                        id="rs_data_refresh"
                                        className={`${restart_medium} icon-md color-primary-blue`}
                                        onClick={() => handleRefreshConnectionType(pathState.type.toLowerCase())}
                                    ></i>
                                </RSTooltip>
                            </Col>
                        </Row>
                    )}
                    {!pathState?.data?.connectionType || pathState.data?.connectionType === 0 ? (
                        <div className="form-group pt21">
                            <Row>
                                {pathState?.data?.remoteDataSourceID === 158 && (
                                    <Col sm={2}>
                                        <>
                                            <RSKendoDropDown
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

                                {pathState?.data?.remoteDataSourceID === 106 && (
                                    <Col sm={2}>
                                        <>
                                            <RSKendoDropDown
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

                                <Col
                                    sm={
                                        pathState?.data?.remoteDataSourceID === 40 ||
                                        pathState?.data?.remoteDataSourceID === 155
                                            ? { span: 4 }
                                            : { span: 3 }
                                    }
                                    className={`${
                                        pathState?.data?.remoteDataSourceID === 40 ||
                                        pathState?.data?.remoteDataSourceID === 155
                                            ? ''
                                            : ''
                                    }`}
                                >
                                    {/* <label className='w-auto'>
                                    {pathState?.data?.remoteDataSourceID === 40 ? 'Attribute category' : 'Table'}
                                </label> */}
                                    <div className="CARET w-100" id="rs_TableAttributes_APIName">
                                        <RSKendoDropDown
                                            control={control}
                                            name="table"
                                            data={updateTabledd}
                                            required
                                            // defaultValue={tabledd[0]}
                                            label={
                                                pathState?.data?.remoteDataSourceID === 40 ||
                                                pathState?.data?.remoteDataSourceID === 155
                                                    ? 'Attribute category'
                                                    : 'Table'
                                            }
                                            handleChange={handleTable}
                                            popupSettings={{
                                                popupClass: `addImportAudienceDropdownListContainer`,
                                            }}
                                            {...dataKeyPropsInTable}
                                        />
                                    </div>
                                </Col>
                                {pathState?.data?.remoteDataSourceID !== 40 &&
                                    pathState?.data?.remoteDataSourceID !== 155 && (
                                        <>
                                            <Col sm={3} className={`position-relative`}>
                                                {/* <label className='w-auto'>Primary key</label> */}

                                                <RSKendoDropDown
                                                    name="primaryKey"
                                                    control={control}
                                                    disabled={primaryKeyDisable}
                                                    data={
                                                        pathState?.data?.remoteDataSourceID === 45 ||
                                                        pathState?.data?.remoteDataSourceID === 5 ||
                                                        pathState?.data?.remoteDataSourceID === 22 ||
                                                        pathState?.data?.remoteDataSourceID === 28 ||
                                                        pathState?.data?.remoteDataSourceID === 50 ||
                                                        pathState?.data?.remoteDataSourceID === 51 ||
                                                        pathState?.data?.remoteDataSourceID === 48 ||
                                                        pathState?.data?.remoteDataSourceID === 41 ||
                                                        pathState?.data?.remoteDataSourceID === 49 ||
                                                        pathState?.data?.remoteDataSourceID === 54 ||
                                                        pathState?.data?.remoteDataSourceID === 23 ||
                                                        pathState?.data?.remoteDataSourceID === 29 ||
                                                        pathState?.data?.remoteDataSourceID === 55 ||
                                                        pathState?.data?.remoteDataSourceID === 156 ||
                                                        pathState?.data?.remoteDataSourceID === 21 ||
                                                        pathState?.data?.remoteDataSourceID === 47 ||
                                                        pathState?.data?.remoteDataSourceID === 46 ||
                                                        pathState?.data?.remoteDataSourceID === 43 ||
                                                        pathState?.data?.remoteDataSourceID === 160 ||
                                                        pathState?.data?.remoteDataSourceID === 158 ||
                                                        pathState?.data?.remoteDataSourceID === 106 ||
                                                        pathState?.data?.remoteDataSourceID === 159 ||
                                                        pathState?.data?.remoteDataSourceID === 166 ||
                                                        pathState?.data?.remoteDataSourceID === 39 ||
                                                        pathState?.data?.remoteDataSourceID === 168
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
                                                        dispatchState({
                                                            type: 'UPDATE',
                                                            field: 'firstCheck',
                                                            payload: false,
                                                        });
                                                        setValue('isTouched', true);
                                                    }}
                                                />
                                                {Object.keys(mySql)?.[0] && (
                                                    <span className="click-off position-absolute">
                                                        Table:{' '}
                                                        {Object.keys(mySql)?.[0]?.length > 15 ? (
                                                            <RSTooltip>
                                                                {truncateTitle(Object.keys(mySql)?.[0], 15)}
                                                            </RSTooltip>
                                                        ) : (
                                                            Object.keys(mySql)?.[0]
                                                        )}
                                                    </span>
                                                )}
                                                <div className="lh0 position-absolute right15">
                                                    <RSPPophover
                                                        position="top"
                                                        text={PRIMARY_KEY_HELP_TEXT}
                                                    >
                                                        <i
                                                            className={`${circle_question_mark_mini} icon-xs color-primary-blue position-relative top5`}
                                                            id="circle_question_mark"
                                                        ></i>
                                                    </RSPPophover>
                                                </div>
                                            </Col>
                                            {!foreignKeyDisable && (
                                                <Col
                                                    sm={3}
                                                    className={`${
                                                        foreignKeyDisable ? 'click-off' : ''
                                                    } position-relative`}
                                                >
                                                    {/* <label className='w-auto'>Foreign key</label> */}

                                                    <RSKendoDropDown
                                                        name="foreignKey"
                                                        control={control}
                                                        disabled={foreignKeyDisable}
                                                        data={
                                                            tableColumns?.length > 0 &&
                                                            (pathState?.data?.remoteDataSourceID === 45 ||
                                                                pathState?.data?.remoteDataSourceID === 5 ||
                                                                pathState?.data?.remoteDataSourceID === 22 ||
                                                                pathState?.data?.remoteDataSourceID === 28 ||
                                                                pathState?.data?.remoteDataSourceID === 50 ||
                                                                pathState?.data?.remoteDataSourceID === 51 ||
                                                                pathState?.data?.remoteDataSourceID === 48 ||
                                                                pathState?.data?.remoteDataSourceID === 41 ||
                                                                pathState?.data?.remoteDataSourceID === 49 ||
                                                                pathState?.data?.remoteDataSourceID === 54 ||
                                                                pathState?.data?.remoteDataSourceID === 23 ||
                                                                pathState?.data?.remoteDataSourceID === 29 ||
                                                                pathState?.data?.remoteDataSourceID === 55 ||
                                                                pathState?.data?.remoteDataSourceID === 156 ||
                                                                pathState?.data?.remoteDataSourceID === 21 ||
                                                                pathState?.data?.remoteDataSourceID === 47 ||
                                                                pathState?.data?.remoteDataSourceID === 46 ||
                                                                pathState?.data?.remoteDataSourceID === 43 ||
                                                                pathState?.data?.remoteDataSourceID === 160 ||
                                                                pathState?.data?.remoteDataSourceID === 158 ||
                                                                pathState?.data?.remoteDataSourceID === 106 ||
                                                                pathState?.data?.remoteDataSourceID === 159 ||
                                                                pathState?.data?.remoteDataSourceID === 166 ||
                                                                pathState?.data?.remoteDataSourceID === 39 ||
                                                                pathState?.data?.remoteDataSourceID === 168)
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
                                                            dispatchState({
                                                                type: 'UPDATE',
                                                                field: 'firstCheck',
                                                                payload: false,
                                                            });
                                                            setValue('isTouched', true);
                                                        }}
                                                    />

                                                    <div className="lh0 position-absolute right15">
                                                        <RSPPophover
                                                            position="top"
                                                            text={FOREIGN_KEY_HELP_TEXT}
                                                        >
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
                                <Col className={`text-right`}>
                                    <RSTooltip
                                        position="top"
                                        text="Reset"
                                        className={`lh0  d-inline-block text-right position-relative top6`}
                                    >
                                        <i
                                            id="rs_data_refresh"
                                            className={`${restart_medium} icon-md color-primary-blue ${
                                                !tableValue && 'click-off'
                                            }`}
                                            onClick={() => setIsReset(true)}
                                        ></i>
                                    </RSTooltip>
                                </Col>
                            </Row>
                        </div>
                    ) : (
                        (pathState.data?.connectionType || pathState.data?.connectionType === 1) &&
                        connection?.typeId === 1 && (
                            <Row>
                                <Col
                                    sm={
                                        pathState?.data?.remoteDataSourceID === 40 ||
                                        pathState?.data?.remoteDataSourceID === 155
                                            ? { span: 4, offset: 3 }
                                            : { span: 3 }
                                    }
                                    className={` ${
                                        pathState?.data?.remoteDataSourceID === 40 ||
                                        pathState?.data?.remoteDataSourceID === 155
                                            ? ''
                                            : ''
                                    }`}
                                >
                                    <div className="d-flex align-items-center">
                                        <label>
                                            {pathState?.data?.remoteDataSourceID === 40 ||
                                            pathState?.data?.remoteDataSourceID === 155
                                                ? 'API Name'
                                                : 'Table'}
                                        </label>
                                        <div id="rs_TableAttributes_APIName">
                                            <RSKendoDropDown
                                                placeholder={'Select'}
                                                control={control}
                                                name="table"
                                                data={tabledd}
                                                required
                                                defaultValue={tabledd[0]}
                                                textField="type"
                                                dataItemKey="typeId"
                                                handleChange={handleTable}
                                            />
                                        </div>
                                    </div>
                                </Col>
                                {pathState?.data?.remoteDataSourceID !== 40 &&
                                    pathState?.data?.remoteDataSourceID !== 155 && (
                                        <>
                                            <Col
                                                sm={foreignKeyDisable ? 8 : 4}
                                                className={`${
                                                    primaryKeyDisable ? 'click-off' : ''
                                                } d-flex align-items-center`}
                                            >
                                                <label>Primary key</label>
                                                <div className="width50p">
                                                    <RSKendoDropDown
                                                        name="primaryKey"
                                                        control={control}
                                                        disabled={primaryKeyDisable}
                                                        data={
                                                            pathState?.data?.remoteDataSourceID === 45 ||
                                                            pathState?.data?.remoteDataSourceID === 5 ||
                                                            pathState?.data?.remoteDataSourceID === 22 ||
                                                            pathState?.data?.remoteDataSourceID === 28
                                                                ? primaryDropDown
                                                                : primaryDropDown.filter((e) => e.primeKey && e)
                                                        }
                                                        textField="type"
                                                        dataItemKey="typeId"
                                                        required={!mySqlLength}
                                                        rules={{
                                                            required: SELECT_PRIMARY_KEY,
                                                        }}
                                                        //label={'Select primary key'}
                                                        handleChange={() => {
                                                            dispatchState({
                                                                type: 'UPDATE',
                                                                field: 'firstCheck',
                                                                payload: false,
                                                            });
                                                            setValue('isTouched', true);
                                                        }}
                                                    />
                                                    {Object.keys(mySql)?.[0] && (
                                                        <span className="click-off">
                                                            Table: {Object.keys(mySql)?.[0]}
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="ml10 lh0">
                                                    <RSPPophover
                                                        position="top"
                                                        text={PRIMARY_KEY_HELP_TEXT}
                                                    >
                                                        <i
                                                            className={`${circle_question_mark_medium} icon-md color-primary-blue`}
                                                            id="circle_question_mark"
                                                        ></i>
                                                    </RSPPophover>
                                                </div>
                                            </Col>
                                            {!foreignKeyDisable && (
                                                <Col
                                                    sm={4}
                                                    className={`${
                                                        foreignKeyDisable ? 'click-off' : ''
                                                    } d-flex align-items-center`}
                                                >
                                                    <label className={`mr30`}>Foreign key</label>
                                                    <div className="width50p">
                                                        <RSKendoDropDown
                                                            name="foreignKey"
                                                            control={control}
                                                            disabled={foreignKeyDisable}
                                                            data={
                                                                tableColumns?.length > 0 &&
                                                                (pathState?.data?.remoteDataSourceID === 45 ||
                                                                    pathState?.data?.remoteDataSourceID === 5 ||
                                                                    pathState?.data?.remoteDataSourceID === 22 ||
                                                                    pathState?.data?.remoteDataSourceID === 28)
                                                                    ? primaryDropDown
                                                                    : primaryDropDown.filter((e) => e.foreignKey && e)
                                                            }
                                                            // data={primaryDropDown.filter((e) => e.primeKey && e)}
                                                            textField="type"
                                                            dataItemKey="typeId"
                                                            required={mySqlLength > 0}
                                                            rules={{
                                                                required: SELECT_FOREIGN_KEY,
                                                            }}
                                                            //label={'Select foreign key'}
                                                            handleChange={() => {
                                                                dispatchState({
                                                                    type: 'UPDATE',
                                                                    field: 'firstCheck',
                                                                    payload: false,
                                                                });
                                                                setValue('isTouched', true);
                                                            }}
                                                        />
                                                    </div>
                                                    <div className="ml10 lh0">
                                                        <RSPPophover
                                                            position="top"
                                                            text={FOREIGN_KEY_HELP_TEXT}
                                                        >
                                                            <i
                                                                className={`${circle_question_mark_medium} icon-md color-primary-blue`}
                                                                id="circle_question_mark"
                                                            ></i>
                                                        </RSPPophover>
                                                    </div>
                                                </Col>
                                            )}
                                        </>
                                    )}
                                <Col sm={1} className="d-flex align-items-center ">
                                    <RSTooltip position="top" text="Reset" className="lh0">
                                        <i
                                            id="rs_data_refresh"
                                            className={`${restart_medium} icon-md color-primary-blue`}
                                            onClick={() => handleRefresh(pathState.type.toLowerCase())}
                                        ></i>
                                    </RSTooltip>
                                </Col>
                            </Row>
                        )
                    )}
                    {(connection?.typeId === 2 || showDropDownTableFlag) && (
                        <>
                            <Row className="form-group mb0">
                                <Col>
                                    {showAttributeError && (
                                        <p style={{ color: 'red' }}>{ENTER_SELECTED_COL_ATT}</p>
                                    )}
                                    {err && <p style={{ color: 'red' }}>{'Table mismatch'}</p>}
                                    <AttributeListBox
                                        attributes={attributes}
                                        setAttributes={setAttributes}
                                        mySql={mySql}
                                        dispatchState={dispatchState}
                                        setValue={setValue}
                                        tableValue={tableValue}
                                        setErr={setErr}
                                        isEdit={isEdit}
                                    />
                                </Col>
                            </Row>{' '}
                        </>
                    )}
                </div>
                {(showDropDownTableFlag || connection?.typeId === 2) && (
                    <>
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
                        {pathState?.data?.remoteDataSourceID === 40 || pathState?.data?.remoteDataSourceID === 155 ? (
                            <>
                                <div className="form-group">
                                    <Row>
                                        {pathState?.data?.remoteDataSourceID !== 155 && (
                                            <Col sm={2}>
                                                <h4 className="d-flex align-items-center mb10">
                                                    {POTENTIAL_AUDIENCE}
                                                </h4>
                                            </Col>
                                        )}
                                        <Col sm={6}>
                                            <Row className="flex-column">
                                                {pathState?.data?.remoteDataSourceID !== 155 && (
                                                    <Col className="d-flex mb15">
                                                        <p className="font-bold font-md pr5 mt-9">
                                                            {numberWithCommas(
                                                                Object.keys(versiumData)?.length > 0
                                                                    ? hasFilterBindSegments(
                                                                          versiumData?.partnerremotesetting?.[0]
                                                                              ?.filterFrontEndBind,
                                                                      )
                                                                        ? getFilterBindCount(
                                                                              versiumData?.partnerremotesetting?.[0]
                                                                                  ?.filterFrontEndBind,
                                                                              tableDropDown?.filterCount ?? 0,
                                                                          )
                                                                        : tableDropDown?.filterCount
                                                                    : tableDropDown?.filterCount,
                                                            )}
                                                        </p>
                                                        <i
                                                            onClick={() => {
                                                                handleVersiumBaseAudience();
                                                            }}
                                                            className={`${pencil_edit_medium} icon-md color-primary-blue mt-5`}
                                                            id="rs_TableAttributes_penciledit"
                                                        ></i>
                                                    </Col>
                                                )}
                                                <Col sm={6}>
                                                    {/* <p className="font-xsm">
                                                    Base audience: {numberWithCommas(tableDropDown?.baseCount)}
                                                </p> */}
                                                    <h4 className="mb0 d-flex align-items-center">
                                                        Base audience:{' '}
                                                        <span className="font-bold font-md ml5">
                                                            {numberWithCommas(tableDropDown?.baseCount)}
                                                        </span>
                                                    </h4>
                                                    {pathState?.data?.remoteDataSourceID !== 155 && (
                                                        <ul className="target-audience-list mt15">
                                                            {Object.keys(versiumData)?.length > 0 ? (
                                                                hasFilterBindSegments(
                                                                    versiumData.partnerremotesetting?.[0]
                                                                        ?.filterFrontEndBind,
                                                                ) ? (
                                                                    <>
                                                                        <>
                                                                            {parseFilterBindSegment(
                                                                                versiumData.partnerremotesetting?.[0]
                                                                                    ?.filterFrontEndBind,
                                                                                1,
                                                                            )?.map((e, ind) => {
                                                                                return (
                                                                                    <li
                                                                                        key={`versium-filter-1-${ind}-${
                                                                                            e?.name ?? ''
                                                                                        }`}
                                                                                    >
                                                                                        <span>{e?.name}</span>
                                                                                        <span className="label-value">
                                                                                            {e?.value}
                                                                                        </span>
                                                                                    </li>
                                                                                );
                                                                            })}
                                                                        </>{' '}
                                                                        <>
                                                                            {parseFilterBindSegment(
                                                                                versiumData.partnerremotesetting?.[0]
                                                                                    ?.filterFrontEndBind,
                                                                                2,
                                                                            )?.map((e, ind) => {
                                                                                return (
                                                                                    <li
                                                                                        key={`versium-filter-2-${ind}-${
                                                                                            e?.name ?? ''
                                                                                        }`}
                                                                                        className="inclusionColor"
                                                                                    >
                                                                                        <span>{e?.name}</span>
                                                                                        <span className="label-value">
                                                                                            {e?.value}
                                                                                        </span>
                                                                                    </li>
                                                                                );
                                                                            })}
                                                                        </>{' '}
                                                                        <>
                                                                            {parseFilterBindSegment(
                                                                                versiumData.partnerremotesetting?.[0]
                                                                                    ?.filterFrontEndBind,
                                                                                3,
                                                                            )?.map((e, ind) => {
                                                                                return (
                                                                                    <li
                                                                                        key={`versium-filter-3-${ind}-${
                                                                                            e?.name ?? ''
                                                                                        }`}
                                                                                        className="exclusionColor"
                                                                                    >
                                                                                        <span>{e?.name}</span>
                                                                                        <span className="label-value">
                                                                                            {e?.value}
                                                                                        </span>
                                                                                    </li>
                                                                                );
                                                                            })}
                                                                        </>
                                                                    </>
                                                                ) : (
                                                                    <li>
                                                                        <span>
                                                                            {
                                                                                tableDropDown?.filterAttributes?.[0]
                                                                                    ?.pVUIPrintableName
                                                                            }
                                                                        </span>
                                                                        <span className="label-value">
                                                                            {
                                                                                tableDropDown?.filterAttributes?.[0]
                                                                                    ?.pVAttributeValue
                                                                            }
                                                                        </span>
                                                                    </li>
                                                                )
                                                            ) : (
                                                                <li>
                                                                    <span>
                                                                        {
                                                                            tableDropDown?.filterAttributes?.[0]
                                                                                ?.pVUIPrintableName
                                                                        }
                                                                    </span>
                                                                    <span className="label-value">
                                                                        {
                                                                            tableDropDown?.filterAttributes?.[0]
                                                                                ?.pVAttributeValue
                                                                        }
                                                                    </span>
                                                                </li>
                                                            )}
                                                        </ul>
                                                    )}
                                                </Col>
                                            </Row>
                                        </Col>
                                    </Row>
                                </div>
                                <div className="form-group">
                                    <Row className="align-items-baseline">
                                        <Col sm={2}>
                                            <h4>{'Required volume'}</h4>
                                        </Col>
                                        <Col sm={3} className="d-flex">
                                            <RSInput
                                                name={'versium_volume'}
                                                placeholder={'Volume'}
                                                onKeyDown={onlyNumbers}
                                                id="rs_TableAttributes_versiumvolume"
                                                required
                                                rules={{
                                                    required: ENTER_VOLUME,
                                                    validate: (data) => (data !== 0 ? true : false),
                                                }}
                                                handleOnBlur={(e) => {
                                                    if (
                                                        Object.keys(versiumData)?.length > 0 &&
                                                        parseInt(e.target.value, 10) >
                                                            getFilterBindCount(
                                                                versiumData?.partnerremotesetting?.[0]
                                                                    ?.filterFrontEndBind,
                                                                0,
                                                            )
                                                    ) {
                                                        setTimeout(() => {
                                                            setError('versium_volume', {
                                                                type: 'custom',
                                                                message: `Enter min. volume of  ${numberWithCommas(
                                                                    getFilterBindCount(
                                                                        versiumData?.partnerremotesetting?.[0]
                                                                            ?.filterFrontEndBind,
                                                                        0,
                                                                    ),
                                                                )} `,
                                                            });
                                                        }, 100);
                                                        return;
                                                    } else if (
                                                        parseInt(e.target.value, 10) > tableDropDown?.filterCount
                                                    ) {
                                                        setTimeout(() => {
                                                            setError('versium_volume', {
                                                                type: 'custom',
                                                                message: `Enter min. volume of  ${numberWithCommas(
                                                                    tableDropDown?.filterCount,
                                                                )} `,
                                                            });
                                                        }, 100);
                                                        return;
                                                    } else {
                                                        clearErrors('versium_volume');
                                                    }
                                                }}
                                            />
                                            <RSPPophover
                                                position={'top'}
                                                pophover={
                                                    'The entered audience count will be extracted from the potential audience.'
                                                }
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
                                                    <h4 className="text-center">{'Recency'}</h4>
                                                </Col>
                                                <Col
                                                    sm={3}
                                                    id="rs_TableAttributes_updatedcycle"
                                                    className="updated_tablecycle"
                                                >
                                                    <RSKendoDropDown
                                                        control={control}
                                                        name="updatedCycle"
                                                        data={recencyValue}
                                                        textField="recency"
                                                        label="Select the days"
                                                        required
                                                        dataItemKey="id"
                                                        rules={{
                                                            required: UPDATE_RECENCY,
                                                            validate: (data) => (data.id !== 0 ? true : false),
                                                        }}
                                                        handleChange={() => {
                                                            setrecencyModal(true);
                                                        }}
                                                    />
                                                </Col>
                                            </>
                                        )}
                                    </Row>
                                </div>
                                {pathState?.data?.remoteDataSourceID !== 155 && (
                                    <div className="form-group">
                                        <Row>
                                            <Col sm={2}>
                                                <h4>{CHECK_FOR_UPDATES}</h4>
                                            </Col>
                                            <Col sm={3} id="rs_TableAttributes_checkUpdate">
                                                <RSKendoDropDown
                                                    control={control}
                                                    name="checkUpdate"
                                                    label="Select update column"
                                                    data={ColumnUpdateValue}
                                                    textField="uIPrintableName"
                                                    dataItemKey="partnerDataAttributeID"
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
                        ) : (
                            <div className="form-group">
                                <Row>
                                    <Col sm={2} className="w-auto">
                                        <label className="control-label-left">{UPDATE_CYCLE}</label>
                                    </Col>
                                    <Col sm={3}>
                                        <RSKendoDropDown
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
                                    {(pathState?.data?.remoteDataSourceID === 1 ||
                                        pathState?.data?.remoteDataSourceID === 2 ||
                                        pathState?.data?.remoteDataSourceID === 3 ||
                                        pathState?.data?.remoteDataSourceID === 52 ||
                                        pathState?.data?.remoteDataSourceID === 53 ||
                                        pathState?.data?.remoteDataSourceID === 28 ||
                                        pathState?.data?.remoteDataSourceID === 45 ||
                                        pathState?.data?.remoteDataSourceID === 5) &&
                                        primaryDropDown?.filter((el) => isValidDateTimeType(el['dataType']))?.length >
                                            0 && (
                                            <>
                                                <Col sm={3}>
                                                    <label>{CHECK_FOR_UPDATES}</label>
                                                </Col>
                                                <Col sm={4}>
                                                    <RSKendoDropDown
                                                        control={control}
                                                        name="checkUpdate"
                                                        data={primaryDropDown?.filter((el) =>
                                                            isValidDateTimeType(el['dataType']),
                                                        )}
                                                        textField="type"
                                                        dataItemKey="typeId"
                                                        //label={`Check for updates`}
                                                        required={
                                                            pathState?.data?.remoteDataSourceID === 45 ? false : true
                                                        }
                                                        rules={
                                                            pathState?.data?.remoteDataSourceID === 45
                                                                ? {
                                                                      required: CHECK_UPDATE,
                                                                      // validate: (data) => (data.typeId !== 0 ? true : false),
                                                                  }
                                                                : {}
                                                        }
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
                            </div>
                        )}

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
                                    className={
                                        Object.keys(errors)?.length > 0 || (isEdit && !pathState?.isBack)
                                            ? // ||
                                              // (pathState?.data?.remoteDataSourceID === 40 && !pathState?.id)
                                              'click-off'
                                            : ''
                                    }
                                >
                                    {UPLOAD}
                                </RSPrimaryButton>
                            </div>
                        </div>
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
                    setValue('checkValid_prime_date', true);
                    ('');
                    dispatchState({ type: 'UPDATE', field: 'firstCheck', payload: true });
                    setAttributes({
                        leftAttributes: [],
                        rightAttributes: generateRightAttributes(mySql),
                    });
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
            {/* <RSConfirmationModal
                show={brandExist_flag}
                text={BARND_NAME_DOESNT_EXISTS}
                primaryButtonText={OK}
                secondaryButton={false}
                handleClose={() => {
                    setBrandExist_flag(false);
                }}
                handleConfirm={() => {
                    setBrandExist_flag(false);
                }}
            /> */}
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
                        // handleTable(event);
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
                    htmlContent={
                        <>
                            <div className="d-flex flex-column align-items-center">
                                <i className={`${alert_medium}  color-primary-red fs75 cursor-normal`} />
                                <div className="mt10">{apiErrorPopup?.message || EXCEPTION_OCCURRED}</div>
                            </div>
                        </>
                    }
                    secondaryButton={false}
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
                    handleRefresh(pathState.type.toLowerCase());
                    setIsReset(false);
                }}
                handleClose={() => setIsReset(false)}
            />
        </Container>
    );
};

export default TableAttributes;
