import { CHECK_EMAIL_SPAM, DELETE_AIEMAIL_BUILDER_TEMPLATE_BYID, DELETE_EMAILBUILDER_TEMPLATES_IMG, DELETE_OFFERSNIPPET_BYID, DELETE_SNIPPET_BYID, DUPLICATE_EMAILBUILDER_TEMPLATES_BYID, EMAIL_ATTACHMENT, EMAIL_TEMPLATENAME_EXIST, FETCH_OFFERSNIPPET_BYID, FETCH_SNIPPET_BYID, GET_AIEMAIL_BUILDER_CATEGORIES, GET_AIEMAIL_BUILDER_TEMPLATES, GET_AIEMAIL_BUILDER_TEMPLATE_BYID, GET_EMAILBUILDER_TEMPLATES_BYIMG, GET_EMAIL_FOOTER_NAME_EXIST, GET_OFFERSNIPPET_LISTS, GET_SNIPPET_LISTS, GET_SNIPPET_NAMEEXIST, IS_EMAILBUILDER_TEMPLATES, LINK_VERIFICATION, LP_TEMPLATE_PREVIEW, LP_TEMPLATE_PUBLISH, MANAGE_AIEMAIL_BUILDER_CATEGORIES, OFFER_SAVE_SNIPPET, OFFER_SNIPPET_NAMEEXIST, SAVE_AIEMAIL_BUILDER_TEMPLATES, SAVE_SNIPPET_BYID, SEND_TO_ME, UPLOAD_EMAILBUILDER_TEMPLATES_IMG } from 'Constants/EndPoints';
import request from 'Utils/Http';

import { templateLoading, updateTemplate } from 'Reducers/communication/Template/reducer';
import { setTemplateCategories } from 'Reducers/preferences/EmailBuilder/reducer';

export const templateGalleryListApi = (payload, loading = false) => async (dispatch) => {
    return dispatch(
        request.post({
            url: GET_AIEMAIL_BUILDER_TEMPLATES,
            payload,
            loading,
            isToast: false,
            ok: ({ data }) => {
                if (data?.status) {
                    dispatch(updateTemplate(data?.data));
                    dispatch(templateLoading(false));
                } else {
                    dispatch(updateTemplate([]));
                    dispatch(templateLoading(false));
                }
            },
            fail: (err) => {
                dispatch(templateLoading(false));
            },
        }),
    );
};
export const email_nameExisit =
    ({ payload }) =>
        async (dispatch) => {
            return dispatch(
                request.post({
                    url: EMAIL_TEMPLATENAME_EXIST,
                    payload,
                    // loading: true,
                    isToast: false,
                    ok: ({ data }) => {
                    },
                    fail: (err) => { },
                }),
            );
        };

export const lp_Template_preview =
    ({ payload }, { loading = false } = {}) =>
        async (dispatch) => {
            return dispatch(
                request.post({
                    url: LP_TEMPLATE_PREVIEW,
                    payload,
                    loading,
                    isToast: false,
                    ok: ({ data }) => {
                    },
                    isFailureCheck: true,
                    fail: (err) => { },
                }),
            );
        };
export const lp_Template_Publish =
    ({ payload }, { loading = false } = {}) =>
        async (dispatch) => {
            return dispatch(
                request.post({
                    url: LP_TEMPLATE_PUBLISH,
                    payload,
                    loading,
                    isToast: false,
                    ok: ({ data }) => {
                    },
                    isFailureCheck: true,
                    fail: (err) => { },
                }),
            );
        };
export const templateGalleryListApi_AI = (payload) => async (dispatch) => {
    return dispatch(
        request.post({
            url: GET_AIEMAIL_BUILDER_TEMPLATES,
            payload,
            loading: false,
            isToast: false,
            ok: ({ data }) => {
                if (data?.status) {
                    dispatch(updateTemplate(data?.data));
                    dispatch(templateLoading(false));
                } else {
                    dispatch(updateTemplate([]));
                    dispatch(templateLoading(false));
                }
            },
            fail: (err) => {
                dispatch(templateLoading(false));
            },
        }),
    );
};
export const templateCategoryListApi_AI = (payload) => async (dispatch) => {
    return dispatch(
        request.post({
            url: GET_AIEMAIL_BUILDER_CATEGORIES,
            payload,
            loading: false,
            isToast: false,
            ok: ({ data }) => {
                if (data?.status) {
                    dispatch(setTemplateCategories(data?.data));
                } else {
                    dispatch(setTemplateCategories([]));
                }
            },
            fail: (err) => {
                dispatch(setTemplateCategories([]));
            },
        }),
    );
};

export const templateCategoryManageApi_AI = (payload, { loading = false } = {}) => async (dispatch) => {
    return dispatch(
        request.post({
            url: MANAGE_AIEMAIL_BUILDER_CATEGORIES,
            payload,
            loading,
            isToast: false,
            ok: ({ data }) => { },
            fail: (err) => { },
        }),
    );
};

export const getTemplate_AIEmail_byId = ({ loading = true, ...payload } = {}) => async (dispatch) => {
    return dispatch(
        request.post({
            url: GET_AIEMAIL_BUILDER_TEMPLATE_BYID,
            payload,
            loading,
            isToast: false,
            ok: ({ data }) => { },
            fail: (err) => { },
        }),
    );
};
export const delete_Template_AIEmail_byId = (payload, { loading = false } = {}) => async (dispatch) => {
    return dispatch(
        request.post({
            url: DELETE_AIEMAIL_BUILDER_TEMPLATE_BYID,
            payload,
            loading,
            isToast: false,
            ok: ({ data }) => { },
            fail: (err) => { },
        }),
    );
};
export const saveTemplate_AIEmail = (payload, { loading } = {}) => async (dispatch) => {
    const resolvedLoading =
        loading !== undefined
            ? loading
            : payload?.loading !== undefined
              ? payload.loading
              : !payload?.isAutoSave;
    return dispatch(
        request.post({
            url: SAVE_AIEMAIL_BUILDER_TEMPLATES,
            payload,
            loading: resolvedLoading,
            isToast: false,
            ok: ({ data }) => { },
            fail: (err) => { },
        }),
    );
};
export const aiemailBuilder_nameExisit =
    ({ payload, loading = false }) =>
        async (dispatch) => {
            return dispatch(
                request.post({
                    url: IS_EMAILBUILDER_TEMPLATES,
                    payload,
                    loading,
                    isToast: false,
                    ok: ({ data }) => {
                    },
                    fail: (err) => { },
                }),
            );
        };
export const aiemailFooter_nameExisit =
    ({ payload }) =>
        async (dispatch) => {
            return dispatch(
                request.post({
                    url: GET_EMAIL_FOOTER_NAME_EXIST,
                    payload,
                    loading: true,
                    isToast: false,
                    ok: ({ data }) => {
                    },
                    fail: (err) => { },
                }),
            );
        };
export const templateDuplicate_aiBuilder = (payload, { loading = false } = {}) => async (dispatch) => {
    return dispatch(
        request.post({
            url: DUPLICATE_EMAILBUILDER_TEMPLATES_BYID,
            payload,
            loading,
            isToast: false,
            isFailureCheck: true,
            ok: ({ data }) => {
            },
            fail: (err) => { },
        }),
    );
};
export const getImages_AIBuilder = (payload) => async (dispatch) => {
    return dispatch(
        request.post({
            url: GET_EMAILBUILDER_TEMPLATES_BYIMG,
            payload,
            loading: false,
            isToast: false,
            ok: ({ data }) => {
            },
            fail: (err) => { },
        }),
    );
};
export const uploadImages_AIBuilder = (payload) => async (dispatch) => {
    return dispatch(
        await request.post({
            url: UPLOAD_EMAILBUILDER_TEMPLATES_IMG,
            payload,
            loading: true,
            isToast: false,
            ok: ({ data }) => {
            },
            fail: (err) => { },
        }),
    );
};
export const deleteImages_AIBuilder = (payload) => async (dispatch) => {
    return dispatch(
        request.post({
            url: DELETE_EMAILBUILDER_TEMPLATES_IMG,
            payload,
            loading: true,
            isToast: false,
            ok: ({ data }) => {
            },
            fail: (err) => { },
        }),
    );
};
export const get_snippentNameExist_AIBuilder = (payload) => async (dispatch) => {
    return dispatch(
        request.post({
            url: GET_SNIPPET_NAMEEXIST,
            payload,
            loading: true,
            isToast: false,
            ok: ({ data }) => {
            },
            fail: (err) => { },
        }),
    );
};
export const delete_snippetById_AIBuilder = (payload) => async (dispatch) => {
    return dispatch(
        request.post({
            url: DELETE_SNIPPET_BYID,
            payload,
            loading: true,
            isToast: false,
            ok: ({ data }) => {
            },
            fail: (err) => { },
        }),
    );
};
export const fetch_snippet_byID_AIBuilder = (payload) => async (dispatch) => {
    return dispatch(
        request.post({
            url: FETCH_SNIPPET_BYID,
            payload,
            loading: true,
            isToast: false,
            ok: ({ data }) => {
            },
            fail: (err) => { },
        }),
    );
};

export const save_snippet_AIBuilder = (payload) => async (dispatch) => {
    return dispatch(
        request.post({
            url: SAVE_SNIPPET_BYID,
            payload,
            loading: true,
            isToast: false,
            ok: ({ data }) => {
            },
            fail: (err) => { },
        }),
    );
};

export const get_snippentLists_AIBuilder = (payload) => async (dispatch) => {
    return dispatch(
        request.post({
            url: GET_SNIPPET_LISTS,
            payload,
            loading: false,
            isToast: false,
            ok: ({ data }) => {
            },
            fail: (err) => { },
        }),
    );
};
export const linkVerification_AIBuilder = (payload) => async (dispatch) => {
    return dispatch(
        request.post({
            url: LINK_VERIFICATION,
            payload,
            loading: true,
            isToast: false,
            ok: ({ data }) => {
            },
            fail: (err) => { },
        }),
    );
};

export const sendToMe_AIBuilder = (payload) => async (dispatch) => {
    return dispatch(
        request.post({
            url: SEND_TO_ME,
            payload,
            loading: true,
            isToast: false,
            ok: ({ data }) => {
            },
            fail: (err) => { },
        }),
    );
};

export const spamScore_AIBuilder = (payload) => async (dispatch) => {
    return dispatch(
        request.post({
            url: CHECK_EMAIL_SPAM,
            payload,
            loading: true,
            isToast: false,
            ok: ({ data }) => {
            },
            fail: (err) => { },
        }),
    );
};

export const emailAttach_AIBuilder = (formData) => async (dispatch) => {
    return dispatch(
        request.post({
            url: EMAIL_ATTACHMENT,
            payload: formData,
            customHeadConfig: {},
            isCustomHeadConfig: true,
            loading: true,
            isToast: false,
            ok: ({ data }) => {
            },
            fail: (err) => { },
        }),
    );
};

export const save_offer_snippet = (payload) => async (dispatch) => {
    return dispatch(
        request.post({
            url: OFFER_SAVE_SNIPPET,
            payload,
            loading: true,
            isToast: false,
            ok: ({ data }) => {
            },
            fail: (err) => { },
        }),
    );
};

export const get_offersnippentNameExist =
    ({ payload }) =>
        async (dispatch) => {
            return dispatch(
                request.post({
                    url: OFFER_SNIPPET_NAMEEXIST,
                    payload,
                    loading: true,
                    isToast: false,
                    ok: ({ data }) => {
                    },
                    fail: (err) => { },
                }),
            );
        };
export const delete_offersnippetById = (payload, loading = false) => async (dispatch) => {
    return dispatch(
        request.post({
            url: DELETE_OFFERSNIPPET_BYID,
            payload,
            loading,
            isToast: false,
            ok: ({ data }) => {
            },
            fail: (err) => { },
        }),
    );
};
export const fetch_offersnippetById = (payload, isFailureCheck = false, loading = true) => async (dispatch) => {
    return dispatch(
        request.post({
            url: FETCH_OFFERSNIPPET_BYID,
            payload,
            loading,
            isFailureCheck,
            isToast: false,
            ok: ({ data }) => {
            },
            fail: (err) => { },
        }),
    );
};

export const get_offersnippentLists = (payload) => async (dispatch) => {
    return dispatch(
        request.post({
            url: GET_OFFERSNIPPET_LISTS,
            payload,
            loading: false,
            isToast: false,
            ok: ({ data }) => {
            },
            fail: (err) => { },
        }),
    );
};
