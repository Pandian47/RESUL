import { ADD_COMMUNICATION_TYPES, BENCHMAKR_LIST, CHECK_ACCOUNT_ATTRIBUTE_EXISTS, GET_BENCHMARK_LIST, GET_COMMUNICATION_ATTRIBUTES, ISNAME_EXITS, UPDATE_BENCHMARK_DETAILS } from 'Constants/EndPoints';
import request from 'Utils/Http';
import { updateBenchmarkOverview } from './reducer';

export const getBenchMarkList =
    ({ payload }) =>
        async (dispatch) => {
            dispatch(updateBenchmarkOverview({ field: 'isLoading', data: true }));
            dispatch(
                request.post({
                    url: BENCHMAKR_LIST,
                    payload,
                    loading: false,
                    ok: (res) => {
                        const { status, data } = res?.data;
                        if (status) {
                            dispatch(updateBenchmarkOverview({ field: 'benchmarkOverview', data: data }));
                        } else {
                            dispatch(updateBenchmarkOverview({ field: 'benchmarkOverview', data: [] }));
                        }
                    },
                    fail: (err) => {
                                            },
                    final: () => {
                        dispatch(updateBenchmarkOverview({ field: 'isLoading', data: false }));
                    },
                }),
            );
        };

export const getBenchMarkAndGoalsList =
    ({ payload }) =>
        async (dispatch) => {
            return dispatch(
                request.post({
                    url: GET_BENCHMARK_LIST,
                    payload,
                    loading: false,
                    isFailureCheck: true,
                    ok: (res) => {
                        const { status, data } = res?.data;
                        if (status) {
                            dispatch(updateBenchmarkOverview({ field: 'benchmarkAndGols', data: data }));
                        } else {
                            dispatch(updateBenchmarkOverview({ field: 'benchmarkAndGols', data: [] }));
                        }
                    },
                    fail: (err) => {},
                }),
            );
        };

export const communicationAttributesBenchmark =
    (payload) =>
        async (dispatch) => {
            return dispatch(
                request.post({
                    url: GET_COMMUNICATION_ATTRIBUTES,
                    payload,
                    // loading: true,
                    ok: (res) => {
                        const { status, data } = res?.data;
                        if (status) {
                            dispatch(updateBenchmarkOverview({ field: 'attributesData', data: data }));
                        } else {
                            dispatch(updateBenchmarkOverview({ field: 'attributesData', data: [] }));
                        }
                    },
                    fail: (err) => {},
                }),
            );
        };
export const communicationAttributes_ADD =
    (payload) =>
        async (dispatch) => {
            return dispatch(
                request.post({
                    url: ADD_COMMUNICATION_TYPES,
                    payload,
                    loading: true,
                    ok: (res) => {
                    },
                    fail: (err) => {},
                }),
            );
        };

export const SaveBenchmark =
    (payload,loading) =>
        async (dispatch) => {
            return dispatch(
                request.post({
                    url: UPDATE_BENCHMARK_DETAILS,
                    payload,
                    loading: loading ?? true,
                    isFailureCheck: true,
                    ok: (res) => { },
                    fail: (err) => {},
                }),
            );
        };

export const CheckIsNameExit =
    ({ payload }) =>
        async (dispatch) => {
            return dispatch(
                request.post({
                    url: ISNAME_EXITS,
                    payload,
                    // loading: true,
                    ok: (res) => { },
                    fail: (err) => {},
                }),
            );
        };

export const CheckAccountAttributeExists =
    (payload) =>
    async (dispatch) => {
        return dispatch(
            request.post({
                url: CHECK_ACCOUNT_ATTRIBUTE_EXISTS,
                payload,
                loading: true,
                ok: (res) => { },
                fail: (err) => {},
            }),
        );
};