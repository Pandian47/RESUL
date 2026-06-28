import { CAMPAIGN_NAME_EXISTS, CREATE_CAMPAIGN_PLAN, GET_BENCHMARK_DETAILS, GET_CAMPAIGN_BY_ID, GET_COMMUNICATION_ATTRIBUTES, GET_COMMUNICATION_PRODUCTS, GET_COMMUNICATION_REFERENCE, GET_COMMUNICATION_SUB_PRODUCTS, GET_COMMUNICATION_TYPES, GET_CONVERSION_TYPE_LIST, GET_DYNAMIC_LIST_COMMUNICATION, GET_TRIGGER_DYNAMICLIST, SAVE_PRODUCT_CATEGORY, SAVE_SUB_PRODUCT_CATEGORY, UPLOAD_COMMUNICATION_DOCKET } from 'Constants/EndPoints';
import request from 'Utils/Http';

import {
    resetCommunicationPlan,
    updateCommunicationData,
    updateCommunicationOptions,
    updateSavedStatusId,
    updateSubProductOptions,
    update_selected_plan,
    setPlanDropdownsFetchedFor,
} from './reducer';
import { encodeUrl } from 'Utils/modules/crypto';
import { resetCreateCommunication } from 'Reducers/communication/createCommunication/create/reducer';
import { getCampaignStatus } from 'Reducers/communication/listing/request';
import { updateSaveChannelsId } from 'Reducers/communication/createCommunication/plan/reducer';
import { handleQrTypeTab } from 'Pages/AuthenticationModule/Communication/CommunicationLists/Pages/Listings/constant';
import { updateCommunicationSettings } from 'Reducers/preferences/CommunicationSettings/reducer';
import { update_failures_API_Errors } from 'Reducers/globalState/reducer';

export const checkCommunicationNameExists =
    ({ payload, setError, isLoading = false }) =>
    async (dispatch) =>
        dispatch(
            request.post({
                url: CAMPAIGN_NAME_EXISTS,
                payload,
                loading: isLoading,
                isToast: false,
                ok: ({ data }) => {
                    const { status } = data;
                    if (status) {
                        setError('communicationName', {
                            type: 'server',
                            message: 'Communication name already exists',
                        });
                        // dispatch(updateCommunicationNameValid(false));
                    } else {
                        // dispatch(updateCommunicationNameValid(true));
                    }
                },
            }),
        );

export const getCommunicationTypes = (payload) => async (dispatch) =>
    dispatch(
        request.post({
            url: GET_COMMUNICATION_TYPES,
            payload,
            loading: true,
            ok: ({ data }) => {
                const { status, data: res } = data;
                if (status) dispatch(updateCommunicationData({ field: 'communicationTypes', data: res }));
                else dispatch(updateCommunicationData({ field: 'communicationTypes', data: [] }));
            },
        }),
    );

export const getCommunicationProducts =
    ({ payload, isLoading = false, from = '' }) =>
    async (dispatch, getState) =>
        dispatch(
            request.post({
                url: GET_COMMUNICATION_PRODUCTS,
                payload,
                loading: isLoading,
                ok: ({ data }) => {
                    const { status, data: res } = data;
                    if (from === 'communicationSetting') {
                        if (status) {
                            dispatch(updateCommunicationSettings({ field: 'productTypes', payload: res }));
                        } else {
                            dispatch(updateCommunicationSettings({ field: 'productTypes', payload: [] }));
                        }
                        return;
                    }
                    const prev = getState()?.communicationPlanReducer?.communicationOptions || {};
                    dispatch(
                        updateCommunicationOptions({
                            ...prev,
                            product: status ? res : [],
                        }),
                    );
                },
            }),
        );
export const saveCommunicationProducts =
    ({ payload, isLoading = false }) =>
    async (dispatch, getState) =>
        dispatch(
            request.post({
                url: SAVE_PRODUCT_CATEGORY,
                payload,
                loading: isLoading,
                ok: ({ data }) => {
                    const { status, data: res } = data;
                    const prev = getState()?.communicationPlanReducer?.communicationOptions || {};
                    dispatch(
                        updateCommunicationOptions({
                            ...prev,
                            product: status ? res : [],
                        }),
                    );
                },
            }),
        );
export const getCommunicationSubProducts =
    ({ payload, loading = false }) =>
    async (dispatch) =>
        dispatch(
            request.post({
                url: GET_COMMUNICATION_SUB_PRODUCTS,
                payload,
                loading,
                ok: ({ data }) => {
                    const { data: res, status } = data;
                    const response = status ? res : [];
                    dispatch(updateSubProductOptions(response));
                },
            }),
        );
        export const saveCommunicationSubProducts =
    ({ payload, isLoading = false }) =>
    async (dispatch, getState) =>
        dispatch(
            request.post({
                url: SAVE_SUB_PRODUCT_CATEGORY,
                payload,
                loading: isLoading,
                ok: ({ data }) => {
                    const { status, data: res } = data;
                    const prev = getState()?.communicationPlanReducer?.communicationOptions || {};
                    dispatch(
                        updateCommunicationOptions({
                            ...prev,
                            product: status ? res : [],
                        }),
                    );
                },
            }),
        );
export const getCommunicationAttributes =
    ({ payload, loading = false }) =>
    async (dispatch, getState) =>
        dispatch(
            request.post({
                url: GET_COMMUNICATION_ATTRIBUTES,
                payload,
                loading,
                ok: ({ data }) => {
                    const { status, data: res } = data;
                    const prev = getState()?.communicationPlanReducer?.communicationOptions || {};
                    dispatch(
                        updateCommunicationOptions({
                            ...prev,
                            attributes: status ? res : [],
                        }),
                    );
                },
            }),
        );

/** Runs product + attribute requests in parallel; thunks merge into communicationOptions. Only sets scope cache here. */
export const fetchAllRequest =
    (request, contextPayload) =>
    (dispatch) =>
        Promise.all(request).then((response) => {
            const [products, attributes] = response;
            if (contextPayload && products.status && attributes.status) {
                dispatch(setPlanDropdownsFetchedFor(contextPayload));
            }
            return response;
        });

export const handleCampaignStatus = async (props, campaignId, dispatch, loading = true) => {
    let tempSavedChannelsId;
    const payload = {
        userId: props.userId,
        departmentId: props.departmentId,
        clientId: props.clientId,
        campaignId: campaignId,
    };
    const { data, status } = await dispatch(getCampaignStatus({ payload, loading }));
    if (status) {
        if (data?.length) {
            const tempSavedChannelsId = data.reduce((acc, item) => {
                const id = item.channelId;
                if (!acc[id]) {
                    acc[id] = [];
                }
                if (id === 7) {
                    acc[id].push(item.socialPostChannelId);
                } else if (id === 10) {
                    acc[id].push(item.socialPostChannelId);
                } else {
                    acc[id].push(id);
                }
                return acc;
            }, {});
            // tempSavedChannelsId = data?.map((item) => {
            //     return item.channelId;
            // });
            dispatch(updateSaveChannelsId(tempSavedChannelsId));
            const updateStatusDetailData = data?.map((item) => {
                const sharedValue = {
                    statusId: item.statusId,
                    channelDetailId: item.channeldetailId,
                    channelId: item.channelId,
                    subSegmentLevel: item.subSegmentLevel,
                    triggerPlayPauseStatus: item?.triggerPlayPauseStatus,
                };
                return sharedValue;
            });
            dispatch(updateSavedStatusId(updateStatusDetailData));

            // qr tab update flow
            const findQrChannel = data?.find((item) => item.channelId === 3);

            if (findQrChannel) {
                handleQrTypeTab(findQrChannel, dispatch);
            }

            return tempSavedChannelsId;
        } else {
            dispatch(updateSaveChannelsId({}));
            dispatch(updateSavedStatusId([]));
            return {};
        }
    } else {
        dispatch(updateSaveChannelsId({}));
        dispatch(updateSavedStatusId([]));
    }

    return tempSavedChannelsId;
};

export const saveCommunicationPlan =
    ({ payload, props, navigate, setIsCampaingFail, isLoading = false }) =>
    async (dispatch) => {
        const responseData = await dispatch(
            request.post({
                url: CREATE_CAMPAIGN_PLAN,
                payload,
                loading: isLoading,
                ok: () => {},
                fail: (err) => {
                    dispatch(
                        update_failures_API_Errors({
                            field: CREATE_CAMPAIGN_PLAN,
                            message: err?.response?.data?.message || 'No data available',
                        }),
                    );
                    setIsCampaingFail(true);
                },
            }),
        );

        if (!responseData || responseData === false) {
            setIsCampaingFail(true);
            return responseData;
        }

        const { status, data: campaignId, message = 'No data available' } = responseData;
        if (status) {
            if (props.buttonType === 'save') {
                dispatch(resetCommunicationPlan());
                dispatch(resetCreateCommunication());
                navigate('/communication', {
                    index: 0,
                });
            } else {
                dispatch(resetCreateCommunication());
                dispatch(resetCommunicationPlan());
                sessionStorage.setItem('reloadCount', 0);
                let url = '/communication/create-communication';
                if (payload.campaignType === 'M') url = '/communication/mdc-workflow';
                const tempSavedChannelsId = await handleCampaignStatus(payload, campaignId, dispatch, false);
                const state = {
                    campaignId,
                    campaignType: payload.campaignType,
                    channels: props.channelType,
                    startDate: payload.startDate,
                    endDate: payload.endDate,
                    campaignName: payload.campaignName,
                    communicationType: props.communicationType.attributename,
                    productType: props.productType.categoryname,
                    primaryGoal: props.primaryGoal,
                    secondaryGoal: props.secondaryGoal,
                    analyticsTypes: props.analyticsTypes,
                    roi: payload?.roi,
                    offlineConversion: props?.offlineConversion,
                    dynamicListId: payload?.dynamicList || 0,
                    isEditable: props?.isEditable ?? true,
                    primaryGoalType: payload?.primaryGoalType,
                    secondaryGoalType: payload?.secondaryGoalType,
                    statusId: props?.statusId,
                    savedChannelsId: tempSavedChannelsId || {},
                    timeZoneId: props?.timeZoneId?.timeZoneID,
                    templateId: props.templateId || 0,
                    isMiniDuration: props?.diffDays <= 3 ? true : false,
                    eligibleChannelType: props.eligibleChannelType || {},
                    campaignStatusId: props?.statusId || null,
                    templateChannelId: props?.templateChannelId,
                };
                const encryptState = encodeUrl(state);
                navigate(`${url}?q=${encryptState}`, {
                    state,
                });
            }
        } else {
            dispatch(
                update_failures_API_Errors({
                    field: CREATE_CAMPAIGN_PLAN,
                    message: responseData?.message || message || 'No data available',
                }),
            );
            setIsCampaingFail(true);
        }
        return responseData;
    };

export const getBenchmarkDetails =
    ({ payload, loading = false }) =>
    async (dispatch) =>
        dispatch(
            request.post({
                url: GET_BENCHMARK_DETAILS,
                payload,
                loading,
            }),
        );

export const getConversionTypeList =
    ({ payload, loading = false }) =>
    async (dispatch) =>
        dispatch(
            request.post({
                url: GET_CONVERSION_TYPE_LIST,
                payload,
                loading,
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
                        dispatch(update_selected_plan({ dynamicListData: res, isFilter: payload?.filterText }));
                    } else {
                        dispatch(update_selected_plan({ dynamicListData: [], isFilter: payload?.filterText }));
                    }
                },
            }),
        );

export const getCommunicationReference =
    ({ payload, loading = true }) =>
    async (dispatch) =>
        dispatch(
            request.post({
                url: GET_COMMUNICATION_REFERENCE,
                payload,
                loading,
                ok: ({ data }) => {
                    const { status, data: res } = data;
                    if (status) {
                        dispatch(updateCommunicationData({ field: 'communicationReferenceConfigs', data: res }));
                    }
                },
            }),
        );
export const upload_CommunicationDocket =
    ({ payload, loading = false }) =>
    async (dispatch) =>
        dispatch(
            request.post({
                url: UPLOAD_COMMUNICATION_DOCKET,
                payload,
                loading,
                isCustomHeadConfig: true,
                customHeadConfig: {},
            }),
        );

export const getCampaignById =
    ({ payload, loading = true }) =>
    async (dispatch) =>
        dispatch(
            request.post({
                url: GET_CAMPAIGN_BY_ID,
                payload,
                loading,
                isFailureCheck: true,
                ok: ({ data }) => {},
            }),
        );

export const getTriggerDynamicListChanneltype = ({ payload, loading = false }) => {
    return async (dispatch) => {
        return dispatch(
            request.post({
                url: GET_TRIGGER_DYNAMICLIST,
                payload,
                loading,
                ok: (data) => {
                                    },
            }),
        );
    };
};
