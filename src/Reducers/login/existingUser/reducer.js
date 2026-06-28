import initialState from './initialState';
import { createSlice } from '@reduxjs/toolkit';

const loginReducer = createSlice({
    name: 'LOGIN',
    initialState,
    reducers: {
        updateOTPState: (state, { payload }) => ({ ...state, isLoginValid: payload.isValid, token: payload.token, prefix: payload.prefix || '' }),
        updateInvoiceState: (state, { payload }) => ({ ...state, isInvoice: payload }),
        updateLicenseKeyState: (state, { payload }) => ({
            ...state,
            isLicenseKey: payload.isLicenseKey,
            isValidLicenseKey: payload.isValidLicenseKey,
            isKeyData: payload.isValidLicenseKeyData,
        }),
        updatePaymentState: (state, { payload }) => ({
            ...state,
            ispaymentEnable: payload.ispaymentEnable,
            isPaymentAuthCode: payload.isPaymentAuthCode,
            authKey: payload.authKey,
        }),
        updateOtpValidState: (state, { payload }) => ({
            ...state,
            isOtpValid: payload.isOtpValid,
            showFlag: payload.showFlag,
            accessToken: payload.accessToken,
            otpMessage: payload.otpMessage,
        }),
        resendLoginOTP: (state, { payload }) => ({
            ...state,
            emailID: payload.emailID,
            loginEmail: payload.loginEmail,
            loginPwd: payload.loginPwd,
            hashval: payload.hashval,
            userAgent: payload.userAgent,
            ipAddress: payload.ipAddress, 
            countryName: payload.countryName,
            countryCode: payload.countryCode,
            oauth: payload.oauth,
            IsADuser: payload.IsADuser,
        }),
        resendEmail:(state, { payload }) => ({
            ...state,
            forgotEmail:payload.forgotEmail
        }),
        isForgotState: (state, { payload }) => ({
            ...state,
            isForgot: payload.isForgot,
        }),
        isAgencyState: (state, { payload }) => ({
            ...state,
            isAgency: payload.isAgency,
        }),
        updateLicenceSessionId: (state, { payload }) => ({
            ...state,
            sessionId: payload.sessionId,
        }),
        updateInvoiceInitial: (state) => ({
            ...state,
            ispaymentEnable: false,
            isPaymentAuthCode: false,
            isInvoice: false,
        }),
        updateValidLicenseKey: (state, { payload }) => ({
            ...state,
            isValidLicenseKey: payload,
        }),
        updateForgotPwd: (state, { payload }) => ({
            ...state,
            isForgotPwd: payload,
        }),
        updateQrCode: (state, { payload }) => ({
            ...state,
            qrCode: payload,
        }),
        updateOtpToken: (state, { payload }) => ({
            ...state,
            otpToken: payload,
        }),
        updateisAuthQrScan: (state, { payload }) => ({
            ...state,
            isAuthQrScan: payload,
        }),
        resetLoginFormState: () => ({ ...initialState }),
        // resetLoginFormState: () => initialState,
    },
});

export const {
    updateOTPState,
    updateInvoiceState,
    updatePaymentState,
    updateLicenseKeyState,
    updateOtpValidState,
    resetLoginFormState,
    resendLoginOTP,
    resendEmail,
    isForgotState,
    isAgencyState,
    updateLicenceSessionId,
    updateInvoiceInitial,
    updateValidLicenseKey,
    updateForgotPwd,
    updateQrCode,
    updateOtpToken,
    updateisAuthQrScan
} = loginReducer.actions;

export default loginReducer.reducer;
