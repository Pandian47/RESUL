import { createSlice } from '@reduxjs/toolkit';
import initialState from './initialState';

const analyticsReportSSRReducer = createSlice({
    name: 'CSR_REDUCER',
    initialState,
    reducers: {
        updateTopDevice: (state, { payload }) => ({
            ...state,
            overviewGrid: {
                topDeviceName: payload.topDeviceName,
                topDeviceValue: payload.topDeviceValue,
            },
        }),
        updateTopDeviceLoading: (state, { payload }) => ({
            ...state,
            topDeviceLoading: payload,
        }),
        updateSummaryReport: (state, { payload }) => ({
            ...state,
            summaryReport: payload,
        }),
        updateTrendsReport: (state, { payload: { payload, key } }) => {
            return {
                ...state,
                trends: {
                    ...state.trends,
                    [key]: payload,
                },
            };
        },
        updateTrendsLoading: (state, { payload }) => ({
            ...state,
            trendsLoading: payload,
        }),
        updatePreblast: (state, { payload }) => ({
            ...state,
            preBlast: payload,
        }),
        updateGeography: (state, { payload }) => ({
            ...state,
            geography: payload,
        }),
        updateKnownToUnknown: (state, { payload }) => ({
            ...state,
            knownToUnknownConversion: payload,
        }),
        updateBenchMark: (state, { payload }) => ({
            ...state,
            benchMark: payload,
        }),
        updateInsights: (state, { payload }) => ({
            ...state,
            insights: payload,
        }),
        updateInsightsLoading: (state, { payload }) => ({
            ...state,
            insightsLoading: payload,
        }),
        updateIndustry: (state, { payload }) => ({
            ...state,
            industryData: payload,
        }),
        updatePDFDownload: (state, { payload }) => ({
            ...state,
            pdfData: payload,
        }),
        updateSummarySubSegmentDetail: (state, { payload }) => {
            return {
                ...state,
                summarySubSegmentDetail: payload,
            };
        },
        resetCSRState: () => ({ ...initialState }),
        // resetCSRState: () => initialState,
        updateSummaryLoading: (state, { payload }) => ({
            ...state,
            summaryLoading: payload,
        }),
        updateNewContactLoading: (state, { payload }) => ({
            ...state,
            newContactLoading: payload,
        }),
        updateRetargetListStatus: (state, { payload }) => ({
            ...state,
            retargetListStatus: payload,
        }),
        updateRetargetListLoading: (state, { payload }) => ({
            ...state,
            retargetListLoading: payload,
        }),
        updateSnapshotList: (state, { payload }) => ({
            ...state,
            snapshotList: payload,
        }),
        updateListingPreviewImage: (state, { payload }) => ({
            ...state,
            listingPreviewImage: payload || {},
        }),
        updateAttributionRoi: (state, { payload }) => ({
            ...state,
            attributionRoi: payload,
        }),
        updateAttributionRoiLoading: (state, { payload }) => ({
            ...state,
            attributionRoiLoading: payload,
        }),
    },
});

export const {
    updateTopDevice,
    updateTopDeviceLoading,
    updatePDFDownload,
    updateSummaryReport,
    updateTrendsReport,
    updateTrendsLoading,
    updatePreblast,
    updateGeography,
    updateKnownToUnknown,
    updateBenchMark,
    updateInsights,
    updateInsightsLoading,
    updateIndustry,
    updateSummarySubSegmentDetail,
    resetCSRState,
    updateSummaryLoading,
    updateNewContactLoading,
    updateRetargetListStatus,
    updateRetargetListLoading,
    updateSnapshotList,
    updateListingPreviewImage,
    updateAttributionRoi,
    updateAttributionRoiLoading,
} = analyticsReportSSRReducer.actions;

export default analyticsReportSSRReducer.reducer;
