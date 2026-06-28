import { createSlice } from '@reduxjs/toolkit';
import initialState from './initialState';
import { updateErrorArray } from 'Utils/modules/display';

const syncHistoryReducer = createSlice({
    name: 'SYNC_HISTORY',
    initialState,
    reducers: {
        updateActionList: (state, { payload }) => ({
            ...state,
            actionList: payload,
        }),
        updateLoading: (state, { payload: { field, payload } }) => ({
            ...state,
            [field]: payload,
        }),
        updateSynchistory: (state, { payload }) => ({
            ...state,
            syncHistory: payload.syncHistory,
            totalAudience: payload.totalAudience,
            mode:payload.mode
        }),
        resetSynchistory: () => ({ ...initialState }),
        updateFailuresAPISyncHistory: (state, { payload: { field, message } }) => {
            state.syncHistoryFailureApiErrors = updateErrorArray(state.syncHistoryFailureApiErrors, field, message);
        },
        updateListAnalysis: (state, { payload }) => ({
            ...state,
            listAnalysisData: payload,
        }),
    },
});

export const { updateActionList, updateLoading, updateSynchistory, resetSynchistory ,updateFailuresAPISyncHistory, updateListAnalysis } = syncHistoryReducer.actions;
export default syncHistoryReducer.reducer;
