import { createSlice } from '@reduxjs/toolkit';
import initialState from './initialState';

const communicationExecuteReducer = createSlice({
    name: 'EXECUTE_COMMUNICATION',
    initialState,
    reducers: {
        update_campaign_details: (state, { payload: { field, data } }) => {
            return {
                ...state,
                [field]: data,
            };
        },
        update_channel_details: (state, { payload: { field, data } }) => {
            return {
                ...state,
                channelDetails: {
                    ...state.channelDetails,
                    [field]: data,
                },
            };
        },
        updateSmartLinkShow: (state, { payload }) => ({
            ...state,
            smartLinkShow: payload,
        }),
        updateScrubRulesData: (state, { payload: { field, data } }) => ({
            ...state,
            scrubRuleData: {
                ...state.scrubRuleData,
                [field]: data,
            },
        }),
        updateAdvAnalyticsData: (state, { payload: { field, data, isReset } }) => ({
            ...state,
            advAnalyticsData: {
                ...state.advAnalyticsData,
                [field]: data
            },
        }),
        updateCampaignAnalyzeListLoading: (state, { payload }) => ({
            ...state,
            isCampaignAnalyzeListLoading: payload,
        }),
        
        resetExecute: () => ({ ...initialState }),
    },
});
export const {
    update_campaign_details,
    update_channel_details,
    updateSmartLinkShow,
    resetExecute,
    updateScrubRulesData,
    updateAdvAnalyticsData,
    updateCampaignAnalyzeListLoading,
} = communicationExecuteReducer.actions;

export default communicationExecuteReducer.reducer;
