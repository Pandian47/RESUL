import { CONSUMPTION_ACCOUNT_DB, CONSUMPTION_CHANNEL_DETAILS, CONSUMPTION_CHANNEL_DETAILS_DOWNLOAD, CONSUMPTION_COMMUNICATION_SENT, CONSUMPTION_COUNT, CONSUMPTION_CSV_REPORT_API, CONSUMPTION_CSV_REPORT_DOWNLOAD, CONSUMPTION_STATUS, GET_LINE_CART, SFTP_CONSUMPTION, VERSAR_CONSUMPTION } from 'Constants/EndPoints';
import request from 'Utils/Http';

import { setConsumptionChannelLoading } from './reducer';

export const getConsumptionDetails = (payload) => async (dispatch) => {
    return dispatch(
        request.post({
            url: CONSUMPTION_COUNT,
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
            url: CONSUMPTION_CHANNEL_DETAILS,
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
            url: CONSUMPTION_STATUS,
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
            url: CONSUMPTION_ACCOUNT_DB,
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
            url: CONSUMPTION_CHANNEL_DETAILS_DOWNLOAD,
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

export const getSftpConsumption = (payload) => async (dispatch) => {
    return dispatch(
        request.post({
            url: SFTP_CONSUMPTION,
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
            url: GET_LINE_CART,
            payload,
            loading: false,
            ok: () => {},
            fail: (err) => {},
        }),
    );
};