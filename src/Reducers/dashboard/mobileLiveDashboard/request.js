import { GET_MOBILE_LIVEDATA, GET_MOBILE_PATHANALYSER, GET_PATHANALYSER_DDL, GET_WEBDASHBOARD, GET_WEB_AUDIENCE_COUNT, GET_WEB_LIVECOUNT, GET_WEB_PATHANALYSER } from 'Constants/EndPoints';
import request from 'Utils/Http';

export const getAudienceCountMobile = (payload) => async (dispatch) => {
    return dispatch(
        request.post({
            url: GET_WEB_AUDIENCE_COUNT,
            payload,
            baseURLConnect: true,
            // loading: true,
            isToast: false,
            ok: ({ data }) => {
                            },
            fail: (err) => {},
        }),
    );
};

export const getMobileAppDasdhboard = (payload) => async (dispatch) => {
    return dispatch(
        request.post({
            url: GET_MOBILE_LIVEDATA,
            payload,
            baseURLConnect: true,
            // loading: true,
            isToast: false,
            ok: ({ data }) => {
                            },
            fail: (err) => {},
        }),
    );
};
export const getWebAppDasdhboard = (payload) => async (dispatch) => {
    return dispatch(
        request.post({
            url: GET_WEBDASHBOARD,
            payload,
            baseURLConnect: true,
            // loading: true,
            isToast: false,
            ok: ({ data }) => {
                            },
            fail: (err) => {},
        }),
    );
};
export const getLiveCountDashboard = (payload) => async (dispatch) => {
    return dispatch(
        request.post({
            url: GET_WEB_LIVECOUNT,
            payload,
            baseURLConnect: true,
            // loading: true,
            isToast: false,
            ok: ({ data }) => {
                            },
            fail: (err) => {},
        }),
    );
};

export const getPathAnalyser = (payload) => async (dispatch) => {
    return dispatch(
        request.post({
            url: GET_WEB_PATHANALYSER,
            payload,
            baseURLConnect: true,
            // loading: true,
            isToast: false,
            ok: ({ data }) => {
                            },
            fail: (err) => {},
        }),
    );
};
export const getPathAnalyserDDL = (payload) => async (dispatch) => {
    return dispatch(
        request.post({
            url: GET_PATHANALYSER_DDL,
            payload,
            // loading: true,
            isToast: false,
            ok: ({ data }) => {
            },
            fail: (err) => {},
        }),
    );
};
export const getMobilePathAnalyser = (payload) => async (dispatch) => {
    return dispatch(
        request.post({
            url: GET_MOBILE_PATHANALYSER,
            payload,
            baseURLConnect: true,
            // loading: true,
            isToast: false,
            ok: ({ data }) => {
                            },
            fail: (err) => {},
        }),
    );
};
