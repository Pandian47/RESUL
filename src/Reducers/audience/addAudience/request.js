import { AUDIENCE_ATTRIBUTES_MAPPING, AUDIENCE_FILENAME_EXISTS, AUDIENCE_IMPORT_SOURCE, AUDIENCE_LIST_INSIGHT, AUDIENCE_SAVE_COLUMN_MAPPING, AUDIENCE_SAVE_MYSQL_COLUMN_MAPPING, AUDIENCE_UPLOAD_FILES, AUDIENCE_UPLOAD_VALIDATION, CONNECT_FTP, CONNECT_TL_FTP, CUSTOM_TABLE_EXISTS, DATAEXCHANGE_ATTRIBUTES_SAVE, FRIENDLYNAME_CHECK, GET_AUDIENCE_LIST_COUNT, GET_CRM_TABLE_COLUMNS, GET_DEDUPE_SETTING_BY_ID, GET_DEDUP_ATTRIBUTE, IMPORT_DESCRIPTION_EXISTS, RETURN_TO_ADD_AUDIENCE, SAVE_DEDUP_ATTRIBUTE_SETTING, SYNC_CRM_EXISTING, TL_FTP_ATTRIBUTES_MAPPING, TL_FTP_ATTRIBUTES_SAVE } from 'Constants/EndPoints';
import request from 'Utils/Http';

import {
    resetCsvFiles,
    updateCsvFiles,
    updateCSVFile,
    updateImportAudience,
    checkFTPConnection,
    resetAll,
    updateResponseHeader,
    updateListAnalysisData,
} from './reducer';
import { encodeUrl } from 'Utils/modules/crypto';

export const checkImportDescriptionExists =
    ({ payload }) =>
    async (dispatch) =>
        dispatch(
            request.post({
                url: IMPORT_DESCRIPTION_EXISTS,
                isReturn: true,
                payload,
                isToast: false,
                ok: () => {},
                fail: (err) => {},
            }),
        );

export const validateCsvFile = (fileData, clearErrors, responseHeaders, csvLength, loading = false) => async (dispatch) => {
    const isExcel = fileData.isExcel || false;
    let payload = {
        listType: fileData.type,
        clientId: fileData.clientId,
        userId: fileData.userId,
        departmentId: fileData.departmentId,
        columnHeader: responseHeaders || '', //? JSON.stringify(responseHeaders) : '',
        firstRowHeader: true,
        fileName: fileData?.name?.split('.csv')?.[0],
        encodedData: fileData.encodedData,
        sourceType: isExcel ? 169 : 7,
        IsListAnalysis: true,
        isExcel: isExcel,
    };
    return dispatch(
        request.post({
            url: AUDIENCE_UPLOAD_VALIDATION,
            loading,
            isReturn: true,
            payload,
            ok: ({
                data: {
                    status,
                    data: { path = '', columnHeader = '', listAnalysis = null } = {},
                    message,
                } = {},
            }) => {
                if (isExcel && !status) {
                    return {
                        status: false,
                        errorMsg: message,
                        message: message,
                    };
                }
                const file = {
                    fileName: fileData.name,
                    fileSize: fileData.size,
                    isValid: status,
                    encodedData: fileData.encodedData,
                    errorMsg: message,
                    excelFileName: fileData?.excelFileName || '',
                    excelSheetName: fileData?.excelSheetName || '',
                };
                const paths = path;
                if (!isExcel || status) {
                    dispatch(updateCsvFiles({ file, paths, status }));
                    if (!csvLength) dispatch(updateResponseHeader({ columnHeader }));
                    if (listAnalysis) {
                        dispatch(
                            updateListAnalysisData({
                                fileName: fileData.name,
                                data: listAnalysis,
                            }),
                        );
                    }
                }
                clearErrors('csvFiles');
                return {
                    status: status,
                    errorMsg: message,
                    message: message,
                };
            },
            fail: (err) => {
                if (isExcel) {
                    return {
                        status: false,
                        errorMsg: err?.message || 'Validation failed',
                        message: err?.message || 'Validation failed',
                    };
                }

                const file = {
                    fileName: fileData.name,
                    fileSize: fileData.size,
                    isValid: false,
                    encodedData: fileData.encodedData,
                    errorMsg: err?.message,
                };
                // setError('csvFiles', { type: 'custom', message: 'Error occured in uploaded file' });
                dispatch(updateCSVFile({ file }));
                return {
                    status: false,
                    errorMsg: err?.message,
                    message: err?.message,
                };
            },
        }),
    );
};

export const audienceUploadForFiles =
    ({
        payload,
        navigate,
        isAdHocList,
        listType,
        setError,
        name,
        from = 'master-data',
        mode = 'add',
        segmentationListID = '',
        targetListName = '',
        type = '',
        loading = true,
    }) =>
    async (dispatch) =>
        dispatch(
            request.post({
                url: AUDIENCE_UPLOAD_FILES,
                payload,
                loading,
                ok: ({ data: { status, data } }) => {
                    if (status) {
                        dispatch(resetCsvFiles());
                        if (payload?.sourceType !== 181) {
                            dispatch(resetAll());
                        }
                        if (isAdHocList) {
                            const encryptState = encodeUrl({ index: 0 });
                            navigate(`/audience?q=${encryptState}`, {
                                state: { index: 0 },
                            });
                        } else {
                            let url = '/audience/add-import-audience';
                            const state = {
                                from: 'csv',
                                fromPage: from,
                                type: type,
                                mode: mode,
                                segmentationListID: segmentationListID,
                                targetListName: targetListName,
                                data: {
                                    audienceData: data,
                                    listType,
                                    catType: payload?.catType,
                                    catTypeName: payload?.catTypeName,
                                },
                                isAudience: true,
                            };
                            const encryptState = encodeUrl(state);
                            navigate(`${url}?q=${encryptState}`, {
                                state,
                            });
                            // navigate(`/audience/add-import-audience`, {
                            //     state: {
                            //         from: 'csv',
                            //         data: {
                            //             audienceData: data,
                            //             listType,
                            //             catType: payload?.catType,
                            //             catTypeName: payload?.catTypeName,
                            //         },
                            //     },
                            // });
                        }
                    } else {
                        setError(name, {
                            type: 'custom',
                            message: 'Invalid headers',
                        });
                    }
                },
                isFailureCheck: true,
                fail: (err) => {},
            }),
        );

export const attributeMapping = ({ payload }) => {
    return async (dispatch) => {
        dispatch(updateImportAudience({ field: 'mappingDataLoading', data: true }));

        dispatch(
            request.post({
                url: AUDIENCE_ATTRIBUTES_MAPPING,
                payload,
                // loading: true,
                ok: ({ data: { data, status, totalcount } }) => {
                    if (status) {
                        dispatch(updateImportAudience({ field: 'attributeMappingData', data: data }));
                        dispatch(updateImportAudience({ field: 'audienceCount', data: totalcount }));
                    } else {
                        dispatch(updateImportAudience({ field: 'attributeMappingData', data: [] }));
                        dispatch(updateImportAudience({ field: 'audienceCount', data: 0 }));
                    }
                },
                err: (err) => {},
                final: () => {
                    dispatch(updateImportAudience({ field: 'mappingDataLoading', data: false }));
                },
            }),
        );
    };
};

export const saveAudiencecolumnMapping =
    ({ payload, dispatchState, navigate, loading = true }) =>
    async (dispatch) =>
        dispatch(
            request.post({
                url: AUDIENCE_SAVE_COLUMN_MAPPING,
                payload,
                loading,
                ok: ({ data }) => {
                    const { status } = data;
                    if (status) {
                        dispatchState({ type: 'RESET_AUDIENCE_IMPORT' });
                        dispatch(resetAll());
                        //navigate('/audience');
                    }
                },
                fail: (err) => {},
                isFailureCheck: true,
            }),
        );

export const saveMySqlColumnMapping = (payload, dispatchState, navigate) => async (dispatch) =>
    dispatch(
        request.post({
            url: AUDIENCE_SAVE_MYSQL_COLUMN_MAPPING,
            loading: true,
            payload,
            ok: ({ data: response }) => {
                const { status } = response;
                if (status) {
                    dispatch(resetAll());
                    dispatchState({ type: 'RESET_AUDIENCE_IMPORT' });
                    const encryptState = encodeUrl({ index: 0 });
                    navigate(`/audience?q=${encryptState}`, {
                        state: { index: 0 },
                    });
                }
            },
            err: (err) => {},
        }),
    );

export const checkFriendlyNameExists =
    ({ payload, setError }) =>
    async (dispatch) =>
        dispatch(
            request.post({
                url: FRIENDLYNAME_CHECK,
                payload,
                //loading: true,
                isToast: false,
                ok: ({ data }) => {
                    const { status, message } = data;
                    // if (status) {
                    //     setError('friendlyName', {
                    //         type: 'server',
                    //         message,
                    //     });
                    // }
                },
                fail: (err) => {},
            }),
        );

export const connectFTP =
    ({ payload, loading = true }) =>
    async (dispatch) =>
        dispatch(
            request.post({
                url: CONNECT_FTP,
                payload,
                loading,
                ok: ({ data }) => {
                    checkFTPConnection(data);
                },
                fail: (err) => {},
                isFailureCheck: true,
            }),
        );
export const connectTLFTP =
    ({ payload, loading = true }) =>
    async (dispatch) =>
        dispatch(
            request.post({
                url: CONNECT_TL_FTP,
                payload,
                loading,
                ok: ({ data }) => {
                    checkFTPConnection(data);
                },
                fail: (err) => {},
                isFailureCheck: true,
            }),
        );

export const attributeMappingSFTP = ({ payloadsCustom }) => {
    return async (dispatch) => {
        dispatch(updateImportAudience({ field: 'mappingDataLoading', data: true }));

        dispatch(
            request.post({
                url: TL_FTP_ATTRIBUTES_MAPPING,
                payload: payloadsCustom,
                loading: false,
        ok: ({ data: { data, status, totalcount } }) => {
                    if (status) {
                        dispatch(updateImportAudience({ field: 'attributeMappingData', data: data }));
                        dispatch(updateImportAudience({ field: 'audienceCount', data: totalcount }));
                    } else {
                        dispatch(updateImportAudience({ field: 'attributeMappingData', data: [] }));
                        dispatch(updateImportAudience({ field: 'audienceCount', data: 0 }));
                    }
                },
                err: (err) => {},
                final: () => {
                    dispatch(updateImportAudience({ field: 'mappingDataLoading', data: false }));
                },
            }),
        );
    };
};



export const get_CRM_Table_Columns = ({ payloadsCustom, dispatchState }) => {
    return async (dispatch) => {
        dispatch(
            request.post({
                url: GET_CRM_TABLE_COLUMNS,
                payload: payloadsCustom,
                loading: true,
                ok: ({ data }) => {
                    const { data: res, status } = data;
                    const arr = status && Array.isArray(res) ? res : [];
                    dispatchState({
                        type: 'UPDATE',
                        payload: arr,
                        field: 'crmTableColumns',
                    });
                },
                fail: (err) => {
                     dispatchState({
                        type: 'UPDATE',
                        payload: [],
                        field: 'crmTableColumns',
                    });
                },
                final: () => {},
            }),
        );
    };
};

export const customTableNameExists =
    ({ payload }) =>
    async (dispatch) =>
        dispatch(
            request.post({
                url: CUSTOM_TABLE_EXISTS,
                payload,
                //loading: true,
                isToast: false,
                ok: ({ data }) => {
                    const { status, message } = data;
                    // if (status) {
                    //     setError('friendlyName', {
                    //         type: 'server',
                    //         message,
                    //     });
                    // }
                },
                fail: (err) => {},
            }),
        );

export const SyncCRM_ExistingColumns =
    ({ payload, dispatchState, navigate, loading = true }) =>
    async (dispatch) =>
        dispatch(
            request.post({
                url: SYNC_CRM_EXISTING,
                payload,
                loading,
                ok: ({ data: response }) => {
                    const { status } = response;
                    if (status) {
                        dispatch(resetAll());
                        dispatchState({ type: 'RESET_AUDIENCE_IMPORT' });
                    }
                },
                fail: (err) => {},
                isFailureCheck: true,
            }),
        );
export const saveSFTPColumnMapping =
    ({ payload, dispatchState, navigate, loading = true }) =>
    async (dispatch) =>
        dispatch(
            request.post({
                url: TL_FTP_ATTRIBUTES_SAVE,
                payload,
                loading,
                ok: ({ data: response }) => {
                    const { status } = response;
                    if (status) {
                        dispatch(resetAll());
                        dispatchState({ type: 'RESET_AUDIENCE_IMPORT' });
                    }
                },
                fail: (err) => {},
                isFailureCheck: true,
            }),
        );
export const save_Connectors_ColumnMapping =
    ({ payload, dispatchState, navigate, loading = true }) =>
    async (dispatch) =>
        dispatch(
            request.post({
                url: DATAEXCHANGE_ATTRIBUTES_SAVE,
                payload,
                loading,
                ok: ({ data: response }) => {
                    const { status } = response;
                    if (status) {
                        dispatch(resetAll());
                        dispatchState({ type: 'RESET_AUDIENCE_IMPORT' });
                    }
                },
                fail: (err) => {},
                isFailureCheck: true,
            }),
        );

export const getAudienceImportSource =
    ({ payload, loading = false }) =>
    async (dispatch) => {
        return dispatch(
            request.post({
                url: AUDIENCE_IMPORT_SOURCE,
                payload,
                loading,
                ok: ({ data }) => {
                    // checkFTPConnection(data);
                },
                fail: (err) => {},
            }),
        );
    };

export const checkFileNameExists =
    ({ payload, loading = true }) =>
    async (dispatch) => {
        return dispatch(
            request.post({
                url: AUDIENCE_FILENAME_EXISTS,
                payload,
                loading,
                ok: ({ data }) => {},
                fail: (err) => {},
            }),
        );
    };
export const getDedupAttributes =
    ({ payload }) =>
    async (dispatch) => {
        return dispatch(
            request.post({
                url: GET_DEDUP_ATTRIBUTE,
                payload,
                loading: false,
                ok: ({ data }) => {},
                fail: (err) => {},
            }),
        );
    };
export const saveDedupAttribute =
    ({ payload }) =>
    async (dispatch) => {
        return dispatch(
            request.post({
                url: SAVE_DEDUP_ATTRIBUTE_SETTING,
                payload,
                loading: false,
                ok: ({ data }) => {},
                isFailureCheck: true,
                fail: (err) => {},
            }),
        );
    };
export const getDedupeSettingById =
    ({ payload }) =>
    async (dispatch) => {
        return dispatch(
            request.post({
                url: GET_DEDUPE_SETTING_BY_ID,
                payload,
                loading: false,
                ok: ({ data }) => {},
                fail: (err) => {},
            }),
        );
    };

export const getAudienceBUWiseListCount =
    ({ payload, loading = true }) =>
    async (dispatch) => {
        return dispatch(
            request.post({
                url: GET_AUDIENCE_LIST_COUNT,
                payload,
                loading,
                ok: ({ data }) => {},
                fail: (err) => {},
            }),
        );
    };

export const returnToAddAudience =
    ({ payload , loading = false}) =>
    async (dispatch) => {
        return dispatch(
            request.post({
                url: RETURN_TO_ADD_AUDIENCE,
                payload,
                loading: loading,
                isReturn: true,
                ok: ({ data }) => {},
                fail: (err) => {
                    return { status: false, error: err };
                },
            }),
        );
    };
const normalizeInsightPaths = (paths) => {
    const pathList = Array.isArray(paths)
        ? paths
        : String(paths ?? '')
              .split(',')
              .map((path) => path.trim());
    return pathList.filter(Boolean).join(',');
};

export const getAudienceInsightList =
    ({ payload, loading = true }) =>
    async (dispatch, getState) => {
        const requestedPaths = normalizeInsightPaths(payload?.encodedData ?? '');

        return dispatch(
            request.post({
                url: AUDIENCE_LIST_INSIGHT,
                payload,
                loading,
                ok: ({ data }) => {
                    const { path = [], csvFiles = [] } = getState()?.addAudienceReducer ?? {};
                    const currentPaths = normalizeInsightPaths(path);

                    if (!csvFiles?.length || currentPaths !== requestedPaths) {
                        return;
                    }

                    if (data?.status) {
                        dispatch(
                            updateImportAudience({
                                field: 'insightData',
                                data: typeof data?.data === 'object' ? data?.data || {} : {},
                            }),
                        );
                    } else {
                        dispatch(updateImportAudience({ field: 'insightData', data: {} }));
                    }
                },
                fail: (err) => {
                    return { status: false, error: err };
                },
            }),
        );
    };
