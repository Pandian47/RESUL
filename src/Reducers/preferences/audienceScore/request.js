import { EDIT_COMMUNICATION_RESPONSE, EDIT_COMMUNICATION_RESPONSE_DATA, GET_AUDIENCELADDERING, GET_FULL_JSON_ATTRIBUTE_VALUES, GET_LADDERKEYS, GET_PERIOD_KEYS, GET_PERSONA, GET_PERSONABY_ID, GET_PERSONA_GRADE, GET_PERSONA_NAME, GET_PROFILE_DATA, GET_PROFILE_DATA_CHANNEL_NAME, GET_PROFILE_DATA_CLASSFICATION_ATTRIBUTES_BY_ID, GET_PURCHASEPATTERN, GET_SENTIMENTKEYS, SAVE_AUDIENCELADDERING, SAVE_PERSONA, SAVE_PERSONA_GRADE, SAVE_PROFILE_DATA, SAVE_PURCHASEPATTERN, UPDATE_PERSONA, UPDATE_PROFILE_DATA, UPDATE_PURCHASEPATTERN } from 'Constants/EndPoints';
import request from 'Utils/Http';

import { update_target_list } from 'Reducers/audience/targetListCreation/reducer';

export const GetPersona = (payload) => async (dispatch) => {
    return dispatch(
        request.post({
            url: GET_PERSONA,
            payload,
            loading: false,
            isToast: false,
            ok: ({ data }) => {},
            fail: (err) => {},
        }),
    );
};
export const GetPersonaName = (payload) => async (dispatch) => {
    return dispatch(
        request.post({
            url: GET_PERSONA_NAME,
            payload,
            // loading: true,
            isToast: false,
            ok: ({ data }) => {},
            fail: (err) => {},
        }),
    );
};
export const savePersona = (payload, loading = false) => async (dispatch) => {
    return dispatch(
        request.post({
            url: SAVE_PERSONA,
            payload,
            loading,
            isToast: false,
            ok: ({ data }) => {},
            fail: (err) => {},
        }),
    );
};
export const updatePersona = (payload, loading = false) => async (dispatch) => {
    return dispatch(
        request.post({
            url: UPDATE_PERSONA,
            payload,
            loading,
            isToast: false,
            ok: ({ data }) => {},
            fail: (err) => {},
        }),
    );
};
export const getPersonaGrade = (payload) => async (dispatch) => {
    return dispatch(
        request.post({
            url: GET_PERSONA_GRADE,
            payload,
            loading: false,
            isToast: false,
            ok: ({ data }) => {},
            fail: (err) => {},
        }),
    );
};
export const savePersonaGrade = (payload, loading = false) => async (dispatch) => {
    return dispatch(
        request.post({
            url: SAVE_PERSONA_GRADE,
            payload,
            loading,
            isToast: false,
            ok: ({ data }) => {},
            fail: (err) => {},
        }),
    );
};
export const getPersonabyId = (payload) => async (dispatch) => {
    return dispatch(
        request.post({
            url: GET_PERSONABY_ID,
            payload,
            loading: false,
            isToast: false,
            ok: (res) => {
                const {
                    data: { data, status },
                } = res;
                if (status) dispatch(update_target_list({ field: 'editList', data: data?.[0] }));
            },

            fail: (err) => {},
        }),
    );
};
export const getPurchasePattern = (payload) => async (dispatch) => {
    return dispatch(
        request.post({
            url: GET_PURCHASEPATTERN,
            payload,
            loading: false,
            isToast: false,
            ok: ({ data }) => {},
            fail: (err) => {},
        }),
    );
};
export const save_PurchasePattern = (payload) => async (dispatch) => {
    return dispatch(
        request.post({
            url: SAVE_PURCHASEPATTERN,
            payload,
            loading: true,
            isToast: false,
            ok: ({ data }) => {},
            fail: (err) => {},
        }),
    );
};
export const update_PurchasePattern = (payload) => async (dispatch) => {
    return dispatch(
        request.post({
            url: UPDATE_PURCHASEPATTERN,
            payload,
            loading: true,
            isToast: false,
            ok: ({ data }) => {},
            fail: (err) => {},
        }),
    );
};
export const get_AudienceLaddering = (payload) => async (dispatch) => {
    return dispatch(
        request.post({
            url: GET_AUDIENCELADDERING,
            payload,
            loading: false,
            isToast: false,
            ok: ({ data }) => {},
            fail: (err) => {},
        }),
    );
};
export const save_AudienceLaddering = (payload, loading = false) => async (dispatch) => {
    return dispatch(
        request.post({
            url: SAVE_AUDIENCELADDERING,
            payload,
            loading,
            isToast: false,
            ok: ({ data }) => {},
            fail: (err) => {},
        }),
    );
};
export const get_LadderKeys = (payload) => async (dispatch) => {
    return dispatch(
        request.post({
            url: GET_LADDERKEYS,
            payload,
            loading: false,
            isToast: false,
            ok: ({ data }) => {},
            fail: (err) => {},
        }),
    );
};
export const get_LadderSentimentKeys = (payload) => async (dispatch) => {
    return dispatch(
        request.post({
            url: GET_SENTIMENTKEYS,
            payload,
            loading: false,
            isToast: false,
            ok: ({ data }) => {},
            fail: (err) => {},
        }),
    );
};

export const getCampaignResponse = (payload) => {
    return async (dispatch) => {
        return dispatch(
            request.post({
                url: EDIT_COMMUNICATION_RESPONSE,
                payload,
                loading: false,
                ok: ({ data }) => {},
            }),
        );
    };
};
export const getCampaignResponseData = (payload) => {
    return async (dispatch) => {
        return dispatch(
            request.post({
                url: EDIT_COMMUNICATION_RESPONSE_DATA,
                payload,
                loading: false,
                ok: ({ data }) => {},
            }),
        );
    };
};

export const getPeriodKeys = (payload) => {
    return async (dispatch) => {
        return dispatch(
            request.post({
                url: GET_PERIOD_KEYS,
                payload,
                loading: false,
                ok: ({ data }) => {},
            }),
        );
    };
};

export const getProfileData = (payload) => {
    return async (dispatch) => {
        return dispatch(
            request.post({
                url: GET_PROFILE_DATA,
                payload,
                loading: false,
                ok: ({ data }) => {
                                    },
            }),
        );
    };
};

export const getProfileDataChannelName = (payload) => {
    return async (dispatch) => {
        return dispatch(
            request.post({
                url: GET_PROFILE_DATA_CHANNEL_NAME,
                payload,
                loading: false,
                ok: ({ data }) => {
                                    },
            }),
        );
    };
};
export const getProfileDataClassficationAttributeById = (payload, builder = false) => {
    return async (dispatch) => {
        return dispatch(
            request.post({
                url: GET_PROFILE_DATA_CLASSFICATION_ATTRIBUTES_BY_ID,
                payload,
                loading: false,
                ok: ({ data }) => {
                                    },
            }),
        );
    };
};
export const getAttributeJson = (payload, builder = false) => {
    return async (dispatch) => {
        return dispatch(
            request.post({
                url: GET_FULL_JSON_ATTRIBUTE_VALUES,
                payload,
                loading: !builder,
                ok: ({ data }) => {
                                    },
            }),
        );
    };
};
export const UpdateProfileData = (payload, loading = false) => {
    return async (dispatch) => {
        return dispatch(
            request.post({
                url: UPDATE_PROFILE_DATA,
                payload,
                loading,
                ok: ({ data }) => {
                                    },
            }),
        );
    };
};
export const SaveProfileData = (payload, loading = false) => {
    return async (dispatch) => {
        return dispatch(
            request.post({
                url: SAVE_PROFILE_DATA,
                payload,
                loading,
                ok: ({ data }) => {
                                    },
            }),
        );
    };
};
