import { ANALYTICS_LISTNAME_SEARCH, GET_ANALYTICS_QUERY_OPTIONS, GET_COMMUNICATION_ATTRIBUTES, GET_COMMUNICATION_INFO_GRID_TWINS, GET_COMMUNICATION_INFO_LIST_TWINS, GET_COMMUNICATION_PRODUCTS, GET_COMMUNICATION_SUMMARY_LIST_TWINS, SAVE_RETARGETLIST } from 'Constants/EndPoints';
import request from 'Utils/Http';

import {
    EMPTY_ANALYTICS_SUMMARY_DATA,
    normalizeAnalyticsSummaryResponse,
} from 'Pages/AuthenticationModule/Analytics/analyticsDefaults';
import { updateListFailure, updateListLoading, updateListingList, updateGridLoading } from './reducer';
import { resetCSRState } from '../analyticsSummary/reducer';

let communicationSummaryListRequestIdTwins = 0;
let communicationSummaryGridRequestIdTwins = 0;

export const getCommunicationAnalyticsList = (payload) => async (dispatch) => {
    const requestId = ++communicationSummaryListRequestIdTwins;
    dispatch(updateListLoading(true));
    return dispatch(
        request.post({
            url: GET_COMMUNICATION_SUMMARY_LIST_TWINS,
            payload,
            //loading: true,
            ok: ({ data }) => {
                if (requestId !== communicationSummaryListRequestIdTwins) return;
                const { status, data: response } = data;
                if (status) {
                    dispatch(resetCSRState());
                    dispatch(updateListingList(normalizeAnalyticsSummaryResponse(response)));
                    dispatch(updateListLoading(false));
                } else {
                    dispatch(resetCSRState());
                    dispatch(updateListingList({ ...EMPTY_ANALYTICS_SUMMARY_DATA }));
                    dispatch(updateListFailure(true));
                    dispatch(updateListLoading(false));
                }
            },
            fail: () => {
                if (requestId !== communicationSummaryListRequestIdTwins) return;
                dispatch(updateListingList({ ...EMPTY_ANALYTICS_SUMMARY_DATA }));
                dispatch(updateListFailure(true));
                dispatch(updateListLoading(false));
            },
        }),
    );
};

export const communicationAttributes = (payload, loading = true) => async (dispatch) => {
    return dispatch(
        request.post({
            url: GET_COMMUNICATION_ATTRIBUTES,
            payload,
            loading: loading,
            ok: () => {},
            fail: (err) => {},
        }),
    );
};

export const getCommunicationProductsList = (payload, loading = true) => async (dispatch) => {
    return dispatch(
        request.post({
            url: GET_COMMUNICATION_PRODUCTS,
            payload,
            loading: loading,
            ok: () => {},
            fail: (err) => {},
        }),
    );
};

export const getAnalyticsInfoList = ({ payload, loading = false } = {}) => async (dispatch) => {
    return dispatch(
        request.post({
            url: GET_COMMUNICATION_INFO_LIST_TWINS,
            payload,
            loading,
            ok: ({ data }) => {},
            fail: (err) => {},
        }),
    );
};

export const analyticsListNameSearch = ({payload}) => async (dispatch) => {
    return dispatch(
        request.post({
            url: ANALYTICS_LISTNAME_SEARCH,
            payload,
            loading: true,
            ok: ({ data }) => {},
            fail: (err) => {},
        }),
    );
};

export const getAnalyticsQueryOptions =
    ({ payload, loading = false }) =>
    async (dispatch) =>
        dispatch(
            request.post({
                url: GET_ANALYTICS_QUERY_OPTIONS,
                payload,
                loading,
                ok: () => {},
                fail: () => {},
            }),
        );
export const getAnalyticsInfoGrid = (payload, loading = true) => async (dispatch) => {
    const requestId = ++communicationSummaryGridRequestIdTwins;
    dispatch(updateGridLoading(true));
    return dispatch(
        request.post({
            url: GET_COMMUNICATION_INFO_GRID_TWINS,
            payload,
            loading: loading,
            ok: ({ data }) => {
                if (requestId !== communicationSummaryGridRequestIdTwins) return;
                dispatch(updateGridLoading(false));
            },
            fail: (err) => {
                if (requestId !== communicationSummaryGridRequestIdTwins) return;
                dispatch(updateGridLoading(false));
            },
        }),
    );
};

export const save_Retargetlist = ({ payload, setError, name,clearErrors }) => async (dispatch) => {
    return dispatch(
        request.post({
            url: SAVE_RETARGETLIST,
            payload,
            loading: false,
             ok: ({ data }) => {
                    // if (data.status) {
                    //     setError(name, {
                    //         type: 'server',
                    //         message: data.message,
                    //     });
                    // }else{
                    //     clearErrors(name)
                    // }
                },
                fail: (err) => {},
        }),
    );
};
