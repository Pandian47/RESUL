import { createSlice } from '@reduxjs/toolkit';
import initialState from './initialState';

// const initial = _clonedeep(initialState);

const newUserReducer = createSlice({
    name: 'NEW_USER',
    initialState,
    reducers: {
        updateOtpToken: (state, { payload }) => ({ ...state, token: payload }),
        updateOtpPrefix: (state, { payload }) => ({ ...state, prefix: payload }),
        updateOtpValidState: (state, { payload }) => ({
            ...state,
            isOtpValid: payload.isOtpValid,
            showFlag: payload.showFlag,
            otpMessage: payload.otpMessage,
        }),
        updateCountryDetails: (state, { payload }) => ({ ...state, countryLocation: payload }),
        updateUserFormState: (state, { payload }) => ({
            ...state,
            ...payload,
        }),
        updateEmailFormState: (state, { payload }) => ({
            ...state,
            ...payload,
        }),
        updateSessionEmail: (state, { payload }) => {
            return {
                ...state,
                ...payload,
                sessionEmail: payload,
            };
        },
        // updateIsValidNewUserEmail: (state, { payload }) => ({
        //     ...state,
        //     isValidNewUserEmailId: payload.isValidEmail,
        // }),
        updateIsOtpModalShow: (state, { payload }) => ({
            ...state,
            isOtpModalShow: payload.isOtpModalShow,
            emailId: payload.emailId,
        }),
        isAgencyBrandState: (state, { payload }) => ({
            ...state,
            agencyId: payload.agencyId,
            userId: payload.userId,
            isAgencyBrand: payload.isAgencyBrand,
        }),
        updateNewUserEmailHasValue: (state, { payload }) => {
            return {
                ...state,
                hasValue: payload.hasValue,
                newUserEmailId: payload.emailId,
            };
        },
        update_newUser_data(state, { payload: {field, data} }) {
            return {
                ...state,
                [field]: data,
            };
        },
        resetNewUserFormState: () => ({ ...initialState }),
    },
});

export const {
    updateOtpToken,
    updateOtpPrefix,
    updateOtpValidState,
    updateCountryDetails,
    isAgencyBrandState,
    updateUserFormState,
    resetNewUserFormState,
    updateEmailFormState,
    //updateIsValidNewUserEmail,
    updateNewUserEmailHasValue,
    updateIsOtpModalShow,
    updateSessionEmail,
    update_newUser_data
} = newUserReducer.actions;

export default newUserReducer.reducer;
