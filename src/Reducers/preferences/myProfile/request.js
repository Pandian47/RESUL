import { CHANGE_MOBILE_NUMBER, CHANGE_PASSWORD, CONFIRM_PASSWORD, GET_MY_PROFILE, SAVE_MY_PROFILE, UPDATE_MOBILE_NUMBER, VALIDATE_OTP, VALIDATE_PASSWORD } from 'Constants/EndPoints';
import request from 'Utils/Http';
import history from 'Utils/history';

import {
    setMyProfileData,
    restProfileData,
    updateOtpToken,
    updateCurrentValid,
    updateProfilePayload,
    updateOtpValid,
    updateOtpInValid,
} from './reducer';
import { update_failures_API_Errors, updateProfilePicture } from 'Reducers/globalState/reducer';

export const getMyprofile =
    ({ payload, config, isLoading = true, signal }) =>
    async (dispatch) =>
        dispatch(
            request.post({
                url: GET_MY_PROFILE,
                payload,
                config,
                signal,
                loading: isLoading,
                ok: ({ data }) => {
                    const { status, data: res } = data;
                    if (status) {
                        dispatch(setMyProfileData(res));
                    }
                },
                fail: (err) => {},
            }),
        );

export const saveMyProfile =
    ({ payload, handleResetValue, loading = true }) =>
    async (dispatch) => {
        return dispatch(
            request.post({
                url: SAVE_MY_PROFILE,
                payload,
                loading,
                ok: ({ data }) => {
                    const { status, message = 'No data available' } = data;
                    if (status) {
                        dispatch(updateProfilePicture(payload.profilePath));
                        dispatch(restProfileData());
                        if (handleResetValue) {
                            handleResetValue();
                        }
                        history.push('/preferences');
                    } else {
                        dispatch(
                            update_failures_API_Errors({
                                field: SAVE_MY_PROFILE,
                                message: message,
                            }),
                        );
                    }
                },
                fail: (err) => {},
                isFailureCheck: true,
            }),
        );
    };

export const validateMobileNumber =
    ({ payload, setError, setMessage }) =>
    async (dispatch) =>
        dispatch(
            request.post({
                url: UPDATE_MOBILE_NUMBER,
                payload,
                ok: ({ data }) => {
                    const { status, message, otptoken , prefix = ''} = data;
                    if (status) {
                        dispatch(updateOtpToken({ token: otptoken, isCurrentValue: true, prefix: prefix }));
                        setMessage('OTP sent successfully');
                    } else {
                        setError('changeMobileNumber.currentMobileNumber', {
                            type: 'custom',
                            message,
                        });
                    }
                },
                fail: (err) => {},
            }),
        );

export const UpdateMobileNumber =
    ({ payload, savePhoneNumber, loading = true }) =>
    async (dispatch) => {
        return dispatch(
            request.post({
                url: CHANGE_MOBILE_NUMBER,
                payload,
                loading,
                ok: ({ data }) => {
                    const { status } = data;
                    if (status) savePhoneNumber?.();
                },
                fail: (err) => {},
            }),
        );
    };

export const validateMyProfileOTP =
    ({ payload, loading = true }) =>
    async (dispatch) => {
        return dispatch(
            request.post({
                url: VALIDATE_OTP,
                payload,
                loading,
                ok: ({ data }) => {
                    const { status, message } = data;
                    if (status) {
                        dispatch(updateOtpValid(true));
                    } else {
                        dispatch(
                            updateOtpInValid({
                                flag: true,
                                otpMessage: message,
                            }),
                        );
                    }
                },
                fail: (err) => {},
            }),
        );
    };

export const validateCurrentPassword =
    ({ payload }) =>
    async (dispatch) => {
        return dispatch(
            request.post({
                url: CHANGE_PASSWORD,
                payload,
                ok: ({ data }) => {
                    const { status } = data;
                    if (status) {
                        dispatch(updateCurrentValid(true));
                    }
                },
                fail: (err) => {},
            }),
        );
    };

export const validatePassword =
    ({ payload, setShow, setMessage, loading = true }) =>
    async (dispatch) => {
        return dispatch(
            request.post({
                url: VALIDATE_PASSWORD,
                payload,
                loading,
                ok: ({ data }) => {
                    const { status, otptoken, prefix = '' } = data;
                    if (status) {
                        dispatch(updateProfilePayload({ token: otptoken, prefix: prefix }));
                        setMessage('OTP sent successfully');
                        setTimeout(() => {
                            setMessage(null);
                        }, 2000);
                        setShow(true);
                    }
                },
                fail: (err) => {},
            }),
        );
    };

export const saveNewPassword =
    ({ payload, onSuccess, loading = true }) =>
    async (dispatch) => {
        return dispatch(
            request.post({
                url: CONFIRM_PASSWORD,
                payload,
                loading,
                ok: ({ data }) => {
                    const { status } = data;
                    if (status) onSuccess?.();
                },
                fail: (err) => {},
            }),
        );
    };
