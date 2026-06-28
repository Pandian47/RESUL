import { createSlice } from '@reduxjs/toolkit';
import initialState from './initialState';
const aa360ViewReducer = createSlice({
    name: 'Audience_analytics_360',
    initialState,
    reducers: {
        aa_Data_View: (state, { payload: { field, data } }) => ({
            ...state,
            [field]: data,
        }),
 resetAAData: () => ({ ...initialState })
        // resetAAData: () => initialState,
    },
});

export const { aa_Data_View, resetAAData } = aa360ViewReducer.actions;

export default aa360ViewReducer.reducer;
