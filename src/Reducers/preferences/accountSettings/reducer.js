import { createSlice } from '@reduxjs/toolkit';
import initialState from './initialState';

const accountSettingsReducer = createSlice({
    name: 'ACCOUNT_SETTINGS',
    initialState,
    reducers: {
        updateAccountSettings: (state, { payload }) => ({ ...state, data: payload }),
        updateWhitelistedIPs: (state, { payload }) => ({ ...state, whitelistedIP: payload }),
        resetAccountSettings: () => ({ ...initialState }),
    },
});

export const { updateAccountSettings, updateWhitelistedIPs, resetAccountSettings } = accountSettingsReducer.actions;

export default accountSettingsReducer.reducer;
