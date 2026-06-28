import { createSlice } from '@reduxjs/toolkit';
import initialState from './initialState';

const userReducer = createSlice({
    name: 'USERS',
    initialState,
    reducers: {
        updateUsersData: (state, { payload }) => ({ ...state, users: payload, isFailure: false }),
        updateUsersGridList: (state, { payload }) => ({ ...state, usersList: payload }),
        updateUserRoles: (state, { payload }) => ({ ...state, userRoles: payload }),
        updateUsersCount: (state, { payload }) => ({ ...state, usersCount: payload }),
        updateUserDetails: (state, { payload }) => ({ ...state, userData: payload }),
        updateTotalUsers: (state, { payload }) => ({ ...state, totalUsers: payload }),
        updateUserLoadingState: (state, { payload }) => ({
            ...state,
            isLoading: payload,
            isFailure: payload ? false : state.isFailure,
        }),
        updateNewUserEmailHasValue: (state, { payload }) => {
            return {
                ...state,
                hasValue: payload.hasValue,
                newUserEmailId: payload.emailId,
            };
        },
        updateIsOtpModalShow: (state, { payload }) => ({
            ...state,
            isOtpModalShow: payload.isOtpModalShow,
        }),
        resetUserCreation: () => ({ ...initialState }),
        updateUserFailureState: (state, { payload }) => ({ ...state, isFailure: payload }),
        updateUserLimitFail: (state, { payload }) => ({ ...state, userLimitFailure: payload }),
        updateOtpToken: (state, { payload }) => ({ ...state, token: payload }),
        updateOtpValidState: (state, { payload }) => {
            return {
                ...state,
                isOtpValid: payload.isOtpValid,
                showFlag: payload.showFlag,
                otpMessage: payload.otpMessage,
            };
        },
        updateIsValidNewUserEmail: (state, { payload }) => ({
            ...state,
            isValidNewUserEmailId: payload.isValidEmail,
        }),
        resetAddNewUserState: (state, { payload }) => ({
            ...state,
            newUserEmailId: '',
            isValidNewUserEmailId: false,
            isOtpModalShow: false,
            isOtpValid: false,
            showFlag: false,
            hasValue: '',
            otpMessage: '',
        }),
    },
});

export const {
    updateUsersData,
    updateUsersGridList,
    updateUserRoles,
    updateUsersCount,
    updateUserDetails,
    updateUserLoadingState,
    updateUserFailureState,
    resetUserCreation,
    updateIsValidNewUserEmail,
    updateIsOtpModalShow,
    updateOtpToken,
    updateOtpValidState,
    resetAddNewUserState,
    updateUserLimitFail,
    updateTotalUsers
} = userReducer.actions;

export default userReducer.reducer;
