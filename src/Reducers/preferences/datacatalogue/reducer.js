import { createSlice } from '@reduxjs/toolkit';
import initialState from './initialState';

const dataCatalogueReducer = createSlice({
    name: 'DATA_CATALOGUE',
    initialState,
    reducers: {
        update_data_catalogue: (state, { payload: { field, data } }) => ({
            ...state,
            [field]: data,
        }),

        update_loading: (state, { payload }) => ({
            ...state,
            loading: {
                ...state.loading,
                ...payload,
            },
        }),
        update_all_loading: (state) => ({
            ...state,
            loading: {
                attributes: true,
                filterGroup: true,
                classificationGroup: true,
            },
        }),
         reset_data_catalogue: () => ({ ...initialState }),
        // reset_data_catalogue: () => initialState,
    },
});

export const { update_data_catalogue, update_loading, update_all_loading, reset_data_catalogue } =
    dataCatalogueReducer.actions;
export default dataCatalogueReducer.reducer;
