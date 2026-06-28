// reducer
import { createSlice } from '@reduxjs/toolkit';
import initialState from './initialState';

const plannerReducer = createSlice({
    name: 'COMMUNICATION_PLANNER',
    initialState,
    reducers: {
        updatePlanner: (state, { payload: { field, data } }) => ({
            ...state,
            [field]: data,
        }),
        resetPlanner: () => ({ ...initialState }),
        setLoading: (state, { payload }) => ({ ...state, isLoading: payload }),
        setFailure: (state, { payload }) => ({ ...state, isFailure: payload }),
        setAttributesLoading: (state, { payload }) => ({ ...state, isAttributesLoading: payload }),
        setAttributesFailure: (state, { payload }) => ({ ...state, isAttributesFailure: payload }),
        setModalLoading: (state, { payload }) => ({ ...state, modalLoading: payload }),
        setModalFailure: (state, { payload }) => ({ ...state, modalFailure: payload }),
        setEventInfoLoading: (state, { payload }) => ({ ...state, eventInfoLoading: payload }),
        setEventInfoFailure: (state, { payload }) => ({ ...state, eventInfoFailure: payload }),
    },
});

export const {
    updatePlanner,
    setLoading,
    setFailure,
    setAttributesLoading,
    setAttributesFailure,
    setModalLoading,
    setModalFailure,
    setEventInfoLoading,
    setEventInfoFailure,
    resetPlanner,
} = plannerReducer.actions;

export default plannerReducer.reducer;
