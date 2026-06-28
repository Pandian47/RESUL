import { CHANGE_HQ, GET_AGENCY_CLIENT_DETAILS, GET_CLIENT_DETAILS, GET_DEPARTMENT_LIMIT, GET_IP_WHITELIST, UPDATE_CLIENT_DETAILS, UPDATE_HQ, UPSERT_IP_WHITELIST } from 'Constants/EndPoints';
import request from 'Utils/Http';

import { updateAccountSettings, updateWhitelistedIPs } from './reducer';
import { getUserDetails } from 'Utils/modules/crypto';
const { isAgency } = getUserDetails();
export const getAccountSettings =
    ({ payload, navigate }) =>
    async (dispatch) =>
        dispatch(
            request.post({
                url: isAgency ? GET_AGENCY_CLIENT_DETAILS : GET_CLIENT_DETAILS,
                payload,
                loading: true,
                ok: ({ data }) => {
                    const { status, data: response } = data;
                    if (status) {
                        dispatch(updateAccountSettings(response));
                    } else {
                        navigate('/preferences');
                    }
                },
                fail: (err) => {},
            }),
        );

export const saveAccountSettings =
    ({
        payload,
        navigate,
        nextScreen,
        mode,
        isNextAccountSettings,
        isAccountSettings,
        stateClientId,
        isUpdate = false,
        loading = true,
    }) =>
    async (dispatch) =>
        dispatch(
            request.post({
                url: UPDATE_CLIENT_DETAILS,
                payload,
                loading,
                isFailureCheck: true,
                ok: async ({ data }) => {
                    const { status, message = 'No data available' } = data;
                    if (status) {
                        // if(isAccountSettings && isUpdate)
                        // if(!isUpdate && (isAgencyValue && isAccountSettings ? false : isNextAccountSettings ? true : false)){
                        //     let res = await dispatch(getBUList({ userId: payload.userId, clientId: payload?.clientId }, stateClientId, true)); // only company client will update
                        //     if(res?.status && state?.currClientId === payload?.clientId && ( fromCompanies || isAccountSettings )){
                        //         dispatch(updateBUByClient({  departmentList: res?.data }));
                        //     }
                        // }
                    }
                },
                fail: (err) => {},
            }),
        );

export const getIPWhiteList =
    ({ payload }) =>
    async (dispatch) =>
        dispatch(
            request.post({
                url: GET_IP_WHITELIST,
                payload,
                loading: true,
                ok: ({ data }) => {
                    const { status, data: response } = data;
                    if (status) {
                        dispatch(updateWhitelistedIPs(response));
                    } else {
                        dispatch(updateWhitelistedIPs([]));
                    }
                },
                fail: (err) => {},
            }),
        );

export const upsertIpWhiteList =
    ({ payload }) =>
    async (dispatch) =>
        dispatch(
            request.post({
                url: UPSERT_IP_WHITELIST,
                payload,
                loading: true,
                ok: ({ data }) => {},
                fail: (err) => {},
            }),
        );

export const changeHQData =
    ({ payload }) =>
    async (dispatch) =>
        dispatch(
            request.post({
                url: CHANGE_HQ,
                payload,
                loading: true,
                ok: ({ data }) => {},
                fail: (err) => {},
            }),
        );
export const updateHQData =
    ({ payload }) =>
    async (dispatch) =>
        dispatch(
            request.post({
                url: UPDATE_HQ,
                payload,
                loading: true,
                ok: ({ data }) => {},
                fail: (err) => {},
            }),
        );
export const getDepartmentLimit =
    ({ payload, loading = true }) =>
    async (dispatch) =>
        dispatch(
            request.post({
                url: GET_DEPARTMENT_LIMIT,
                payload,
                loading,
                ok: ({ data }) => {},
                fail: (err) => {},
            }),
        );
