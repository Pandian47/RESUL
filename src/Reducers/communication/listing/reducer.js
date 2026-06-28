// reducer
import { createSlice } from '@reduxjs/toolkit';
import initialState from './initialState';
import { updateErrorArray } from 'Utils/modules/display';
import { normalizeCommunicationListingData } from 'Pages/AuthenticationModule/Communication/CommunicationLists/communicationListingDefaults';

const communicationListingReducer = createSlice({
    name: 'COMMUNICATION_LISTING',
    initialState,
    reducers: {
          get_communication_list: (state, { payload: { field, data } }) => {
            return {
                ...state,
                [field]: data,
            };
        },
        updateListingList: (state, { payload }) => ({
            ...state,
            data: normalizeCommunicationListingData(payload),
            isLoading: false,
        }),
        updateCommunicationList: (state, { payload }) => {
            const list = Array.isArray(payload) ? payload : [];
            return {
                ...state,
                data: normalizeCommunicationListingData({
                    ...state.data,
                    communicationsList: list,
                }),
                isLoading: false,
            };
        },
        updateCampaignStatus: (state, { payload }) => ({ ...state, campaignStatus: payload, isLoading: false }),
        updateListLoading: (state, { payload }) => ({ ...state, isLoading: payload, isFailure: false }),
        updateListFailure: (state, { payload }) => ({ ...state, isFailure: payload }),
        updateListDuplicate: (state, { payload }) => ({ ...state, isDuplicate: payload }),
        updatePopupModal: (state, { payload }) => {
            return { ...state, campaignDetail: payload };
        },
        updatePopupContent: (state, { payload }) => {
            return { ...state, popupContent: payload };
        },
        update_failures_API_Communication_Listing: (state, { payload: { field, message } }) => {
            state.communicationListingFailureApiErrors = updateErrorArray(state.communicationListingFailureApiErrors, field, message);
        },
        reset_failure_API_Communication_Listing: (state) => ({
            ...state,
            communicationListingFailureApiErrors: []
        }),
        resetCommListing: () => ({ ...initialState }),
    },
});

export const {
    get_communication_list,
    updateListingList,
    updateListLoading,
    updateListFailure,
    updateCampaignStatus,
    updateCommunicationList,
    updatePopupModal,
    resetCommListing,
    updateListDuplicate,
    updatePopupContent
} = communicationListingReducer.actions;

export default communicationListingReducer.reducer;
