// reducer
import { createSlice } from '@reduxjs/toolkit';
import initialState from './initialState';
import { normalizeAnalyticsSummaryResponse } from 'Pages/AuthenticationModule/Analytics/analyticsDefaults';

const analyticsListingReducer = createSlice({
    name: 'ANALYTICS_LISTING',
    initialState,
    reducers: {
        updateListingList: (state, { payload }) => ({
            ...state,
            data: normalizeAnalyticsSummaryResponse(payload),
            isLoading: false,
        }),
        updateListLoading: (state, { payload }) => ({ ...state, isLoading: payload, isFailure: false }),
        updateListFailure: (state, { payload }) => ({ ...state, isFailure: payload }),
        updateAnalyticsDetail: (state, { payload }) => ({ ...state, analyticsDetatils: payload }),
        updateGridLoading: (state, { payload }) => ({ ...state, isGridLoading: payload }),
        // resetAnalyticsListingState: () => initialState,
        resetAnalyticsListingState: () => ({ ...initialState }),
    },
});

export const { updateListingList, updateListLoading, resetAnalyticsListingState, updateListFailure, updateAnalyticsDetail, updateGridLoading } =
    analyticsListingReducer.actions;

export default analyticsListingReducer.reducer;
