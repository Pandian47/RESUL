import { DUPLICATE_COMMUNICATION, GET_GALLERY_LIST, GET_INFO_LIST, SHOW_SELECTED_DETAILS } from 'Constants/EndPoints';
import request from 'Utils/Http';

import { updateGallery, setLoading, setFailure } from './reducer';

export const getGalleryList =
    ({ payload, loading = false }) =>
        async (dispatch) => {
            dispatch(setLoading(true));
            dispatch(setFailure(false));
            return dispatch(
                request.post({
                    url: GET_GALLERY_LIST,
                    payload,
                    loading,
                    ok: ({ data }) => {
                        const { status, data: response , message = 'No data available' } = data;
                        if (status) {
                            if(response?.items?.length > 0) {
                                dispatch(updateGallery({ field: 'galleryData', data: response }));
                            } else {
                                dispatch(updateGallery({ field: 'galleryData', data: {} }));
                                dispatch(setFailure(true));
                            }
                        } else {
                            dispatch(updateGallery({ field: 'galleryData', data: {} }));
                            dispatch(setFailure(true));
                            //dispatch(update_failures_API_Errors({ field: 'galleryData', message: message || 'No data available'  }));
                        }
                        dispatch(setLoading(false));
                    },
                    fail: (err) => {
                                                dispatch(setLoading(false));
                        dispatch(setFailure(true));
                    },
                }),
            );
        };


export const getInfoList =
    ({ payload, loading = false }) =>
    async (dispatch) => {
        return dispatch(
            request.post({
                url: GET_INFO_LIST,
                payload,
                loading,
                ok: () => {},
                fail: () => {},
            }),
        );
    };

export const duplicateGalleryCommunication =
    ({ payload }) =>
        async (dispatch) => {
            return dispatch(
                request.post({
                    url: DUPLICATE_COMMUNICATION,
                    payload,
                    loading: true,
                    ok: ({ data }) => {
                        const { status, message = 'No data available' } = data;
                        // if (status) {
                        //     dispatch(update_failures_API_Errors({ field: 'duplicategallery', message: '' }));
                        // } else {
                        //     dispatch(update_failures_API_Errors({ field: 'duplicategallery', message: message  || 'No data available' }));
                        // }
                    },
                    isFailureCheck: true,
                    fail: (err) => {},
                }),
            );
        };

export const getGalleryDetails =
    ({ payload }) =>
        async (dispatch) => {
            return dispatch(
                request.post({
                    url: SHOW_SELECTED_DETAILS,
                    payload,
                    loading: true,
                }),
            );
        };