import { CHECK_EXTENDED_NAMEEXISIT, FRIENDLYNAME_CHECK, GET_API_CONSUMPTION, GET_BIGQUERY_DETAILS, GET_COMM_LINKEDIN_ACCESSTOKEN, GET_CONNECTORS_LIST, GET_CONNECTOR_DETAILS, GET_DATAEXCHANGE_ACTIVEELEMENTS, GET_DATA_TABLES_DIGIPOP, GET_DIGIPOP_CONNECTOR_ID, GET_DIGIPOP_ENABLED, GET_DIGIPOP_GROUPATTRIBUTES, GET_EXTENDED_ACCESSTOKEN, GET_EXTENDED_TWITTER_ACCESSTOKEN, GET_EXTENDED_VALUES, GET_FACEBOOK_ADS, GET_FACEBOOK_PAGES, GET_GOOGLE_ADS, GET_GOOGLE_ADS_ACCESSTOKEN, GET_GOOGLE_ANALYTICS_ACCOUNTS_LISTS, GET_INSTAGRAM_ACCOUNTS, GET_INSTAGRAM_PAGES, GET_LINKEDIN_PAGES, GET_MATOMO_INSIGHTS, GET_MATOMO_SITES, GET_PINTEREST_ACCESSTOKEN, GET_PINTEREST_BOARDSLIST, GET_SOCIALMEDIA_OAUTHURL, GET_TWITTER_USERDETAILS, GET_YOUTUBE_ACCESSTOKEN, GET_YOUTUBE_ACCOUNTS, RENXT_TOKEN_VALIDATION, SAVE_API_CONSUMPTION, SAVE_DIGIPIP_ATTRIBUTES, SAVE_SOCIAL_USERSETUP_DETAILS, UPDATE_EXTENDED_NAMEEXISIT } from 'Constants/EndPoints';
import request from 'Utils/Http';

import { updateIntegartedSytem } from './reducer';
import { updateMatomoInsights, updateMatomoSites } from 'Reducers/RemoteDataSource/reducer';

export const getDataExchangeElements =
    (payload, fromAudience = false, AUDIENCE_RDSTAB_CONFIG = [], loading = false) =>
    async (dispatch) => {
        if (loading) {
            dispatch(updateIntegartedSytem({ field: 'integratedSysLoading', data: true }));
        }
        return dispatch(
            request.post({
                url: GET_DATAEXCHANGE_ACTIVEELEMENTS,
                payload,
                loading,
                ok: (res) => {
                    const {
                        data: { data, status },
                    } = res;
                    const editData = status
                        ? fromAudience
                            ? data.filter((item) => !AUDIENCE_RDSTAB_CONFIG.includes(item?.sourceGroupName))
                            : data
                        : [];
                    dispatch(updateIntegartedSytem({ field: 'GetRemoteConnectionActive', data: editData }));
                    if (loading) {
                        dispatch(updateIntegartedSytem({ field: 'integratedSysLoading', data: false }));
                    }
                    return { status, data: editData };
                },
                fail: () => {
                    dispatch(updateIntegartedSytem({ field: 'GetRemoteConnectionActive', data: [] }));
                    if (loading) {
                        dispatch(updateIntegartedSytem({ field: 'integratedSysLoading', data: false }));
                    }
                    return { status: false, data: [] };
                },
                final: () => {
                    if (loading) {
                        dispatch(updateIntegartedSytem({ field: 'integratedSysLoading', data: false }));
                    }
                },
            }),
        );
    };
export const getAccessTokens = (payload) => async (dispatch) => {
    return dispatch(
        request.post({
            url:
                payload.socialMediaTypeId === 11
                    ? GET_GOOGLE_ADS_ACCESSTOKEN
                    : payload.socialMediaTypeId === 13
                    ? GET_YOUTUBE_ACCESSTOKEN
                    : GET_EXTENDED_ACCESSTOKEN,
            payload,
            loading: true,
            isFailureCheck: true,
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
export const RenxtTokenValidation = (payload) => async (dispatch) => {
    return dispatch(
        request.post({
            url: RENXT_TOKEN_VALIDATION,
            payload,
            loading: true,
            isFailureCheck: true,
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

export const getAccessTokens_Twitter = (payload) => async (dispatch) => {
    return dispatch(
        request.post({
            url: GET_EXTENDED_TWITTER_ACCESSTOKEN,
            payload,
            loading: true,
            isFailureCheck: true,
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

export const get_webhooknameExist = (payload, loading = false) => async (dispatch) => {
    return dispatch(
        request.post({
            url: CHECK_EXTENDED_NAMEEXISIT,
            payload,
            loading,
            isToast: false,
            ok: ({ data }) => {},
            fail: (err) => {},
        }),
    );
};
export const get_webhooknameSave = (payload, loading = false) => async (dispatch) => {
    return dispatch(
        request.post({
            url: UPDATE_EXTENDED_NAMEEXISIT,
            payload,
            loading,
            isToast: false,
            ok: ({ data }) => {},
            fail: (err) => {},
        }),
    );
};
export const get_Extendedvalues = (payload, loading = false) => async (dispatch) => {
    return dispatch(
        request.post({
            url: GET_EXTENDED_VALUES,
            payload,
            loading,
            isToast: false,
            ok: ({ data }) => {},
            fail: (err) => {},
        }),
    );
};
export const get_connectorsList =
    (arg, legacyLoading = false) =>
    async (dispatch) => {
        const payload = arg?.payload ?? arg;
        const loading = arg?.loading ?? legacyLoading;
        return dispatch(
            request.post({
                url: GET_CONNECTORS_LIST,
                payload,
                loading,
                ok: ({ data }) => {
                    const { data: res, status } = data;
                    const result = status ? res : [];
                    dispatch(updateIntegartedSytem({ field: 'connectorList', data: result }));
                    return { status, data: result };
                },
                fail: () => {
                    dispatch(updateIntegartedSytem({ field: 'connectorList', data: [] }));
                    return { status: false, data: [] };
                },
            }),
        );
    };
// export const get_connectorsList = (payload) => async (dispatch) => {
//     return async dispatch(
        
//         request.post({
//             url: GET_CONNECTORS_LIST,
//             payload,
//             loading: true,
//             isToast: false,
//             ok: ({ data }) => {
//                 const { data: res, status } = data;
//                 const result = status ? res : [];
//                 dispatch(updateIntegartedSytem({ field: 'connectorList', data: result }));
//             },
//             fail: (err) => console.log('ERROR @ form  get_connectorsList : ', err),
//         }),
//     );
// };
export const save_ApiConsumption =
    ({ payload, loading = false }) =>
    async (dispatch) => {
        return dispatch(
            request.post({
                url: SAVE_API_CONSUMPTION,
                payload,
                loading,
                isToast: false,
                ok: ({ data }) => {},
                fail: (err) => {},
            }),
        );
    };
export const get_ApiConsumption = (payload) => async (dispatch) => {
    return dispatch(
        request.post({
            url: GET_API_CONSUMPTION,
            payload,
            loading: false,
            isToast: false,
            ok: (res) => {
                const {
                    data: { data, status },
                } = res;
                if (status) {
                    dispatch(updateIntegartedSytem({ field: 'GetAPIConnectionActive', data: data }));
                }
            },
            fail: (err) => {},
        }),
    );
};
export const get_ConnectorDetails = (payload, loading = true) => async (dispatch) => {
    return dispatch(
        request.post({
            url: GET_CONNECTOR_DETAILS,
            payload,
            loading: loading,
            isFailureCheck: true,
            isToast: false,
            ok: ({ data }) => {},
            fail: (err) => {},
        }),
    );
};

// Digipop

export const save_digipop_credentails = (payload) => async (dispatch) => {
    return dispatch(
        request.post({
            url: GET_DATA_TABLES_DIGIPOP,
            payload,
            loading: true,
            isToast: false,
            ok: ({ data }) => {},
            fail: (err) => {},
        }),
    );
};

export const get_DigipopnameExist = (payload) => async (dispatch) => {
    return dispatch(
        request.post({
            url: FRIENDLYNAME_CHECK,
            payload,
            loading: true,
            isToast: false,
            ok: ({ data }) => {},
            fail: (err) => {},
        }),
    );
};

export const get_DigipopExtendedvalues = (payload) => async (dispatch) => {
    return dispatch(
        request.post({
            url: GET_DIGIPOP_CONNECTOR_ID,
            payload,
            loading: true,
            isToast: false,
            ok: ({ data }) => {},
            fail: (err) => {},
        }),
    );
};
export const get_DigipopGroupAttributes= ({payload}) => async (dispatch) => {
    return dispatch(
        request.post({
            url: GET_DIGIPOP_GROUPATTRIBUTES,
            payload,
            loading: true,
            isToast: false,
            ok: ({ data }) => {},
            fail: (err) => {},
        }),
    );
};

export const get_IsDigipopEnabled = ({payload}) => async (dispatch) => {
    return dispatch(
        request.post({
            url: GET_DIGIPOP_ENABLED,
            payload,
            loading: true,
            isToast: false,
            ok: ({ data }) => {},
            fail: (err) => {},
        }),
    );
};
export const save_Digipop_Attibutes = ({ payload, loading = true }) => async (dispatch) => {
    return dispatch(
        request.post({
            url: SAVE_DIGIPIP_ATTRIBUTES,
            payload,
            loading,
            isToast: false,
            ok: ({ data }) => {},
            fail: (err) => {},
        }),
    );
};

export const getSocialMediaOauthUrl =
    ({ payload }) =>
    async (dispatch) => {
        return dispatch(
            request.post({
                url: GET_SOCIALMEDIA_OAUTHURL,
                payload,
                loading: true,
                isFailureCheck: true,
                ok: ({ data }) => {
                    if (data.status) {
                        const { status, data: res } = data;
                    }
                },
                fail: (err) => {},
            }),
        );
    };
export const get_FacebookPages = (payload) => async (dispatch) => {
    return dispatch(
        request.post({
            url: GET_FACEBOOK_PAGES,
            payload,
            loading: true,
            isToast: false,
            isFailureCheck: true,
            ok: (res) => {
                const {
                    data: { data, status },
                } = res;
            },
            fail: (err) => {},
        }),
    );
};

export const GetFacebookAdsList = (payload) => async (dispatch) => {
    return dispatch(
        request.post({
            url: GET_FACEBOOK_ADS,
            payload,
            loading: true,
            isToast: false,
            isFailureCheck: true,
            ok: (res) => {
                const {
                    data: { data, status },
                } = res;
            },
            fail: (err) => {},
        }),
    );
};

export const GetGoogleAdsList = (payload) => async (dispatch) => {
    return dispatch(
        request.post({
            url: GET_GOOGLE_ADS,
            payload,
            loading: true,
            isToast: false,
            isFailureCheck: true,
            ok: (res) => {
                const {
                    data: { data, status },
                } = res;
            },
            fail: (err) => {},
        }),
    );
};

export const GetYoutubeAccountsList = (payload) => async (dispatch) => {
    return dispatch(
        request.post({
            url: GET_YOUTUBE_ACCOUNTS,
            payload,
            loading: true,
            isToast: false,
            isFailureCheck: true,
            ok: (res) => {
                const {
                    data: { data, status },
                } = res;
            },
            fail: (err) => {},
        }),
    );
};

export const save_SocialUserSetup = (payload) => async (dispatch) => {
    return dispatch(
        request.post({
            url: SAVE_SOCIAL_USERSETUP_DETAILS,
            payload,
            loading: true,
            isToast: false,
            isFailureCheck: true,
            ok: (res) => {
                const {
                    data: { data, status },
                } = res;
            },
            fail: (err) => {},
        }),
    );
};

export const get_TwitterUserDetails = (payload) => async (dispatch) => {
    return dispatch(
        request.post({
            url: GET_TWITTER_USERDETAILS,
            payload,
            loading: true,
            isToast: false,
            isFailureCheck: true,
            ok: (res) => {
                const {
                    data: { data, status },
                } = res;
            },
            fail: (err) => {},
        }),
    );
};

export const get_LinkedinAccessToken = (payload) => async (dispatch) => {
    return dispatch(
        request.post({
            url: GET_COMM_LINKEDIN_ACCESSTOKEN,
            payload,
            loading: true,
            isToast: false,
            isFailureCheck: true,
            ok: (res) => {
                const {
                    data: { data, status },
                } = res;
            },
            fail: (err) => {},
        }),
    );
};

export const get_LinkedinPages = (payload) => async (dispatch) => {
    return dispatch(
        request.post({
            url: GET_LINKEDIN_PAGES,
            payload,
            loading: true,
            isToast: false,
            isFailureCheck: true,
            ok: (res) => {
                const {
                    data: { data, status },
                } = res;
            },
            fail: (err) => {},
        }),
    );
};
export const get_InstagramAccounts = (payload) => async (dispatch) => {
    return dispatch(
        request.post({
            url: GET_INSTAGRAM_ACCOUNTS,
            payload,
            loading: true,
            isToast: false,
            isFailureCheck: true,
            ok: (res) => {
                const {
                    data: { data, status },
                } = res;
                if (status) {
                }
            },
            fail: (err) => {},
        }),
    );
};
export const get_InstagramPages = (payload) => async (dispatch) => {
    return dispatch(
        request.post({
            url: GET_INSTAGRAM_PAGES,
            payload,
            loading: true,
            isToast: false,
            isFailureCheck: true,
            ok: (res) => {
                const {
                    data: { data, status },
                } = res;
                if (status) {
                }
            },
            fail: (err) => {},
        }),
    );
};

export const get_PinterestAccessToken = (payload) => async (dispatch) => {
    return dispatch(
        request.post({
            url: GET_PINTEREST_ACCESSTOKEN,
            payload,
            loading: true,
            isToast: false,
            isFailureCheck: true,
            ok: (res) => {
                const {
                    data: { data, status },
                } = res;
                if (status) {
                }
            },
            fail: (err) => {},
        }),
    );
};
export const get_PinterestBoardsList = (payload) => async (dispatch) => {
    return dispatch(
        request.post({
            url: GET_PINTEREST_BOARDSLIST,
            payload,
            loading: true,
            isToast: false,
            isFailureCheck: true,
            ok: (res) => {
                const {
                    data: { data, status },
                } = res;
                if (status) {
                }
            },
            fail: (err) => {},
        }),
    );
};
export const get_BigqueryDetail = (payload) => async (dispatch) => {
    return dispatch(
        request.post({
            url: GET_BIGQUERY_DETAILS,
            payload,
            loading: true,
            isToast: false,
            isFailureCheck: true,
            ok: (res) => {
                const {
                    data: { data, status },
                } = res;
                if (status) {
                }
            },
            fail: (err) => {},
        }),
    );
};
export const get_googleanalyticsaccountslists = (payload) => async (dispatch) => {
    return dispatch(
        request.post({
            url: GET_GOOGLE_ANALYTICS_ACCOUNTS_LISTS,
            payload,
            loading: true,
            isToast: false,
            ok: ({ data }) => {
                            },
            fail: (err) => {},
        }),
    );
};
export const get_matomosites = (payload) => async (dispatch) => {
    return dispatch(
        request.post({
            url: GET_MATOMO_SITES,
            payload,
            loading: true,
            isToast: false,
            ok: ({ data }) => {
                if (data.status) {
                    const { status, data: res } = data;
                    if (status) {
                        dispatch(updateMatomoSites(res));
                    } else {
                        dispatch(updateMatomoSites([]));
                    }
                }
            },
            fail: (err) => {},
        }),
    );
};
export const get_matomoinsights = (payload) => async (dispatch) => {
    return dispatch(
        request.post({
            url: GET_MATOMO_INSIGHTS,
            payload,
            loading: true,
            isToast: false,
            ok: ({ data }) => {
                if (data.status) {
                    const res = data?.data;
                    let modifiedData = res.map((item) => ({
                        id: item,
                        name: item,
                    }));
                    dispatch(updateMatomoInsights(modifiedData));
                } else {
                    dispatch(updateMatomoInsights([]));
                }
            },
            fail: (err) => {},
        }),
    );
};
