const initialState = {
    data: {
        alertNotifications: [],
        totalRowCount: 0,
        totalUnreadCount: 0,
        notificationsDetail: '',
    },
    notificationsDetail: {
        data: {
            notifications: [],
            count: 0,
        },
        isLoading: false,
        isFailure: false,
    },
    notificationStatus: {
        data: [],
        isLoading: false,
        isFailure: false,
    },
};

export default initialState;
