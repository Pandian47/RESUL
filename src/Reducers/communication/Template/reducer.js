import { createSlice } from '@reduxjs/toolkit';
import initialState from './initialState';

const TemplateReducer = createSlice({
    name: 'COMMUNICATION_TEMPLATE',
    initialState,
    reducers: {
        updateTemplate: (state, { payload }) => ({
            ...state,
            templateCard: payload,
        }),
        templateLoading: (state, { payload }) => ({
            ...state,
            templateLoading: payload,
        })
    }
})

export const { updateTemplate, templateLoading } = TemplateReducer.actions;
export default TemplateReducer.reducer;