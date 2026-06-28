import { CHECK_GEOFENCE_NAME_EXISTS, CHECK_VALID_GEOFENCE, DELETE_REGION_BY_ID, GET_GEOFENCES_LISTS, GET_GEOFENCE_DETAILS_BY_ID, SAVE_GEOFENCE, SYNC_GEOFENCE } from 'Constants/EndPoints';
import request from 'Utils/Http';
import { updateGeofence } from './reducer';

export const getGeoFencesLists = (payload) => async (dispatch) => {
    return dispatch(
        request.post({
            url: GET_GEOFENCES_LISTS,
            payload,
            // loading: true,
            ok: ({ data }) => {
                const { status, data: res } = data;
                dispatch(updateGeofence({ field: 'list', payload: status ? res : [] }));
            },
            fail: () => dispatch(updateGeofence({ field: 'list', payload: [] })),
        }),
    );
};

export const syncGeoFenceStatus = ({ geoFenceId, statusId }) => async (dispatch, getState) => {
    const response = await dispatch(
        request.post({
            url: SYNC_GEOFENCE,
            payload: { geoFenceId, statusId },
            loading: true,
            isFailureCheck: true,
        }),
    );
    // Optimistically update list in store to avoid extra API call
    if (response?.status !== false) {
        const { geofenceReducer } = getState();
        const currentList = geofenceReducer?.list || [];
        const updatedList = currentList.map((item) => {
            const id = item?.geoFenceId ?? item?.id;
            if (id === geoFenceId) return { ...item, statusID: statusId };
            return item;
        });
        dispatch(updateGeofence({ field: 'list', payload: updatedList }));
    }
    return response;
};

export const getGeoFenceDetailsById = ({ geoFenceId, departmentId, clientId, userId }) => async (dispatch) => {
    return dispatch(
        request.post({
            url: GET_GEOFENCE_DETAILS_BY_ID,
            payload: { geoFenceId, departmentId, clientId, userId },
            loading: false,
            isFailureCheck: true,
        }),
    );
};

export const checkGeoFenceNameExists = ({payload}) => async (dispatch) => {
    let temp = payload;
        return dispatch(
        request.post({
            url: CHECK_GEOFENCE_NAME_EXISTS,
            payload: payload ,
            loading: false,
        }),
    );
};

export const saveGeoFence = (payload, loading = false) => async (dispatch) => {
    return dispatch(
        request.post({
            url: SAVE_GEOFENCE,
            payload,
            loading,
            isFailureCheck: true,
        }),
    );
};

export const checkValidGeoFence = (payload) => async (dispatch) => {
    return dispatch(
        request.post({
            url: CHECK_VALID_GEOFENCE,
            payload,
            loading: true,
            isFailureCheck: true,
        }),
    );
};

export const deleteRegionById = ({ regionId }) => async (dispatch) => {
    return dispatch(
        request.post({
            url: DELETE_REGION_BY_ID,
            payload: { regionId },
            loading: true,
            isFailureCheck: true,
        }),
    );
};

