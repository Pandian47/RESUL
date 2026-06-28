import { CONSUMPTION_COMMUNICATION_SENT, CONSUMPTION_CSV_REPORT_API, CONSUMPTION_CSV_REPORT_DOWNLOAD, CONSUMPTION_TWIN_ACCOUNT_STATUS, CONSUMPTION_TWIN_DOWNLOAD_ACTIVITY_LIST_CSV, CONSUMPTION_TWIN_GET_ACC_DB_CONSUMPTION, CONSUMPTION_TWIN_GET_CONSUMPTION_DETAILS, CONSUMPTION_TWIN_GET_CONSUMPTION_STATUS, CONSUMPTION_TWIN_GET_LINE_CART, VERSAR_CONSUMPTION } from 'Constants/EndPoints';
import request from 'Utils/Http';

import { setConsumptionChannelLoading } from './reducer';

export const getConsumptionDetails = (payload) => async (dispatch) => {
    return dispatch(
        request.post({
            url: CONSUMPTION_TWIN_ACCOUNT_STATUS,
            payload,
            loading: false,
            ok: () => {},
            fail: (err) => {},
            // ok: (res) => {
            //     const {
            //         data: { data, status },
            //     } = res;
            //     // if (status) {
            //     //     dispatch(consumptionData(data));
            //     // }
            // },
            // fail: (err) => {
            //     console.log('@@@ Consumptions get info : ', err);
            // },
        }),
    );
};

export const getConsumptionChannelDetails = (payload) => async (dispatch) => {
    dispatch(setConsumptionChannelLoading(true));
    const result = await dispatch(
        request.post({
            url: CONSUMPTION_TWIN_GET_CONSUMPTION_DETAILS,
            payload,
            // loading: true,
            ok: () => {},
            fail: (err) => {},
            // ok: (res) => {
            //     const {
            //         data: { data, status },
            //     } = res;
            //     // if (status) {
            //     //     dispatch(consumptionData(data));
            //     // }
            // },
            // fail: (err) => {
            //     console.log('@@@ Consumptions get info : ', err);
            // },
        }),
    );
    setTimeout(() => {
        dispatch(setConsumptionChannelLoading(false));
    }, 1000);
    
    return result;
};

export const getConsumptionStatus = (payload) => async (dispatch) => {
    return dispatch(
        request.post({
            url: CONSUMPTION_TWIN_GET_CONSUMPTION_STATUS,
            payload,
            loading: false,
            ok: () => {},
            fail: (err) => {},
        }),
    );
};
export const getConsumptionAccountDb = (payload) => async (dispatch) => {
    return dispatch(
        request.post({
            url: CONSUMPTION_TWIN_GET_ACC_DB_CONSUMPTION,
            payload,
            loading: false,
            ok: () => {},
            fail: (err) => {},
        }),
    );
};
export const getConsumptionChannelDetailsDownload = (payload) => async (dispatch) => {
    return dispatch(
        request.post({
            url: CONSUMPTION_TWIN_DOWNLOAD_ACTIVITY_LIST_CSV,
            payload,
            loading: true,
            ok: () => {},
            fail: (err) => {},
           
        }),
    );
};
export const getConsumptionCsvReport = (payload) => async (dispatch) => {
    return dispatch(
        request.post({
            url: CONSUMPTION_CSV_REPORT_API,
            payload,
            loading: false,
            ok: () => {},
            fail: (err) => {},
        }),
    );
};
export const getConsumptionCsvReportDownload = (payload) => async (dispatch) => {
    return dispatch(
        request.post({
            url: CONSUMPTION_CSV_REPORT_DOWNLOAD,
            payload,
            loading: true,
            config: {
                responseType: 'text', // Ensure response is treated as text to preserve encoding
            },
            ok: () => {},
            fail: (err) => {},
        }),
    );
};
export const getConsumptionCommunicationSent = (payload) => async (dispatch) => {
    return dispatch(
        request.post({
            url: CONSUMPTION_COMMUNICATION_SENT,
            payload,
            loading: false,
            ok: () => {},
            fail: (err) => {},
        }),
    );
};

export const getVersarConsumption = (payload) => async (dispatch) => {
    return dispatch(
        request.post({
            url: VERSAR_CONSUMPTION,
            payload,
            loading: false,
            ok: () => {},
            fail: (err) => {},
        }),
    );
};
export const getLineChart = (payload) => async (dispatch) => {
    return dispatch(
        request.post({
            url: CONSUMPTION_TWIN_GET_LINE_CART,
            payload,
            loading: false,
            ok: () => {},
            fail: (err) => {},
        }),
    );
};