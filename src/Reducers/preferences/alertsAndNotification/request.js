import { GET_NOTIFICATION_STATUS, UPDATE_NOTIFICATION_STATUS } from 'Constants/EndPoints';
import request from 'Utils/Http';

import { update_failures_API_Errors } from 'Reducers/globalState/reducer';

export const getAlertsAndNotficationsStatus =
    ({ payload }) =>
    async (dispatch) =>
        dispatch(
            request.post({
                url: GET_NOTIFICATION_STATUS,
                payload,
                loading: true,
                ok: ({ data }) => {},
                fail: (err) => {},
            }),
        );

export const updateAlertsAndNotfications =
    ({ payload }) =>
    async (dispatch) =>
        dispatch(
            request.post({
                url: UPDATE_NOTIFICATION_STATUS,
                payload,
                loading: false,
                ok: ({ data }) => {
                    const { status,message='No data available' } = data;
                    if (!status) {
                        dispatch(
                            update_failures_API_Errors({
                                field: UPDATE_NOTIFICATION_STATUS,
                                message: message,
                            }),
                        );
                    }
                },
                fail: (err) => {},
            }),
        );
