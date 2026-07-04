import { ADHOCLISTID_BY_ATTRIBUTES, ADHOCLIST_VALUES_BY_ATTRIBUTE_NAME, ADHOCLIST_VALUES_BY_WATERFALLCOUNT, GET_ALL_GROUP_AUDIENCE_COUNT, GET_ALL_GROUP_AUDIENCE_COUNT_PARTNER, GET_ALL_ZERODAY_FILES, GET_ATTRIBUTE_VALUES, GET_ATTRIBUTE_VALUES_EDIT, GET_CHANNEL_LIST, GET_COMMNUICATION_NAMES, GET_EDIT_LIST_NEW, GET_FULL_JSON_ATTRIBUTE_VALUES, GET_SEGMENT_EXPRESSION_BYIDS, GET_SUBSCRIPTION_FORM_NAMES, GET_SUBSEGMENT_WATERFALLCOUNT, GET_VIRTUAL_FIELD_DATA, GET_ZERODAY_HEADER_DATA, GET_ZERODAY_HEADER_VALUES, RFA_TARGET_LIST_APPROVE, RFA_TARGET_LIST_REJECT, SAVE_SUBSEGMENT_RULE, TARGETLIST_SUBSEGMENT_BY_ID, TARGET_LIST_LEFT_SIDE_PANEL, TARGET_LIST_NAME_EXIST, UPDATE_SAVE_TARGET_LIST_NEW, UPDATE_SAVE_TARGET_LIST_PARTNER, UPDATE_TARGET_LIST_NAME } from 'Constants/EndPoints';
import request from 'Utils/Http';

import {
    hasTargetListEditData,
    hasTargetListLeftPanelData,
    parseAudienceJson,
    parseAudienceJsonArray,
} from 'Pages/AuthenticationModule/Audience/audienceDefaults';
import { update_target_list } from './reducer';

export const getTargetListPanel =
    ({ payload, dispatchState, loading = false }) =>
    async (dispatch) => {
    dispatchState({
        type: 'UPDATE',
        field: 'attributesLoading',
        payload: true,
    });
    dispatchState({
        type: 'UPDATE',
        field: 'attributesLoadFailed',
        payload: false,
    });
    return dispatch(
        request.post({
            url: TARGET_LIST_LEFT_SIDE_PANEL,
            loading,
            payload,
            ok: (res) => {
                const {
                    data: { data, status },
                } = res;
                const parsed = status ? parseAudienceJson(data, {}) : {};
                dispatch(update_target_list({ field: 'leftPanelAtt', data: parsed }));
                dispatchState({
                    type: 'UPDATE',
                    field: 'attributesLoadFailed',
                    payload: !hasTargetListLeftPanelData(parsed),
                });
            },
            fail: () => {
                dispatch(update_target_list({ field: 'leftPanelAtt', data: {} }));
                dispatchState({
                    type: 'UPDATE',
                    field: 'attributesLoadFailed',
                    payload: true,
                });
            },
            final: () =>
                dispatchState({
                    type: 'UPDATE',
                    field: 'attributesLoading',
                    payload: false,
                }),
        }),
    );
};

export const getVirtualFieldData = (payload, dispatchState,sOLRFieldName) => async (dispatch) => {
 return   dispatch(
        request.post({
            url: GET_VIRTUAL_FIELD_DATA,
            loading: true,
            payload,
            ok: (res) => {
                const {
                    data: { data, status },
                } = res;
                if (status) {
                    dispatchState({
                        type: 'UPDATE_VIRTUAL_VALUES',
                        payload: { [sOLRFieldName]: parseAudienceJsonArray(data, []) },
                    });
                } else {
                    dispatchState({
                        type: 'UPDATE_VIRTUAL_VALUES',
                        payload: { [sOLRFieldName]: [] },
                    });
                }
            },
            fail: (err) => {
                            },
        }),
    );
};

export const checkTargetListName = (payload, loading = false) => async (dispatch) => {
    return dispatch(
        request.post({
            url: TARGET_LIST_NAME_EXIST,
            payload,
            loading: loading,
            isToast: false,
            ok: () => {},
            fail: (err) => {
                            },
        }),
    );
};

export const allGroupAudienceGroup = (payload, loading = true) => async (dispatch) => {
    return dispatch(
        request.post({
            url: GET_ALL_GROUP_AUDIENCE_COUNT,
            loading: loading,
            payload,
            ok: (res) => {
                const {
                    data: { data, status },
                } = res;
            },
            fail: (err) => {
                            },
        }),
    );
};
export const allGroupAudienceGroup_Partner = (payload) => async (dispatch) => {
    return dispatch(
        request.post({
            url: GET_ALL_GROUP_AUDIENCE_COUNT_PARTNER,
            loading: true,
            payload,
            ok: (res) => {
                const {
                    data: { data, status },
                } = res;
            },
            fail: (err) => {
                            },
        }),
    );
};

export const GetChannelList = (payload) => async (dispatch) => {
    return dispatch(
        request.post({
            url: GET_CHANNEL_LIST,
            loading: true,
            payload,
            ok: (res) => {
                const {
                    data: { data, status },
                } = res;   
                dispatch(update_target_list({ field: 'channelList', data: data || [] }));      

            },
            fail: (err) => {
                            },
        }),
    );
};

export const getAttributeValues = (payload, dispatchState, labelText, loaderIndex , loading) => async (dispatch) => {
   return dispatch(
        request.post({
            url: GET_ATTRIBUTE_VALUES,
            loading: loading ?? false,
            payload,
            ok: (res) => {
                const {
                    data: { data, status },
                } = res;

                if (status) {
                    debugger
                    const attrsValue = parseAudienceJson(data, {});
                    const attrs = Object.keys(parseAudienceJson(attrsValue, {}));
                    // const attributesList = attrs
                    //     ?.map((attr) => {
                    //         const attribute = attr?.split(':')[0];
                    //         return attribute;
                    //     })
                    //     ?.filter((attr) => attr !== '');
                    dispatchState({
                        type: 'UPDATE_ATTRIBUTE_VALUES',
                        payload: {
                            loading: false,
                            index: null,
                            attrName: [labelText],
                            values: attrs,
                        },
                    });
                } else {
                    dispatchState({
                        type: 'UPDATE_ATTRIBUTE_VALUES',
                        payload: {
                            loading: false,
                            index: null,
                            attrName: [labelText],
                            values: [],
                        },
                    });
                }
            },
            fail: (err) => {
                            },
            final: () => {
                dispatchState({
                    type: 'UPDATE_LOADING',
                    payload: {
                        loading: false,
                        index: loaderIndex,
                    },
                });
            },
        }),
    );
};

export const updateAndSaveTargetList = (payload, loading = true) => async (dispatch) => {
    return dispatch(
        request.post({
            url: UPDATE_SAVE_TARGET_LIST_NEW,
            loading,
            payload,
            ok: (res) => {
                const {
                    data: { data, status, message = 'No data available' },
                } = res;
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

export const updateAndSaveTargetList_Partner = (payload, loading = true) => async (dispatch) => {
    return dispatch(
        request.post({
            url: UPDATE_SAVE_TARGET_LIST_PARTNER,
            loading,
            payload,
            ok: (res) => {
                const {
                    data: { data, status, message = 'No data available' },
                } = res;
            },
            fail: ({ response }) => {
                const {
                    data: { status, message = 'No data available' },
                } = response;

                            },
            isFailureCheck: true,
        }),
    );
};

export const updateTargetListName = (payload, dispatchState, setError, setValue) => async (dispatch) => {
    dispatch(
        request.post({
            url: UPDATE_TARGET_LIST_NAME,
            loading: true,
            payload,
            ok: (res) => {
                const {
                    data: { status },
                } = res;
                if (status) {
                    setValue('segmentation.listName', payload.ListName);
                    dispatchState({
                        type: 'UPDATE',
                        payload: true,
                        field: 'isValidListname',
                    });
                } else
                    setError('segmentation.listName', {
                        type: 'custom',
                        message: 'List name already exists',
                    });
            },
            fail: (err) => {
                            },
        }),
    );
};

export const getIndividualTargetList =
    ({ payload, loading = false, dispatchState }) =>
    async (dispatch) => {
    const setEditPageState = (field, statePayload) => {
        dispatchState?.({
            type: 'UPDATE',
            field,
            payload: statePayload,
        });
    };

    setEditPageState('editListLoading', true);
    setEditPageState('editLoadFailed', false);
    dispatch(update_target_list({ field: 'editList', data: {} }));
    dispatch(update_target_list({ field: 'rfaList', data: [] }));
    return dispatch(
        request.post({
            url: GET_EDIT_LIST_NEW,
            loading: loading,
            payload,
            ok: (res) => {
                const {
                    data: { data, status },
                } = res;
                const hasEditData = status && hasTargetListEditData(data);
                if (hasEditData) {
                    dispatch(update_target_list({ field: 'editList', data: data?.targetlist?.[0] }));
                    dispatch(update_target_list({ field: 'rfaList', data: data?.targetlistapproval }));
                } else {
                    dispatch(update_target_list({ field: 'editList', data: [] }));
                    dispatch(update_target_list({ field: 'rfaList', data: [] }));
                }
                setEditPageState('editLoadFailed', !hasEditData);
            },
            fail: () => {
                dispatch(update_target_list({ field: 'editList', data: [] }));
                dispatch(update_target_list({ field: 'rfaList', data: [] }));
                setEditPageState('editLoadFailed', true);
            },
            final: () => setEditPageState('editListLoading', false),
        }),
    );
};

export const getEditAttributeValue1AJSONTargetList = (payload,apicallStatusDetail) => async (dispatch) => {
   return dispatch(
        request.post({
            url: GET_ATTRIBUTE_VALUES_EDIT,
            loading: false,
            payload,
            ok: (res) => {
                const {
                    data: { data, status },
                } = res;
                if (status) {
                    const attrsValue = parseAudienceJson(data, {});
                    const attrs = parseAudienceJson(attrsValue, {});
                    dispatch(update_target_list({ field: 'oneAJSON', data: attrs }));
                } else {
                    dispatch(update_target_list({ field: 'oneAJSON', data: {} }));
                }
                   apicallStatusDetail.current = {
                ...apicallStatusDetail.current,
                oneAJSONAPICallStatus: true,
            };
            },
            fail: (err) => {
                            },
        }),
    );
};

export const approveTargetList =
    ({ payload }) =>
    async (dispatch) =>
        dispatch(
            request.post({
                url: RFA_TARGET_LIST_APPROVE,
                payload,
                loading: false,
                ok: ({ data }) => {},
                fail: (err) => {
                                    },
            }),
        );
export const rejectTargetList =
    ({ payload }) =>
    async (dispatch) =>
        dispatch(
            request.post({
                url: RFA_TARGET_LIST_REJECT,
                payload,
                loading: false,
                ok: ({ data }) => {},
                fail: (err) => {
                                    },
            }),
        );

export const getCommunicationNames = (payload, dispatchState, labelText) => async (dispatch) => {
    dispatch(
        request.post({
            url: GET_COMMNUICATION_NAMES,
            loading: true,
            payload,
            ok: (res) => {
                const { status, data } = res;
                if (status) {
                    dispatchState({
                        type: 'UPDATE_ATTRIBUTE_VALUES',
                        payload: {
                            loading: false,
                            index: null,
                            attrName: [labelText],
                            values: data?.data,
                        },
                    });
                } else {
                    dispatchState({
                        type: 'UPDATE_ATTRIBUTE_VALUES',
                        payload: {
                            loading: false,
                            index: null,
                            attrName: [labelText],
                            values: [],
                        },
                    });
                }
            },
            fail: (err) => {
                            },
        }),
    );
};
export const get_Zeroday_AttributeValues = (payload, dispatchState, labelText, loaderIndex) => async (dispatch) => {
    dispatch(
        request.post({
            url: GET_ALL_ZERODAY_FILES,
            loading: false,
            payload,
            ok: (res) => {
                const {
                    data: { data, status },
                } = res;

                if (status) {
                    const attrs = data;
                    dispatchState({
                        type: 'UPDATE_ATTRIBUTE_VALUES',
                        payload: {
                            loading: false,
                            index: null,
                            attrName: [labelText],
                            values: attrs,
                        },
                    });
                } else {
                    dispatchState({
                        type: 'UPDATE_ATTRIBUTE_VALUES',
                        payload: {
                            loading: false,
                            index: null,
                            attrName: [labelText],
                            values: [],
                        },
                    });
                }
            },
            fail: (err) => {
                            },
            final: () => {
                dispatchState({
                    type: 'UPDATE_LOADING',
                    payload: {
                        loading: false,
                        index: loaderIndex,
                    },
                });
            },
        }),
    );
};

export const get_Zeroday_Header_Attribute = (payload, dispatchState, value) => async (dispatch) => {
    dispatch(
        request.post({
            url: GET_ZERODAY_HEADER_DATA,
            loading: true,
            payload,
            ok: (res) => {
                const {
                    data: { data, status },
                } = res;
                                if (status) {
                    dispatch(
                        update_target_list({
                            field: 'leftPanelAtt_Zero',
                            data: data.map((item) => ({
                                ...item,
                                headerName: value,
                                dataTypeId: item.FieldType === 's' ? 1 : item.FieldType === 'd' ? 3 : 1,
                                 FieldName: item?.FieldName || value
                            })),
                        }),
                    );
                } else {
                    dispatch(update_target_list({ field: 'leftPanelAtt_Zero', data: [] }));
                }
            },
            fail: (err) => {
                            },
            final: () => {},
        }),
    );
};

export const getAttributeValues_zeroDay = (payload, dispatchState, labelText, loaderIndex,getAttributeListData = []) => async (dispatch) => {
    dispatch(
        request.post({
            url: GET_ZERODAY_HEADER_VALUES,
            loading: false,
            payload,
            ok: (res) => {
                                const {
                    data: { data, status },
                } = res;
                if (status) {
                    const attrs = data;
                    getAttributeListData.push(attrs)
                    dispatchState({
                        type: 'UPDATE_ATTRIBUTE_VALUES',
                        payload: {
                            loading: false,
                            index: null,
                            attrName: [labelText],
                            values: attrs,
                        },
                    });
                } else {
                    dispatchState({
                        type: 'UPDATE_ATTRIBUTE_VALUES',
                        payload: {
                            loading: false,
                            index: null,
                            attrName: [labelText],
                            values: [],
                        },
                    });
                }
            },
            fail: (err) => {
                            },
            final: () => {
                dispatchState({
                    type: 'UPDATE_LOADING',
                    payload: {
                        loading: false,
                        index: loaderIndex,
                    },
                });
            },
        }),
    );
};
export const getExpression_byIDS = (payload) => async (dispatch) => {
    dispatch(
        request.post({
            url: GET_SEGMENT_EXPRESSION_BYIDS,
            loading: false,
            payload,
            ok: (res) => {
                const {
                    data: { data, status },
                } = res;
                if (status) {
                    dispatch(update_target_list({ field: 'SubSegmentExp_List', data: data }));
                } else {
                    dispatch(update_target_list({ field: 'SubSegmentExp_List', data: [] }));
                }
            },
            fail: (err) => {
                            },
            final: () => {},
        }),
    );
};
export const saveSubSegment_Rule = (payload, loading = true) => async (dispatch) => {
    return dispatch(
        request.post({
            url: SAVE_SUBSEGMENT_RULE,
            loading,
            payload,
            ok: (res) => {
                const {
                    data: { data, status },
                } = res;
            },
            fail: (err) => {
                            },
            final: () => {},
        }),
    );
};

export const get_allGroupSubsegment_waterfallcount = (payload, loading = false) => async (dispatch) => {
    return dispatch(
        request.post({
            url: GET_SUBSEGMENT_WATERFALLCOUNT,
            loading,
            payload,
            ok: (res) => {
                const {
                    data: { data, status },
                } = res;
            },
            fail: (err) => {
                            },
            final: () => {},
        }),
    );
};
export const get_allGroupAdhocListSubsegment_waterfallcount = (payload, loading = false) => async (dispatch) => {
    return dispatch(
        request.post({
            url: ADHOCLIST_VALUES_BY_WATERFALLCOUNT,
            loading,
            payload,
            ok: (res) => {
                const {
                    data: { data, status },
                } = res;
            },
            fail: (err) => {
                            },
            final: () => {},
        }),
    );
};

export const targetListSubSegmentById =
    ({ payload }) =>
    async (dispatch) => {
        return dispatch(
            request.post({
                url: TARGETLIST_SUBSEGMENT_BY_ID,
                payload,
                loading: false,
                ok: ({ data }) => {
                    if (data?.status) {
                        dispatch(update_target_list({ field: 'editList', data: data?.data?.[0] }));
                    } else {
                        dispatch(update_target_list({ field: 'editList', data: [] }));
                    }
                },
            }),
        );
    };

export const getTargetListPanelByAdhocList = (payload, dispatchState) => async (dispatch) => {
    dispatchState({
        type: 'UPDATE',
        field: 'adhocLeftPanelLoading',
        payload: true,
    });
    dispatchState({
        type: 'UPDATE',
        field: 'attributesLoadFailed',
        payload: false,
    });
    dispatch(
        request.post({
            url: ADHOCLISTID_BY_ATTRIBUTES,
            loading: false,
            payload,
            ok: (res) => {
                const {
                    data: { data, status },
                } = res;
                const parsed =
                    status && data?.attributesList?.length
                        ? {
                              attributesList: data.attributesList,
                              brand_category: ['File'],
                              category: ['File'],
                          }
                        : {};
                dispatch(update_target_list({ field: 'leftPanelAtt_Adhoc', data: parsed }));
                dispatchState({
                    type: 'UPDATE',
                    field: 'attributesLoadFailed',
                    payload: !hasTargetListLeftPanelData(parsed),
                });
            },
            fail: () => {
                dispatch(update_target_list({ field: 'leftPanelAtt_Adhoc', data: {} }));
                dispatchState({
                    type: 'UPDATE',
                    field: 'attributesLoadFailed',
                    payload: true,
                });
            },
            final: () =>
                dispatchState({
                    type: 'UPDATE',
                    field: 'adhocLeftPanelLoading',
                    payload: false,
                }),
        }),
    );
};

export const getAttributeValueByAdhocList = (payload, dispatchState, labelText, loaderIndex) => async (dispatch) => {
    dispatch(
        request.post({
            url: ADHOCLIST_VALUES_BY_ATTRIBUTE_NAME,
            loading: false,
            payload,
            ok: (res) => {
                const {
                    data: { data, status },
                } = res;

                if (status) {
                    dispatchState({
                        type: 'UPDATE_ATTRIBUTE_VALUES',
                        payload: {
                            loading: false,
                            index: null,
                            attrName: [labelText],
                            values: data,
                        },
                    });
                } else {
                    dispatchState({
                        type: 'UPDATE_ATTRIBUTE_VALUES',
                        payload: {
                            loading: false,
                            index: null,
                            attrName: [labelText],
                            values: [],
                        },
                    });
                }
            },
            fail: (err) => {
                            },
            final: () => {
                dispatchState({
                    type: 'UPDATE_LOADING',
                    payload: {
                        loading: false,
                        index: loaderIndex,
                    },
                });
            },
        }),
    );
};


export const getSubScriptionFormList = (payload, dispatchState, labelText) => async (dispatch) => {
    dispatch(
        request.post({
            url: GET_SUBSCRIPTION_FORM_NAMES,
            loading: true,
            payload,
            ok: (res) => {
                const { status, data } = res;
                if (status) {
                    dispatchState({
                        type: 'UPDATE_ATTRIBUTE_VALUES',
                        payload: {
                            loading: false,
                            index: null,
                            attrName: [labelText],
                            values: data?.data,
                        },
                    });
                } else {
                    dispatchState({
                        type: 'UPDATE_ATTRIBUTE_VALUES',
                        payload: {
                            loading: false,
                            index: null,
                            attrName: [labelText],
                            values: [],
                        },
                    });
                }
            },
            fail: (err) => {
                            },
        }),
    );
};

export const needAttributeAPICall = ['Campaign_name_s'];


export const getFullAttributeJSONValues =
    ({ payload, dispatchState, from = '', loading = false }) =>
    async (dispatch) => {
        return dispatch(
            request.post({
                url: GET_FULL_JSON_ATTRIBUTE_VALUES,
                payload,
                loading: loading,
                ok: ({ data }) => {
                    if (data?.status) {
                        try {
                            const attributeData = parseAudienceJson(data?.data, {});

                            const attributeValues =
                                attributeData?.AttributeUniqueValuewithCountproperty ?? [];

                            const processAttributes = () => {
                                attributeValues.forEach((value) => {
                                    Object.entries(value || {}).forEach(
                                        ([sOLRFieldName, attributeValueData]) => {
                                            if (!needAttributeAPICall?.includes(sOLRFieldName)) {
                                                const finalValues =
                                                    attributeValueData?.map((item) => item || '') || [];

                                                dispatchState({
                                                    type: 'UPDATE_ATTRIBUTE_VALUES',
                                                    payload: {
                                                        loading: false,
                                                        index: null,
                                                        attrName: [sOLRFieldName],
                                                        values: finalValues,
                                                    },
                                                });
                                            }
                                        }
                                    );
                                });
                            };

                            if (from === 'dynamicList') {
                                dispatchState({
                                    type: 'UPDATE',
                                    payload: attributeValues,
                                    field: 'fullAttributeJSONValues',
                                });

                                processAttributes();
                                return;
                            }

                            processAttributes();

                            dispatch(
                                update_target_list({
                                    field: 'fullAttributeJSONValues',
                                    data: attributeValues,
                                })
                            );

                        } catch (error) {
                            dispatch(
                                update_target_list({
                                    field: 'fullAttributeJSONValues',
                                    data: [],
                                })
                            );
                        }
                    }
                    else {
                        dispatch(update_target_list({ field: 'fullAttributeJSONValues', data: [] }));
                    }
                },
            }),
        );
    };
