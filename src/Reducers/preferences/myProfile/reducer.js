import { createSlice } from '@reduxjs/toolkit';
import initialState from './initialState';

const myProfileReducer = createSlice({
    name: 'MY_PROFILE',
    initialState,
    reducers: {
        setMyProfileData: (state, { payload }) => {
            return {
                ...state,
                data: payload,
            };
        },
        updateCurrentValid: (state, { payload }) => ({ ...state, isCurrentValue: payload }),
        updateOtpValid: (state, { payload }) => ({ ...state, isOtp: payload, flag: payload }),
        updateOtpInValid: (state, { payload }) => ({
            ...state,
            isOtp: false,
            flag: payload.flag,
            otpMessage: payload.otpMessage,
        }),
        updateOtpToken: (state, { payload }) => ({
            ...state,
            token: payload.token,
            isCurrentValue: payload.isCurrentValue,
            prefix: payload.prefix || '',
        }),
        resetOtpState: (state) => ({
            ...state,
            token: null,
            isCurrentValue: false,
            isOtp: false,
            flag: false,
            otpMessage: null,
        }),
        updateProfilePayload: (state, { payload }) => ({ ...state, ...payload }),
        setWelcomeModal: (state, { payload }) => ({ ...state, showWelcomeModal: payload }),
        restProfileData: () => ({ ...initialState }),
    },
});

export const {
    setMyProfileData,
    restProfileData,
    updateOtpValid,
    updateCurrentValid,
    updateOtpToken,
    updateOtpInValid,
    resetOtpState,
    updateProfilePayload,
    setWelcomeModal,
} = myProfileReducer.actions;

export default myProfileReducer.reducer;
