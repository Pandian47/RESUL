import initialState from './initialState';
import { createSlice } from '@reduxjs/toolkit';

const notificationsReducer = createSlice({
    name: 'NOTIFICATIONS',
    initialState,
    reducers: {
        get_notifications_success(state, action) {
            return {
                ...state,
                alertNotifications: action.payload?.alertNotifications,
                isFailure: false,
                errorMessage: '',
            };
        },
        get_notifications_failure(state, action) {
            return {
                ...state,
                isFailure: true,
                errorMessage: action.payload,
            };
        },
        single_read_success(state, action) {
            const alertNotifications = (state?.data?.alertNotifications ?? []).map((notification) => {
                if (notification?.notificationID === action.payload) {
                    return {
                        ...notification,
                        readStatus: 'true',
                        status: 'Read',
                    };
                }
                return notification;
            });
            return {
                ...state,
                data: {
                    ...state?.data,
                    alertNotifications,
                    totalUnreadCount: (state?.data?.totalUnreadCount ?? 0) - 1,
                },
                isFailure: false,
                errorMessage: '',
            };
        },
        get_notification_detail: (state, { payload: { field, data } }) => {
            return {
                ...state,
                notificationsDetail: {
                    ...state.notificationsDetail,
                    [field]: data,
                },
            };
        },
        get_notification_status: (state, { payload: { field, data } }) => {
            return {
                ...state,
                notificationStatus: {
                    ...state.notificationStatus,
                    [field]: data,
                },
            };
        },
        get_notification_unread: (state, { payload: { field, data } }) => {
            return {
                ...state,

                [field]: data,
            };
        },

        resetAlertNotification: () => ({ ...initialState }),
        mark_all_read_success(state) {
            const alertNotifications = (state?.data?.alertNotifications ?? []).map((notification) => {
                return {
                    ...notification,
                    readStatus: 'true',
                    status: 'Read',
                };
            });
            return {
                ...state,
                data: {
                    ...state?.data,
                    alertNotifications,
                    totalUnreadCount: 0,
                },
                isFailure: false,
                errorMessage: '',
            };
        },
    },
});

export const {
    get_notifications_success,
    get_notifications_failure,
    mark_all_read_success,
    single_read_success,
    get_notification_detail,
    get_notification_status,
    get_notification_unread,
    resetAlertNotification,
} = notificationsReducer.actions;

export default notificationsReducer.reducer;
