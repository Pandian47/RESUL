import { DELETE_SECURITY_GROUP, GET_SECURITY_GROUP, GET_SECURITY_GROUP_BY_ID, GET_SECURITY_GROUP_LIST, SAVE_SECURITY_GROUP, SECURITY_GROUP_NAME_EXISTS } from 'Constants/EndPoints';
import request from 'Utils/Http';
import history from 'Utils/history';

import { updateRoles, updateSecurityList, updateRolesFailureState, updateRolesLoadingState } from './reducer';
import { update_failures_API_Errors } from 'Reducers/globalState/reducer';

export const checkSecuritynameExists =
    ({ payload, setFormError }) =>
    async (dispatch) =>
        dispatch(
            request.post({
                url: SECURITY_GROUP_NAME_EXISTS,
                payload,
                isToast: false,
                ok: ({ data }) => {
                    const { status, message } = data;
                    if (status) {
                        setFormError('roleName', {
                            type: 'custom',
                            message,
                        });
                    }
                },
                fail: (err) => {},
            }),
        );

export const saveUserRoles =
    ({ payload, loading = true }) =>
    async (dispatch) =>
        dispatch(
            request.post({
                url: SAVE_SECURITY_GROUP,
                payload,
                loading,
                ok: ({ data }) => {
                    const { status, message='No data available'} = data;
                    if (status) {
                        history.replace('/preferences/roles-and-permissions');
                    }else {
                        dispatch(
                            update_failures_API_Errors({
                                field: SAVE_SECURITY_GROUP,
                                message: message,
                            }),
                        );
                    }
                },
                isFailureCheck: true,
                fail: (err) => {},
            }),
        );

export const getSecuritygroupList =
    ({ payload, loading = false }) =>
    async (dispatch) =>
        dispatch(
            request.post({
                url: GET_SECURITY_GROUP_LIST,
                payload,
                loading,
                ok: ({ data }) => {
                    const { status, data: res } = data;
                    if (status) {
                        dispatch(updateRoles(res));
                    } else {
                        dispatch(updateRoles([]));
                        dispatch(updateRolesFailureState(true));
                    }
                },
                fail: () => dispatch(updateRolesFailureState(true)),
                final: () => dispatch(updateRolesLoadingState(false)),
            }),
        );

export const getSecurityGroupById =
    ({ payload, loading = true }) =>
    async (dispatch) =>
        dispatch(
            request.post({
                url: GET_SECURITY_GROUP_BY_ID,
                payload,
                loading,
                ok: ({ data }) => {
                    const { status, data: res } = data;
                    if (status) {
                        dispatch(updateSecurityList(res));
                    }
                },
                fail: () => {},
            }),
        );

export const getSecurityGroup =
    ({ payload, loading = true }) =>
    async (dispatch) =>
        dispatch(
            request.post({
                url: GET_SECURITY_GROUP,
                payload,
                loading,
                ok: ({ data }) => {
                    const { status, data: res } = data;
                    if (status) {
                        dispatch(updateSecurityList(res));
                    } else {
                        history.push('/preferences/roles-and-permissions');
                    }
                },
                fail: () => history.push('/preferences/roles-and-permissions'),
            }),
        );

export const deleteSecurityGroup =
    ({ payload, loading = true }) =>
    async (dispatch) => {
        return dispatch(
            request.post({
                url: DELETE_SECURITY_GROUP,
                payload,
                loading,
                 ok: ({ data }) => {
                    const { status,message='No data available' } = data;
                    if (!status) {
                        dispatch(
                            update_failures_API_Errors({
                                field: DELETE_SECURITY_GROUP,
                                message: message,
                            }),
                        );
                    }
                },
                fail: () => dispatch(updateRolesFailureState(true)),
                final: () => dispatch(updateRolesLoadingState(false)),
            }),
        );
    };
