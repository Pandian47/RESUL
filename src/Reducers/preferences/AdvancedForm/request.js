import { GET_FORM_ANALYTICS_URL, GET_FORM_EDIT_URL, GET_FORM_FIELDS_AND_NOTIFY_FF, GET_FORM_LIST_FF, GET_FORM_PUBLISH_DETAILS_FF, GET_NEW_FORM_REDIRECT_URL, UPDATE_FORM_NOTIFIER_FF, WARM_UP_FORM_FORGE_FF } from 'Constants/EndPoints';
import request from 'Utils/Http';

import { getFormLoading } from '../FormGenerator/reducer';

export const advancedFormListApi = (payload) => async (dispatch) => {
    dispatch(getFormLoading({ field: 'advanced_form_loading', data: true }));
    return dispatch(
        request.post({
            url: GET_FORM_LIST_FF,
            payload,
            isToast: false,
            ok: () => { },
            fail: () => { },
            final: () => {
                dispatch(getFormLoading({ field: 'advanced_form_loading', data: false }));
            },
        }),
    );
};

/** Create (RESUL form / survey forge) — API expects empty body; session from headers. */
export const getNewFormRedirectUrl = (payload) => async (dispatch) => {
    return dispatch(
        request.post({
            url: GET_NEW_FORM_REDIRECT_URL,
            payload,
            isToast: false,
            isFailureCheck: true,
            ok: () => { },
            fail: () => { },
        }),
    );
};

/** Edit — API expects `{ formId: string }`. */
export const getFormEditUrl = (payload) => async (dispatch) => {
    return dispatch(
        request.post({
            url: GET_FORM_EDIT_URL,
            payload,
            isToast: false,
            isFailureCheck: true,
            ok: () => { },
            fail: () => { },
        }),
    );
};

/** Analytics SSO — API expects `{ formId: string }`. */
export const getFormAnalyticsUrl = (payload) => async (dispatch) => {
    return dispatch(
        request.post({
            url: GET_FORM_ANALYTICS_URL,
            payload,
            isToast: false,
            isFailureCheck: true,
            ok: () => { },
            fail: () => { },
        }),
    );
};

/** Notifier — field labels + current notify config. */
export const getFormFieldsAndNotifyFF = (formId, loading = false) => async (dispatch) => {
    return dispatch(
        request.post({
            url: GET_FORM_FIELDS_AND_NOTIFY_FF,
            payload: { formId: String(formId) },
            loading,
            isToast: false,
            isFailureCheck: true,
            ok: () => { },
            fail: () => { },
        }),
    );
};

/** Notifier — update notify, notification_email, required_column. */
export const updateFormNotifierFF = (payload, loading = true) => async (dispatch) => {
    return dispatch(
        request.post({
            url: UPDATE_FORM_NOTIFIER_FF,
            payload,
            loading,
            isToast: true,
            isFailureCheck: true,
            ok: () => { },
            fail: () => { },
        }),
    );
};

/** Fetch publish details — API expects `{ formId: string }`. */
export const getFormPublishDetailsFF = (formId) => async (dispatch) => {
    return dispatch(
        request.post({
            url: GET_FORM_PUBLISH_DETAILS_FF,
            payload: { formId: String(formId) },
            isToast: false,
            isFailureCheck: true,
            ok: () => { },
            fail: () => { },
        }),
    );
};

/** Warm up FormForge SSO and HTTP connections in the background. */
export const warmUpFormForgeFF = () => async (dispatch) => {
    return dispatch(
        request.post({
            url: WARM_UP_FORM_FORGE_FF,
            payload: {},
            isToast: false,
            isFailureCheck: false,
            ok: () => { },
            fail: () => { },
        }),
    );
};