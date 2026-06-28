import { createSlice } from '@reduxjs/toolkit';
import initialState from './initialState';

const remoteDataSourceReducer = createSlice({
    name: 'REMOTE_DATA_SOURCE',
    initialState,
    reducers: {
        connectToTable: (state, { payload }) => {
            return {
                ...state,
                tableData: payload,
            };
        },
        connectToBQ: (state, { payload }) => {
            return {
                ...state,
                bqConnected: payload,
                bgQueryConnectData: payload,
            };
        },
        connectBQprojectList: (state, { payload }) => {
            return {
                ...state,
                bqProjectList: payload,
            };
        },
        getBQDataSetList: (state, { payload }) => {
            return {
                ...state,
                bgDataset: payload,
            };
        },
        getTableDropDown: (state, { payload }) => {
            return {
                ...state,
                tableDropDown: payload,
            };
        },
        getTableColumnDetails: (state, { payload }) => {
            return {
                ...state,
                tableColumns: payload,
            };
        },
        getShowTableColumn: (state, { payload }) => {
            return {
                ...state,
                showColumns: payload,
            };
        },
        getBQTableStatus: (state, { payload }) => {
                        return {
                ...state,
                showBQTable: payload?.status,
                bqTableList: payload?.data,
            };
        },
        getBQColumnStatus: (state, { payload }) => {
            return {
                ...state,
                bqColumnLists: payload,
            };
        },
        mySqlUpdate: (state, { payload }) => {
            return {
                ...state,
                mySql: {
                    ...state.mySql,
                    ...payload,
                },
            };
        },
        mySqlDataUpdate: (state, { payload }) => {
            return {
                ...state,
                mySql: payload
            };
        },
        versiumDataUpdate: (state, { payload }) => {
            return {
                ...state,
                versiumData: {
                    ...state.versiumData,
                    ...payload,
                },
            };
        },
        updateCycleFrequency: (state, { payload }) => {
            return {
                ...state,
                updateCycleList: payload,
            };
        },
        updateWistiaMedia: (state, { payload }) => {
            return {
                ...state,
                updateWistiaMediaList: payload,
            };
        },
        updateMatomoSites: (state, { payload }) => {
            return {
                ...state,
                updateMatomoSiteList: payload,
            };
        },
        updateMatomoInsights: (state, { payload }) => {
            return {
                ...state,
                updateMatomoInsightList: payload,
            };
        },
        updateOrganizationList: (state, { payload }) => {
            return {
                ...state,
                organizationList: payload,
            };
        },
        versiumDataReset: (state) => {
            return {
                ...state,
                versiumData: initialState.versiumData,
                tableColumns: [],
            };
        },
        mySqlReset: (state) => {
            return {
                ...state,
                mySql: initialState.mySql,
                tableColumns: [],
                versiumData: {},
            };
        },
        setWebinarsData: (state, { payload }) => {
            return {
                ...state,
                webinarsData: payload,
            };
        },
        setWebexData: (state, { payload }) => {
            return {
                ...state,
                webexData: payload,
            };
        },
    },
});

export const {
    getBQColumnStatus,
    getBQTableStatus,
    getBQDataSetList,
    connectToTable,
    getTableDropDown,
    versiumDataUpdate,
    getTableColumnDetails,
    getShowTableColumn,
    connectToBQ,
    connectBQprojectList,
    mySqlUpdate,
    mySqlReset,
    updateCycleFrequency,
    updateWistiaMedia,
    updateOrganizationList,
    setWebinarsData,
    setWebexData,
    updateMatomoSites,
    updateMatomoInsights,
    mySqlDataUpdate
} = remoteDataSourceReducer.actions;

export default remoteDataSourceReducer.reducer;
