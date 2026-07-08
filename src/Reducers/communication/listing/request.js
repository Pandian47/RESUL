import { ARHIVE_COMMUNICATION, DUPLICATE_COMMUNICATION, GET_CAMPAIGN_MAKE_CHANGES, GET_CAMPAIGN_REJECTS_COMMENTS,MDC_DUPLICATE_COMMUNICATION, GET_CAMPAINGN_STATUS_EXTENSION, GET_COMMUNICATION_LIST_EXTENSION, GET_COMM_SPLITAB_PROCESS_RECIPIENTS, GET_COMM_SPLIT_POPUP, GET_COMM_TAGS, GET_LISTING_USER_LIST, GET_PREVIEW_BY_CHANNEL, LISTNAME_SEARCH, TIGGER_PAUSE_AND_PLAY_CAMPAIGN, UNARHIVE_COMMUNICATION, DELETE_CHANNEL_BY_ID } from 'Constants/EndPoints';
import request from 'Utils/Http';

import {
    EMPTY_COMMUNICATION_LISTING_DATA,
    normalizeCommunicationListingData,
    parseListingJsonArray,
} from 'Pages/AuthenticationModule/Communication/CommunicationLists/communicationListingDefaults';

import {
    updateListLoading,
    updateListingList,
    updateListFailure,
    updateCampaignStatus,
    get_communication_list,
} from './reducer';
import { getCampaignBlastDetails } from '../createCommunication/Create/request';

export const getSearchDropdownDataCommunicationList =
    ({ payload, loading = true }) =>
        async (dispatch) =>
            dispatch(
                request.post({
                    url: LISTNAME_SEARCH,
                    payload,
                    loading,
                    ok: ({ data }) => {
                        if (data.status) {
                            if (data?.data && typeof data?.data === 'string' && data?.data !== 'No data found') {
                                const temp = parseListingJsonArray(data.data, []);
                                dispatch(get_communication_list({ field: 'advSearchDropdown', data: [...temp] }));
                            } else {
                                dispatch(get_communication_list({ field: 'advSearchDropdown', data: [] }));
                            }
                        } else {
                            dispatch(get_communication_list({ field: 'advSearchDropdown', data: [] }));
                        }
                    },
                    fail: (err) => {
                    },
                }),
            );
export const getSearchDropdownDataCommunicationTags =
    ({ payload, loading = false }) =>
        async (dispatch) =>
            dispatch(
                request.post({
                    url: GET_COMM_TAGS,
                    payload,
                    loading,
                    ok: ({ data }) => {
                        if (data.status) {
                            const temp = parseListingJsonArray(data?.data, []);
                            dispatch(get_communication_list({ field: 'advSearchDropdownTags', data: [...temp] }));
                            // dispatch(update_failures_API_Errors({ field: 'advSearchDropdownTags', message: '' }));
                            // setDropdownData(data?.data);
                        } else {
                            // dispatch(
                            //     update_failures_API_Errors({
                            //         field: 'advSearchDropdownTags',
                            //         message: data?.message || 'No data available',
                            //     }),
                            // );
                            dispatch(get_communication_list({ field: 'advSearchDropdownTags', data: [] }));
                        }
                    },
                    fail: (err) => {
                    },
                }),
            );

export const getCommunicationList =
    ({ payload, loading = false }) =>
        async (dispatch) => {
            dispatch(updateListLoading(true));
            return dispatch(
                request.post({
                    url: GET_COMMUNICATION_LIST_EXTENSION,
                    payload,
                    loading,
                    ok: ({ data }) => {
                        const { status, data: response, message = 'No data available' } = data;
                        if (status) {
                            const handleCampaignTypeValue = (type) => {
                                switch (type) {
                                    case 'S':
                                        return 'Single dimension';
                                    case 'M':
                                        return 'Multi dimension';
                                    case 'T':
                                        return 'Event trigger';
                                    default:
                                        return 'Single dimension';
                                }
                            }

                            const mappedResponse = normalizeCommunicationListingData({
                                ...(response && typeof response === 'object' ? response : {}),
                                communicationsList: (response?.communicationsList ?? []).map((item) => ({
                                    ...(item && typeof item === 'object' ? item : {}),
                                    campaignTypeValue: handleCampaignTypeValue(item?.campaignTypeValue),
                                })),
                            });

                            dispatch(updateListingList(mappedResponse));
                            dispatch(updateListLoading(false));
                            // dispatch(
                            //     update_failures_API_Errors({
                            //         field: 'communicationlistings',
                            //         message: '',
                            //     }),
                            // );
                        } else {
                            dispatch(updateListingList({ ...EMPTY_COMMUNICATION_LISTING_DATA }));
                            dispatch(updateListFailure(true));
                            dispatch(updateListLoading(false));
                            // dispatch(
                            //     update_failures_API_Errors({
                            //         field: 'communicationlistings',
                            //         message: message || 'No data available',
                            //     }),
                            // );
                        }
                    },
                    fail: () => {
                        dispatch(updateListingList({ ...EMPTY_COMMUNICATION_LISTING_DATA }));
                        dispatch(updateListFailure(true));
                        dispatch(updateListLoading(false));
                    },
                }),
            );
        };

export const normalizeCampaignStatusChannel = (item) => {
    if (!item || typeof item !== 'object' || !Object.keys(item).length) {
        return null;
    }
    const channelId = item.channelId ?? item.ChannelId ?? item.channelID;
    return {
        ...item,
        channelId: channelId != null ? Number(channelId) : channelId,
        channeldetailId:
            item.channeldetailId ??
            item.channelDetailId ??
            item.channelDetailID ??
            item.ChannelDetailID,
        statusId: item.statusId ?? item.StatusId,
        levelNumber: item.levelNumber ?? item.LevelNumber ?? 1,
        socialPostChannelId: item.socialPostChannelId ?? item.SocialPostChannelId,
        subChannelId: item.subChannelId ?? item.SubChannelId,
        subSegmentFriendlyName:
            item.subSegmentFriendlyName ?? item.SubSegmentFriendlyName ?? item.subsegmentFriendlyName,
        subSegmentLevel: item.subSegmentLevel ?? item.SubSegmentLevel ?? item.subsegmentLevel,
        subSegmentPriority: item.subSegmentPriority ?? item.SubSegmentPriority ?? item.subsegmentPriority,
        triggerPlayPauseStatus:
            item.triggerPlayPauseStatus ?? item.TriggerPlayPauseStatus ?? item.triggerplaypausestatus,
    };
};

/** Normalize GetCampaignStatusExtensionByID body — always returns `{ status, data: channel[] }`. */
export const normalizeCampaignStatusApiBody = (body) => {
    if (!body || typeof body !== 'object') {
        return { status: false, data: [] };
    }
    const apiStatus = body.status ?? body.Status;
    const raw = body.data ?? body.Data;
    let channels = [];
    if (Array.isArray(raw)) {
        channels = raw;
    } else if (raw && typeof raw === 'object') {
        channels = [raw];
    }
    const data = channels.map(normalizeCampaignStatusChannel).filter(Boolean);
    return {
        status: Boolean(apiStatus),
        data,
    };
};


export const getCampaignStatus =
    ({ payload, loading = true }) =>
        async (dispatch) => {
            const body = await dispatch(
                request.post({
                    url: GET_CAMPAINGN_STATUS_EXTENSION,
                    payload,
                    loading,
                    ok: async ({ data }) => {
                        const { status, data: response } = normalizeCampaignStatusApiBody(data);
                        if (status) {
                            const rawChannelRows = Array.isArray(response) ? response : [];
                            const channelRows = rawChannelRows.map((item) => ({
                                ...item,
                                sentCount: item?.sentcount !== undefined ? item.sentcount : item?.sentCount,
                            }));
                            data.data = channelRows;
                            const isOfflineConversionExist = channelRows.find((channel) => channel?.channelId == 0);
                            dispatch(updateCampaignStatus(channelRows));
                            isOfflineConversionExist && await dispatch(
                                getCampaignBlastDetails({
                                    payload: {
                                        clientId: payload.clientId,
                                        departmentId: payload.departmentId,
                                        userId: payload.userId,
                                        campaignId: payload.campaignId,
                                    },
                                }),
                            );
                        } else {
                            dispatch(updateCampaignStatus([]));
                        }
                    },
                    fail: (err) => { },
                }),
            );
        return normalizeCampaignStatusApiBody(body);
        };

export const duplicateCommunication =
    ({ payload, loading = false }) =>
        async (dispatch) => {
            return dispatch(
                request.post({
                    url: DUPLICATE_COMMUNICATION,
                    payload,
                    loading:false,
                    ok: () => { },
                    isFailureCheck: true,
                }),
            );
        };
export const mdcDuplicateCommunication =
    ({ payload, loading = false }) =>
        async (dispatch) => {
            return dispatch(
                request.post({
                    url: MDC_DUPLICATE_COMMUNICATION,
                    payload,
                    loading:false,
                    ok: () => { },
                    isFailureCheck: true,
                }),
            );
        };
export const updatePlayPause =
    ({ payload }) =>
        async (dispatch) => {
            return dispatch(
                request.post({
                    url: TIGGER_PAUSE_AND_PLAY_CAMPAIGN,
                    payload,
                    loading: true,
                }),
            );
        };
export const deleteArchiveCommunication =
    ({ payload, loading = false }) =>
        async (dispatch) => {
            return dispatch(
                request.post({
                    url: ARHIVE_COMMUNICATION,
                    payload,
                    loading,
                    ok: ({ data }) => {
                        const { status, message = 'No data available' } = data;

                    },
                    isFailureCheck: true,
                }),
            );
        };

export const unarchiveCommunication =
    ({ payload }) =>
        async (dispatch) => {
            return dispatch(
                request.post({
                    url: UNARHIVE_COMMUNICATION,
                    payload,
                    loading: true,
                    ok: ({ data }) => {
                        const { status, message = 'No data available' } = data;

                    },
                    isFailureCheck: true,
                }),
            );
        };

export const get_splitAB_popup =
    ({ payload }) =>
        async (dispatch) => {
            return dispatch(
                request.post({
                    url: GET_COMM_SPLIT_POPUP,
                    payload,
                    loading: false,
                isToast: false,
                }),
            );
        };
export const get_splitAB_process_recipients = (payload) => async (dispatch) => {
    return dispatch(
        request.post({
            url: GET_COMM_SPLITAB_PROCESS_RECIPIENTS,
            payload,
            loading: true,
        }),
    );
};
export const get_campaign_make_changes = (payload) => async (dispatch) => {
    return dispatch(
        request.post({
            url: GET_CAMPAIGN_MAKE_CHANGES,
            payload,
            loading: false,
            ok: ({ data }) => {
                const { status, message = 'No data available' } = data;
            },
            isFailureCheck: true,
            fail: ({ response }) => {
                const {
                    data: { status, message = 'No data available' },
                } = response;
            },
        }),
    );
};
export const get_campaign_reject_commets = (payload) => async (dispatch) => {
    return dispatch(
        request.post({
            url: GET_CAMPAIGN_REJECTS_COMMENTS,
            payload,
            loading: false,
            ok: ({ data }) => {
                const { status, message = 'No data available' } = data;
            },
            isFailureCheck: true,
            fail: ({ response }) => {
                const {
                    data: { status, message = 'No data available' },
                } = response;
            },
        }),
    );
};
export const Get_Preview_By_Channel = (payload, loading = false) => async (dispatch) => {
    return dispatch(
        request.post({
            url: GET_PREVIEW_BY_CHANNEL,
            payload,
            loading,
            ok: ({ data }) => { },
            fail: ({ response }) => { },
        }),
    );
};

export const commListingUserList = ({ payload, loading = false }) => async (dispatch) => {
    return dispatch(
        request.post({
            url: GET_LISTING_USER_LIST,
            payload,
            loading: loading,
            ok: ({ data }) => { },
            fail: ({ response }) => { },
        }),
    );
};

export const deleteChannelById =
    ({ payload, loading = false }) =>
        async (dispatch) => {
            return dispatch(
                request.post({
                    url: DELETE_CHANNEL_BY_ID,
                    payload,
                    loading,
                    isFailureCheck: true,
                }),
            );
        };