import { GET_NOTIFICATION, GET_NOTIFICATION_STATUS, GET_UNREAD_COUNT, MARK_ALL_AS_READ, MARK_NOTIFICATION_AS_READ_BY_ID } from 'Constants/EndPoints';
import request from 'Utils/Http';
import { toast } from 'react-toastify';

import { get_notification_detail, get_notification_status } from './reducer';
import { getToastCloseButton } from 'Utils/modules/uiToast';
import { getEnvironment } from 'Utils/modules/environment';

// export const getNotificationDetail = () => async (dispatch) =>
//     dispatch(
//         request.post({
//             url: GET_NOTIFICATION,
//             // loading: true,
//             ok: ({ data }) => {
//                 const { data: res } = data;
//             },
//             fail: (err) => console.error(err),
//         }),
//     );

export const getAlertsAndNotficationsDetail =
    (payload, updateNotif = true) =>
    async (dispatch) => {
        if (updateNotif) {
            dispatch(
                get_notification_detail({
                    field: 'isLoading',
                    data: true,
                }),
            );
        }
        return dispatch(
            request.post({
                url: GET_NOTIFICATION,
                payload,
                //loading: true,
                ok: ({ data }) => {
                    if (updateNotif) {
                        if (data?.status) {
                            dispatch(
                                get_notification_detail({
                                    field: 'data',
                                    data: { notifications: data?.data, count: data?.totalRows },
                                }),
                            );
                        } else {
                            dispatch(
                                get_notification_detail({
                                    field: 'data',
                                    data: { notifications: [], count: 0 },
                                }),
                            );
                        }
                        dispatch(
                            get_notification_detail({
                                field: 'isLoading',
                                data: false,
                            }),
                        );
                    }
                },
                fail: (err) => {
                    dispatch(
                        get_notification_detail({
                            field: 'isLoading',
                            data: false,
                        }),
                    );
                },
            }),
        );
    };

export const getNotificationStatus =
    ({ payload, loading = true }) =>
    async (dispatch) => {
        dispatch(get_notification_status({ field: 'isLoading', data: true }));
        return dispatch(
            request.post({
                url: GET_NOTIFICATION_STATUS,
                payload,
                loading,
                ok: ({ data }) => {
                    const { status, data: res } = data;
                                        if (status) {
                        dispatch(get_notification_status({ field: 'data', data: res }));
                        dispatch(get_notification_status({ field: 'isLoading', data: false }));
                    } else {
                        dispatch(get_notification_status({ field: 'isFailure', data: true }));
                        dispatch(get_notification_status({ field: 'isLoading', data: false }));
                    }
                },
                fail: (err) => {
                    dispatch(get_notification_status({ field: 'isFailure', data: true }));
                    dispatch(get_notification_status({ field: 'isLoading', data: false }));
                },
            }),
        );
    };

export const markAllAsRead =
    ({ payload }) =>
    async (dispatch) =>
        dispatch(
            request.post({
                url: MARK_ALL_AS_READ,
                payload,
                loading: true,
                ok: ({ data }) => {},
                fail: (err) => {},
                isFailureCheck:true,
            }),
        );

export const markNotificationAsReadById =
    ({ payload }) =>
    async (dispatch) =>
        dispatch(
            request.post({
                url: MARK_NOTIFICATION_AS_READ_BY_ID,
                payload,
                ok: () => {},
                fail: () => {},
            }),
        );

export const updateNotificationCountStatus =
    ({ payload }) =>
    async (dispatch) => {
        return dispatch(
            request.post({
                url: GET_UNREAD_COUNT,
                payload,
                // loading: true,
                ok: ({ data: apiData }) => {
                    const { alertId, alertmessage } = apiData;
                    const notificationId = alertId;
                    if (alertId > 0 && alertmessage) {
 const env = getEnvironment();
 env !== 'RUN' &&
                        toast.info(alertmessage, {
                            position: 'top-right',
                            closeButton: getToastCloseButton,
                            autoClose: 5000,
                            hideProgressBar: false,
                            closeOnClick: true,
                            pauseOnHover: true,
                            onClose: () => {
                                dispatch(
                                    markNotificationAsReadById({
                                        payload: {
                                            departmentId: payload.departmentId,
                                            clientId: payload.clientId,
                                            userId: payload.userId,
                                            notificationId,
                                        },
                                    }),
                                );
                            },
                        });
                    }
                },
                fail: (err) => {},
            }),
        );
    };

