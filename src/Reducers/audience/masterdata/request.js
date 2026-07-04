import { GET_AUDIENCE_GRID, GET_LIST_ACQUISITION, GET_RECOMMENDATION_JSON, IS_PARTNER_DATA_ENABLE, MASTER_DATA_AUDIENCE, MASTER_DATA_GET_AUDIENCE_LIST_ATTRIBUTES, MASTER_DATA_MAKE_ACQUISITION, MASTER_DATA_RECIPIENT_ACQUISITION, MASTER_DATA_UPDATE_AUDIENCE_LIST_ATTRIBUTES } from 'Constants/EndPoints';
import request from 'Utils/Http';

import { update_master_audience_data, update_MDM_field, update_errors, update_MDM_loading, reset_mdm } from './reducer';
import { updateUserDetailsPartnerFlag } from 'Utils/modules/crypto';
import { ensureArray, normalizeMdmAudienceGrid } from 'Pages/AuthenticationModule/Audience/audienceDefaults';

const getApiPayload = (res) => {
    const responseData = res?.data;
    return {
        data: responseData?.data,
        status: responseData?.status,
        message: responseData?.message ?? 'No data available',
    };
};

let listAcquisitionChartRequestSeq = 0;
let recipientAcquisitionRequestSeq = 0;

const beginListAcquisitionChartRequest = (dispatch, getState) => {
    const requestId = ++listAcquisitionChartRequestSeq;
    const { listAcquisitionChart = {} } = getState?.()?.masterDataReducer ?? {};
    dispatch(update_MDM_loading({ field: 'listAcquisitionChartLoading', status: true }));
    dispatch(update_MDM_field({ field: 'listAcquisitionApiData', data: null }));
    dispatch(update_MDM_field({ field: 'isListAcquisitionApiSuccess', data: false }));
    dispatch(
        update_MDM_field({
            field: 'listAcquisitionChart',
            data: {
                ...listAcquisitionChart,
                recipientListSeries: [],
                dateRanges: [],
            },
        }),
    );
    return requestId;
};

const endListAcquisitionChartRequest = (dispatch, requestId) => {
    if (requestId === listAcquisitionChartRequestSeq) {
        dispatch(update_MDM_loading({ field: 'listAcquisitionChartLoading', status: false }));
    }
};

const isStaleListAcquisitionChartRequest = (requestId) => requestId !== listAcquisitionChartRequestSeq;

const beginRecipientAcquisitionRequest = (dispatch) => {
    const requestId = ++recipientAcquisitionRequestSeq;
    dispatch(update_MDM_field({ field: 'recipientAcquisition', data: [] }));
    return requestId;
};

const isStaleRecipientAcquisitionRequest = (requestId) => requestId !== recipientAcquisitionRequestSeq;

export const getIsPartnerDataEnable = (payload) => async (dispatch) => {
    const depId = payload?.departmentId;
    return dispatch(
        request.post({
            url: IS_PARTNER_DATA_ENABLE,
            payload: { departmentId: payload.departmentId, clientId: payload.clientId, userId: payload.userId },
            loading: false,
            ok: (res) => {
                const { data: resData } = res;
                const enabled = resData?.data === true;
                updateUserDetailsPartnerFlag({ [depId]: enabled });
            },
            fail: () => {
                updateUserDetailsPartnerFlag({ [depId]: false });
            },
        }),
    );
};

export const getMasterDataAudience = (payload) => async (dispatch) => {
    dispatch(update_MDM_loading({ field: 'audienceOverviewLoading', status: true }));
    return dispatch(
        request.post({
            url: MASTER_DATA_AUDIENCE,
            payload,
            loading: false,
            ok: (res) => {
                const responseData = res?.data;
                const data = responseData?.data;
                const status = responseData?.status;

                if (status && data && typeof data === 'object') {
                    dispatch(update_master_audience_data(data));
                    const listData = data?.audienceDashboardJson?.recipientListModel;
                    dispatch(
                        update_MDM_field({
                            field: 'listAcquisitionChart',
                            data: {
                                allImportedSources: ensureArray(listData?.allImportedSources),
                                dateRanges: ensureArray(listData?.recipientListSeriess?.dateRanges),
                                recipientListSeries: ensureArray(listData?.recipientListSeriess?.recipientListSeries),
                            },
                        }),
                    );
                    dispatch(
                        update_MDM_field({
                            field: 'recipientAcquisition',
                            data: Array.isArray(listData?.recipientListAcquisition)
                                ? listData.recipientListAcquisition
                                : [],
                        }),
                    );
                } else {
                    dispatch(reset_mdm());
                }
            },
            fail: () => {
                dispatch(reset_mdm());
            },
            final: () => dispatch(update_MDM_loading({ field: 'audienceOverviewLoading', status: false })),
        }),
    );
};
export const getMasterGridData = (payload) => async (dispatch) => {
    dispatch(update_MDM_loading({ field: 'audienceGridLoading', status: true }));
    return dispatch(
        request.post({
            url: GET_AUDIENCE_GRID,
            payload,
            loading: false,
            ok: (res) => {
                const responseData = res?.data;
                const data = responseData?.data;
                const status = responseData?.status;

                if (status && data && typeof data === 'object') {
                    dispatch(update_MDM_field({ field: 'audienceGrid', data: normalizeMdmAudienceGrid(data) }));
                } else {
                    dispatch(update_MDM_field({ field: 'audienceGrid', data: {} }));
                }
            },
            fail: () => {
                dispatch(update_MDM_field({ field: 'audienceGrid', data: {} }));
            },
            final: () => {dispatch(update_MDM_loading({ field: 'audienceGridLoading', status: false }));},
        }),
    );
};
export const getRecepientAcquisitions = (payload) => async (dispatch) => {
    const requestId = beginRecipientAcquisitionRequest(dispatch);
    return dispatch(
        request.post({
            url: MASTER_DATA_RECIPIENT_ACQUISITION,
            payload,
            loading: false,
            ok: (res) => {
                if (isStaleRecipientAcquisitionRequest(requestId)) return;
                const { data, status, message } = getApiPayload(res);
                if (status && Array.isArray(data)) {
                    dispatch(update_MDM_field({ field: 'recipientAcquisition', data: data }));
                } else {
                    dispatch(update_MDM_field({ field: 'recipientAcquisition', data: [] }));
                    dispatch(update_errors({ field: 'recipientAcquisition', error: message }));
                }
            },
            fail: (err) => {
                if (isStaleRecipientAcquisitionRequest(requestId)) return;
                dispatch(update_MDM_field({ field: 'recipientAcquisition', data: [] }));
                dispatch(update_errors({ field: 'recipientAcquisition', error: String(err) }));
            },
        }),
    );
};

export const makeAcquisitionNote = (payload, refreshPayload) => async (dispatch) => {
    return dispatch(
        request.post({
            url: MASTER_DATA_MAKE_ACQUISITION,
            payload,
            loading: false,
            ok: (res) => {
                const { status } = getApiPayload(res);
                if (status) {
                    const recepientPayload = refreshPayload || {
                        departmentId: payload.departmentId,
                        clientId: payload.clientId,
                        userId: payload.userId,
                        activityType: payload.activityType,
                    };
                    dispatch(getRecepientAcquisitions(recepientPayload));
                }
            },
            fail: () => {},
        }),
    );
};

export const getAudienceListAttributes = (payload) => async (dispatch) => {
    dispatch(
        request.post({
            url: MASTER_DATA_GET_AUDIENCE_LIST_ATTRIBUTES,
            payload,
            ok: (res) => {
                const { data, status } = getApiPayload(res);
                if (status && data != null) {
                    dispatch(update_MDM_field({ field: 'audienceListAttrs', data: data }));
                } else {
                    dispatch(update_MDM_field({ field: 'audienceListAttrs', data: [] }));
                }
            },
            fail: () => {
                dispatch(update_MDM_field({ field: 'audienceListAttrs', data: [] }));
            },
        }),
    );
};

export const updateAudienceListAttributes = (payload) => async (dispatch) => {
    return dispatch(
        request.post({
            url: MASTER_DATA_UPDATE_AUDIENCE_LIST_ATTRIBUTES,
            payload,
            ok: () => {},
            fail: (err) => {},
        }),
    );
};

export const getListAcquisition = (payload) => async (dispatch, getState) => {
    const requestId = beginListAcquisitionChartRequest(dispatch, getState);
    return dispatch(
        request.post({
            url: GET_LIST_ACQUISITION,
            payload,
            loading: false,
            ok: (res) => {
                if (isStaleListAcquisitionChartRequest(requestId)) return;
                const { data, status, message } = getApiPayload(res);
                if (status && data != null) {
                    dispatch(update_MDM_field({ field: 'listAcquisitionApiData', data: data }));
                    dispatch(update_MDM_field({ field: 'isListAcquisitionApiSuccess', data: true }));
                } else {
                    dispatch(update_MDM_field({ field: 'listAcquisitionApiData', data: null }));
                    dispatch(update_MDM_field({ field: 'isListAcquisitionApiSuccess', data: false }));
                    dispatch(update_errors({ field: 'listAcquisitionApiData', error: message }));
                }
            },
            fail: (err) => {
                if (isStaleListAcquisitionChartRequest(requestId)) return;
                dispatch(update_MDM_field({ field: 'listAcquisitionApiData', data: null }));
                dispatch(update_MDM_field({ field: 'isListAcquisitionApiSuccess', data: false }));
                dispatch(update_errors({ field: 'listAcquisitionApiData', error: String(err) }));
            },
            final: () => endListAcquisitionChartRequest(dispatch, requestId),
        }),
    );
};
export const getRecommendationJson = (payload) => async (dispatch) => {
    return dispatch(
        request.post({
            url: GET_RECOMMENDATION_JSON,
            payload,
            ok: (res) => {
                const {
                    data: { data, status },
                } = res;
                if (status) {
                    dispatch(update_MDM_field({ field: 'recommendationJson', data: data }));
                } else {
                    dispatch(update_MDM_field({ field: 'recommendationJson', data: [] }));
                }
            },
            fail: (err) => {},
        }),
    );
};