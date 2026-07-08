import request from 'Utils/Http';
import * as endPoints from 'Constants/EndPoints';
import { updateBeacon } from './reducer';

const normalizeBeaconListResponse = (res) => {
    if (Array.isArray(res)) {
        return { list: res, totalCount: res.length };
    }
    if (Array.isArray(res?.beaconLists)) {
        return {
            list: res.beaconLists,
            totalCount: res.totalRecords ?? res.totalRows ?? res.beaconLists.length,
        };
    }
    if (Array.isArray(res?.items)) {
        return { list: res.items, totalCount: res.totalRecords ?? res.totalCount ?? res.totalRows ?? res.items.length };
    }
    if (Array.isArray(res?.list)) {
        return { list: res.list, totalCount: res.totalRecords ?? res.totalCount ?? res.totalRows ?? res.list.length };
    }
    if (Array.isArray(res?.data)) {
        return { list: res.data, totalCount: res.totalRecords ?? res.totalCount ?? res.totalRows ?? res.data.length };
    }
    return { list: [], totalCount: 0 };
};

export const getBeaconLists = (payload) => async (dispatch) => {
    return dispatch(
        request.post({
            url: endPoints.GET_BEACON_LISTS,
            payload,
            ok: ({ data }) => {
                const { status, data: res } = data;
                const { list, totalCount } = normalizeBeaconListResponse(status ? res : []);
                dispatch(updateBeacon({ field: 'list', payload: list }));
                dispatch(updateBeacon({ field: 'totalCount', payload: totalCount }));
            },
            fail: () => {
                dispatch(updateBeacon({ field: 'list', payload: [] }));
                dispatch(updateBeacon({ field: 'totalCount', payload: 0 }));
            },
        }),
    );
};

export const getBeaconById = ({ id }) => async (dispatch) => {
    return dispatch(
        request.post({
            url: endPoints.GET_BEACON_BY_ID,
            payload: { id },
            loading: true,
            isFailureCheck: true,
        }),
    );
};

export const checkBeaconExists = ({ payload }) => async (dispatch) => {
    return dispatch(
        request.post({
            url: endPoints.CHECK_BEACON_EXISTS,
            payload,
            loading: false,
        }),
    );
};

export const saveBeaconDetails = (payload) => async (dispatch) => {
    return dispatch(
        request.post({
            url: endPoints.SAVE_BEACON_DETAILS,
            payload,
            loading: true,
            isFailureCheck: true,
        }),
    );
};

export const saveBeaconDetailsBulk = (payload) => async (dispatch) => {
    return dispatch(
        request.post({
            url: endPoints.SAVE_BEACON_DETAILS_BULK,
            payload,
            loading: true,
            isFailureCheck: true,
        }),
    );
};

export const updateBeaconStatus = ({ id, isActive }) => async (dispatch, getState) => {
    const response = await dispatch(
        request.post({
            url: endPoints.UPDATE_BEACON_STATUS,
            payload: { id, isActive },
            loading: true,
            isFailureCheck: true,
        }),
    );

    if (response?.status !== false) {
        const { beaconReducer } = getState();
        const currentList = beaconReducer?.list || [];
        const updatedList = currentList.map((item) => {
            const beaconId = item?.id ?? item?.beaconId;
            if (beaconId === id) {
                const statusId = isActive ? 1 : 2;
                return { ...item, isActive, statusId, statusID: statusId };
            }
            return item;
        });
        dispatch(updateBeacon({ field: 'list', payload: updatedList }));
    }

    return response;
};
