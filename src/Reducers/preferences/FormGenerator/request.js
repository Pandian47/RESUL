import { DELETE_FORM_VALUES, DISABLE_FORM_CSV_SCHEDULE, DUPLICATE_FORM_ID, FORM_DOWNLOAD_RM, GET_CSS_FORMDATA, GET_CSV_DOWNLOAD, GET_CSV_FORMDATA, GET_CSV_FORMFIELDS, GET_EXTENDED_SYSTEM, GET_FORMNAME_EXIST, GET_FORM_LISTS, GET_FORM_RM, GET_FORM_VALUES, PUBLISH_FORM_VALUES, SAVEUPDATE_FORM_VALUES, SAVE_BRAND_OWNED_FORMS, SAVE_CSS_FORMDATA, SEARCH_FORM_LIST } from 'Constants/EndPoints';
import request from 'Utils/Http';

export const checkSaveFormExist =
    ({ payload }) =>
    async (dispatch) => {
        return dispatch(
            request.post({
                url: GET_FORMNAME_EXIST,
                payload,
                // loading: true,
                isToast: false,
                ok: ({ data }) => {
                                    },
                fail: (err) => {},
            }),
        );
    };
export const saveAndUpdateForm = (payload) => async (dispatch) => {
    return dispatch(
        request.post({
            url: SAVEUPDATE_FORM_VALUES,
            payload,
            loading: false,
            isToast: false,
            isFailureCheck: true,
            ok: ({ data }) => {},
            fail: (err) => {},
        }),
    );
};
export const formListApi = (payload) => async (dispatch) =>
    dispatch(
        request.post({
            url: GET_FORM_LISTS,
            payload,
            loading: false,
            isToast: false,
            ok: ({ data }) => {},
            fail: (err) => {},
        }),
    );

export const getFormData = (payload) => async (dispatch) =>
    dispatch(
        request.post({
            url: GET_FORM_VALUES,
            payload,
            loading: false,
            isToast: false,
            isFailureCheck: true,
            ok: ({ data }) => {},
            fail: (err) => {},
        }),
    );
export const duplicateFormbyID = (payload, loading = true) => async (dispatch) => {
    return dispatch(
        request.post({
            url: DUPLICATE_FORM_ID,
            payload,
            loading,
            isToast: false,
            isFailureCheck: true,
            ok: ({ data }) => {
                            },
            fail: (err) => {},
        }),
    );
};
export const deleteFormbyID = (payload) => async (dispatch) => {
    return dispatch(
        request.post({
            url: DELETE_FORM_VALUES,
            payload,
            loading: true,
            isToast: false,
            ok: ({ data }) => {
                            },
            fail: (err) => {},
        }),
    );
};
export const publishFormbyID = (payload) => async (dispatch) => {
    return dispatch(
        request.post({
            url: PUBLISH_FORM_VALUES,
            payload,
            loading: false,
            isToast: false,
            ok: ({ data }) => {
                            },
            fail: (err) => {},
        }),
    );
};
export const get_formCSV_download = (payload, loading = true) => async (dispatch) => {
    return dispatch(
        request.post({
            url: GET_CSV_DOWNLOAD,
            payload,
            loading,
            isToast: false,
            ok: ({ data }) => {},
            fail: (err) => {},
        }),
    );
};
export const get_formCSV_FormFields = (payload) => async (dispatch) => {
    return dispatch(
        request.post({
            url: GET_CSV_FORMFIELDS,
            payload,
            loading: false,
            isToast: false,
            isFailureCheck: true,
            ok: ({ data }) => {},
            fail: (err) => {},
        }),
    );
};

export const save_cssFormData = (payload) => async (dispatch) => {
    return dispatch(
        request.post({
            url: SAVE_CSS_FORMDATA,
            payload,
            loading: true,
            isToast: false,
            isFailureCheck: true,
            ok: ({ data }) => {},
            fail: (err) => {},
        }),
    );
};
export const get_cssFormData = (payload) => async (dispatch) => {
    return dispatch(
        request.post({
            url: GET_CSS_FORMDATA,
            payload,
            loading: true,
            isToast: false,
            ok: ({ data }) => {},
            fail: (err) => {},
        }),
    );
};
export const get_csVFormData = (payload) => async (dispatch) => {
    return dispatch(
        request.post({
            url: GET_CSV_FORMDATA,
            payload,
            loading: false,
            isToast: false,
            ok: ({ data }) => {},
            fail: (err) => {},
        }),
    );
};

export const disable_formCsvSchedule = (payload, loading = true) => async (dispatch) => {
    return dispatch(
        request.post({
            url: DISABLE_FORM_CSV_SCHEDULE,
            payload,
            isFailureCheck: true,
            loading,
            isToast: false,
            ok: ({ data }) => {},
            fail: (err) => {},
        }),
    );
};

export const saveAndUpdateBrandOwnedForm = (payload) => async (dispatch) => {
    return dispatch(
        request.post({
            url: SAVE_BRAND_OWNED_FORMS,
            payload,
            loading: true,
            isToast: false,
            ok: ({ data }) => {
                            },
            fail: (err) => {},
        }),
    );
};

export const getSearchNameByFormList =  (payload) => async (dispatch) => {
    return dispatch(
        request.post({
            url: SEARCH_FORM_LIST,
            payload,
            loading: true,
            ok: ({ data }) => {
                            },
            fail: (err) => {},
        }),
    );
};

export const getExtendedSystem = (payload) => async (dispatch) => {
    return dispatch(
        request.post({
            url: GET_EXTENDED_SYSTEM,
            payload,
            loading: true,
            isToast: false,
            ok: ({ data }) => {
                            },
            fail: (err) => {},
        }),
    );
};

export const formDownloadRM = (payload, loading = true) => async (dispatch) => {
    return dispatch(
        request.post({
            url: FORM_DOWNLOAD_RM,
            payload,
            loading,
            ok: ({ data }) => {
            },
            fail: (err) => {},
        }),
    );
};
export const getFormRM = (payload) => async (dispatch) => {
    return dispatch(
        request.post({
            url: GET_FORM_RM,
            payload,
            loading: false,
            ok: ({ data }) => {
            },
            fail: (err) => {},
        }),
    );
};