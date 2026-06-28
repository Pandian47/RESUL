import request from 'Utils/Http';
import {
    GET_RECIPIENT_COMMUNICATION,
    GET_MDC_CANVAS_TEMPLATE_LIST,
    SAVE_MDC_CANVAS_DATA,
    GET_MDC_CANVAS_DATA,
    GET_MDC_CHANNEL_RESPONSE_DATA,
    SAVE_CHANNEL_FRIENDLY_NAME,
    UPDATE_CASCADING_SCHEDULE,
    GET_MDC_CANVAS_FLOW_CONFIG,
    DELETE_MDC_CHANNELS,
    SAVE_AS_TEMPLATE_MDC,
    UPDATE_ALL_OR_ANY,
    GET_SELECTED_MDC_TEMPLATE_DATA,
    GET_SUBSCRIPTION_ACTIVE_FORM,
    GET_CONVERSION_CATEGORY,
    SET_LANDING_PAGE,
    GET_LANDING_PAGE,
    GET_DYNAMIC_LIST_COMMUNICATION,
    GET_WEBHOOK_LIST,
    GET_WEBHOOK_ATTRIBUTE_NAME,
    SAVE_WEBHOOK,
    GET_WEBHOOK,
    ADD_OR_REMOVE_ATTR,
    SAVE_TRIGGER_CANVAS_DATA,
    SAVE_PRIORITY_SEGMENTS,
    UPSERT_SUB_SEGMENT_JOURNEY,
    SUBSEGMENT_AGANIST_CHANNEL_COUNT_ADHOCLIST,
    SUBSEGMENT_AGANIST_CHANNEL_COUNT_TARGETLIST,
    SUBSEGMENT_DISABLE_CHANNELS,
    SUBSEGMENT_ENABLE_CHANNELS,
    GET_MDC_OFFLINE_CONVERSION_EDIT,
} from 'Constants/EndPoints';
import { updateRecipientList, setMdcFlowConfig, updateDynamicList } from './reducer';
import { updateOfflineConversion, updateVoiceList } from '../../Create/reducer';

export const getRecipientList =
    ({ payload, loading = false }) =>
    async (dispatch) =>
        dispatch(
            request.post({
                url: GET_RECIPIENT_COMMUNICATION,
                payload,
                loading,
                ok: (rslt) => {
                                        let {
                        data: { data },
                        status,
                        message,
                    } = rslt;
                    if (status) {
                        dispatch(updateRecipientList(data));
                    } else {
                        dispatch(updateRecipientList([]));
                    }
                },
                fail: (err) => {
                                    },
                retry: 0,
                final: () => {},
            }),
        );

export const getDynamicList =
    ({ payload, loading = false }) =>
    async (dispatch) =>
        dispatch(
            request.post({
                url: GET_DYNAMIC_LIST_COMMUNICATION,
                payload,
                loading,
                ok: ({ data }) => {
                    const { data: res, status } = data;
                    if (status) {
                        dispatch(updateDynamicList(res));
                    } else {
                        dispatch(updateDynamicList([]));
                    }
                },
                fail: (err) => {
                                    },
                retry: 0,
                final: () => {},
            }),
        );
export const getMdcCanvasTemplateList =
    ({ payload, loading = false }) =>
    async (dispatch) =>
        dispatch(
            request.post({
                url: GET_MDC_CANVAS_TEMPLATE_LIST,
                payload,
                loading,
                ok: ({ data }) => {
                    const { status, data: templateList } = data;
                    if (status && Array.isArray(templateList)) {
                        return { status: true, data: templateList };
                    }
                    return { status: false, data: [] };
                },
                fail: () => ({ status: false, data: [] }),
                retry: 0,
                final: () => {},
            }),
        );
export const saveMdcCanvasData =
    ({ saveCanvasPayload }) =>
    async (dispatch) =>
        dispatch(
            request.post({
                url: SAVE_MDC_CANVAS_DATA,
                payload: saveCanvasPayload,
                loading: false,
                ok: ({ data }) => {
                                    },
                fail: (err) => {
                                    },
                retry: 0,
                final: () => {},
            }),
        );
export const getMdcCanvasData =
    ({ payload, loading = false }) =>
    async (dispatch) =>
        dispatch(
            request.post({
                url: GET_MDC_CANVAS_DATA,
                payload,
                loading,
                ok: ({ data }) => {
                                    },
            }),
        );
export const getMdcChannelResponseData =
    ({ payload, loading = false }) =>
    async (dispatch) =>
        dispatch(
            request.post({
                url: GET_MDC_CHANNEL_RESPONSE_DATA,
                payload,
                loading,
                ok: ({ data }) => {
                                    },
            }),
        );
export const saveChannelFriendlyName =
    ({ payload, loading = false }) =>
    async (dispatch) =>
        dispatch(
            request.post({
                url: SAVE_CHANNEL_FRIENDLY_NAME,
                payload,
                loading,
                ok: ({ data }) => {
                                    },
                fail: (err) => {
                                    },
                retry: 0,
                final: () => {},
            }),
        );

export const updateCascadingSchedule =
    ({ payload }) =>
    async (dispatch) =>
        dispatch(
            request.post({
                url: UPDATE_CASCADING_SCHEDULE,
                payload,
                loading: true,
                ok: ({ data }) => {
                                    },
                fail: (err) => {
                                    },
                retry: 0,
                final: () => {},
            }),
        );

export const getMdcFlowConfig =
    ({ payload, loading = false }) =>
    async (dispatch) =>
        dispatch(
            request.post({
                url: GET_MDC_CANVAS_FLOW_CONFIG,
                payload,
                loading,
                ok: ({ data }) => {
                                        const { data: flowConfig, message, status } = data;

                    if (status) {
                        dispatch(setMdcFlowConfig(flowConfig[0]));
                    }
                },
                fail: (err) => {
                                    },
                retry: 0,
                final: () => {},
            }),
        );
export const deletMdcChannels =
    ({ payload, loading = false }) =>
    async (dispatch) =>
        dispatch(
            request.post({
                url: DELETE_MDC_CHANNELS,
                payload,
                loading,
                ok: ({ data }) => {
                                    },
                fail: (err) => {
                                    },
                retry: 0,
                final: () => {},
            }),
        );
export const mdcSaveAsTemplate =
    ({ payload, loading = false }) =>
    async (dispatch) =>
        dispatch(
            request.post({
                url: SAVE_AS_TEMPLATE_MDC,
                payload,
                loading,
                ok: ({ data }) => {
                                    },
                fail: (err) => {
                                    },
                retry: 0,
                final: () => {},
            }),
        );
export const getSelectedMdcTemplateData =
    ({ payload, loading = false }) =>
    async (dispatch) =>
        dispatch(
            request.post({
                url: GET_SELECTED_MDC_TEMPLATE_DATA,
                payload,
                loading,
                ok: ({ data }) => {
                                    },
            }),
        );

export const updatAllOrAny =
    ({ payload }) =>
    async (dispatch) =>
        dispatch(
            request.post({
                url: UPDATE_ALL_OR_ANY,
                payload,
                loading: true,
                ok: ({ data }) => {
                                    },
            }),
        );

export const getSubscriptionActiveForm =
    ({ payload, loading = true }) =>
    async (dispatch) =>
        dispatch(
            request.post({
                url: GET_SUBSCRIPTION_ACTIVE_FORM,
                payload,
                loading,
                ok: ({ data }) => {
                                    },
                fail: (err) => {
                                    },
                retry: 1,
                final: () => {},
            }),
        );
export const getConversionCategory =
    ({ payload, loading = true }) =>
    async (dispatch) =>
        dispatch(
            request.post({
                url: GET_CONVERSION_CATEGORY,
                payload,
                loading,
                ok: ({ data }) => {
                                    },
                fail: (err) => {
                                    },
                retry: 1,
                final: () => {},
            }),
        );
export const SetLandingPage =
    ({ payload, loading = true }) =>
    async (dispatch) =>
        dispatch(
            request.post({
                url: SET_LANDING_PAGE,
                payload,
                loading,
                ok: ({ data }) => {
                                    },
                fail: (err) => {
                                    },
                retry: 0,
                final: () => {},
            }),
        );
export const GetLandingPage =
    ({ payload, loading = true }) =>
    async (dispatch) =>
        dispatch(
            request.post({
                url: GET_LANDING_PAGE,
                payload,
                loading,
                ok: ({ data }) => {
                                    },
                fail: (err) => {
                                    },
                retry: 0,
                final: () => {},
            }),
        );
export const getWebhookList =
    ({ payload, loading = true }) =>
    async (dispatch) =>
        dispatch(
            request.post({
                url: GET_WEBHOOK_LIST,
                payload,
                loading,
                ok: ({ data }) => {
                                        const { data: response, status } = data;
                    const res = status ? response : [];
                    dispatch(updateVoiceList({ data: res, field: 'vendorList' }));
                },
            }),
        );
export const getWebhookAttributeList =
    ({ payload }) =>
    async (dispatch) =>
        dispatch(
            request.post({
                url: GET_WEBHOOK_ATTRIBUTE_NAME,
                payload,
                loading: true,
                ok: ({ data }) => {
                                    },
            }),
        );
export const SaveWebhookCommunication =
    ({ payload }) =>
    async (dispatch) =>
        dispatch(
            request.post({
                url: SAVE_WEBHOOK,
                payload,
                loading: true,
                ok: ({ data }) => {
                                    },
                fail: (err) => {
                                    },
                retry: 0,
                final: () => {},
            }),
        );
export const getWebhookCommunicationById =
    ({ payload }) =>
    async (dispatch) =>
        dispatch(
            request.post({
                url: GET_WEBHOOK,
                payload,
                loading: true,
                ok: ({ data }) => {
                                    },
            }),
        );
export const addOrRemoveAttr =
    ({ payload }) =>
    async (dispatch) =>
        dispatch(
            request.post({
                url: ADD_OR_REMOVE_ATTR,
                payload,
                loading: true,
                ok: ({ data }) => {
                                    },
            }),
        );
export const SaveTriggerCanvasData =
    ({ payload, loading = false }) =>
    async (dispatch) =>
        dispatch(
            request.post({
                url: SAVE_TRIGGER_CANVAS_DATA,
                payload,
                loading,
                ok: ({ data }) => {
                                    },
            }),
        );

export const UpsertSubSegmentJourney =
    ({ payload, loading = false }) =>
    async (dispatch) =>
        dispatch(
            request.post({
                url: UPSERT_SUB_SEGMENT_JOURNEY,
                payload,
                loading,
                ok: ({ data }) => {
                                    },
            }),
        );
export const SavePrioritySegments =
    ({ payload, loading = false }) =>
    async (dispatch) =>
        dispatch(
            request.post({
                url: SAVE_PRIORITY_SEGMENTS,
                payload,
                loading,
                ok: ({ data }) => {
                                    },
            }),
        );
export const subsegmentAgainstChannelCountAdhocList =
    ({ payload, loading = false }) =>
    async (dispatch) =>
        dispatch(
            request.post({
                url: SUBSEGMENT_AGANIST_CHANNEL_COUNT_ADHOCLIST,
                payload,
                loading,
                ok: ({ data }) => {
                                    },
            }),
        );
export const subsegmentAgainstChannelCountTargetList =
    ({ payload, loading = false }) =>
    async (dispatch) =>
        dispatch(
            request.post({
                url: SUBSEGMENT_AGANIST_CHANNEL_COUNT_TARGETLIST,
                payload,
                loading,
                ok: ({ data }) => {
                                    },
            }),
        );
export const subsegmentDisableChannels =
    ({ payload, loading = false }) =>
    async (dispatch) =>
        dispatch(
            request.post({
                url: SUBSEGMENT_DISABLE_CHANNELS,
                payload,
                loading,
                ok: ({ data }) => {
                                    },
            }),
        );
export const subsegmentEnableChannels =
    ({ payload, loading = false }) =>
    async (dispatch) =>
        dispatch(
            request.post({
                url: SUBSEGMENT_ENABLE_CHANNELS,
                payload,
                loading,
                ok: ({ data }) => {
                                    },
            }),
        );

export const GetMDCOfflineConversionDetails = (payload) => async (dispatch) => {
    return dispatch(
        request.post({
            url: GET_MDC_OFFLINE_CONVERSION_EDIT,
            payload,
            loading: true,
            ok: ({ data }) => {
                const { data: res, status } = data;
                const response = status ? res : [];
                dispatch(
                    updateOfflineConversion({
                        data: response,
                        field: 'OfflineConversionEdit',
                    }),
                );
            },
        }),
    );
};
