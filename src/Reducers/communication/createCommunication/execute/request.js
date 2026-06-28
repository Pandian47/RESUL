import { DELETE_FREQUENCY_CAP, GET_ADVANCED_CUSTOM_FIELDS, GET_BENCHMARK_BY_CAMPAIGN_ID, GET_CAMPAIGN_ANALYZE_LIST, GET_CAMPAIGN_ROI_DETAILS, GET_FREQUENCY_CAP, GET_FREQUENCY_CAP_EDIT, GET_LIMIT_LIST, SAVE_ADVANCE_ANALYTICS, SAVE_CAMPAIGN_ROI, SAVE_FREQUENCY_CAP, SAVE_LIMIT_LIST, UPDATE_CGTG_COMMUNICATION, UPDATE_SCRUB_RULES } from 'Constants/EndPoints';
import request from 'Utils/Http';

import { update_campaign_details, updateCampaignAnalyzeListLoading } from './reducer';

/** Pre-campaign execute uses page skeletons — pass `loading: false` to avoid global RSLoader. */
const resolveRequestGlobalLoading = (loading = true, isEnableLoader) =>
    isEnableLoader ?? loading;

export const getCampaignAnalyzeList =
    ({ payload, loading = false }) =>
    async (dispatch) => {
        dispatch(updateCampaignAnalyzeListLoading(true));
        return dispatch(
            request.post({
                url: GET_CAMPAIGN_ANALYZE_LIST,
                loading: resolveRequestGlobalLoading(loading),
                payload,
                ok: ({ data }) => {
                    const { status } = data;
                    dispatch(updateCampaignAnalyzeListLoading(false));
                    // if (status) {
                    //     // let types = {
                    //     //     S: 'Single dimensional',
                    //     //     M: 'Multi dimensional',
                    //     //     E: 'Event trigger',
                    //     // };
                    //     debugger
                    //     let tempData = {
                    //         ...data?.data,
                    //         //campaignType: types[data?.data?.campaignType],
                    //     };
                    //     dispatch(update_campaign_details({ field: 'campaignDetails', data: tempData }));
                    //     var channelDetails = [...data?.data?.channelDetails];
                    //     for (var i = 0; i < channelDetails?.length; i++) {
                    //         let name = TAB_HEADER_CONFIG[channelDetails[i]?.channelId];
                    //         dispatch(update_channel_details({ field: name, data: channelDetails[i] }));
                    //         dispatch(updateScrubRulesData({ field: name, data: channelDetails[i]?.scrubRules }))
                    //     }
                    // } else {
                    //     dispatch(update_campaign_details({ field: 'campaignDetails', data: {} }));
                    // }
                },
                fail: (err) => {
                    dispatch(updateCampaignAnalyzeListLoading(false));
                                    },
            }),
        );
    };

export const getAdvancedCustomFields =
    ({ payload, loading = false }) =>
    async (dispatch) =>
        dispatch(
            request.post({
                url: GET_ADVANCED_CUSTOM_FIELDS,
                payload,
                loading: resolveRequestGlobalLoading(loading),
                ok: ({ data }) => {
                    const { status } = data;
                    if (status === 'True' || status) {
                        dispatch(update_campaign_details({ field: 'advancedAnalyticsData', data: data?.data }));
                    } else {
                        dispatch(update_campaign_details({ field: 'advancedAnalyticsData', data: [] }));
                    }
                },
                fail: (err) => {
                                    },
            }),
        );

export const saveAdvanceAnalytics =
    ({ payload }, { loading = true } = {}) =>
    async (dispatch) =>
        dispatch(
            request.post({
                url: SAVE_ADVANCE_ANALYTICS,
                payload,
                loading,
                isFailureCheck: true,
                ok: ({ data }) => {
                    const { status } = data;
                },
                fail: (err) => {
                                    },
            }),
        );

export const updateScrubRules =
    ({ payload }, { loading = true } = {}) =>
    async (dispatch) =>
        dispatch(
            request.post({
                url: UPDATE_SCRUB_RULES,
                payload,
                loading,
                ok: ({ data }) => {
                    const { status } = data;
                },
                fail: (err) => {
                                    },
            }),
        );

export const getFrequencyCapOnOff =
    ({ payload, loading = false }) =>
    async (dispatch) => {
        return dispatch(
            request.post({
                url: GET_FREQUENCY_CAP,
                payload,
                loading: resolveRequestGlobalLoading(loading),
                ok: ({ data }) => {
                    const { status } = data;
                    if (status) dispatch(update_campaign_details({ field: 'frequencyCapDetails', data: data?.data }));
                    else dispatch(update_campaign_details({ field: 'frequencyCapDetails', data: [] }));
                },
                fail: (err) => {
                                    },
            }),
        );
    };

export const saveFrequencyCapping =
    ({ payload }, { loading = true } = {}) =>
    async (dispatch) =>
        dispatch(
            request.post({
                url: SAVE_FREQUENCY_CAP,
                payload,
                loading,
                isFailureCheck: true,
                ok: ({ data }) => {
                    const { status } = data;
                },
                fail: (err) => {
                                    },
            }),
        );

export const getROIContentData =
    ({ payload, loading = false }) =>
    async (dispatch) =>
        dispatch(
            request.post({
                url: GET_CAMPAIGN_ROI_DETAILS,
                payload,
                loading: resolveRequestGlobalLoading(loading),
                ok: ({ data }) => {
                    const { status } = data;
                    if (status === 'True' || status) {
                        dispatch(update_campaign_details({ field: 'roiContent', data: data?.data }));
                    } else {
                        dispatch(update_campaign_details({ field: 'roiContent', data: [] }));
                    }
                },
                fail: (err) => {
                                    },
            }),
        );

export const getBenchmarkValueById =
    ({ payload, loading = true, skipStoreUpdate = false }) =>
    async (dispatch) =>
        dispatch(
            request.post({
                url: GET_BENCHMARK_BY_CAMPAIGN_ID,
                payload,
                loading: resolveRequestGlobalLoading(loading),
                ok: ({ data }) => {
                    const { status } = data;
                    if (!skipStoreUpdate) {
                        if (status === 'True' || status) {
                            dispatch(
                                update_campaign_details({
                                    field: 'benchmarkPercentage',
                                    data: data?.data?.benchmarkPercentage,
                                }),
                            );
                        } else {
                            dispatch(update_campaign_details({ field: 'benchmarkPercentage', data: '' }));
                        }
                    }
                },
                fail: (err) => {
                                    },
            }),
        );

export const saveCampaignRoi =
    ({ payload }) =>
    async (dispatch) =>
        dispatch(
            request.post({
                url: SAVE_CAMPAIGN_ROI,
                payload,
                loading: true,
                isFailureCheck: true,
                ok: ({ data }) => {
                    const { status } = data;
                },
                fail: (err) => {
                },
            }),
        );

export const saveLimitList = (payload) => async (dispatch) => {
    return dispatch(
        request.post({
            url: SAVE_LIMIT_LIST,
            payload,
            loading: false,
            isFailureCheck: true,
            ok: ({ data }) => {
                const { status } = data;
                            },
            fail: (err) => {
                            },
        }),
    );
};

export const deleteFrequencyCapping = (payload, { loading = false } = {}) => async (dispatch) =>
    dispatch(
        request.post({
            url: DELETE_FREQUENCY_CAP,
            payload,
            loading,
            isFailureCheck: true,
            ok: ({ data }) => {
                const { status, message } = data;
            },
            fail: (err) => {
                            },
        }),
    );

export const getLimitListData =
    ({ loading = false, ...payload } = {}) =>
    async (dispatch) => {
    return dispatch(
        request.post({
            url: GET_LIMIT_LIST,
            loading: resolveRequestGlobalLoading(loading),
            payload,
            fail: (err) => {
                            },
        }),
    );
    };

export const getFrequencyCapData =
    ({ loading = false, ...payload } = {}) =>
    async (dispatch) => {
    return dispatch(
        request.post({
            url: GET_FREQUENCY_CAP_EDIT,
            loading: resolveRequestGlobalLoading(loading),
            payload,
            fail: (err) => {
                            },
        }),
    );
    };

export const updateCGTGCampaignValue = (payload, { loading = true } = {}) => async (dispatch) => {
    return dispatch(
        request.post({
            url: UPDATE_CGTG_COMMUNICATION,
            payload,
            loading,
            isFailureCheck: true,
            ok: (res) => {
                const {
                    data: { data, status },
                } = res;
                if (status) {
                                    }
            },
            fail: (err) => {
                            },
        }),
    );
};
