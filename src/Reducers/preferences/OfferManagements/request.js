import { CHECK_OFFERNAME_EXIST, COUPON_CODE_GENERATION, COUPON_CODE_GENERATION_CSV, CREATE_OFFER, DELETED_OFFER, DELETE_BRAND_OFFER, DELETE_OFFER_NEW, DELETE_STORE_OFFER, DUPLICATE_BRAND, DUPLICATE_OFFER, DUPLICATE_OFFER_NEW, DUPLICATE_STORE, FETCH_OFFER, FETCH_OFFER_BRAND, FETCH_OFFER_CATEGORY, FETCH_OFFER_STORE, FETCH_OFFER_SUBCATEGORY, FETCH_OFFER_TYPES, GET_DATABEST_OFFER, GET_OFFER_ANALYTICS, GET_OFFER_BYID, GET_OFFER_GRID_NEW, GET_OFFER_LIST, GET_OFFER_NAMELIST, GET_OFFER_TYPE, OFFER_CATEGORY_SAVE, OFFER_CODE_COUNT, PUBLISH_OFFER, RENDER_PUBLISHED_OFFER, SAVE_BEST_OFFER, SAVE_BRAND_OFFER, SAVE_OFFER, SAVE_OFFERCODEFILE, SAVE_STORE_OFFER } from 'Constants/EndPoints';
import request from 'Utils/Http';

export const checkOfferNameExists =
    ({ payload }) =>
    async (dispatch) => {
        return dispatch(
            request.post({
                url: CHECK_OFFERNAME_EXIST,
                payload,
                //loading: true,
                isToast: false,
                ok: ({ data }) => {
                                    },
                fail: (err) => {},
            }),
        );
    };

export const getOfferType =
    (payload, builder = false, { loading } = {}) =>
    async (dispatch) => {
        return dispatch(
            request.post({
                url: GET_OFFER_TYPE,
                payload,
                loading: typeof loading === 'boolean' ? loading : !builder,
                isToast: false,
                ok: ({ data }) => {
                                    },
                fail: (err) => {},
            }),
        );
    };
export const offerListApi = (payload) => async (dispatch) => {
    return dispatch(
        request.post({
            url: GET_OFFER_LIST,
            payload,
            loading: true,
            isToast: false,
            ok: ({ data }) => {
                            },
            fail: (err) => {},
        }),
    );
};
export const offerListApiNew = (payload) => async (dispatch) => {
    return dispatch(
        request.post({
            url: GET_OFFER_GRID_NEW,
            payload,
            loading: false,
            ok: ({ data }) => {
                            },
            fail: (err) => {},
        }),
    );
};

export const offerListPublishApi = (payload, loading = false) => async (dispatch) => {
    return dispatch(
        request.post({
            url: PUBLISH_OFFER,
            payload,
            loading,
            ok: ({ data }) => {
                            },
            fail: (err) => {},
        }),
    );
};

export const getOfferAnalytics = (payload) => async (dispatch) => {
    return dispatch(
        request.post({
            url: GET_OFFER_ANALYTICS,
            payload,
            loading: false,
            ok: ({ data }) => {
                            },
            fail: (err) => {},
        }),
    );
};


export const offerCategoryFetch = (payload , loading = false) => async (dispatch) => {
    return dispatch(
        request.post({
            url: FETCH_OFFER_CATEGORY,
            payload,
            loading: loading,
            ok: ({ data }) => {
                            },
            fail: (err) => {},
        }),
    );
};

export const saveOfferCategory = (payload, loading = false) => async (dispatch) => {
    return dispatch(
        request.post({
            url: OFFER_CATEGORY_SAVE,
            payload,
            loading,
            ok: ({ data }) => {
                            },
            fail: (err) => {},
        }),
    );
};




export const getOfferById = (payload) => async (dispatch) => {
    return dispatch(
        request.post({
            url: GET_OFFER_BYID,
            payload,
            loading: false,
            isToast: false,
            ok: ({ data }) => {
                            },
            fail: (err) => {},
        }),
    );
};
export const fetchOffer =
    ({ payload, loading = true }) =>
    async (dispatch) => {
    return dispatch(
        request.post({
            url: FETCH_OFFER,
            payload,
            loading,
            isToast: false,
            ok: ({ data }) => {
                            },
            fail: (err) => {},
        }),
    );
};
export const renderPublishedOffer = (payload, loading = false) => async (dispatch) => {
    return dispatch(
        request.post({
            url: RENDER_PUBLISHED_OFFER,
            payload,
            loading,
            isToast: false,
            ok: ({ data }) => {},
            fail: (err) => {},
        }),
    );
};
export const saveOffer = (payload) => async (dispatch) => {
    return dispatch(
        request.post({
            url: SAVE_OFFER,
            payload,
            loading: true,
            isToast: false,
            ok: ({ data }) => {
                            },
            fail: (err) => {},
        }),
    );
};
export const duplicateOffer = (payload) => async (dispatch) => {
    return dispatch(
        request.post({
            url: DUPLICATE_OFFER,
            payload,
            loading: true,
            isToast: false,
            ok: ({ data }) => {
                            },
            fail: (err) => {},
        }),
    );
};
export const duplicateOfferNew = (payload, loading = false) => async (dispatch) => {
    return dispatch(
        request.post({
            url: DUPLICATE_OFFER_NEW,
            payload,
            loading,
            isToast: false,
            ok: ({ data }) => {
                            },
            fail: (err) => {},
        }),
    );
};
export const deleteOffer = (payload) => async (dispatch) => {
    return dispatch(
        request.post({
            url: DELETED_OFFER,
            payload,
            loading: true,
            isToast: false,
            ok: ({ data }) => {
                            },
            fail: (err) => {},
        }),
    );
};
export const deleteOfferNew = (payload, loading = false) => async (dispatch) => {
    return dispatch(
        request.post({
            url: DELETE_OFFER_NEW,
            payload,
            loading,
            isToast: false,
            ok: ({ data }) => {
                            },
            fail: (err) => {},
        }),
    );
};

export const saveOfferCodeFile = (payload) => async (dispatch) => {
    return dispatch(
        request.post({
            url: SAVE_OFFERCODEFILE,
            payload,
            loading: true,
            isToast: false,
            ok: ({ data }) => {
                            },
            fail: (err) => {},
        }),
    );
};
export const getCouponCode = (payload) => async (dispatch) => {
    return dispatch(
        request.post({
            url: COUPON_CODE_GENERATION,
            payload,
            loading: true,
            isToast: false,
            isFailureCheck: true,
            ok: ({ data }) => {
                            },
            fail: (err) => {},
        }),
    );
};
export const getCouponCode_CSV = (payload) => async (dispatch) => {
    return dispatch(
        request.post({
            url: COUPON_CODE_GENERATION_CSV,
            payload,
            loading: true,
            isToast: false,
            ok: ({ data }) => {
                            },
            fail: (err) => {},
        }),
    );
};
export const getOfferNameList = (payload, { loading = true } = {}) => async (dispatch) => {
    return dispatch(
        request.post({
            url: GET_OFFER_NAMELIST,
            payload,
            loading,
            isToast: false,
            ok: ({ data }) => {
                            },
            fail: (err) => {},
        }),
    );
};
export const getBestOfferAPi = (payload) => async (dispatch) => {
    return dispatch(
        request.post({
            url: GET_DATABEST_OFFER,
            payload,
            loading: true,
            isToast: false,
            ok: ({ data }) => {
                            },
            fail: (err) => {},
        }),
    );
};
export const saveBestOffer = (payload, { loading = true } = {}) => async (dispatch) => {
    return dispatch(
        request.post({
            url: SAVE_BEST_OFFER,
            payload,
            loading,
            isToast: false,
            ok: ({ data }) => {
                            },
            fail: (err) => {},
            isFailureCheck: true
        }),
    );
};
export const offerCodeCountApi = (payload, { loading = true } = {}) => async (dispatch) => {
    return dispatch(
        request.post({
            url: OFFER_CODE_COUNT,
            payload,
            loading,
            isToast: false,
            ok: ({ data }) => {
                            },
            fail: (err) => {},
        }),
    );
};
export const fetchOfferBrand = (payload, loading= false) => async (dispatch) => {
    return dispatch(
        request.post({
            url: FETCH_OFFER_BRAND,
            payload,
            loading: loading,
            isToast: false,
            ok: ({ data }) => {
                            },
            fail: (err) => {},
        }),
    );
};
export const fetchOfferStore = (payload, loading = false) => async (dispatch) => {
    return dispatch(
        request.post({
            url: FETCH_OFFER_STORE,
            payload,
            loading,
            isToast: false,
            ok: ({ data }) => {
                            },
            fail: (err) => {},
        }),
    );
};
export const fetchOfferCategory = (payload) => async (dispatch) => {
    return dispatch(
        request.post({
            url: FETCH_OFFER_CATEGORY,
            payload,
            loading: false,
            isToast: false,
            ok: ({ data }) => {
                            },
            fail: (err) => {},
        }),
    );
};
export const fetchOfferSubCategory = (payload) => async (dispatch) => {
    return dispatch(
        request.post({
            url: FETCH_OFFER_SUBCATEGORY,
            payload,
            loading: false,
            isToast: false,
            ok: ({ data }) => {
                            },
            fail: (err) => {},
        }),
    );
};
export const fetchOfferTypes = (payload) => async (dispatch) => {
    return dispatch(
        request.post({
            url: FETCH_OFFER_TYPES,
            payload,
            loading: true,
            isToast: false,
            ok: ({ data }) => {
                            },
            fail: (err) => {},
        }),
    );
};

export const createOffer = (payload, loading = false) => async (dispatch) => {
    return dispatch(
        request.post({
            url: CREATE_OFFER,
            payload,
            loading,
            isToast: false,
            ok: ({ data }) => {
                            },
            fail: (err) => {},
        }),
    );
};
export const saveBrandOffer = (payload, loading = false) => async (dispatch) => {
    return dispatch(
        request.post({
            url: SAVE_BRAND_OFFER,
            payload,
            loading,
            isToast: false,
            ok: ({ data }) => {
                            },
            fail: (err) => {},
        }),
    );
};

export const duplicateBrand = (payload, loading = false) => async (dispatch) => {
     let receivePayload = {
        payload: {
            ...payload?.payload,
        },
    };
    return dispatch(
        request.post({
            url: DUPLICATE_BRAND,
            payload : receivePayload?.payload,
            loading,
            isToast: false,
            ok: ({ data }) => {
                            },
            fail: (err) => {},
        }),
    );
};




export const saveStoreOffer = (payload, loading = false) => async (dispatch) => {
    return dispatch(
        request.post({
            url: SAVE_STORE_OFFER,
            payload,
            loading,
            isToast: false,
            ok: ({ data }) => {
                            },
            fail: (err) => {},
        }),
    );
};


export const duplicateStore = (payload, loading = false) => async (dispatch) => {
    let receivePayload = {
        payload: {
            ...payload?.payload,
        },
    };
    return dispatch(
        request.post({
            url: DUPLICATE_STORE,
            payload: receivePayload?.payload,
            loading,
            isToast: false,
            ok: ({ data }) => {
                            },
            fail: (err) => {},
        }),
    );
};



export const deleteBrandOffer = (payload, loading = false) => async (dispatch) => {
    return dispatch(
        request.post({
            url: DELETE_BRAND_OFFER,
            payload,
            loading,
            isToast: false,
            ok: ({ data }) => {
                            },
            fail: (err) => {},
        }),
    );
};
export const deleteStoreOffer = (payload, loading = false) => async (dispatch) => {
    return dispatch(
        request.post({
            url: DELETE_STORE_OFFER,
            payload,
            loading,
            isToast: false,
            ok: ({ data }) => {
                            },
            fail: (err) => {},
        }),
    );
};