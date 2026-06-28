import { createSlice } from '@reduxjs/toolkit';
import initialState from './initialState';
import { updateErrorArray } from 'Utils/modules/display';

const communicationPlanReducer = createSlice({
    name: 'CREATE_COMMUNICATION_PLAN',
    initialState,
    reducers: {
        update_selected_plan: (state, { payload }) => {
            const finalDynamicData = payload?.isFilter
                ? [...payload.dynamicListData, ...state?.dynamicListData]
                : [...payload.dynamicListData];

            return {
                ...state,
                dynamicListData: finalDynamicData,
            };
        },
        updateCommunicationNameValid: (state, { payload }) => ({ ...state, isCommunicationName: payload }),
        updateCommunicationOptions: (state, { payload }) => ({ ...state, communicationOptions: payload }),
        updateSubProductOptions: (state, { payload }) => ({
            ...state,
            communicationOptions: { ...state.communicationOptions, subProducts: payload },
        }),
        updateCommunicationData: (state, { payload: { field, data } }) => ({
            ...state,
            [field]: data,
        }),
        setPlanDropdownsFetchedFor: (state, { payload }) => ({
            ...state,
            planDropdownsFetchedFor: payload,
        }),
        update_failures_API_Communication_Plan: (state, { payload: { field, message } }) => {
            state.communicationPlanFailureApiErrors = updateErrorArray(
                state.communicationPlanFailureApiErrors,
                field,
                message,
            );
        },
        reset_failure_API_Communication_Plan: (state) => ({
            ...state,
            communicationPlanFailureApiErrors: [],
        }),
        updateSaveChannelsId: (state, { payload }) => {
            return {
                ...state,
                savedChannelsId: payload,
            };
        },
        updateChannelAudiences: (state, { payload }) => {
            return {
                ...state,
                channelAudiences: payload,
            };
        },
        updateSavedStatusId: (state, { payload }) => {
            return {
                ...state,
                savedChannelStatusId: payload,
            };
        },
        setCampaignBlastDetails: (state, { payload }) => {
            return {
                ...state,
                campaignBlastDetails: payload || null
            }
        },
        updateExistingLinks: (state, { payload }) => ({
            ...state,
            exisingLinks: payload,
        }),
        // Keep dropdown cache across plan resets to avoid redundant refetch
        // when navigating from communication list to edit flow.
        resetCommunicationPlan: (state) => ({
            ...initialState,
            communicationOptions: {
                ...(state?.communicationOptions || {}),
                product: state?.communicationOptions?.product || [],
                attributes: state?.communicationOptions?.attributes || [],
            },
            planDropdownsFetchedFor: state?.planDropdownsFetchedFor ?? null,
        }),
    },
});
export const {
    update_selected_plan,
    resetCommunicationPlan,
    updateCommunicationNameValid,
    updateCommunicationOptions,
    updateSubProductOptions,
    updateCommunicationData,
    setPlanDropdownsFetchedFor,
    update_failures_API_Communication_Plan,
    reset_failure_API_Communication_Plan,
    updateSaveChannelsId,
    updateChannelAudiences,
    updateSavedStatusId,
    setCampaignBlastDetails,
    updateExistingLinks
} = communicationPlanReducer.actions;

export default communicationPlanReducer.reducer;
