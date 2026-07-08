import { GET_COMMUNICATION_ATTRIBUTES, GET_PLANNER_EVENTS, GET_PLANNER_SINGLE_EVENTS } from 'Constants/EndPoints';
import request from 'Utils/Http';
import {
    updatePlanner,
    setLoading,
    setFailure,
    setAttributesLoading,
    setAttributesFailure,
    setModalLoading,
    setModalFailure,
    setEventInfoLoading,
    setEventInfoFailure,
} from './reducer';
import { normalizePlannerDayModalEvents } from './plannerModalUtils';

export const campaignPlannerList =
    ({ payload }) =>
    async (dispatch) => {
        dispatch(setLoading(true));
        dispatch(setFailure(false));
        return dispatch(
            request.post({
                url: GET_PLANNER_EVENTS,
                payload,
                loading: false,
                ok: (res) => {
                    const { status, data, message = 'No data available' } = res?.data;
                    if (status) {
                        dispatch(updatePlanner({ field: 'plannerData', data: data?.campaigns }));
                    } else {
                        dispatch(updatePlanner({ field: 'plannerData', data: [] }));
                    }
                    dispatch(setLoading(false));
                },
                fail: () => {
                    dispatch(setLoading(false));
                    dispatch(setFailure(true));
                },
            }),
        );
    };

export const campaignPlannerSingleList =
    ({ payload, setPlanner }) =>
    async (dispatch) => {
        dispatch(setEventInfoLoading(true));
        dispatch(setEventInfoFailure(false));
        dispatch(updatePlanner({ field: 'campaignList', data: [] }));
        setPlanner((pre) => ({
            ...pre,
            popupShow: false,
            eventPopupShow: true,
        }));

        return dispatch(
            request.post({
                url: GET_PLANNER_SINGLE_EVENTS,
                payload,
                loading: false,
                ok: (res) => {
                    const { status, data } = res?.data;
                    dispatch(setEventInfoLoading(false));
                    if (status) {
                        dispatch(updatePlanner({ field: 'campaignList', data: data?.specificcampaign }));
                        setPlanner((pre) => ({
                            ...pre,
                            selectedEvent: data,
                            eventPopupShow: true,
                        }));
                    } else {
                        dispatch(setEventInfoFailure(true));
                        dispatch(updatePlanner({ field: 'campaignList', data: [] }));
                        setPlanner((pre) => ({ ...pre, eventPopupShow: true }));
                    }
                },
                fail: () => {
                    dispatch(setEventInfoLoading(false));
                    dispatch(setEventInfoFailure(true));
                    dispatch(updatePlanner({ field: 'campaignList', data: [] }));
                },
            }),
        );
    };

export const datePlannerSingleList = (payload, setPlanner) => async (dispatch) => {
    dispatch(setModalLoading(true));
    dispatch(setModalFailure(false));
    setPlanner((pre) => ({
        ...pre,
        popupEvent: null,
        popupShow: true,
        showMore: false,
        selectedDate: payload.specificDate,
        eventPopupShow: false,
    }));

    return dispatch(
        request.post({
            url: GET_PLANNER_SINGLE_EVENTS,
            payload,
            loading: false,
            ok: (res) => {
                const { status, data } = res?.data;
                const normalized = normalizePlannerDayModalEvents(data);

                if (status) {
                    dispatch(updatePlanner({ field: 'dateList', data: normalized }));
                    setPlanner((pre) => ({
                        ...pre,
                        popupEvent: normalized,
                        popupShow: true,
                        selectedDate: payload.specificDate,
                    }));
                } else {
                    dispatch(setModalFailure(true));
                    dispatch(updatePlanner({ field: 'dateList', data: [] }));
                    setPlanner((pre) => ({
                        ...pre,
                        popupEvent: null,
                        popupShow: true,
                        selectedDate: payload.specificDate,
                    }));
                }
                dispatch(setModalLoading(false));
            },
            fail: () => {
                dispatch(setModalFailure(true));
                dispatch(updatePlanner({ field: 'dateList', data: [] }));
                setPlanner((pre) => ({
                    ...pre,
                    popupEvent: null,
                    popupShow: true,
                    selectedDate: payload.specificDate,
                }));
                dispatch(setModalLoading(false));
            },
        }),
    );
};

export const communicationAttributes = (payload) => async (dispatch) => {
    dispatch(setAttributesLoading(true));
    dispatch(setAttributesFailure(false));
    return dispatch(
        request.post({
            url: GET_COMMUNICATION_ATTRIBUTES,
            payload,
            loading: false,
            ok: (res) => {
                const { status, data } = res?.data;
                if (status) {
                    dispatch(updatePlanner({ field: 'attributesData', data: data }));
                } else {
                    dispatch(updatePlanner({ field: 'attributesData', data: [] }));
                }
                dispatch(setAttributesLoading(false));
            },
            fail: () => {
                dispatch(setAttributesLoading(false));
                dispatch(setAttributesFailure(true));
            },
        }),
    );
};
