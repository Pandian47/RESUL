import { AUDIENCE_GET_PERSONALIZED_ATTRIBUTES, DATA_CATALOGUE_ATTRIBUTES, DATA_CATALOGUE_ATTRIBUTE_BYID, DATA_CATALOGUE_CHECK_UI_PRINTABLE_EXISTS, DATA_CATALOGUE_CLASSIFICATIONS, DATA_CATALOGUE_DATA_TYPES, DATA_CATALOGUE_DATEFORMATS, DATA_CATALOGUE_FILTER_GROUPS, DATA_CATALOGUE_GRID, DATA_CATALOGUE_INPUT_TYPES, DATA_CATALOGUE_SAVE_ATTRIBUTE, DATA_CATALOGUE_UPDATE_ATTRIBUTE, DATA_CATALOGUE_UPDATE_CLASSIFICATIONS, DATA_CATALOGUE_UPDATE_CLASSIFICATION_FALLBACK, DATA_CATALOGUE_UPDATE_FILTERGROUP, GET_CHILD_LISTINGS, IS_CAT_TYPE_NAME_EXISTS, SAVE_CAT_TYPE, UPDATE_FILTER_GROUP } from 'Constants/EndPoints';
import request from 'Utils/Http';

import { update_data_catalogue, update_loading } from './reducer';
import { getUserDetails, encryptWithAES } from 'Utils/modules/crypto';
import { updateBrandId } from 'Utils/modules/brandStorage';

import CacheManager from 'Utils/cacheManager';
export const getSeedDataAttributes =
    (payload, loading = false, listType) =>
    async (dispatch) => {
        dispatch(
            request.post({
                url:
                     AUDIENCE_GET_PERSONALIZED_ATTRIBUTES
                        ,
                payload,
                loading: loading,
                ok: (res) => {
                    const {
                        data: { data, status },
                    } = res;
                    if (status) {
                        dispatch(update_data_catalogue({ field: 'dataCatalogueAttrs', data: data }));
                        if (!listType) {
                            dispatch(getFilterGroups(payload));
                            dispatch(getClassifications(payload));
                        }
                    }
                },
                fail: (err) => {
                                    },
                final: () => {
                    dispatch(update_loading({ attributes: false }));
                },
            }),
        );
    };
    export const getDataAttributes =
    (payload, loading = false, listType,form='') =>
    async (dispatch) => {
      return  dispatch(
            request.post({
                url:  DATA_CATALOGUE_ATTRIBUTES,
                payload,
                loading: loading,
                ok: (res) => {
                    const {
                        data: { data, status },
                    } = res;
                    if (status) {
                        dispatch(update_data_catalogue({ field: 'dataCatalogueAttrs', data: data }));
                        if (!listType && form==='') {
                            dispatch(getFilterGroups(payload));
                            dispatch(getClassifications(payload));
                        }
                    }else{
                        dispatch(update_data_catalogue({ field: 'dataCatalogueAttrs', data: [] }));
                    }
                },
                fail: (err) => {
                                    },
                final: () => {
                    dispatch(update_loading({ attributes: false }));
                },
            }),
        );
    };

export const getAttributeById =
    ({ payload, setEditData }, loading = false) =>
    async (dispatch) => {
        return dispatch(
            request.post({
                url: DATA_CATALOGUE_ATTRIBUTE_BYID,
                payload,
                loading,
                isFailureCheck:true,
                ok: (res) => {
                    const {
                        data: { data, status },
                    } = res;
                    if (status) {
                        setEditData(data[0]);
                        // dispatch(update_data_catalogue({ field: 'editAttributeById', data: data }));
                    }
                },
                fail: (err) => {
                                    },
                final: () => {
                    dispatch(update_loading({ attributes: false }));
                },
            }),
        );
    };

export const getFilterGroups = (payload) => async (dispatch) => {
    dispatch(update_loading({ filterGroup: true }));
    dispatch(
        request.post({
            url: DATA_CATALOGUE_FILTER_GROUPS, 
            loading: false,
            payload,
            ok: (res) => {
                const {
                    data: { data, status },
                } = res;
                if (status) {
                    dispatch(update_data_catalogue({ field: 'filterGroups', data: data }));
                }else{
                    dispatch(update_data_catalogue({ field: 'filterGroups', data: [] }));
                }
            },
            fail: (err) => {
                            },
            final: () => {
                dispatch(update_loading({ filterGroup: false }));
            },
        }),
    );
};

export const getClassifications = (payload) => async (dispatch) => {
    dispatch(update_loading({ classificationGroup: true }));
    dispatch(
        request.post({
            url: DATA_CATALOGUE_CLASSIFICATIONS,
            loading: false,
            payload,
            ok: (res) => {
                const {
                    data: { data, status },
                } = res;
                if (status) {
                    const finalClassificationData = data.map((item) => {
                        if (item?.dataClassificationName === 'Personalisation') {
                            return {
                                ...item,
                                dataClassificationName: 'Personalization',
                            };
                        } else {
                            return item;
                        }
                    });
                    dispatch(update_data_catalogue({ field: 'classifications', data: finalClassificationData }));
                } else {
                    dispatch(update_data_catalogue({ field: 'classifications', data: [] }));
                }
            },
            fail: (err) => {
                            },
            final: () => {
                dispatch(update_loading({ classificationGroup: false }));
            },
        }),
    );
};

export const getDataTypes = (payload, loading = false) => async (dispatch) => {
    return dispatch(
        request.post({
            url: DATA_CATALOGUE_DATA_TYPES,
            loading,
            payload,
            ok: (res) => {
                const {
                    data: { data, status },
                } = res;
                if (status) {
                    dispatch(update_data_catalogue({ field: 'dataTypes', data: data }));
                }else{
                    dispatch(update_data_catalogue({ field: 'dataTypes', data: [] }));
                }
            },
            fail: (err) => {
                            },
        }),
    );
};

export const getInputTypes = (payload, loading = false) => async (dispatch) => {
    return dispatch(
        request.post({
            url: DATA_CATALOGUE_INPUT_TYPES,
            loading,
            payload,
            ok: (res) => {
                const {
                    data: { data, status },
                } = res;
                if (status) {
                    dispatch(update_data_catalogue({ field: 'inputTypes', data: data }));
                }else{
                    dispatch(update_data_catalogue({ field: 'inputTypes', data: [] }));
                }
            },
            fail: (err) => {
                            },
        }),
    );
};
 
export const getDateFormat = (payload, loading = false) => async (dispatch) => {
    return dispatch(
        request.post({
            url: DATA_CATALOGUE_DATEFORMATS,
            loading,
            payload,
            ok: (res) => {
                const {
                    data: { data, status },
                } = res;
                if (status) {
                    dispatch(update_data_catalogue({ field: 'dateformats', data: data }));
                } else dispatch(update_data_catalogue({ field: 'dateformats', data: [] }));
            },
            fail: (err) => {
                            },
        }),
    );
};

export const checkIsUiPrintableNameExists =
    ({ payload }) =>
    (dispatch) => {
        return dispatch(
            request.post({
                url: DATA_CATALOGUE_CHECK_UI_PRINTABLE_EXISTS,
                payload,
                isToast: false,
                ok: () => {},
                fail: (err) => {
                                    },
            }),
        );
    };
export const dataCatalogueGrid =
    ({ payload }) =>
    (dispatch) => {
        return dispatch(
            request.post({
                url: DATA_CATALOGUE_GRID,
                payload,
                isToast: false,
                loading: false,
                ok: () => {},
                fail: (err) => {
                                    },
            }),
        );
    };
export const updateFilterGroups =
    ({ payload }) =>
    (dispatch) => {
        return dispatch(
            request.post({
                url: UPDATE_FILTER_GROUP,
                payload,
                loading: true,
                isToast: false,
                isFailureCheck: true,
                ok: () => {},
                fail: (err) => {
                                    },
            }),
        );
    };

export const saveDataAttribute = (payload, callNewAttrs = true, loading = false) => async (dispatch) => {
    return dispatch(
        request.post({
            url: DATA_CATALOGUE_SAVE_ATTRIBUTE,
            payload,
            loading,
            isFailureCheck:true,
            ok: (res) => {
                const {
                    data: { status, data },
                } = res;
                const { clientId, userId, departmentId, isBrandId, name } = payload;
                if (status) {
                    const payload = {
                        departmentId,
                        clientId,
                        userId,
                    };
                    if(callNewAttrs){
                     dispatch(getDataAttributes(payload, false));
                    }
                    if (isBrandId === 1) updateBrandId(name, data, departmentId, name);
                }
            },
            fail: (err) => {
                            },
        }),
    );
};

export const updateCatDataAttribute = (payload, setEditData, setShowModal, loading = false) => async (dispatch) => {
    return dispatch(
        request.post({
            url: DATA_CATALOGUE_UPDATE_ATTRIBUTE,
            payload,
            loading,
            isFailureCheck:true,
            ok: (res) => {
                const {
                    data: { status },
                } = res;
                const { clientId, userId, departmentId, uIPrintableName, dataAttributeId, isBrandId
                      , attributeName 
                      } = payload;
                if (status) {
                    const payload = {
                        departmentId,
                        clientId,
                        userId,
                    };
                    if (isBrandId === 1) updateBrandId(uIPrintableName, dataAttributeId, departmentId,attributeName);
                    else  {
                          let tmpData = getUserDetails();
                         tmpData.departmentList = tmpData.departmentList.map((item) => {
                            if (item.departmentId===departmentId && item.brandName === attributeName && item.brandId === dataAttributeId) {
                                        return {
                                            ...item,
                                            "brandId": 0,
                                            "brandName": "",
                                            "uiprintableName": ""
                                        };
                                    }
                                    return item;
                                 }); 
                             localStorage.setItem('userInfo', encryptWithAES(JSON.stringify(tmpData)));
                             CacheManager.set('userDetails', tmpData);
                    }
                    dispatch(getDataAttributes(payload, false));

                    setEditData(null);
                    setShowModal(false);
                }
            },
            fail: (err) => {
                            },
        }),
    );
};

export const updateClassifications = (payload) => (dispatch) => {
   return  dispatch(
        request.post({
            url: DATA_CATALOGUE_UPDATE_CLASSIFICATIONS,
            payload,
            loading: true,
            isFailureCheck: true,
            ok: (res) => {
                const {
                    data: { status },
                } = res;
                const { clientId, userId, departmentId } = payload;
                if (status) {
                    dispatch(getDataAttributes({ clientId, userId, departmentId }));
                }
            },
            fail: (err) => {
                            },
        }),
    );
};
export const updateFilterGroup = (payload) => (dispatch) => {
   return  dispatch(
        request.post({
            url: DATA_CATALOGUE_UPDATE_FILTERGROUP,
            payload,
            loading: true,
            isFailureCheck: true,
            ok: (res) => {
                const {
                    data: { status },
                } = res;
                const { clientId, userId, departmentId } = payload;
                if (status) {
                    dispatch(getDataAttributes({ clientId, userId, departmentId }));
                }
            },
            fail: (err) => {
                            },
        }),
    );
};

export const updateClassificationFallback = (payload) => (dispatch) => {
    return dispatch(
        request.post({
            url: DATA_CATALOGUE_UPDATE_CLASSIFICATION_FALLBACK,
            payload,
            loading: true,
            ok: () => {},
            fail: (err) => {
                            },
        }),
    );
};

// Child import
export const getChildListings = (payload, requestOptions = {}) => (dispatch) => {
    const { loading = true } = requestOptions;
    return dispatch(
        request.post({
            url: GET_CHILD_LISTINGS,
            payload,
            loading,
            ok: () => {},
            fail: (err) => {
                            },
        }),
    );
};

export const saveCatType = (payload) => (dispatch) => {
    return dispatch(
        request.post({
            url: SAVE_CAT_TYPE,
            payload,
            loading: true,
            ok: () => {},
            fail: (err) => {
                            },
        }),
    );
};

export const isCatTypeNameExists = (payload) => (dispatch) => {
    return dispatch(
        request.post({
            url: IS_CAT_TYPE_NAME_EXISTS,
            payload,
            loading: false,
            ok: () => {},
            fail: (err) => {
                            },
        }),
    );
};
 

