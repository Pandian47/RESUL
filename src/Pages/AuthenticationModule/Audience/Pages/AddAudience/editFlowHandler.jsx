import { decryptWithAES } from 'Utils/modules/crypto';
import { formatName } from 'Utils/modules/formatters';
import _get from 'lodash/get';
import { setEditFlowData } from 'Reducers/audience/addAudience/reducer';
import { returnToAddAudience } from 'Reducers/audience/addAudience/request';
import { getChildListings } from 'Reducers/preferences/datacatalogue/request';

import { IMPORT_PRESERVE_PREFERENCE_LABEL, IMPORT_PREFERENCE_LABEL } from 'Constants/GlobalConstant/Placeholders';
import { getUpdateCycleFrequency } from 'Reducers/remoteDataSource/request';
import { get_ConnectorDetails } from 'Reducers/preferences/DataExchange/request';
import { parseAudienceJsonArray } from 'Pages/AuthenticationModule/Audience/audienceDefaults';
// Flow types constants
export const FLOW_TYPES = {
    MASTER_DATA: 'master-data',
    TARGET_LIST: 'targetList',
    CSV: 'csv',
    SFTP: 'sftp',
    COLUMN_MAPPING: 'column-mapping',
    MANUAL_ENTRY: 'manual-entry',
    REMOTE_DATA_SOURCE: 'remote-data-source',
};

// Convert listType number to string (reverse of getCsvListType)
export const getListTypeString = (listTypeNumber) => {
    switch (listTypeNumber) {
        case 1:
            return 'Ad-hoc list';
        case 2:
            return 'Match input list';
        case 3:
            return 'Seed list';
        case 4:
            return 'Suppression input list';
        case 5:
            return 'Target list';
        default:
            return 'Target list'; // Default to Target list
    }
};

// Handle different edit flows based on flow type
const handleFlowByType = async (flowType, responseData, methods, setCurrentComponent, dispatch, userDetails) => {
    switch (flowType?.typeId) {
        case 7:
            await handleCsvEditFlow(responseData, methods, setCurrentComponent, dispatch, userDetails);
            break;
        case 8:
            await handleSftpEditFlow(responseData, methods, setCurrentComponent, dispatch, userDetails);
            break;
        case 32:
            handleManualEntryEditFlow(responseData, methods, setCurrentComponent);
            break;
        case 169:
            await handleExcelEditFlow(responseData, methods, setCurrentComponent, dispatch, userDetails);
            break;
        default:
            break;
    }
};

// Handle Excel edit flow
const handleExcelEditFlow = async (responseData, methods, setCurrentComponent, dispatch, userDetails) => {
    const { savedDataDetails, frontendbindjson } = responseData ?? {};
    const { importDescription, catType, catTypeName, listType, importPreferences } = savedDataDetails ?? {};
    const { reset } = methods;
    await handleEditFlowData(frontendbindjson, dispatch);
    let catTypeList = [];

    if (catTypeName) {
        const payload = {
            catType: 'child',
            ...userDetails,
        };

        const res = await dispatch(getChildListings(payload));
        catTypeList = res?.data || [];
    }

    const resetValues = {
        audienceBy: { type: 'Excel', typeId: 169 },
        ...(importDescription && {
            listName: importDescription,
            validatedImportDescriptionName: true,
        }),
        ...(catType && {
            attributeMapping: catType.charAt(0).toUpperCase() + catType.slice(1),
        }),
        ...(catTypeName && {
            categoryType: catTypeList.find((cat) => cat.catTypeName === catTypeName) || {
                catTypeName,
                catTypeID: catType === 'child' ? 1 : 0,
            },
        }),
        ...(listType && {
            listType: typeof listType === 'number' ? getListTypeString(listType) : listType,
        }),
        ...(importPreferences && {
            isImportPreference: handleImportPreferenceEdit(importPreferences),
        }),
    };

    setCurrentComponent('excel');
    reset((formState) => ({
        ...formState,
        ...resetValues,
    }));
};
// Handle CSV edit flow
const handleCsvEditFlow = async (responseData, methods, setCurrentComponent, dispatch, userDetails) => {
    const { savedDataDetails, frontendbindjson } = responseData ?? {};
    const { importDescription, catType, catTypeName, listType, importPreferences } = savedDataDetails ?? {};
    const { reset } = methods;
    await handleEditFlowData(frontendbindjson, dispatch);
    let catTypeList = [];

    if (catTypeName) {
        const payload = {
            catType: 'child',
            ...userDetails,
        };

        const res = await dispatch(getChildListings(payload));
        catTypeList = res?.data || [];
    }

    const resetValues = {
        audienceBy: { type: 'CSV', typeId: 7 },
        ...(importDescription && {
            listName: importDescription,
            validatedImportDescriptionName: true,
        }),
        ...(catType && {
            attributeMapping: catType.charAt(0).toUpperCase() + catType.slice(1),
        }),
        ...(catTypeName && {
            categoryType: catTypeList.find((cat) => cat.catTypeName === catTypeName) || {
                catTypeName,
                catTypeID: catType === 'child' ? 1 : 0,
            },
        }),
        ...(listType && {
            listType: typeof listType === 'number' ? getListTypeString(listType) : listType,
        }),
        ...(importPreferences && {
            isImportPreference: handleImportPreferenceEdit(importPreferences),
        }),
    };

    setCurrentComponent('csv');
    reset((formState) => ({
        ...formState,
        ...resetValues,
    }));
};

// Handle SFTP edit flow
const handleSftpEditFlow = async (responseData, methods, setCurrentComponent, dispatch, userDetails) => {
    const saveDetails = responseData?.savedDataDetails;
    const { importDescription, catType, catTypeName, listType, importPreferences } = saveDetails || {};
    const { reset } = methods;
    let catTypeList = [];

    if (catTypeName) {
        const payload = {
            catType: 'child',
            ...userDetails,
        };

        const res = await dispatch(getChildListings(payload, { loading: false }));
        catTypeList = res?.data || [];
    }

    const payload = {
        departmentId: userDetails?.departmentId,
        clientId: userDetails?.clientId,
        userId: userDetails?.userId,
    };
    const response = await dispatch(getUpdateCycleFrequency({ payload, loading: false }));
    let updateCycleList = response?.status ? response?.data : [];
    let finalMatchCycleList = updateCycleList?.find((list) => list?.typeId === saveDetails?.scheduleFrequency || 0);
    const resetValues = {
        audienceBy: { type: 'SFTP', typeId: 8 },
        ...(importDescription && {
            listName: importDescription,
            validatedImportDescriptionName: true,
        }),
        ...(catType && {
            attributeMapping: catType.charAt(0).toUpperCase() + catType.slice(1),
            catType: catType.charAt(0).toUpperCase() + catType.slice(1),
        }),
        ...(catTypeName && {
            categoryType: catTypeList.find((cat) => cat.catTypeName === catTypeName) || {
                catTypeName,
                catTypeID: catType === 'child' ? 1 : 0,
            },
        }),
        ...(listType && {
            listType: typeof listType === 'number' ? getListTypeString(listType) : listType,
        }),
        ...(importPreferences && {
            isImportPreference: handleImportPreferenceEdit(importPreferences),
        }),
    };

    setCurrentComponent('sftp');
    reset((formState) => ({
        ...formState,
        folderPath: saveDetails?.path || '',
        password: saveDetails?.password || '',
        userName: saveDetails?.userName || '',
        portNumber: saveDetails?.port || '',
        ipAddress: saveDetails?.iPAddress || '',
        friendlyName: saveDetails?.friendlyName || '',
        updatedCycle: finalMatchCycleList || '',
        isTargetListType: getListTypeString(listType) === 'Target list' && listType === 5 ? true : false,
        ...resetValues,
    }));
};

// Handle Manual Entry edit flow
const handleManualEntryEditFlow = (responseData, methods, setCurrentComponent) => {
    const { savedDataDetails } = responseData ?? {};
    const { importDescription, encodedData, importPreferences } = savedDataDetails ?? {};
    const { reset } = methods;
    const decodedAudienceData = atob(encodedData);
    const resetValues = {
        audienceBy: { type: 'Manual entry', typeId: 32 },
        manualEntry: {
            importDescription: importDescription || '',
            audienceData: decodedAudienceData || '',
        },
        ...(importPreferences && {
            isImportPreference: handleImportPreferenceEdit(importPreferences),
        }),
    };
    reset((formState) => ({
        ...formState,
        ...resetValues,
    }));
    setCurrentComponent('manual entry');
};

// Main edit flow handler function
const safeJsonParse = (value, fallback = null) => {
    try {
        if (typeof value === "string") return JSON.parse(value);
        return value;
    } catch (err) {
        return fallback;
    }
};

const safeDecrypt = (value) => {
    try {
        const decoded = decodeURIComponent(value);
        return decryptWithAES(decoded);
    } catch (err) {
        return null;
    }
};

export const handleEditFlow = async ({
    jobId,
    departmentId,
    clientId,
    userId,
    dispatch,
    methods,
    setCurrentComponent,
    state,
    setEditLoading,
}) => {
    setEditLoading?.(true);

    try {
        const payload = {
            jobId: typeof jobId === 'string' ? parseInt(jobId, 10) : jobId,
            departmentId,
            clientId,
            userId,
        };

        let userDetails = { departmentId, clientId, userId };
        const payloadSftp = {
            ...userDetails,
            remotesettingId: payload?.jobId,
        };

        let response;
        if (state?.isSFTP) {
            const res = await dispatch(get_ConnectorDetails(payloadSftp, false));
            response = {
                status: res?.status,
                data: res?.status
                    ? {
                          FrontendBindJSON: JSON.stringify(res?.data?.frontEndBind?.[0]?.key),
                      }
                    : '',
            };
        } else {
            response = await dispatch(returnToAddAudience({ payload, loading: false }));
        }

        if (!response?.status || !response?.data) {
            return;
        }

        const rawBind = response?.data?.FrontendBindJSON;

        if (!rawBind) {
            return;
        }

        const parsedData = safeJsonParse(rawBind);

        if (!parsedData) {
            return;
        }

        const decrypted = safeDecrypt(parsedData);

        if (!decrypted) {
            return;
        }

        const finalSaveDataDetails = safeJsonParse(decrypted);

        if (!finalSaveDataDetails) {
            return;
        }

        const audienceByType = getAudienceTypeById(finalSaveDataDetails?.savedDataDetails?.sourceType);

        await handleFlowByType(
            audienceByType,
            finalSaveDataDetails,
            methods,
            setCurrentComponent,
            dispatch,
            userDetails,
        );
    } catch (error) {
        // keep edit flow resilient; loading cleared in `finally`
    } finally {
        setEditLoading?.(false);
    }
};

// Get flow type from state
export const getFlowTypeFromState = (state) => {
    const from = _get(state, 'from', '');
    const type = _get(state, 'type', '').toLowerCase();
    const jobId = _get(state, 'data.jobId') || _get(state, 'jobId') || 0;
    if (jobId > 0 && from === FLOW_TYPES.COLUMN_MAPPING) {
        return FLOW_TYPES.COLUMN_MAPPING;
    }
    return null;
};

export const shouldTriggerEditFlow = (state) => {
    const jobId = _get(state, 'data.jobId') || _get(state, 'jobId') || 0;
    const from = _get(state, 'from', '');

    if (jobId > 0) {
        const validFlowTypes = [FLOW_TYPES.COLUMN_MAPPING];

        return validFlowTypes.includes(from) || from === FLOW_TYPES.TARGET_LIST;
    }

    return false;
};

const handleEditFlowData = async (frontendbindjsonString, dispatch) => {
    try {
        const frontendbindjson =
            typeof frontendbindjsonString === 'string'
                ? parseAudienceJsonArray(frontendbindjsonString, [])
                : frontendbindjsonString;

        if (!Array.isArray(frontendbindjson) || frontendbindjson.length === 0) {
            return;
        }
        const csvFiles = [];
        const paths = [];
        const fileWiseListAnalysisData = {};
        let excelFileData = frontendbindjson?.[0]?.excelFileData;
        let responseHeaders = '';
        //dispatch(updateExcelFilesData(excelFileData));
        frontendbindjson.forEach((fileData) => {
            const { filename, columnHeader, path, listAnalysis, fileSize } = fileData;

            // Build CSV file object
            const csvFile = {
                fileName: filename,
                isValid: true,
                encodedData: path,
                fileSize: fileSize || 0,
            };

            csvFiles.push(csvFile);
            paths.push(path);

            // Set response headers from first file's columnHeader
            if (!responseHeaders && columnHeader && Array.isArray(columnHeader)) {
                responseHeaders = columnHeader;
            }

            // Store list analysis data
            if (listAnalysis && filename) {
                fileWiseListAnalysisData[filename] = listAnalysis;
            }
        });

        // Dispatch to update Redux state
        await dispatch(
            setEditFlowData({
                csvFiles,
                path: paths,
                responseHeaders,
                fileWiseListAnalysisData,
                headerColumns: responseHeaders?.join(',') || '',
            }),
        );
    } catch (error) {}
};

const handleImportPreferenceEdit = (value) => {
    const input = formatName(value || '');

    const preferenceNew = IMPORT_PREFERENCE_LABEL;
    const preferenceOld = IMPORT_PRESERVE_PREFERENCE_LABEL;

    const reverseMap = {
        update_new_data: preferenceNew,
        preserve_older_data: preferenceOld,
    };

    return reverseMap[input] || preferenceOld;
};

const audienceByConfig = {
    11: 'Manual',
    12: 'CSV',
    13: 'XML',
    14: 'Remote Data Source',
    15: 'SFTP',
    16: 'Adhoc List',
    17: 'Seed List',
    18: 'Target List',
    19: 'Match Input List',
    20: 'Suppression Input List',
};

const avaliableAudienceBy = {};

const getAudienceTypeById = (id) => {
    // const typeName = audienceByConfig[id] || null;
    switch (id) {
        case 32:
            return { type: 'Manual entry', typeId: 32 };
        case 7:
            return { type: 'CSV', typeId: 7 };
        case 8:
            return { type: 'SFTP', typeId: 8 };
        case 3:
            return { type: 'Remote data source', typeId: 3 };
        case 169:
            return { type: 'Excel', typeId: 169 };
        default:
            return null;
    }
};
