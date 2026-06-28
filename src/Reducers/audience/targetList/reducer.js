import { createSlice } from '@reduxjs/toolkit';
import initialState from './initialState';

const targetListViewReducer = createSlice({
    name: 'TARGET_LIST_LEFT_SIDE_PANEL',
    initialState,
    reducers: {
        target_list_view: (state, { payload: { field, data } }) => ({
            ...state,
            [field]: data,
        }),
        target_list_update: (state, { payload }) => ({
            ...state,
            targetListView: payload?.data,
            totalListCount: payload.totalListCount,
            message: payload
        }),
        get_target_list: (state, { payload: { field, data } }) => {
            return {
                ...state,
                [field]: data,
            };
        },
        resetTargetListData: (state) => ({ ...initialState, tldlUserList: state.tldlUserList || [] })
        // resetTargetListData: () => initialState,
    },
});

export const { target_list_view, target_list_update, resetTargetListData, get_target_list } =
    targetListViewReducer.actions;

export default targetListViewReducer.reducer;
