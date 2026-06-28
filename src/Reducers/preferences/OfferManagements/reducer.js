// reducer
import { createSlice } from '@reduxjs/toolkit';
import initialState from './initialState';

const offerMangementReducer = createSlice({
    name: 'OFFER_MANAGEMENT',
    initialState,
    reducers: {
        getOfferManagement: (state, { payload: { field, data } }) => ({
            ...state,
            [field]: data,
        }),
        clearOfferManageMent: (state) => {
            return initialState;
        },
    },
});

export const { getOfferManagement, clearOfferManageMent } = offerMangementReducer.actions;

export default offerMangementReducer.reducer;
