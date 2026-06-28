import { ADD_USER, CLIENT_HIERACHY, DELETE_ASSIGN_ROLE, DELETE_USER, EMAIL_EXIST, GET_ADUSER, GET_ASSIGN_USER_LIST, GET_SECURITY_GROUP_LIST, GET_USERLIST_BY_CLIENTID, GET_USER_BY_ID, GET_USER_LIMIT, GET_USER_LIST, GET_USER_LISTING, HIERARCY_USER_LIST, NEW_USER_EMAIL_EXISTS, NEW_USER_VALIDATE_EMAIL_OTP, SAVE_ADUSER, SEND_SELECTED_USER_INFO_MAIL, USER_ASSIGN_ROLES } from 'Constants/EndPoints';
import request from 'Utils/Http';
import history from 'Utils/history';

import { updateUsersData, updateUserRoles, updateUserLoadingState, updateUserFailureState, updateUsersCount, updateUserDetails, updateOtpToken, updateOtpValidState, updateUserLimitFail, updateTotalUsers } from './reducer';

export const sendSelectedUserInfoMail =
    ({ payload }) =>
    async (dispatch) =>
        dispatch(
            request.post({
                url: SEND_SELECTED_USER_INFO_MAIL,
                isFailureCheck: true,
                payload,
                loading: true,
            }),
        );

export const saveUser =
    ({ payload, loading = true }) =>
    async (dispatch) =>
        dispatch(
            request.post({
                url: ADD_USER,
                payload,
                loading,
                isFailureCheck: true,
            }),
        );
export const updateUserStatus =
    ({ payload }) =>
    async (dispatch) =>
        dispatch(
            request.post({
                url: DELETE_USER,
                payload,
                loading: true,
            }),
        );

export const assignRoleToUser = (payload, callback, loading = true) => async (dispatch) => {
    return dispatch(
        request.post({
            url: USER_ASSIGN_ROLES,
            payload,
            loading,
            ok: ({ data }) => {
                const { status } = data;
                if (status) {
                    if (!callback) history.replace('/preferences/users');
                }
            },
            fail: (err) => {},
            isFailureCheck: true
        }),
    );
};

export const assignRoleToUserCompanies =
    ({ payload }) =>
    async (dispatch) => {
        return dispatch(
            request.post({
                url: GET_ASSIGN_USER_LIST,
                payload,
                loading: true,
                ok: ({ data }) => {},
                fail: () => {},
                isFailureCheck: true
            }),
        );
    };
export const getUserList =
    ({ payload, loading = false }) =>
    async (dispatch) =>
        dispatch(
            request.post({
                url: GET_USER_LIST,
                payload,
                loading,
                ok: ({ data }) => {
                    const { status, data: response, totalUser } = data;
                    if (status) {
                        dispatch(updateUsersData(response));
                        dispatch(updateTotalUsers(totalUser));
                    } else {
                        dispatch(updateUsersData([]));
                        dispatch(updateUserFailureState(true));
                        dispatch(updateTotalUsers(totalUser));
                    }
                },
                fail: () => dispatch(updateUserFailureState(true)),
                final: () => dispatch(updateUserLoadingState(false)),
            }),
        );
export const getUserListNew =
    ({ payload, loading = false }) =>
    async (dispatch) =>
        dispatch(
            request.post({
                url: GET_USERLIST_BY_CLIENTID,
                payload,
                loading,
                ok: ({ data }) => {
                    const { status, data: response, totalUser } = data;
                    if (status) {
                        dispatch(updateUsersData(response?.AssignUser));
                        dispatch(updateTotalUsers(totalUser));
                    } else {
                        dispatch(updateUsersData([]));
                        dispatch(updateUserFailureState(true));
                        dispatch(updateTotalUsers(totalUser));
                    }
                },
                fail: () => dispatch(updateUserFailureState(true)),
                final: () => dispatch(updateUserLoadingState(false)),
            }),
        );

export const checkEmailExist =
    ({ payload, setError }) =>
    async (dispatch) =>
        dispatch(
            request.post({
                url: EMAIL_EXIST,
                payload,
                isToast: false,
                ok: ({ data }) => {
                    if (data.status) {
                        setError('emailId', {
                            type: 'server',
                            message: data.message,
                        });
                    } else {
                        if (data.message === 'Invalid domain name')
                            setError('emailId', {
                                type: 'server',
                                message: data.message,
                            });
                    }
                },
                fail: (err) => {},
            }),
        );

export const getSecurityGroupList =
    ({ payload }) =>
    async (dispatch) =>
        dispatch(
            request.post({
                url: GET_SECURITY_GROUP_LIST,
                payload,
                ok: ({ data }) => {
                    const { status, data: roles } = data;
                    if (status) {
                        dispatch(updateUserRoles(roles));
                    } else {
                        dispatch(updateUserFailureState(true));
                    }
                },
                fail: () => dispatch(updateUserFailureState(true)),
                final: () => dispatch(updateUserLoadingState(false)),
            }),
        );

export const getAssignUserList =
    ({ payload }) =>
    async (dispatch) => {
        return dispatch(
            request.post({
                url: GET_ASSIGN_USER_LIST,
                payload,
                loading: true,
                ok: ({ data }) => {
                    const { status, totalUser } = data;
                    dispatch(updateTotalUsers(totalUser));
                },
                fail: () => {},
            }),
        );
    };

export const removeAssignUser =
    ({ payload }) =>
    async (dispatch) => {
        return dispatch(
            request.post({
                url: DELETE_ASSIGN_ROLE,
                payload,
                loading: true,
                isFailureCheck: true,
                ok: ({ data }) => {},
                fail: () => {},
            }),
        );
    };

export const getUserLimit =
    ({ payload, loading = true }) =>
    async (dispatch) =>
        dispatch(
            request.post({
                url: GET_USER_LIMIT,
                payload,
                loading,
                ok: ({ data }) => {
                    const { status, data: response } = data;
                    if (status) {
                        dispatch(updateUsersCount(response));
                        dispatch(updateUserLimitFail(false));
                    } else {
                        dispatch(updateUsersCount({}));
                        dispatch(updateUserLimitFail(true));
                    }
                },
                fail: () => dispatch(updateUserLimitFail(true)),
                // final: () => dispatch(updateUserLimitFail(false)),
            }),
        );

export const getUserById =
    ({ payload, loading = true }) =>
    async (dispatch) =>
        dispatch(
            request.post({
                url: GET_USER_BY_ID,
                payload,
                loading,
                isFailureCheck: true,
                ok: ({ data }) => {
                    const { status, data: response } = data;
                    if (status) {
                        dispatch(updateUserDetails(response[0]));
                    } else {
                        dispatch(updateUserFailureState(true));
                    }
                },
                fail: () => dispatch(updateUserFailureState(true)),
                final: () => dispatch(updateUserLoadingState(false)),
            }),
        );

export const getClientHieracy =
    ({ payload }) =>
    async (dispatch) => {
        return dispatch(
            request.post({
                url: CLIENT_HIERACHY,
                payload,
                ok: () => {},
                fail: (err) => {},
            }),
        );
    };

export const getHierarchyUserList =
    ({ payload }) =>
    async (dispatch) => {
        return dispatch(
            request.post({
                url: HIERARCY_USER_LIST,
                payload,
                ok: () => {},
                fail: (err) => {},
            }),
        );
    };

export const saveAdUser =
    ({ payload }) =>
    async (dispatch) => {
        return dispatch(
            request.post({
                url: SAVE_ADUSER,
                payload,
                loading: true,
                isToast: false,
                ok: ({ data }) => {
                                    },
                fail: (err) => {},
            }),
        );
    };
export const getUserListing =
    ({ payload, loading = true }) =>
    async (dispatch) => {
        return dispatch(
            request.post({
                url: GET_USER_LISTING,
                payload,
                loading,
                isToast: false,
                ok: ({ data }) => {
                                    },
                fail: (err) => {},
            }),
        );
    };
    
export const getAdUser =
    ({ payload, loading = true }) =>
    async (dispatch) => {
        return dispatch(
            request.post({
                url: GET_ADUSER,
                payload,
                loading,
                isToast: false,
                ok: ({ data }) => {
                                    },
                fail: (err) => {},
            }),
        );
    };

export const checkNewUserEmailExists =
    ({ payload }) =>
    async (dispatch) => {
        dispatch(
            request.post({
                url: NEW_USER_EMAIL_EXISTS,
                payload,
                loading: true,
                ok: ({ data: response }) => {
                    const { status, data, message } = response;
                    if (status) {
                        dispatch(
                            updateOtpToken({
                                token: data,
                            }),
                        );
                    } else {
                        dispatch(
                            updateOtpToken({
                                token: '',
                            }),
                        );
                        dispatch(
                            updateOtpValidState({
                                isOtpValid: false,
                                showFlag: true,
                                otpMessage: message,
                            }),
                        );
                    }
                },
                fail: (err) => {},
            }),
        );
    };
export const checkNewUserValidateEmailOTP =
    ({ payload }) =>
    async (dispatch) => {
        dispatch(
            request.post({
                url: NEW_USER_VALIDATE_EMAIL_OTP,
                payload,
                loading: true,
                ok: ({ data: response }) => {
                    const { status, message } = response;
                    if (status) {
                        dispatch(
                            updateOtpValidState({
                                isOtpValid: true,
                                showFlag: true,
                            }),
                        );
                    } else {
                        dispatch(
                            updateOtpValidState({
                                isOtpValid: false,
                                showFlag: true,
                                otpMessage: message,
                            }),
                        );
                    }
                },
                fail: (err) => {},
            }),
        );
    };
