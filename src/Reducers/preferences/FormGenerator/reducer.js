// reducer
import { createSlice } from '@reduxjs/toolkit';
import initialState from './initialState';

const formGeneratorReducers = createSlice({
    name: 'FORM_GENERATOR',
    initialState,
    reducers: {
        getFormGeneratorsDatas: (state, { payload: { field, data } }) => ({
            ...state,
            [field]: data,
        }),
        getFormLoading: (state, { payload: { field, data } }) => ({
            ...state,
            [field]: data,
        }),
        clearFormGeneratorsDatas: (state) => {
            return {};
        },
    },
});

export const { getFormGeneratorsDatas, getFormLoading, clearFormGeneratorsDatas } = formGeneratorReducers.actions;

export default formGeneratorReducers.reducer;
