import { AA360_GET_GOAL_PATH_CONVERSION_DATA, AA360_GET_WEB_NOTIFY_GOAL_SETTING, AA360_OVERVIEW, AA360_SAVE_RETARGETLIST, AA360_USERINFO, AA360_USERREPORT_LIST, AA360_USER_DATAATTRIBUTES, AA360_USER_GETPASSPORT_SEARCH, AA360_USER_TIMELINE } from 'Constants/EndPoints';
import request from 'Utils/Http';

import { aa_Data_View } from './reducer';

export const aa_Overview = (payload) => async (dispatch) => {
    dispatch(aa_Data_View({ field: 'overView_loading', data: true }));
    dispatch(
        request.post({
            url: AA360_OVERVIEW,
            payload,
            // loading: true,
            ok: (res) => {
                const {
                    data: { data, status, isCustom },
                } = res;
                if (status) {
                    dispatch(aa_Data_View({ field: 'overView', data: data }));
                    dispatch(aa_Data_View({ field: 'isCustom', data: isCustom }));
                    dispatch(aa_Data_View({ field: 'overView_loading', data: false }));
                }
                else {
                    dispatch(aa_Data_View({ field: 'overView', data: {} }));
                    dispatch(aa_Data_View({ field: 'isCustom', data: false }));
                    dispatch(aa_Data_View({ field: 'overView_loading', data: false }));
                }
            },

            fail: (err) => {
                                dispatch(aa_Data_View({ field: 'overView', data: {} }));
                dispatch(aa_Data_View({ field: 'isCustom', data: false }));
                dispatch(aa_Data_View({ field: 'overView_loading', data: false }));
            },
        }),
    );
};

export const aa_UserInfo = (payload) => async (dispatch) => {
    dispatch(aa_Data_View({ field: 'audience_details_loading', data: true }));
    return dispatch(
        request.post({
            url: AA360_USERINFO,
            payload,
            // loading: true,
            ok: (res) => {
                const {
                    data: { data, status },
                } = res;
                if (status) {
                    dispatch(aa_Data_View({ field: 'audience_details', data: data }));
                    dispatch(aa_Data_View({ field: 'audience_details_loading', data: false }));
                    dispatch(aa_Data_View({ field: 'passportId', data: payload?.passportId }));
                } else {
                    dispatch(aa_Data_View({ field: 'audience_details', data: {} }));
                    dispatch(aa_Data_View({ field: 'audience_details_loading', data: false }));
                    dispatch(aa_Data_View({ field: 'passportId', data: '' }));
                }
            },
            fail: (err) => {
                                dispatch(aa_Data_View({ field: 'audience_details', data: {} }));
                dispatch(aa_Data_View({ field: 'audience_details_loading', data: false }));
            },
        }),
    );
};

export const aa_audience_report = (payload) => async (dispatch) => {
    dispatch(aa_Data_View({ field: 'audience_report_loading', data: true }));
    return dispatch(
        request.post({
            url: AA360_USERREPORT_LIST,
            payload,
            // loading: true,
            ok: (res) => {
                const {
                    data: { data, status },
                } = res;
                if (status) {
                    dispatch(aa_Data_View({ field: 'audience_report', data: data }));
                    dispatch(aa_Data_View({ field: 'audience_report_loading', data: false }));
                } else {
                    dispatch(aa_Data_View({ field: 'audience_report', data: {} }));
                    dispatch(aa_Data_View({ field: 'audience_report_loading', data: false }));
                }
            },
            fail: (err) => {
                                dispatch(aa_Data_View({ field: 'audience_report', data: {} }));
                dispatch(aa_Data_View({ field: 'audience_report_loading', data: false }));
            },
        }),
    );
};

export const aa_audience_timeLineview = (payload) => async (dispatch) => {
    dispatch(aa_Data_View({ field: 'audience_timeLine_loading', data: true }));
    return dispatch(
        request.post({
            url: AA360_USER_TIMELINE,
            payload,
            // loading: true,
            ok: (res) => {
                const {
                    data: { data, status },
                } = res;
                if (status) {
                    dispatch(aa_Data_View({ field: 'audience_timeLine', data: data}));
                    dispatch(aa_Data_View({ field: 'audience_timeLine_loading', data: false }));
                } else {
                    dispatch(aa_Data_View({ field: 'audience_timeLine', data: [] }));
                    dispatch(aa_Data_View({ field: 'audience_timeLine_loading', data: false }));
                }
            },
            fail: (err) => {
                                dispatch(aa_Data_View({ field: 'audience_timeLine', data: [] }));
                dispatch(aa_Data_View({ field: 'audience_timeLine_loading', data: false }));
            },
        }),
    );
};

export const aa_audience_dataAttributes = (payload) => async (dispatch) => {
    dispatch(aa_Data_View({ field: 'dataAttributes_loading', data: true }));
    return dispatch(
        request.post({
            url: AA360_USER_DATAATTRIBUTES,
            payload,
            // loading: true,
            ok: (res) => {
                const {
                    data: { data, status },
                } = res;
                if (status) {
                    const result = JSON.parse(data);
                    
                    dispatch(aa_Data_View({ field: 'data_Attributes', data: result?.data }));
                    dispatch(aa_Data_View({ field: 'dataAttributes_loading', data: false }));
                } else {
                    dispatch(aa_Data_View({ field: 'data_Attributes', data: [] }));
                    dispatch(aa_Data_View({ field: 'dataAttributes_loading', data: false }));
                }
            },
            fail: (err) => {
                dispatch(aa_Data_View({ field: 'data_Attributes', data: [] }));
                dispatch(aa_Data_View({ field: 'dataAttributes_loading', data: false }));
            },
        }),
    );
};

export const aa_Search = (payload) => async (dispatch) => {
    dispatch(aa_Data_View({ field: 'search_loading', data: true }));
    return dispatch(
        request.post({
            url: AA360_USER_GETPASSPORT_SEARCH,
            payload,
            // loading: true,
            ok: (res) => {
                const {
                    data: { data, status },
                } = res;
                if (status) {
                    dispatch(aa_Data_View({ field: 'search', data: data }));
                    dispatch(aa_Data_View({ field: 'search_loading', data: false }));
                } else {
                    dispatch(aa_Data_View({ field: 'search', data: {} }));
                    dispatch(aa_Data_View({ field: 'search_loading', data: false }));
                }
            },
            fail: (err) => {
                                dispatch(aa_Data_View({ field: 'search', data: {} }));
                dispatch(aa_Data_View({ field: 'search_loading', data: false }));
            },
        }),
    );
};

export const aa_GetWebNotifyGoalSetting =
    ({ payload }) =>
    async (dispatch) => {
        dispatch(aa_Data_View({ field: 'webNotifyGoalSetting_loading', data: true }));
        return dispatch(
            request.post({
                url: AA360_GET_WEB_NOTIFY_GOAL_SETTING,
                payload,
                // loading: true,
                ok: (res) => {
                    const {
                        data: { data, status },
                    } = res;
                    if (status) {
                        dispatch(aa_Data_View({ field: 'webNotifyGoalSetting', data: data }));
                        dispatch(aa_Data_View({ field: 'webNotifyGoalSetting_loading', data: false }));
                    } else {
                        dispatch(aa_Data_View({ field: 'webNotifyGoalSetting', data: {} }));
                        dispatch(aa_Data_View({ field: 'webNotifyGoalSetting_loading', data: false }));
                    }
                },
                fail: (err) => {
                                        dispatch(aa_Data_View({ field: 'webNotifyGoalSetting', data: {} }));
                    dispatch(aa_Data_View({ field: 'webNotifyGoalSetting_loading', data: false }));
                },
            }),
        );
    };

export const aa_GetGoalPathConversionData =
    ({ payload }) =>
    async (dispatch) => {
        dispatch(aa_Data_View({ field: 'goalPathConversionData_loading', data: true }));
        return dispatch(
            request.post({
                url: AA360_GET_GOAL_PATH_CONVERSION_DATA,
                payload,
                // loading: true,
                ok: (res) => {
                    const {
                        data: { data, status },
                    } = res;
                    if (status) {
                        dispatch(aa_Data_View({ field: 'goalPathConversionData', data: data }));
                        dispatch(aa_Data_View({ field: 'goalPathConversionData_loading', data: false }));
                    } else {
                        dispatch(aa_Data_View({ field: 'goalPathConversionData', data: {} }));
                        dispatch(aa_Data_View({ field: 'goalPathConversionData_loading', data: false }));
                    }
                },
                fail: (err) => {
                                        dispatch(aa_Data_View({ field: 'goalPathConversionData', data: {} }));
                    dispatch(aa_Data_View({ field: 'goalPathConversionData_loading', data: false }));
                },
            }),
        );
    };

export const aa_SavetargetList =
    ({ payload }) =>
    async (dispatch) => {
        return dispatch(
            request.post({
                url: AA360_SAVE_RETARGETLIST,
                payload,
                loading: true,
                ok: (res) => {
                    const {
                        data: { data, status },
                    } = res;
                },
                fail: (err) => {
                },
            }),
        );
};