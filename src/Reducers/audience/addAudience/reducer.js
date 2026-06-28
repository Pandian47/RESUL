// reducer
import { createSlice } from '@reduxjs/toolkit';
import initialState from './initialState';

const addAudienceReducer = createSlice({
    name: 'ADD_AUDIENCE',
    initialState,
    reducers: {
        updateCsvFiles: (state, { payload }) => ({
            ...state,
            csvFiles: [...state.csvFiles, { ...payload.file }],
            path: [...state.path, payload.paths],
            IsListAnalysis: true,
        }),
        deleteCsvFiles: (state, { payload }) => {
            const csvFiles = [...state.csvFiles];
            csvFiles.splice(payload, 1);
            let responseHeaders = state.responseHeaders;
            if (!csvFiles?.length) responseHeaders = '';
            const path = state.path ? [...state.path] : [];
            path.splice(payload, 1);
            return { ...state, csvFiles, path, responseHeaders };
        },
        resetCsvFiles: (state) => ({
            ...state,
            csvFiles: [],
            path: [],
            headerColumns: '',
            categoryTypeText: '',
            attributeMapping: '',
            fileWiseListAnalysisData: {},
            excelFilesData: [],
            insightData: {}
        }),
        updateColumnData: (state, { payload }) => ({ ...state, columnData: payload }),
        updateDataAttribute: (state, { payload }) => ({ ...state, dataAttributes: payload }),
        updateCSVFile: (state, { payload }) => ({ ...state, csvFiles: [...state.csvFiles, { ...payload.file }] }),
        updateImportAudience: (state, { payload: { field, data } }) => {
            return {
                ...state,
                [field]: data,
            };
        },
        checkIfFriendlyNameExists: (state, { payload }) => {
            return {
                ...state,
                isFriendlyName: payload,
            };
        },
        checkFTPConnection: (state, { payload }) => {
            return {
                ...state,
                ftpConnectionStatus: payload,
            };
        },
        setConnectionStatus: (state, { payload }) => {
            return {
                ...state,
                controlConnection: payload,
            };
        },
        updateHeaderColumns: (state, { payload }) => ({ ...state, headerColumns: payload }),
        updateResponseHeader: (state, { payload }) => ({ ...state, responseHeaders: payload.columnHeader }),
        updateListAnalysisData: (state, { payload }) => {
            return {
                ...state,
                fileWiseListAnalysisData: {
                    ...state.fileWiseListAnalysisData,
                    [payload?.fileName]: payload?.data,
                },
            };
        },
        setEditFlowData: (state, { payload }) => {
            return {
                ...state,
                csvFiles: payload.csvFiles || [],
                path: payload.path || [],
                responseHeaders: payload.responseHeaders || [],
                fileWiseListAnalysisData: payload.fileWiseListAnalysisData || {},
                headerColumns: payload.headerColumns || '',
            };
        },
        updateExcelFilesData: (state, { payload }) => {
            return {
                ...state,
                excelFilesData: payload,
            };
        },
        resetAll: () => ({ ...initialState }),
        // resetAll: () => () => initialState,
    },
});

export const {
    updateCsvFiles,
    deleteCsvFiles,
    updateColumnData,
    resetCsvFiles,
    updateDataAttribute,
    updateCSVFile,
    updateImportAudience,
    checkIfFriendlyNameExists,
    checkFTPConnection,
    updateHeaderColumns,
    setConnectionStatus,
    updateResponseHeader,
    updateListAnalysisData,
    setEditFlowData,
    updateExcelFilesData,
    resetAll,
} = addAudienceReducer.actions;

export default addAudienceReducer.reducer;
