import initialState from './initialState';
import { createSlice } from '@reduxjs/toolkit';

const smartLinkReducer = createSlice({
    name: 'SMART_LINK',
    initialState,
    reducers: {
        updateCustomFields: (state, { payload }) => ({ ...state, customFields: payload }),
        updateMobileApps: (state, { payload }) => ({ ...state, mobileApps: payload }),
        updateMobileAppId: (state, { payload }) => ({ ...state, mobileAppId: payload }),
        updateSubScreenList: (state, { payload }) => ({
            ...state,
            ...state,
            subScreenList: {
                ...state.subScreenList,
                [payload?.field]: payload?.data,
            },
        }),
        updateScreenList: (state, { payload }) => ({
            ...state,
            screenList: {
                ...state.screenList,
                [payload?.field]: payload?.data,
            },
        }),
        updateGeneratedLink: (state, { payload }) => ({
            ...state,
            generatedLink: payload,
        }),
        updateSmartLinkFriendlyName: (state, { payload }) => ({
            ...state,
            SmartLinks: payload,
        }),
        deleteGeneratedSmartLink: (state, { payload }) => ({
            ...state,
            generatedLink: {
                ...state.generatedLink,
                [payload]: '',
            },
        }),
        updateEditFlow: (state, { payload }) => ({
            ...state,
            editFlow: payload.edit,
            generatedLink: payload.generatedLink,
            generateFlag: payload?.generateFlag,
            isAppEventTrack: payload?.isAppAnalyticsEventTrack
        }),
        removeEditFlow: (state, { payload, key }) => ({
            ...state,
            editFlow: {
                ...state.editFlow,
                [payload.key]: payload.payload,
            },
        }),
        showTabsSmartlink: (state, { payload }) => ({ ...state, tabSmartLink_Flag: payload }),
        updateMobileChangeConfirm: (state, { payload }) => {
            return {
                ...state,
                mobileChangeConfirm: {
                    ...state.mobileChangeConfirm,
                    [payload?.field]: payload?.data,
                },
            };
        },
        updateEventTrack: (state, { payload: {field,data} }) => {
            return {
                ...state,
                eventTrackData: {
                    ...state.eventTrackData,
                    [field]: data,
                },
            };
        },
        updateSavedSmartLinkPayload: (state,{payload}) => {
            return {
                ...state,
                savedSmartLinkPayload: payload,
            }
        },
        updateSmartLinkDetailLoading: (state, { payload }) => ({
            ...state,
            isSmartLinkDetailLoading: Boolean(payload),
        }),
        markSmartLinkDetailFetched: (state, { payload }) => ({
            ...state,
            isSmartLinkDetailFetched: true,
            fetchedCampaignId: payload?.campaignId ?? 0,
        }),
        // resetSmartLink: () => initialState,
        resetSmartLink: () => ({ ...initialState }),
    },
});

export const {
    updateCustomFields,
    updateMobileApps,
    updateMobileAppId,
    updateSubScreenList,
    updateScreenList,
    updateGeneratedLink,
    updateSmartLinkFriendlyName,
    updateEditFlow,
    deleteGeneratedSmartLink,
    resetSmartLink,
    removeEditFlow,
    showTabsSmartlink,
    updateMobileChangeConfirm,
    updateEventTrack,
    updateSmartLinkDetailLoading,
    markSmartLinkDetailFetched,
} = smartLinkReducer.actions;

export default smartLinkReducer.reducer;
