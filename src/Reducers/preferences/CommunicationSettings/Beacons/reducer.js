import { createSlice } from '@reduxjs/toolkit';
import initialState from './initialState';

const beaconReducer = createSlice({
    name: 'BEACON',
    initialState,
    reducers: {
        updateBeacon: (state, { payload: { field, payload } }) => ({
            ...state,
            [field]: payload,
        }),
        resetBeacon: () => ({ ...initialState }),
    },
});

export const { updateBeacon, resetBeacon } = beaconReducer.actions;
export default beaconReducer.reducer;
