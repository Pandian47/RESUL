import { createSlice } from '@reduxjs/toolkit';
import initialState from './initialState';

const dataTargetListReducer = createSlice({
    name: 'TARGET_LIST_LEFT_SIDE_PANEL',
    initialState,
    reducers: {
        update_target_list: (state, { payload: { field, data } }) => ({
            ...state,
            [field]: data,
        }),
        resetTLLeftJSON: () => ({ ...initialState }),
    },
});

export const { update_target_list, resetTLLeftJSON } = dataTargetListReducer.actions;

export default dataTargetListReducer.reducer;
