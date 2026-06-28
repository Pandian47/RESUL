import { createSlice } from '@reduxjs/toolkit';
import initialState from './initialState';

const communicationSettingsReducer = createSlice({
    name: 'COMMUNICATION_SETTINGS',
    initialState,
    reducers: {
        updateCommunicationSettings: (state, { payload: { field, payload } }) => ({
            ...state,
            [field]: payload,
        }),
        updateWepAppPermissionData: (state, { payload: { field, payload } }) => ({
            ...state,
            [field]: payload,
        }),
        updateMobilePermissionData: (state, { payload: { field, payload } }) => ({
            ...state,
            [field]: payload,
        }),
 update_isBUEnableSub: (state, { payload }) => ({ ...state, isBUEnableSub: payload }),
 update_isBUEnablePush: (state, { payload }) => ({ ...state, isBUEnablePush: payload }),
 update_isBUEnableAds: (state, { payload }) => ({ ...state, isBUEnableAds: payload }),
 update_disableBU: (state, { payload }) => ({ ...state, disableBU: payload }),
        resetCommunicationSettings: () => ({ ...initialState }),
    },
});

export const {
    resetCommunicationSettings,
    updateCommunicationSettings,
    updateWepAppPermissionData,
    updateMobilePermissionData,
    update_isBUEnableSub,
    update_isBUEnablePush,
    update_disableBU,
    update_isBUEnableAds
} = communicationSettingsReducer.actions;

export default communicationSettingsReducer.reducer;
