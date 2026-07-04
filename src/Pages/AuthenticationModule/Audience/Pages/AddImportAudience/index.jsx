
import { getBrandNameUIPrintable } from 'Utils/modules/brandStorage';
import { BRAND_ID_CHECK } from 'Utils/modules/communicationChannels';
import { getCsvListType } from 'Utils/modules/browserUtils';
import { encodeUrl, encryptWithAES, getUserDetails } from 'Utils/modules/crypto';
import { numberWithCommas } from 'Utils/modules/formatters';
import { getWarningPopupMessage } from 'Utils/modules/warningPopup';
import { csvPayload, customTableCell, deleteHeaderColumn, getAttribute, getCRMAttributes, getEnableStatus, getUnmappedFirstColumnOrder, headerMapping, INITIAL_STATE, mySqlPayload, ResulToCRMPayload, setAttrError, stateReducer } from './constant';
import { iconMapping } from './Components/CustomHeaderColumn/constant';
import { BRAND_ATTRIBUTE_NOT_SELECTED, CONFIRM_OPT_IN } from 'Constants/GlobalConstant/ValidationMessage';
import { ARE_YOU_SURE_DELETE, BRAND_ID_NOT_EXISTS, CANCEL, CONFIRM, DELETE_USER_ROLE, DOUBLE_OPT_IN, LIST_ANALYSIS, MAP_DATA_ATTRIBUTES, NEW_AUDIENCE_LIST, OK, POTENTIAL_AUDIENCE, RESTART, REVIEW_COLUMN_MAPPING_BEFORE_CONFIRM, SAVE, TO_MAP_THE_DATA, WARNING } from 'Constants/GlobalConstant/Placeholders';
import { alert_medium, alert_xlarge } from 'Constants/GlobalConstant/Glyphicons';
import { useEffect, useMemo, useReducer, useRef, useState } from 'react';
import { get as _get,last as _last,find as _find,first as _first,cloneDeep as _cloneDeep,unionBy as _uniqBy } from 'Utils/modules/lodashReplacements';
import { Row, Col, Container } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

import KendoGrid from 'Components/RSKendoGrid';
import RSPageHeader from 'Components/RSPageHeader';
import RSConfirmationModal from 'Components/ConfirmationModal';
import CustomHeaderColumn from './Components/CustomHeaderColumn/CustomHeaderColumn';
import NewAttributeModal from 'Pages/AuthenticationModule/Components/NewAttributeModal';
import AudienceImportModal from './Components/AudienceImportModal/AudienceImportModal';
import AddImportAudienceSkeleton from './Components/AddImportAudienceSkeleton';

import { RSCheckbox } from 'Components/RSInput';
import { RSPrimaryButton, RSSecondaryButton } from 'Components/Buttons';
import {
    attributeMapping,
    attributeMappingSFTP,
    saveAudiencecolumnMapping,
    save_Connectors_ColumnMapping,
    saveSFTPColumnMapping,
    get_CRM_Table_Columns,
    SyncCRM_ExistingColumns,
} from 'Reducers/audience/addAudience/request';
import { get_ConnectorDetails } from 'Reducers/preferences/DataExchange/request';
import {
    getDataAttributes,
    getSeedDataAttributes,
    saveDataAttribute,
} from 'Reducers/preferences/datacatalogue/request';
import { getSessionId } from 'Reducers/globalState/selector';

import CacheManager from 'Utils/cacheManager';
import useQueryParams from 'Hooks/useQueryParams';
import RSModal from 'Components/RSModal';
import { updateImportAudience } from 'Reducers/audience/addAudience/reducer';
import useApiLoader from 'Hooks/useApiLoader';

import { FIELD_LOADER_CONFIG } from 'Hooks/loaderTypes';

const AddImportAudience = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const audienceSaveAPI = useApiLoader({ autoFetch: false });
    // const { state } = useLocation();
    const state = useQueryParams('/audience/add-import-audience');
    const fromTLSLML = state?.fromPage === 'targetList' && (state?.type === 'suppression-list' || state?.type === 'match-list')
    const isRender = useRef();
    const pageFrom = _get(state, 'from', '');
    let fromCSV = false; //pageFrom === 'csv';
    if (pageFrom === 'csv' || 'sftpTL') {
        fromCSV = true;
    } else {
        fromCSV = false;
    }

    let audienceData = _get(state, 'data.audienceData.data', {});
    if (pageFrom === 'csv' || pageFrom === 'sftpTL') {
        audienceData = _get(state, 'data.audienceData', {});
    } else {
        audienceData = _get(state, 'data.audienceData.data', {});
    }

    // console.log('Check state :::::: ', state);
    const userDetails = getUserDetails();
    const [isBrandIDModal, setIsBrandIDModal] = useState(false);
    const [showSavePreviewModal,setShowSavePreviewModal] = useState(false)
    const fromMySql = pageFrom === 'manual entry';

    const remoteSettingId = audienceData?.remoteSettingId || audienceData?.remoteSettingID || 0;
    const importHistoryId = audienceData?.importHistoryId || audienceData?.importhistoryId || 0;
    const jobId = pageFrom === 'csv' ? _get(state, 'data.audienceData.jobId', 0) : Number(remoteSettingId) || 0;
    //jobId = fromCSV ? _get(state, 'data.audienceData.jobId', 0) : +_get(state, 'data.audienceData.data', 0);
    const listType = _get(state, 'data.listType', 'Target list');
    // console.log('listType: ', listType);

    const catType = _get(state, 'data.catType', '');
    const catTypeName = _get(state, 'data.catTypeName', '');
    // console.log('catTypeName: ', catTypeName);

    const { attributeMappingData, audienceCount, mappingDataLoading } = useSelector(
        ({ addAudienceReducer }) => addAudienceReducer,
    );
    const { dataCatalogueAttrs } = useSelector(({ dataCatalogueReducer }) => dataCatalogueReducer);
    const { failureApiErrors } = useSelector(({ globalstate }) => globalstate);
    // const { loading } = useSelector((state) => globalStateSelector(state));

    const { departmentId, clientId, userId } = useSelector((state) => getSessionId(state));

    const [audienceState, dispatchState] = useReducer(stateReducer, INITIAL_STATE);
    const {
        selectedAttribute,
        uniqueKeyIndex,
        primarykey,
        isUniqueAttrSelected,
        mySqlList,
        uniqueIdentifier,
        crmTableColumns,
        ResulToCRM,
    } = audienceState;
      const orderedColumnIndexes = useMemo(
        () => getUnmappedFirstColumnOrder(audienceState?.audienceColumn, selectedAttribute),
        [audienceState?.audienceColumn, selectedAttribute],
    );
    useEffect(() => {
        return () => {
            dispatch(updateImportAudience({ field: 'attributeMappingData', data: [] }));
        };
    }, []);
    useEffect(() => {
        const payload = {
            jobId: jobId,
            clientId,
            userId,
            departmentId,
        };
        if (listType === 'Seed list' && !!jobId) {
            dispatch(getSeedDataAttributes(payload, true, getCsvListType(listType)));
        } else if (state?.isBiDirectionEnabled && audienceData?.connectionMode?.typeId === 2) {
            let payloadsCustom = {...audienceData?.connectorPayload}

            dispatch(get_CRM_Table_Columns({ payloadsCustom, dispatchState }));
            dispatchState({
                type: 'UPDATE',
                payload: true,
                field: 'ResulToCRM',
            });
        } else if (!!jobId) {
            dispatch(getDataAttributes(payload, false, getCsvListType(listType)));
        }
        if (state && pageFrom === 'csv' && !!jobId) {
            dispatch(attributeMapping({ payload }));
        } else if (state && pageFrom === 'sftpTL' && !!jobId) {
            const payloadsCustom = {
                remotesettingId: jobId,
                clientId,
                userId,
                departmentId,
            };
            dispatch(attributeMappingSFTP({ payloadsCustom }));
        }
        const remotesettingIdData = remoteSettingId;
        if (fromMySql && remotesettingIdData) {
            const payloadsCustom = {
                remotesettingId: remotesettingIdData,
                clientId,
                userId,
                departmentId,
            };
            dispatch(attributeMappingSFTP({ payloadsCustom }));

            // const data = _get(state, 'data.audienceData.arr', '').split(','); //'adhoclist.EmailID, SOLRAttributeValues.DepartmentID'.split(',')
            // if (_compact(data)?.length) {
            //     dispatchState({
            //         type: 'UPDATE',
            //         payload: data,
            //         field: 'mySqlList',
            //     });
            // }
        }
    }, [departmentId, clientId, userId, state]);

    useEffect(() => {
        if (!!dataCatalogueAttrs?.length) handleDataAttribute('', dataCatalogueAttrs, '');
    }, [dataCatalogueAttrs]);
    useEffect(() => {
        if (!!crmTableColumns?.length) handlecrmTableAttribute(crmTableColumns);
    }, [crmTableColumns]);

    useEffect(() => {
        if (fromCSV) {
            const data = _cloneDeep(attributeMappingData);
            const headerRow = _first(data) || [];
            let selectedAttrs = [];
            let tempIconState = [];
            const { tempData, columnData } = headerMapping(headerRow);
            for (let i = 1; i < data?.length; i++) {
                const dataRow = data[i];
                const obj = {};
                for (let j = 0; j < headerRow?.length; j++) {
                    const header = headerRow[j];
                    const value = dataRow[j];
                    obj[header] = value;
                }
                tempData.push(obj);
            }
            if (dataCatalogueAttrs?.length && data?.length) {
                let tempCatAttrBrandId = dataCatalogueAttrs?.filter((e) => e.isBrandId === 1);
                if (!headerRow?.includes(tempCatAttrBrandId[0]?.attributeName) && pageFrom === 'sftpTL') {
                    setIsBrandIDModal(true);
                } else {
                    setIsBrandIDModal(false);
                    if (catTypeName !== '') {
                        let tempCatAttr = dataCatalogueAttrs?.filter((e) => e.cattype === catTypeName);
                        let tempState = [...tempCatAttrBrandId, ...tempCatAttr];
                        selectedAttrs = headerRow.map((column, index) => {
                            const tmpAttr = selectedAttribute[index]?.attributeName
                                ? selectedAttribute[index]
                                : getAttribute(_find(tempState, ['uIPrintableName', column]));
                            return {
                                ...tmpAttr,
                                index: index,
                            };
                        });
                    } else {
                        let tempParentAttr = dataCatalogueAttrs?.filter((e) => !e.cattype);
                        let tempState = [...tempCatAttrBrandId, ...tempParentAttr];
                        selectedAttrs = headerRow.map((column, index) => {
                            const tmpAttr = selectedAttribute[index]?.attributeName
                                ? selectedAttribute[index]
                                : getAttribute(_find(tempState, ['uIPrintableName', column]));
                            // : getAttribute(_find(dataCatalogueAttrs, ['uIPrintableName', column]));
                            return {
                                ...tmpAttr,
                                index: index,
                            };
                        });
                    }
                    tempIconState = headerRow.map((icon, index, row) => {
                        return iconMapping(selectedAttrs, icon, dispatchState, index, row, uniqueKeyIndex);
                    });
                    isRender.current = true;
                }
            }
            dispatchState({
                type: 'UPDATE_MYSQL',
                payload: {
                    audienceList: tempData,
                    audienceColumn: columnData,
                    primarykey: tempIconState,
                    selectedAttribute: selectedAttrs,
                },
            });
            let initialUniqueKeyIndex = null;
            if (tempIconState && tempIconState.length > 0) {
                const userIconIndex = tempIconState.findIndex((item) => item?.selectedIcon?.name === 'user');
                if (userIconIndex !== -1) {
                    initialUniqueKeyIndex = userIconIndex;
                }
            }
            dispatchState({
                type: 'PRIMARY_KEY',
                payload: {
                    primarykey: tempIconState,
                    uniqueKeyIndex: initialUniqueKeyIndex,
                },
            });
        }
    }, [attributeMappingData, dataCatalogueAttrs]);

    // useEffect(() => {
    //     if (fromMySql) {
    //         let selectedAttrs = [];
    //         let tempIconState = [];
    //         const { tempData, columnData } = headerMapping(mySqlList);
    //         if (dataCatalogueAttrs?.length) {
    //             selectedAttrs = mySqlList.map((column, index) => {
    //                 column = column.split('.')[1] || '';
    //                 const tmpAttr = selectedAttribute[index]?.attributeName
    //                     ? selectedAttribute[index]
    //                     : getAttribute(_find(dataCatalogueAttrs, ['attributeName', column]));
    //                 return {
    //                     ...tmpAttr,
    //                     index: index,
    //                 };
    //             });
    //             tempIconState = mySqlList.map((icon, index) => {
    //                 icon = icon.split('.')[1] || '';
    //                 return iconMapping(dataCatalogueAttrs, icon, dispatchState, index);
    //             });
    //         }
    //         dispatchState({
    //             type: 'UPDATE_MYSQL',
    //             payload: {
    //                 audienceList: tempData,
    //                 audienceColumn: columnData,
    //                 primarykey: tempIconState,
    //                 selectedAttribute: selectedAttrs,
    //             },
    //         });
    //     }
    // }, [mySqlList, dataCatalogueAttrs]);

    const handleSaveDataAttribute = async (data) => {
        let attr = await dispatch(saveDataAttribute(data, false));
        if (attr.status) {
            const payload = {
                departmentId,
                clientId,
                userId,
            };
            const newAttrs = await dispatch(getDataAttributes(payload, true));
            if (newAttrs?.status) {
                handleDataAttribute(data.name, newAttrs?.data, 'fromSaveAttr');
            }
            dispatchState({
                type: 'UPDATE',
                payload: false,
                field: 'isNewAttributeModal',
            });
        }
    };

    const handleDataAttribute = (name, newAttrs = [], from = '') => {
        const data = newAttrs;
        const lastData = _last(data);
        const lastAttr = _last(data)?.dataAttributeId;
        const newAttribute = {
            dataAttributeId: lastAttr + 2,
            attributeName: 'New attribute',
        };
        const ignoreAttribute = {
            dataAttributeId: lastAttr + 3,
            attributeName: '<< Ignore >>',
        };
        let tempState;
        let orderDataAttribute = data
            .map((attribute) => getAttribute(attribute))
            .sort((a, b) => (a.attributeName.toLowerCase() > b.attributeName.toLowerCase() ? 1 : -1));
        if (listType !== 'Seed list') {
            orderDataAttribute = orderDataAttribute?.filter((e) => parseInt(e.isImportAttributeMap, 10) === 1);
        }
        if (listType === 'Seed list') {
            tempState = [...orderDataAttribute];
        } else if (catTypeName !== '') {
            let tempCatAttr = orderDataAttribute?.filter((e) => e.cattypeName === catTypeName);
            let tempCatAttrBrandId = orderDataAttribute?.filter((e) => e.isBrandId === 1);
            tempState = [...tempCatAttrBrandId, ...tempCatAttr];
        } else {
            let tempParentAttr = orderDataAttribute?.filter((e) => !e.cattypeName);
            let tempCatAttrBrandId = orderDataAttribute?.filter((e) => e.isBrandId === 1);
            tempState =  _uniqBy( [...tempParentAttr, ...tempCatAttrBrandId], 'dataAttributeId');
        }
        dispatchState({
            type: 'UPDATE',
            payload: tempState,
            field: 'dataAttributes',
        });
        if (Object.keys(audienceState.selectedNewAttribute)?.length && from === 'fromSaveAttr' && !!name) {
            const temp = [...selectedAttribute];
            const tempData = [...tempState];
            let lastSavedAttr = {
                ..._find(tempData, (item) => item.attributeName?.toLowerCase() === name?.toLowerCase()),
                index: audienceState.selectedNewAttribute.index,
            };
            let tempAtts = tempData?.filter((item) => item.attributeName?.toLowerCase() !== name?.toLowerCase());
            let allData = lastSavedAttr ? [lastSavedAttr, ...tempAtts] : tempAtts;
            // _find(newAttrs, ['selectedIcon.name', 'user'])
            //tempData.unshift(lastSavedAttr);
            temp[audienceState.selectedNewAttribute.index] = lastSavedAttr
                ? lastSavedAttr
                : {
                      dataAttributeId: tempData?.length + 1,
                      attributeName: name,
                      fieldTypeId: lastData.fieldTypeId,
                      sOLRFieldName: lastData.sOLRFieldName,
                      isBrandId: lastData.isBrandId,
                      attrName: name,
                      filterGroupId: lastData.filterGroupId,
                      isImportAttributeMap: lastData.isImportAttributeMap,
                      index: audienceState.selectedNewAttribute.index,
                      cattypeName: lastData.cattype,
                  };
            dispatchState({
                type: 'UPDATE',
                payload: allData,
                field: 'dataAttributes',
            });
            dispatchState({
                type: 'UPDATE',
                payload: temp,
                field: 'selectedAttribute',
            });
            dispatchState({
                type: 'UPDATE',
                payload: {},
                field: 'selectedNewAttribute',
            });
        }
    };
    const handlecrmTableAttribute = (crmColumns = []) => {
        const data = [...crmColumns];
        const crmData = data
            .map((attribute, ind) => getCRMAttributes(attribute, ind))
            .sort((a, b) => (a.attributeName.toLowerCase() > b.attributeName.toLowerCase() ? 1 : -1));
        dispatchState({
            type: 'UPDATE',
            payload: crmData,
            field: 'dataAttributes',
        });
    };

    const runAudienceSave = (fetcher) =>
        audienceSaveAPI.refetch({
            fetcher,
            mode: 'create',
            loaderConfig: FIELD_LOADER_CONFIG,
        });

    const handleFormSubmit = async () => {
        // console.log('Data catalog attr :::::::::: ', dataCatalogueAttrs, attributeMappingData, audienceState);
        if (!audienceState.isDoubleOptIn && !fromTLSLML) {
            dispatchState({
                type: 'UPDATE',
                payload: CONFIRM_OPT_IN,
                field: 'errDoubleOptIn',
            });
            return;
        } else if (
            BRAND_ID_CHECK.includes(listType) &&
            !_find(primarykey, ['selectedIcon.name', 'user']) &&
            !ResulToCRM
        ) {
            setAttrError(audienceState, dispatchState, BRAND_ATTRIBUTE_NOT_SELECTED);
        } else {
            if (pageFrom === 'csv') {
                const payload = {
                    ...csvPayload(
                        attributeMappingData,
                        selectedAttribute,
                        uniqueKeyIndex,
                        dataCatalogueAttrs,
                        audienceState?.deletedColumn,
                    ),
                    deletedColumn: audienceState?.deletedColumn,
                    jobId,
                    catType,
                    catTypeName,
                    departmentId,
                    clientId,
                    userId,
                    connectorId: state?.data?.type?.data?.remoteDataSourceID || 0,
                    connectorName: state?.data?.type?.data?.sourceName || '',
                    importhistoryId: importHistoryId || 0,
                };
                const response = await runAudienceSave(() =>
                    dispatch(
                        saveAudiencecolumnMapping({ payload, dispatchState, navigate, loading: false }),
                    ),
                );
                if (response?.status) {
                    dispatchState({
                        type: 'UPDATE',
                        payload: true,
                        field: 'isAudienceImport',
                    });
                    if (!userDetails?.isCampaign) {
                        const userInfo = { ...userDetails, isCampaign: true, isAudience: 1 };
                        localStorage.setItem('userInfo', encryptWithAES(JSON.stringify(userInfo)));
                        CacheManager.set('userDetails', userInfo);
                    }
                }
            } else if (pageFrom === 'sftpTL') {
                const payload = {
                    ...csvPayload(attributeMappingData, selectedAttribute, uniqueKeyIndex, dataCatalogueAttrs),
                    remoteSettingId: jobId,
                    catType,
                    catTypeName,
                    departmentId,
                    clientId,
                    userId,
                    connectorId: 8 || 0,
                    importHistoryId: importHistoryId || 0,
                };

                const { status } = await runAudienceSave(() =>
                    dispatch(saveSFTPColumnMapping({ payload, dispatchState, navigate, loading: false })),
                );
                if (status) {
                    dispatchState({
                        type: 'UPDATE',
                        payload: true,
                        field: 'isAudienceImport',
                    });
                }
            } else if (fromMySql && !ResulToCRM) {
                const payload = {
                    remoteSettingId: state?.data?.audienceData?.data?.remoteSettingId || 0,
                    catType,
                    catTypeName,
                    ...csvPayload(attributeMappingData, selectedAttribute, uniqueKeyIndex, dataCatalogueAttrs),
                    // ...mySqlPayload(mySqlList, selectedAttribute, jobId),
                    departmentId,
                    clientId,
                    userId,
                    connectorId: state?.data?.type?.data?.remoteDataSourceID || 0,
                    connectorName: state?.data?.type?.data?.sourceName || '',
                    importHistoryId: importHistoryId || 0,
                };
                if (
                    state?.data?.type.data?.remoteDataSourceID === 1 ||
                    state?.data?.type.data?.remoteDataSourceID === 2
                ) {
                    const { status } = await runAudienceSave(() =>
                        dispatch(saveSFTPColumnMapping({ payload, dispatchState, navigate, loading: false })),
                    );
                    if (status) {
                        dispatchState({
                            type: 'UPDATE',
                            payload: true,
                            field: 'isAudienceImport',
                        });
                        if (!userDetails?.isCampaign) {
                            const userInfo = { ...userDetails, isCampaign: true, isAudience: 1 };
                            localStorage.setItem('userInfo', encryptWithAES(JSON.stringify(userInfo)));
                            CacheManager.set('userDetails', userInfo);
                        }
                    }
                } else {
                    const { status } = await runAudienceSave(() =>
                        dispatch(
                            save_Connectors_ColumnMapping({ payload, dispatchState, navigate, loading: false }),
                        ),
                    );
                    if (status) {
                        dispatchState({
                            type: 'UPDATE',
                            payload: true,
                            field: 'isAudienceImport',
                        });
                        if (!userDetails?.isCampaign) {
                            const userInfo = { ...userDetails, isCampaign: true, isAudience: 1 };
                            localStorage.setItem('userInfo', encryptWithAES(JSON.stringify(userInfo)));
                            CacheManager.set('userDetails', userInfo);
                        }
                    }
                }
                // dispatch(saveMySqlColumnMapping(payload, dispatchState, navigate));
            } else if (fromMySql && ResulToCRM) {

                const payload = {
                    ...audienceData?.connectorPayload,
                    filePath: audienceData?.filePath,

                    remoteSettingId: remoteSettingId || 0,

                    ...ResulToCRMPayload(
                        attributeMappingData,
                        selectedAttribute,
                    ),
                };
                const { status } = await runAudienceSave(() =>
                    dispatch(SyncCRM_ExistingColumns({ payload, dispatchState, navigate, loading: false })),
                );
                if (status) {
                    dispatchState({
                        type: 'UPDATE',
                        payload: true,
                        field: 'isAudienceImport',
                    });
                }
            }
        }
    };

    const isSaveLoading = audienceSaveAPI.isLoading;

    if (mappingDataLoading && !audienceState?.audienceList?.length) {
        return <AddImportAudienceSkeleton />;
    }

    const handleRemoteDataExchangeEditData = async (id) => {
        const payload = {
            departmentId,
            clientId,
            userId,
            remotesettingId: id,
        };
        const { data, status } = await dispatch(get_ConnectorDetails(payload));
        if (status && data) {
            return data || {};
        } else {
            return {};
        }
    };

    const handleBackClick = async () => {   
        if (state?.data?.type?.from === 'data_exchange') {
            const editData = await handleRemoteDataExchangeEditData(jobId);
            const pqeryState = encodeUrl({
                from: 'data_exchange',
                type: state?.data?.type?.type,
                data: {
                    ...editData,
                    sourceGroupName: state?.data?.type?.data?.sourceGroupName,
                    sourceName: state?.data?.type?.data?.sourceName,
                    webinar: state?.data?.type?.data?.schemaName,
                    ...state?.data?.type?.data,
                    selectedConnection: editData?.connectionType || ''
                },
                isAudience: false,
                mode: 'edit',
                isBack: true,
                fromBack: 'ColumnMapping',
            });
            navigate(`/audience/add-audience?q=${pqeryState}`, { replace: true });
        } 
    };

    const getBackPath = () => {
        if (state?.data?.type?.from === 'data_exchange') {
            return `/audience/add-audience`;
        } else if (state?.from === 'sftpTL') {
            const restState = { ...(state || {}) };
            delete restState.savedData;
            return `/audience/add-audience?q=${encodeUrl({
                ...restState,
                from: 'column-mapping',
                mode: 'back',
                jobId,
                isSFTP: true,
            })}`;
        } else if (state?.fromPage === 'targetList' && state?.mode === 'inputList') {
            return `/audience/add-audience?q=${encodeUrl({
                ...state,
                from: 'targetList',
                mode: 'inputList',
                jobId,
            })}`;
        } else {
            return `/audience/add-audience?q=${encodeUrl({
                ...state,
                from: 'column-mapping',
                mode: 'back',
                jobId,
            })}`;
        }
    };

    return (
        <div className="page-content-holder">
            {/* Main page heading block starts */}
            <RSPageHeader
                title={MAP_DATA_ATTRIBUTES}
                isTabber
                isBuDisabled
                showAgency={false}
                rightCommonMenus
                isBack
                backPath={getBackPath()}
                backAction={
                    state?.data?.type?.from === 'data_exchange'
                        ? handleBackClick
                        : undefined
                }
            />
            {/* Main page heading block ends */}
            <Container fluid>
                <div className="page-content">
                    <Container className="px0">
                        {/* Main page content block starts */}
                        <div className="d-flex justify-content-between mt21">
                            <h4 className="mb0">{NEW_AUDIENCE_LIST}</h4>
                        </div>
                        <Row>
                            <Col className="d-flex justify-content-between">
                                <p>{TO_MAP_THE_DATA}</p>
                                <h4 className="mb10 d-flex align-items-center">
                                    {POTENTIAL_AUDIENCE}:{' '}
                                    <span className="font-bold font-md ml5">{numberWithCommas(audienceCount)}</span>
                                </h4>
                            </Col>
                        </Row>
                        <div className="addImportAudienceMapAttributes clearfix ">
                            <KendoGrid
                                // data={attributeMappingData}
                                data={audienceState?.audienceList}
                                className="mb21"
                                sortable={false}
                                column={orderedColumnIndexes
                                    ?.map((columnIndex) => {
                                        const column = audienceState?.audienceColumn?.[columnIndex];
                                        if (!column) return null;
                                        return {
                                            field: column.attributeName,
                                            title: column.attributeName,
                                            width: 240,
                                            headerCell: (props) =>
                                                CustomHeaderColumn(
                                                    props,
                                                    columnIndex,
                                                    audienceState,
                                                    dispatchState,
                                                    listType,
                                                ),
                                            cell: (props) =>
                                                customTableCell(props, columnIndex, audienceState),
                                        };
                                    })
                                    .filter(Boolean)}
                                pageable={false}
                                scrollable={'scrollable'}
                                isFailure={!audienceState?.audienceList?.length}
                            />
                            {!fromTLSLML && 
                                <div className="float-start">
                                    <RSCheckbox
                                        type="checkbox"
                                        labelName={DOUBLE_OPT_IN}
                                        name={DOUBLE_OPT_IN}
                                        checked={audienceState.isDoubleOptIn}
                                        onChange={(status) => {
                                            const errorMessage = !status ? CONFIRM_OPT_IN : null;
                                            dispatchState({
                                                type: 'UPDATE_DOUBLE_OPTIN',
                                                payload: {
                                                    isDoubleOptIn: status,
                                                    errDoubleOptIn: errorMessage,
                                                },
                                            });
                                        }}
                                        errorMessage={audienceState?.errDoubleOptIn || ''}
                                    />
                                </div>
                            }
                            {audienceState.errUniqueIdentifier && (
                                <div className="float-end color-primary-red">{audienceState.errUniqueIdentifier}</div>
                            )}

                            {audienceState?.attributesError &&
                                audienceState?.attributesError?.some(
                                    (error) => error === 'Brand attribute does not selected',
                                ) && (
                                    <div className="float-end d-flex">
                                        <i className={`${alert_medium} icon-md color-primary-orange mr5`}></i>

                                        <div className="mb5 color-primary-red">
                                            {`Brand ID [${getBrandNameUIPrintable(departmentId)}] does not selected`}
                                        </div>
                                    </div>
                                )}

                            {isUniqueAttrSelected && (
                                <div className="float-end color-primary-green">
                                    {uniqueIdentifier} has been selected as an unique identifier
                                </div>
                            )}
                        </div>
                        <Row>
                            <div className="d-flex justify-content-end mt21">
                                <RSSecondaryButton
                                    className={'mr15'}
                                    blockInteraction={isSaveLoading}
                                    onClick={() =>
                                        // navigate('/audience/add-audience', {
                                        //     state: { from: 'master-data' },
                                        // })
                                        {
                                            if (state?.isAudience) {
                                                const stateRedirect = { from: 'master-data' };
                                                const stateredirectEncode = encodeUrl(stateRedirect);
                                                navigate(`/audience/add-audience?q=${stateredirectEncode}`, {
                                                    state: stateRedirect,
                                                });
                                            } else {
                                                navigate('/preferences/data-exchange');
                                            }
                                        }
                                    }
                                >
                                    {RESTART}
                                </RSSecondaryButton>
                                {/* <RSPrimaryButton
                            onClick={() => dispatchState({ type: 'UPDATE', field: 'listAnalysis', payload: true })}
                        >
                            {LIST_ANALYSIS}
                        </RSPrimaryButton> */}
                                <RSPrimaryButton
                                    className={getEnableStatus(audienceState, ResulToCRM) ? '' : 'click-off'}
                                    onClick={handleFormSubmit}
                                    isLoading={isSaveLoading}
                                    blockBodyPointerEvents={isSaveLoading}
                                >
                                    {SAVE}
                                </RSPrimaryButton>
                            </div>
                        </Row>
                        {/* Main page content block ends */}
                    </Container>
                </div>
            </Container>
            {/* Modals */}
            {/* <SaveModal saveModal={saveModal} dispatchState={dispatchState} /> */}
            {/* <ListAnalysis listAnalysis={listAnalysis} dispatchState={dispatchState} /> */}
            <RSConfirmationModal
                show={audienceState.isDeleteColumn}
                text={ARE_YOU_SURE_DELETE}
                primaryButtonText={OK}
                isBorder
                header={DELETE_USER_ROLE}
                handleClose={() => {
                    dispatchState({
                        type: 'UPDATE',
                        payload: false,
                        field: 'isDeleteColumn',
                    });
                }}
                handleConfirm={(status) => {
                    if (status) {
                        deleteHeaderColumn(audienceState, dispatchState, navigate);
                    }
                }}
            />
            {audienceState.isNewAttributeModal && (
                <NewAttributeModal
                    show={audienceState.isNewAttributeModal}
                    handleClose={() => {
                        dispatchState({
                            type: 'UPDATE',
                            payload: false,
                            field: 'isNewAttributeModal',
                        });
                    }}
                    handleSaveAttribute={(data) => handleSaveDataAttribute(data)}
                    addAudience={true}
                    catType={catTypeName}
                />
            )}
            <AudienceImportModal
                show={audienceState.isAudienceImport}
                handleClose={() => {
                    dispatchState({
                        type: 'UPDATE',
                        payload: false,
                        field: 'isAudienceImport',
                    });
                }}
                audienceMode={state?.from}
            />
            <RSModal
                show={showSavePreviewModal}
                size={'lg'}
                header={'Confirm attribute mapping'}
                handleClose={() => {
                    if (isSaveLoading) return;
                    setShowSavePreviewModal(false);
                }}
                isCloseDisabled={isSaveLoading}
                lockBackground={isSaveLoading}
                body={
                    <div className="p10">
                        <p className="mb10">{REVIEW_COLUMN_MAPPING_BEFORE_CONFIRM}</p>
                        {showSavePreviewModal && <MappingPreviewGrid data={savePreviewRows} />}
                    </div>
                }
                footer={
                    <>
                        <RSSecondaryButton
                            blockInteraction={isSaveLoading}
                            onClick={() => setShowSavePreviewModal(false)}
                        >
                            {CANCEL}
                        </RSSecondaryButton>
                        <RSPrimaryButton
                            onClick={handleFormSubmit}
                            isLoading={isSaveLoading}
                            blockBodyPointerEvents={isSaveLoading}
                        >
                            {CONFIRM}
                        </RSPrimaryButton>
                    </>
                }
            />
            <RSModal
                show={isBrandIDModal}
                size={'md'}
                noBottomBorder
                className="border-0"
                header={WARNING}
                handleClose={() => {
                    setIsBrandIDModal(false);
                    const stateRedirect = { from: 'master-data' };
                    const stateredirectEncode = encodeUrl(stateRedirect);

                    navigate(`/audience/add-audience?q=${stateredirectEncode}`, {
                        state: stateRedirect,
                    });
                    // navigate('/audience/add-audience');
                }}
                body={
                    <div className="d-flex flex-column align-items-center">
                        <i className={`${alert_xlarge}  color-primary-yellow fs75 cursor-normal`} />
                        <div className="mt10">{BRAND_ID_NOT_EXISTS} </div>
                    </div>
                }
            />
            {getWarningPopupMessage(failureApiErrors, dispatch)}
        </div>
    );
    // Content holder ends
};

export default AddImportAudience;
