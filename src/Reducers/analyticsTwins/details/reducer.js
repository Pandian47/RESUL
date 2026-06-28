// reducer
import { createSlice } from '@reduxjs/toolkit';
import initialState from './initialState';

const analyticsDetails = createSlice({
    name: 'DETAILS_ANALYTICS',
    initialState,
    reducers: {
        updateDetailsMainList: (state, { payload: { field, data } }) => ({
            ...state,
            [field]: data,
        }),
        updateDetailsPreBlast: (state, { payload: { field, data } }) => ({
            ...state,
            [field]: data,
        }),
        updateDetailsLoading: (state, { payload }) => ({ ...state, isLoading: payload, isFailure: false }),
        updateDetailsChannelLoading: (state, { payload }) => ({ ...state, isChannelLoading: payload }),
        updateDetailsFailure: (state, { payload }) => ({ ...state, isFailure: payload }),
        linkPreviewDetailsData: (state, { payload }) => ({ ...state, linkPreviewData: payload }),
        updatekyccount:(state,{payload}) => ({...state,updatekyccount:payload}),
        docketDetailsData: (state, { payload }) => ({ ...state, docketDetails: payload }),
        docketCsvPathData: (state, { payload }) => ({ ...state, docketCsvPath: payload }),
        // resetAnalyticsDetailState: () => initialState,
        resetAnalyticsDetailState: () => ({ ...initialState }),
        setCommStatusLoading: (state, { payload }) => ({ ...state, isCommStatusLoading: payload }),
    },
});

export const {
    updateDetailsMainList,
    updateDetailsLoading,
    updateDetailsFailure,
    updateDetailsPreBlast,
    resetAnalyticsDetailState,
    linkPreviewDetailsData,
    docketDetailsData,
    updatekyccount,
    docketCsvPathData,
    updateDetailsChannelLoading,
    setCommStatusLoading
} = analyticsDetails.actions;

export default analyticsDetails.reducer;
